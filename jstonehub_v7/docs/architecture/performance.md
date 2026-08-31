# Performance & Complexity

Every feature must be designed with four cost dimensions in mind:
**CPU**, **Memory**, **Network**, and **Growth rate (Big O)**.

---

## Big O — Algorithmic Complexity

Before writing any loop, filter, or data transformation, consider how
the operation scales as data grows.

### Target complexities

| Acceptable | Avoid | Refactor immediately |
|---|---|---|
| O(1) — constant | O(n log n) — without justification | O(n²) — nested loops over same data |
| O(log n) — binary search, index seek | | O(n³) — triple nesting |
| O(n) — single pass | | O(2ⁿ) — exponential |

### Decision algorithm

```
┌──────────────────────────────────────┐
│ Does the operation iterate over data?│
└──────────┬───────────────┬───────────┘
           │ No            │ Yes
           ▼               ▼
    ┌────────────┐  ┌──────────────────────────────┐
    │ O(1) — ok  │  │ How many nested iterations    │
    └────────────┘  │ over the same or related data?│
                    └──────┬───────────┬────────────┘
                           │ 1         │ 2+
                           ▼           ▼
                    ┌────────────┐ ┌──────────────────────────┐
                    │ O(n) — ok  │ │ Can an inner loop be     │
                    └────────────┘ │ replaced with a Set/Map  │
                                   │ lookup?                  │
                                   └──────┬───────────┬───────┘
                                          │ Yes       │ No
                                          ▼           ▼
                                   ┌────────────┐ ┌──────────────────┐
                                   │ Refactor   │ │ Can the work be  │
                                   │ to O(n)    │ │ moved to SQL     │
                                   │ using      │ │ (index seek)?    │
                                   │ Map/Set    │ └────┬────────┬────┘
                                   └────────────┘      │ Yes    │ No
                                                       ▼       ▼
                                                ┌──────────┐ ┌────────────┐
                                                │ Move to  │ │ Document   │
                                                │ SQL with │ │ why O(n²)  │
                                                │ index    │ │ is needed  │
                                                └──────────┘ └────────────┘
```

### Common refactoring patterns

**O(n²) → O(n) with Map/Set:**

```ts
// ❌ O(n²) — for each user, scan all permissions
for (const user of users) {
  const perm = permissions.find((p) => p.userId === user.id);
}

// ✅ O(n) — build lookup first, then single pass
const permByUser = new Map(permissions.map((p) => [p.userId, p]));
for (const user of users) {
  const perm = permByUser.get(user.id);
}
```

**O(n) in JS → O(log n) in SQL:**

```ts
// ❌ O(n) — fetch all, filter in JS
const all = await db.select().from(userTable);
const admins = all.filter((u) => u.globalRole === "admin");

// ✅ O(log n) — filter in SQL using index
const admins = await db
  .select()
  .from(userTable)
  .where(eq(userTable.globalRole, "admin"));
```

---

## Database Indexes

### Checklist before creating a table

1. Which columns will be filtered? → Add B-tree indexes
2. Which columns will be sorted? → Include in composite indexes
3. Which columns will be searched (fuzzy)? → Add GIN trigram indexes
4. What is the expected row count? → Thousands? Millions?
5. Which queries will be most frequent? → Optimize those first
6. Which foreign keys exist? → Add index on FK columns (not automatic in PostgreSQL)

### Index types

```
Single filter:          index(column)
Filter + sort:          index(filter_column, sort_column)
Fuzzy text search:      index USING gin(column gin_trgm_ops)
Unique lookup:          unique(column) — already indexed
Foreign key:            index(fk_column)
Cursor pagination:      index(sort_column, id)
```

### Decision algorithm

```
┌───────────────────────────────────────┐
│ Will this column appear in WHERE?     │
└──────────┬────────────────┬───────────┘
           │ No             │ Yes
           ▼                ▼
┌──────────────────┐ ┌─────────────────────────────┐
│ Will it appear   │ │ Is it a text search (ILIKE)? │
│ in ORDER BY?     │ └──────┬───────────┬───────────┘
└────┬────────┬────┘        │ Yes       │ No
     │ No     │ Yes         ▼           ▼
     ▼        ▼      ┌───────────┐ ┌──────────────────────┐
┌─────────┐ ┌─────┐  │ GIN trgm  │ │ Will it also be      │
│ No      │ │ Add │  │ index     │ │ sorted?              │
│ index   │ │ idx │  └───────────┘ └────┬────────┬────────┘
│ needed  │ └─────┘                     │ Yes    │ No
└─────────┘                             ▼       ▼
                                 ┌────────────┐ ┌───────────┐
                                 │ Composite  │ │ Single    │
                                 │ index      │ │ column    │
                                 │ (filter,   │ │ index     │
                                 │  sort_col) │ └───────────┘
                                 └────────────┘
```

### Example: user table

```
Filter by role + sort by created_at  →  index(global_role, created_at)
Fuzzy search by name                 →  GIN index(name gin_trgm_ops)
Fuzzy search by email                →  GIN index(email gin_trgm_ops)
Sort by created_at alone             →  index(created_at)
Cursor pagination by created_at      →  index(created_at, id)
```

