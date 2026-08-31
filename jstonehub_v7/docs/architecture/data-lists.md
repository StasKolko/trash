# Data Lists

Every list, table, or feed in the application follows the same architecture.
This document is the single source of truth for how lists work — from API
response format to frontend rendering.

---

## Loading Modes

Every list endpoint operates in one of two modes.

### Mode: `all`

The server returns **every record** in a single response. No pagination
query parameters are accepted.

The frontend handles filtering, sorting, and search locally using
TanStack Table. All filter/sort/search state is stored in URL search
params via `createValidateSearch` from
`@packages/contract/pagination/client`.

### Mode: `cursor`

The server accepts query parameters (`query`, `sort`, `order`, filters,
`cursor`, `limit`) and returns a page of results with cursor pointers
for bidirectional navigation.

### Decision algorithm

The only criterion is the **total number of records** in a given scope.
The number of users accessing the data is irrelevant — synchronization
between clients is handled through optimistic updates, SSE events, or
polling. The point is: if the dataset is small, it is simpler to return
everything at once and let the client work with it locally, avoiding
unnecessary database queries.

```
┌──────────────────────────────────────────────────┐
│ What is the weight of list items?                │
└──────┬──────────────────┬──────────────┬─────────┘
       │ Light            │ Medium       │ Heavy
       │ (3–5 fields)     │ (5–15 fields)│ (15+ fields)
       ▼                  ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ≤ 5000       │  │ ≤ 1000       │  │ ≤ 500        │
│ records?     │  │ records?     │  │ records?     │
└───┬─────┬────┘  └───┬─────┬────┘  └───┬─────┬────┘
    │ Yes │ No        │ Yes │ No        │ Yes │ No
    ▼     ▼           ▼     ▼           ▼     ▼
  ┌────┐┌──────┐   ┌────┐┌──────┐   ┌────┐┌──────┐
  │all ││cursor│   │all ││cursor│   │all ││cursor│
  └────┘└──────┘   └────┘└──────┘   └────┘└──────┘
```

Threshold values are defined as constants in
`@packages/contract/pagination/constant`:

| Item weight | Fields per item | `all` → `cursor` threshold | Approx. size of 100 records |
|---|---|---|---|
| Light | 3–5 scalar fields | `ALL_MODE_THRESHOLD_LIGHT` | ~10–15 KB |
| Medium | 5–15 fields | `ALL_MODE_THRESHOLD_MEDIUM` | ~30–50 KB |
| Heavy | 15+ fields or nested objects | `ALL_MODE_THRESHOLD_HEAVY` | ~60–100 KB |

Example: "User's projects" — medium weight, typically < 100 records → `all`.
Example: "Admin: all users" — potentially tens of thousands → `cursor`.

---

## Cursor-Based Pagination

All paginated lists use cursor-based pagination. No offset/page-based
pagination anywhere in the system.

### Why cursors over offset

| Criteria | Cursor | Offset |
|---|---|---|
| Insert/delete stability | Stable — no skipped/duplicated items | Shifts on data change |
| Performance at depth | O(log n) index seek at any position | O(n) linear degradation |
| Infinite scroll fit | Natural — no page numbers | Requires page tracking |

### What is a cursor

An opaque base64-encoded string containing the sort field value and
the record id:

```
cursor = base64(JSON.stringify({
  sortValue: "2024-01-15T10:30:00Z",
  id: "clxyz123abc"
}))
```

**Why both values?** The sort value enables a direct composite index
seek — O(log n). The id guarantees uniqueness when multiple records
share the same sort value. Clients never parse cursors, only pass
them back.

### Server response format

```ts
type CursorPageResponse<Item> = {
  items: Item[];
  nextCursor: string | null;   // null = no more data below
  prevCursor: string | null;   // null = no more data above
};
```

No `totalCount` — expensive on large tables, useless for infinite scroll.
`nextCursor === null` signals the end.