---

## API Response Efficiency

### Select only needed columns

```ts
// ❌ Returns all columns including heavy ones
const users = await db.select().from(userTable);

// ✅ Returns only what the list needs
const users = await db
  .select({
    id: userTable.id,
    name: userTable.name,
    email: userTable.email,
    globalRole: userTable.globalRole,
  })
  .from(userTable);
```

### Decision algorithm

```
┌───────────────────────────────────────────┐
│ Does the client need ALL columns?         │
└──────────┬────────────────────┬───────────┘
           │ Yes                │ No
           ▼                   ▼
┌─────────────────────┐  ┌──────────────────────────────┐
│ Select all          │  │ Select only required columns  │
│ (detail page,       │  │ (lists, search results,       │
│  edit form)         │  │  autocomplete, summaries)     │
└─────────────────────┘  └──────────────────────────────┘
```

### Response shape

- Return **flat structures** — avoid deeply nested objects
- Use **consistent naming** — camelCase for all fields
- **Never return unbounded result sets** — every list endpoint
  uses either `mode: "all"` (bounded by scope) or `mode: "cursor"`
  (bounded by limit)

### Batch operations

Prefer a single request with array payload over N individual requests:

```ts
// ❌ N requests
for (const id of ids) {
  await client.api.jokes[id].delete();
}

// ✅ Single request
await client.api.jokes.batch.delete({ ids });
```

---

## Network Request Consolidation

Multiple pieces of data that are fetched or refreshed together must be
served by a **single API endpoint**. TanStack Query does not merge
separate queryKeys into one HTTP request — consolidation happens at
the **API design** level.

### Why consolidate

- Fewer HTTP round-trips — lower latency, less server load
- Atomic freshness — related data is consistent within one response
- Simpler polling — one `refetchInterval` instead of N independent timers

### Decision algorithm

```
┌──────────────────────────────────────────────────┐
│ Are there 2+ queries that are always fetched     │
│ together (same page, same lifecycle)?            │
└──────────┬───────────────────────┬───────────────┘
           │ No                    │ Yes
           ▼                      ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│ Keep as separate    │  │ Do they share the same            │
│ endpoints           │  │ staleTime / refetchInterval?      │
└─────────────────────┘  └──────────┬───────────┬────────────┘
                                    │ Yes       │ No
                                    ▼           ▼
                          ┌──────────────────┐ ┌─────────────────────┐
                          │ Merge into ONE   │ │ Can the faster one  │
                          │ endpoint         │ │ piggyback on the    │
                          │ (single query)   │ │ slower interval?    │
                          └──────────────────┘ └──────┬──────┬───────┘
                                                      │ Yes  │ No
                                                      ▼      ▼
                                            ┌──────────────┐ ┌───────────┐
                                            │ Align to the │ │ Keep      │
                                            │ slower       │ │ separate  │
                                            │ interval,    │ │ endpoints │
                                            │ merge        │ └───────────┘
                                            └──────────────┘
```

### Example: auth context

Session and admin permissions are always loaded together on the admin
app and share `staleTime: Infinity` (manual invalidation only).

```
❌ Two endpoints, two queries:
   GET /api/auth/session       → { id, name, role, ... }
   GET /api/admin/permissions/me → ["joke:read", ...]

✅ One endpoint, one query:
   GET /api/auth/context?scope=admin
   → { user: { id, name, role }, permissions: ["joke:read", ...] }

   For hub (no permissions needed):
   GET /api/auth/context?scope=hub
   → { user: { id, name, role }, permissions: null }
```

One queryKey `["auth-context"]`, one HTTP request, one `staleTime`.

### Example: periodic background data

Two datasets both need refreshing every 5 minutes:

```
❌ Two independent polling queries:
   useQuery({ queryKey: ["stats"], refetchInterval: 300_000 })
   useQuery({ queryKey: ["alerts"], refetchInterval: 300_000 })
   → 2 requests every 5 minutes, potentially at different times

✅ One combined endpoint:
   GET /api/dashboard/live → { stats: {...}, alerts: [...] }
   useQuery({ queryKey: ["dashboard-live"], refetchInterval: 300_000 })
   → 1 request every 5 minutes
```

### Interval alignment rule

When a new dataset needs periodic refresh and a combined endpoint
already exists with a suitable interval:

```
┌─────────────────────────────────────────────────────┐
│ Does an existing combined endpoint already refresh  │
│ at a similar interval (within 2x)?                  │
└──────────┬──────────────────────────┬───────────────┘
           │ Yes                      │ No
           ▼                         ▼
┌───────────────────────────┐  ┌──────────────────────┐
│ Add to existing endpoint  │  │ Create new endpoint  │
│ Align to its interval     │  │ with own interval    │
└───────────────────────────┘  └──────────────────────┘
```

"Within 2x" means: if existing interval is 5 min and new data
needs 3–10 min freshness → add to existing. If new data needs
30 sec freshness → keep separate.

### What NOT to consolidate

- Queries with vastly different freshness requirements (5 min vs 10 sec)
- Queries used on different pages with no shared lifecycle
- Heavy queries that would slow down a lightweight polling endpoint