### How cursor queries work

Next page (sorted by `created_at DESC`):

```sql
SELECT * FROM "user"
WHERE (created_at, id) < (:cursor_sort_value, :cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT :limit + 1
```

Fetch `limit + 1` rows. If all return → more data exists, set
`nextCursor` from last row, return first `limit`. If fewer → set
`nextCursor` to `null`.

Previous page mirrors with reversed comparison and order.

---

## Search Params as Source of Truth

All list state is stored in **URL search params**, never in component
state. Three reasons:

1. **Page refresh** preserves the exact view
2. **Sharing a URL** gives another user the same view
3. **Browser back/forward** navigates through filter history

### What lives in search params

| Parameter | Mode | Purpose |
|---|---|---|
| `sort` | all, cursor | Active sort field |
| `order` | all, cursor | Sort direction (`asc` / `desc`) |
| `query` | all, cursor | Search text |
| Filter values | all, cursor | Active filter values |
| `anchor` | cursor only | Encoded top visible item |

### What does NOT live in search params

- Pagination cursors — internal to TanStack Query
- UI state (sidebar, modals)
- Selection state (checked rows)
- Scroll pixel offset

### Scroll anchor (cursor mode only)

The URL contains `?anchor=<encoded>` — base64 string with the **id
and sort field value** of the top visible element.

When another user opens the shared URL:

1. Client reads and decodes `anchor`
2. Sends request with decoded values as starting point
3. Server returns items centered on that position + cursors
4. Virtualizer renders from the anchor item

In `all` mode, anchor is unnecessary — all data is loaded, the
virtualizer scrolls to the element by id.

---

## Debounce and Change Batching

All list control components (search, filters, sorting, scroll anchor)
use **one shared debounce**. Not a separate debounce per input, but a
single timer on search params updates.

### Why a shared debounce

Users act fast: select a filter, change sorting, start typing a search
query — all within a couple of seconds. There is no point sending
intermediate requests after each individual action. A single shared
debounce waits until the user finishes the series of changes and only
then applies the result.

### Comparison before applying

When the debounce fires, it **compares new parameters with the current
ones**. If the user clicked back and forth but returned all values to
their original state — no request is sent, no cache is reset.

### Implementation

Debounce duration and the list of debounced interactions are defined as
constants in `@packages/contract/pagination/constant`. List components
use `@tanstack/solid-pacer` for implementation.

Debounced interactions:

- Search text input
- Filter selection / deselection
- Sort field or direction change
- Scroll anchor update

---

## List Loading States

When list parameters change, the user must see feedback. A semi-transparent
overlay with a spinner and a brief status appears over the table/list.

### States

States are determined based on TanStack Query (`isPending`, `isFetching`,
`isRefetching`) and the internal debounce status:

| State | What is happening | What the user sees |
|---|---|---|
| **Awaiting input** | Debounce has not fired yet — user is still changing parameters | Overlay + "Applying filters…" (or similar) |
| **Loading** | Request sent to server (cursor mode) or local re-indexing (all mode) | Overlay + spinner |
| **Ready** | Data received and rendered | Overlay removed |

In `all` mode, "loading" is a local TanStack Table operation (instant
for small volumes) — the overlay may be imperceptibly short, which
is fine.

---

## Parameter Changes and Cache Reset

When the debounce fires and new parameters differ from current ones:

| Mode | Behavior |
|---|---|
| **Cursor** | Cache cleared, cursor reset to `null`, fresh first-page request |
| **All** | No server request; TanStack Table re-applies filtering/sorting locally |

If new parameters **match** the current ones — nothing happens.

---

## Sorting

Single sort field + single direction. No multi-column sorting.

Sort field and direction stored in search params (`sort` + `order`).
Allowed sort fields defined per endpoint via pagination factory.

---

## Filtering

Multiple fields, each with multiple selected values.

Filter value `"all"` = do not filter by this field. This is distinct
from `mode: "all"` (loading mode):

| Concept | Meaning |
|---|---|
| `mode: "all"` | Server returns all records |
| Filter value `"all"` | No filtering on this field |

---

## Infinite Scroll

Bidirectional loading (down and up). No page numbers.

### Prefetch threshold

Next page fetch triggers when the user is within a configurable number
of items from the boundary. The threshold is defined as the
`PREFETCH_THRESHOLD` constant in `@packages/contract/pagination/constant`:

```
Loaded items:  [1] [2] [3] ... [46] [47] [48] [49] [50]
                                            ▲
                                PREFETCH_THRESHOLD items from end
                                → fetchNextPage()
```

If `nextCursor` is `null`, no request. Same logic applies upward.

### Cache structure

```
TanStack Query cache (useInfiniteQuery):

Page 0:  [item_1  ... item_50 ]  ← prevCursor
Page 1:  [item_51 ... item_100]
Page 2:  [item_101... item_150]  ← anchor (top visible)
Page 3:  [item_151... item_200]  ← nextCursor
```

Cursors live only in TanStack Query cache, never in URL.

---

## Virtualization

Virtualization is the **default** for all lists. Use
`@tanstack/solid-virtual`.

Only visible rows plus overscan buffer are rendered. Skip
virtualization only for **guaranteed static and tiny** lists
(e.g. settings page with 5 toggles).

---

## Optimistic Updates

Optimistic updates are the **default strategy** for mutations.

### How it works

```
User triggers mutation (create, update, delete)
  │
  ├─→ Immediately update TanStack Query cache
  │   (UI reflects the change instantly)
  │
  └─→ Send request to server
        │
        ├─→ Server confirms → done (UI already correct)
        │
        └─→ Server returns error → roll back cache, show error
```

### Decision algorithm

```
┌──────────────────────────────┐
│ Is the action irreversible?  │
│ (payment, permanent delete)  │
└──────┬───────────┬───────────┘
       │ Yes       │ No
       ▼           ▼
┌─────────────┐ ┌──────────────────────────────┐
│ pessimistic │ │ Can the result be predicted   │
└─────────────┘ │ from client state alone?      │
                └──────┬───────────┬────────────┘
                       │ No        │ Yes
                       ▼           ▼
                ┌─────────────┐ ┌──────────────────────────┐
                │ pessimistic │ │ Is rollback on error      │
                └─────────────┘ │ straightforward?          │
                                │ (single cache entry)      │
                                └──────┬───────────┬────────┘
                                       │ No        │ Yes
                                       ▼           ▼
                                ┌─────────────┐ ┌────────────┐
                                │ pessimistic │ │ optimistic │
                                └─────────────┘ └────────────┘
```

Example: "Delete a joke" — reversible (soft delete), predictable,
simple rollback → **optimistic**.
Example: "Process payment" — irreversible → **pessimistic**.

---

## Data Synchronization

### Single-user changes

When the current user mutates data, optimistic updates handle the UI
immediately (see above).

### Multi-user changes

When multiple users can modify the same data, changes split into two
categories.

#### Non-critical changes

Cosmetic or metadata updates (project name, logo, description).
Do not block other users' work.

Strategy: **no real-time sync**. Changes picked up on next automatic
refetch (`refetchOnWindowFocus` or manual refresh).

#### Critical changes

Destructive or access-breaking changes (resource deletion, permission
revocation, ban).

Strategy: **server-initiated notification**. Affected clients must be
informed promptly.

### Sync mechanism decision algorithm