---

## Server-Side Caching

### Four storage levels

| Level | Storage | Speed | Survives restart | Shared across processes |
|---|---|---|---|---|
| 1 | **In-memory** (variable in process) | Fastest | No | No |
| 2 | **Redis** | Fast (network hop) | Yes (persistent) | Yes |
| 3 | **S3 / MinIO** | Moderate | Yes | Yes |
| 4 | **PostgreSQL** | Moderate | Yes | Yes |

**PostgreSQL is always the source of truth.** Levels 1–3 are caches
that are rebuilt from PostgreSQL on process restart.

### Decision algorithm: should I cache?

```
┌─────────────────────────────────────────────┐
│ Is this data read more than once per minute │
│ by one or more clients?                     │
└──────────┬──────────────────────┬───────────┘
           │ No                   │ Yes
           ▼                     ▼
┌─────────────────────┐  ┌──────────────────────────────┐
│ No caching needed.  │  │ Is the query fast (<10ms)    │
│ Read from           │  │ with proper indexes?         │
│ PostgreSQL directly │  └──────────┬───────────┬───────┘
└─────────────────────┘             │ Yes       │ No
                                    ▼           ▼
                          ┌──────────────┐  ┌────────────┐
                          │ No caching   │  │ Cache it   │
                          │ needed.      │  │ (choose    │
                          │ Index is     │  │  level     │
                          │ sufficient   │  │  below)    │
                          └──────────────┘  └────────────┘
```

### Decision algorithm: which cache level?

```
┌──────────────────────────────────────────────┐
│ Is the data needed by multiple processes     │
│ (API + Worker, or multiple API instances)?   │
└──────────┬───────────────────────┬───────────┘
           │ No                    │ Yes
           ▼                      ▼
┌─────────────────────┐   ┌──────────────────────────────┐
│ In-memory (level 1) │   │ Is the data binary or large  │
│                     │   │ (images, files, audio)?      │
│ Invalidate via      │   └──────────┬───────────┬───────┘
│ API mutation        │              │ Yes       │ No
│ (same process)      │              ▼           ▼
└─────────────────────┘   ┌──────────────┐ ┌───────────────┐
                          │ S3 / MinIO   │ │ Redis         │
                          │ (level 3)    │ │ (level 2)     │
                          │              │ │               │
                          │ Store object,│ │ TTL or event- │
                          │ cache URL    │ │ based         │
                          │ in Redis or  │ │ invalidation  │
                          │ in-memory    │ └───────────────┘
                          └──────────────┘
```

### Cache invalidation

Every cached value must have a defined invalidation strategy **before**
it is cached:

| Strategy | When to use | Example |
|---|---|---|
| **Synchronous** — update cache in same mutation | Data changes through your own API | Admin updates fingerprint → update in-memory + PostgreSQL |
| **TTL** — cache expires after fixed time | External data, acceptable staleness | Voice list → cache 24h in S3, URL in Redis |
| **Event-based** — invalidate on specific event | Data changes from another process | Worker completes job → event → API invalidates Redis key |

### Decision algorithm: how to invalidate?

```
┌──────────────────────────────────────────────┐
│ Does the data change through your own API?   │
└──────────┬───────────────────────┬───────────┘
           │ Yes                   │ No
           ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│ Synchronous:         │  │ Is stale data acceptable     │
│ update cache in the  │  │ for some time?               │
│ same mutation handler│  └──────────┬───────────┬───────┘
└──────────────────────┘             │ Yes       │ No
                                     ▼           ▼
                           ┌──────────────┐ ┌────────────────┐
                           │ TTL-based    │ │ Event-based    │
                           │ (set expiry) │ │ (listen for    │
                           └──────────────┘ │  change event) │
                                            └────────────────┘
```

---

## Client-Side Caching (TanStack Query)

### staleTime and gcTime

| Data type | `staleTime` | `gcTime` | Invalidation |
|---|---|---|---|
| Auth context (session + permissions) | `Infinity` | `Infinity` | Manual on refresh/logout |
| User's own data (projects, accounts) | 30s–60s | 5min | On mutation (optimistic) |
| Admin lists (all users, all jokes) | 0 | 5min | On parameter change |
| Dashboard live data | 0 | 5min | `refetchInterval` on combined endpoint |

### When NOT to cache on the client

- Computation takes **< 1ms** (e.g. `cn()`, string concatenation)
- Value is already reactive (SolidJS derived signals)
- Caching overhead (memory + invalidation) exceeds recomputation cost

---

## Checklist

Before shipping any feature that reads or writes data:

- [ ] Queries use proper indexes (no sequential scans on large tables)
- [ ] API returns only needed columns (no `SELECT *` for lists)
- [ ] No O(n²) loops without documented justification
- [ ] Lists follow the standard pagination contract
      (see [data-lists.md](./data-lists.md))
- [ ] Cache has defined invalidation strategy (if caching is used)
- [ ] No unbounded result sets from API
- [ ] Related data with same lifecycle served by single endpoint
      (see [Network Request Consolidation](#network-request-consolidation))