```
┌─────────────────────────────────────────────────┐
│ Must affected clients know within seconds?       │
└──────────┬──────────────────────┬────────────────┘
           │ No                   │ Yes
           ▼                     ▼
┌─────────────────────┐  ┌─────────────────────────────────┐
│ Passive sync        │  │ Is the client already connected  │
│ (refetchOnFocus,    │  │ to an SSE stream for this scope? │
│  staleTime expiry)  │  └──────────┬──────────┬────────────┘
└─────────────────────┘             │ Yes      │ No
                                    ▼          ▼
                          ┌──────────────┐ ┌────────────────────────────┐
                          │ SSE event    │ │ Does the client discover   │
                          │ → invalidate │ │ the change on next action? │
                          │   cache key  │ │ (e.g. API returns 404/410) │
                          └──────────────┘ └──────────┬─────────┬───────┘
                                                      │ Yes     │ No
                                                      ▼         ▼
                                            ┌───────────────┐ ┌─────────────┐
                                            │ Handle API    │ │ Add SSE     │
                                            │ error code    │ │ stream for  │
                                            │ (404 → toast  │ │ this scope  │
                                            │  + redirect)  │ └─────────────┘
                                            └───────────────┘
```

### Cache update strategies

When a sync event arrives (SSE, polling, or error response):

```
┌──────────────────────────────────────────┐
│ Does the event carry the full new state? │
└──────────┬───────────────────┬───────────┘
           │ Yes               │ No
           ▼                   ▼
┌────────────────────┐  ┌─────────────────────────────────┐
│ Update cache       │  │ Is the resource deleted/revoked? │
│ directly via       │  └──────────┬──────────┬────────────┘
│ setQueryData()     │             │ Yes      │ No
└────────────────────┘             ▼          ▼
                        ┌────────────────┐ ┌──────────────────┐
                        │ Remove from    │ │ Invalidate query │
                        │ cache +        │ │ key → automatic  │
                        │ redirect/toast │ │ refetch          │
                        └────────────────┘ └──────────────────┘
```

| Strategy | When | Example |
|---|---|---|
| `setQueryData()` | Event contains full object | SSE: project renamed, payload has new name |
| `invalidateQueries()` | Something changed, need fresh data | SSE: "project X updated" (no payload) |
| Remove + redirect | Resource no longer accessible | API returns 404, or SSE: "project X deleted" |
| `queryClient.clear()` + redirect | User context changed | Ban, role downgrade → clear everything, go to login |

---

## Standardization

All list behavior is standardized through factories in `@packages/contract`:

- **`@packages/contract/pagination/server`** — `createQueryParamsSchema`
  (TypeBox) for API endpoint validation
- **`@packages/contract/pagination/client`** — `createValidateSearch`
  (Valibot) for TanStack Router search params validation

Both share the same constants from `@packages/contract/pagination/constant`
ensuring client and server always agree on field names, limits, and defaults.

### Shared entity constants

For each paginated entity, create a constants file in contract:

```ts
// @packages/contract/src/user-list.constant.ts
const USER_SORTS = ["createdAt", "name", "email"] as const;
const USER_SORT_DEFAULT = "createdAt" as const;
const USER_FILTERS = {
  globalRole: { values: GLOBAL_ROLE },
} as const;
```

Both client and server import from the same file — TypeScript catches
any mismatch at compile time.

Custom list implementations are not allowed. If a use case does not fit
the factory — extend the factory, do not bypass it.

---

## Page Size Guidelines

The `limitDefault` parameter controls how many records the server
returns per request in `cursor` mode. Values are defined as constants
in `@packages/contract/pagination/constant`:

| Item weight | Fields per item | `limitDefault` | Approx. page size |
|---|---|---|---|
| Light | 3–5 scalar fields | `CURSOR_LIMIT_LIGHT` | ~10–15 KB |
| Medium | 5–15 fields | `CURSOR_LIMIT_MEDIUM` (default) | ~30–50 KB |
| Heavy | 15+ fields or nested objects | `CURSOR_LIMIT_HEAVY` | ~30–60 KB |

Configured **per endpoint** via the factory's `limitDefault`. No
device-based adaptation — the payload size difference is negligible,
while reducing the limit increases round-trips, which hurts mobile
more.