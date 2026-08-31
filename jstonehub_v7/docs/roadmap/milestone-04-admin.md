# Milestone 04: Admin Panel

---

## Overview

Full admin interface for managing users, permissions, pricing,
audit logs, and platform configuration. Consolidates admin
features from MS-01 through MS-03 into a polished, complete
admin experience.

**Duration:** ~4 hours
**Depends on:** MS-01 (auth, permissions), MS-02 (energy, subscriptions),
MS-03 (organizations — for org-related admin views)

---

## Step-by-Step Execution Order

```
Step 1:  Audit log viewer (API + frontend)
Step 2:  User management (enhanced from MS-01)
Step 3:  Pricing management (frontend for MS-02 endpoints)
Step 4:  Platform management (frontend for MS-03 endpoints)
Step 5:  Admin dashboard (stats, recent activity)
Step 6:  Notification system (price changes, announcements)
Step 7:  Dev seed cards on all admin pages
Step 8:  Tests
```

Note: Most API endpoints already exist from MS-01, MS-02, MS-03.
This milestone is primarily frontend work + audit log feature +
admin dashboard.

---

## Step 1: Audit Log Viewer

### API Endpoint

```
GET /api/admin/audit-log
  Permission: admin:audit:read
  Pagination: cursor mode
  Filters:
    - actor_id (who performed the action)
    - target_id (who was affected)
    - target_type ("user", "organization", "subscription", etc.)
    - action ("ban", "unban", "grant_energy", "grant_subscription",
              "grant_permission", "revoke_permission", 
              "transfer_energy", "price_change", etc.)
    - date range (created_at from/to)
  Sort: created_at (desc default)
  Search: by actor name/email, target name/email (trigram)
  Response: CursorPageResponse<{
    id, actor: { id, name, email },
    target: { id, type, name },
    action, reason, metadata, createdAt
  }>

GET /api/admin/audit-log/stats
  Permission: admin:audit:read
  Response: {
    totalToday: number,
    totalThisWeek: number,
    totalThisMonth: number,
    byAction: { action: string, count: number }[]
  }
```

### Frontend

```
Route: /admin/audit
Permission: admin:audit:read

Page layout:
  1. Stats bar (top): today / week / month counts
  2. Filters bar:
     - Search input (actor or target name/email)
     - Action dropdown (multi-select)
     - Target type dropdown
     - Date range picker
  3. Log table (cursor pagination, virtualized):
     Columns: timestamp, actor (avatar+name), action (badge),
              target (name+type), reason (truncated), details (expand)
  4. Row expansion: full metadata JSON, reason text

Action badges color-coded:
  - Red: ban, revoke_permission, revoke_subscription
  - Green: unban, grant_energy, grant_subscription, grant_permission
  - Blue: transfer_energy, price_change
  - Gray: other

No edit/delete controls. Read-only. Append-only principle enforced
at every layer.
```

---

## Step 2: User Management (Enhanced)

Builds on MS-01 user endpoints. Adds energy and subscription
management from MS-02.

### Enhanced User Detail Page

```
Route: /admin/user/:userId

Sections (tabs or accordion):

  1. PROFILE (from MS-01)
     - Avatar, name, email, created_at, updated_at
     - Ban status with ban/unban button
     - Read-only (name/email/avatar changed only by user themselves)

  2. PERMISSIONS (from MS-01)
     - Current permissions list (grouped by scope)
     - Add/remove permissions
     - Grouped UI:
       ├── Admin
       │   ├── ☑ Access admin panel (admin:access)
       │   ├── ☐ View users (admin:user:read)
       │   ├── ☐ Ban users (admin:user:ban)
       │   └── ...
       └── Organizations
           └── [list of org permissions if any]
     - "Select all" per group → collapses to :all
     - Cannot edit own permissions
     - Cannot grant admin:all without having it

  3. ENERGY (from MS-02)
     - Current balance (big number display)
     - Grant energy button:
       Amount input + quick buttons (100K, 1M, 10M)
       Reason input (required)
       Confirm dialog
     - Recent transactions table (last 20, link to full history)

  4. SUBSCRIPTIONS (from MS-02)
     - Active subscriptions list:
       Tier, starts_at, expires_at, daily_energy, discount
       Revoke button (per subscription)
     - Grant subscription button:
       Tier selector, duration selector
       Reason input (required)
       Preview of what user will receive
       Confirm dialog

  5. SESSIONS (from MS-01)
     - Active sessions table
     - Read-only (admin sees but cannot force-revoke;
       ban cascade handles session termination)

  6. ORGANIZATIONS (from MS-03)
     - Orgs owned by this user
     - Orgs where user is member (with permission list)
     - Read-only (admin sees structure, manages through org pages)

  7. AUDIT HISTORY
     - Filtered audit_log: target_id = this user
     - Chronological, newest first
     - Same format as audit log page but pre-filtered
```

### User List (Enhanced)

```
Route: /admin/user

Additions from MS-01:
  - New filter: subscription tier (all / common / rare / epic / legendary)
  - New filter: has admin permissions (yes / no)
  - New column: subscription tier badge
  - New column: energy balance (abbreviated)
  - Bulk actions (future — not in MVP):
    Select multiple → ban all / grant energy all
```

---

## Step 3: Pricing Management

Frontend for MS-02 pricing endpoints. All API endpoints already exist.

```
Route: /admin/pricing
Permission: admin:pricing:manage

Layout: single page with collapsible sections

Section 1: GLOBAL SETTINGS
  ┌──────────────────────────────────────────────────┐
  │  Base Rate: $1 = 1,000,000 energy    [read-only] │
  │                                                    │
  │  Global Markup:  [ 10 ] %            [save]       │
  │  Max Discount:   [ 70 ] %            [save]       │
  │  Sub Margin:     [ 10 ] %            [save]       │
  │                                                    │
  │  ⚠ Changing global markup recomputes all           │
  │    tool prices immediately                         │
  └──────────────────────────────────────────────────┘

Section 2: TOOL PRICING
  ┌──────────────────────────────────────────────────────────┐
  │  Tool           │ Unit   │ Real Cost │ +/- % │ Energy │ V │
  │─────────────────┼────────┼───────────┼───────┼────────┼───│
  │  Silence Remove │ second │ $0.0001   │ +0%   │ 110    │ 3 │
  │  Noise Reduce   │ second │ $0.0002   │ +5%   │ 231    │ 2 │
  │  TTS Generate   │ char   │ $0.0010   │ -2%   │ 1080   │ 1 │
  │  Image Generate │ image  │ $0.0200   │ +0%   │ 22000  │ 5 │
  │                                                           │
  │  [+ Add Tool]                                             │
  │                                                           │
  │  Click row to edit:                                       │
  │    - Real cost (USD)                                      │
  │    - Individual markup adjustment (+/- %)                 │
  │    - Coefficients (expandable JSON-like form)             │
  │    - Live preview: "1 second @ 256kbps = 143 energy"      │
  └──────────────────────────────────────────────────────────┘

Section 3: SUBSCRIPTION TIERS
  ┌──────────────────────────────────────────────────────────┐
  │  Tier      │ Monthly │ Yearly │ Disc% │ Daily  │ Pack   │
  │────────────┼─────────┼────────┼───────┼────────┼────────│
  │  Rare      │ $10     │ $100   │ 10%   │ 50K    │ 3.3M   │
  │  Epic      │ $25     │ $250   │ 30%   │ 200K   │ 10M    │
  │  Legendary │ $45     │ $450   │ 50%   │ 500K   │ 27M    │
  │                                                           │
  │  Validation:                                              │
  │    ✅ Each row must have strictly higher values            │
  │    ✅ Max discount + max org tier ≤ 70%                    │
  │    🔴 Red border + message on validation failure           │
  └──────────────────────────────────────────────────────────┘

Section 4: ORGANIZATION VOLUME TIERS
  ┌──────────────────────────────────────────────────┐
  │  Threshold (USD) │ Discount %                     │
  │──────────────────┼────────────                     │
  │  $0              │ 0%                              │
  │  $100            │ 5%                              │
  │  $1,000          │ 10%                             │
  │  $10,000         │ 20%                             │
  │                                                    │
  │  [+ Add Tier]   [Remove Last]                     │
  │                                                    │
  │  Cross-validation:                                 │
  │    Max org tier (20%) + max sub (50%) = 70% ≤ 70% │
  │    ✅ Valid                                         │
  └──────────────────────────────────────────────────┘

Section 5: PRICING SIMULATOR
  ┌──────────────────────────────────────────────────┐
  │  Tool:        [Silence Removal ▼]                 │
  │  Units:       [ 3600 ] seconds                    │
  │  Bitrate:     [ 256  ] kbps                       │
  │  Sub Tier:    [Epic ▼]                            │
  │  Org Tier:    [Tier 2 ($1000+) ▼]                 │
  │                                                    │
  │  ─── Results ───                                   │
  │  Base cost:     396,000 energy                     │
  │  With coeff:    514,800 energy (×1.3 bitrate)      │
  │  USD equivalent: $0.51                             │
  │                                                    │
  │  If purchasing energy for this:                    │
  │  Personal (Epic 30%):  $0.37                       │
  │  Org (Epic 30% + T2 10% = 40%):  $0.31            │
  └──────────────────────────────────────────────────┘
```

---

## Step 4: Platform Management

```
Route: /admin/platforms
Permission: admin:access

Two tabs:

Tab 1: PLATFORMS
  - Table: name, slug, categories (tags), API supported, active
  - Edit platform: change categories, toggle active
  - Add platform manually (without going through request flow)

Tab 2: PLATFORM REQUESTS
  - Table: requester, platform name, URL, reason, status, date
  - Filter: pending / approved / rejected
  - Actions:
    Approve → opens form to set slug, categories, API support
    Reject → requires reason
```

---

## Step 5: Admin Dashboard

```
Route: /admin/dashboard
Permission: admin:access

Layout: grid of stat cards + recent activity

Row 1: Key Metrics
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Users    │ │ Orgs     │ │ Energy   │ │ Active   │
  │ 1,234    │ │ 56       │ │ Sold     │ │ Subs     │
  │ +23 week │ │ +3 week  │ │ $4,560   │ │ 89       │
  └──────────┘ └──────────┘ └──────────┘ └──────────┘

Row 2: Charts (future — placeholder cards for now)
  - User signups per day (last 30 days)
  - Energy purchased per day (last 30 days)
  - Active subscriptions by tier (pie chart)

Row 3: Recent Activity (from audit log)
  - Last 10 admin actions
  - Click to expand or navigate to audit log

Row 4: Pending Items
  - Platform requests pending: [count] → link to /admin/platforms
  - Feedback pending: [count] → link to /admin/feedback (MS-07)
  - Banned users: [count] → link to /admin/user?filter=banned

Data source: single endpoint GET /api/admin/dashboard
  Permission: admin:access
  Response: { userCount, orgCount, energySoldUsd, activeSubCount,
              recentAudit: [...], pendingPlatformRequests,
              pendingFeedback, bannedUserCount }
  
  Cached in Redis for 60 seconds to avoid expensive aggregations
  on every dashboard load.
```

---

## Step 6: Notification System (Price Changes)

### Price Change Notification

When admin changes tool pricing:

```
API side:
  1. Price changes are immediate (tool_pricing updated)
  2. Create notification record:
     notification table:
       id, type ("price_change" | "announcement"), 
       title, body, metadata (jsonb),
       publish_at (timestamp — can be future),
       expires_at (timestamp),
       created_by (FK → user),
       created_at

  3. Active notifications returned with auth context:
     GET /api/auth/context response adds:
       notifications: [{ id, type, title, body, metadata }]

Frontend side:
  1. On auth context load, check for new notifications
  2. Show dialog/banner for price changes:
     "Tool pricing has been updated effective [date].
      Silence Removal: 110 → 130 energy/second.
      See full pricing details."
  3. User dismisses → stored in localStorage
     (notification_id → dismissed)
  4. Don't show dismissed notifications again
```

### Notification Table

```
notification
├── id          : text (PK, cuid2)
├── type        : text (NOT NULL)  — "price_change" | "announcement"
├── title       : text (NOT NULL)
├── body        : text (NOT NULL)
├── metadata    : jsonb (nullable)
├── publish_at  : timestamp with tz (NOT NULL, default now)
├── expires_at  : timestamp with tz (nullable)
├── created_by  : text (NOT NULL, FK → user)
├── created_at  : timestamp with tz (NOT NULL, default now)

Indexes:
  INDEX(publish_at, expires_at)    — active notifications query
```

Query for active notifications:
```sql
SELECT * FROM notification
WHERE publish_at <= now()
AND (expires_at IS NULL OR expires_at > now())
ORDER BY publish_at DESC
LIMIT 10
```

---

## Step 7: Dev Seed Cards

Every admin page gets a DevSeedCard at the top (dev only):

```
/admin/user           → seed/clear test users
/admin/pricing        → seed/clear default pricing config
/admin/platforms      → seed/clear test platforms
/admin/audit          → seed/clear test audit entries
/admin/dashboard      → seed all (calls all seed endpoints)
```

Each card uses the shared DevSeedCard component from @packages/ui.

---

## Step 8: Tests

### Integration Tests

```
apps/api/src/feature/audit/_test/audit.integration.test.ts
  - List audit log: returns entries with cursor pagination
  - Filter by action: returns only matching actions
  - Filter by actor: returns only entries by this admin
  - Filter by target: returns only entries affecting this user
  - Filter by date range: respects from/to
  - Search by name/email: trigram search works
  - Stats: correct counts for today/week/month
  - Append-only: no UPDATE or DELETE endpoints exist

apps/api/src/feature/notification/_test/notification.integration.test.ts
  - Create notification: visible in auth context
  - Future notification: not visible before publish_at
  - Expired notification: not visible after expires_at
  - Price change creates notification automatically
```

### E2E Tests (Playwright)

```
apps/admin/e2e/dashboard.spec.ts
  - Dashboard loads: stat cards show numbers
  - Recent activity: shows audit entries
  - Pending items: correct counts with links

apps/admin/e2e/user-management.spec.ts
  - User list: search works (trigram)
  - User list: filter by ban status
  - User list: filter by subscription tier
  - User detail: all tabs load correctly
  - Ban user: dialog, reason, cascade effects visible
  - Grant energy: amount, reason, balance updates
  - Grant subscription: tier, duration, appears in active subs
  - Permissions: add/remove, grouped UI works
  - Permissions: admin:all grayed out for non-owners

apps/admin/e2e/pricing.spec.ts
  - Global settings: change markup, save, tools recompute
  - Tool pricing: edit real cost, energy cost updates
  - Tool pricing: coefficient editor works
  - Subscription tiers: validation prevents invalid config
  - Org volume tiers: cross-validation with subscription discount
  - Pricing simulator: inputs produce correct calculations
  - Price change: notification created, visible in Hub

apps/admin/e2e/audit.spec.ts
  - Audit log: loads with pagination
  - Audit log: filters work (action, target, date)
  - Audit log: search by name works
  - Audit log: no edit/delete controls visible
```

---

## API Endpoint Summary (New in MS-04)

Most endpoints already exist from MS-01/02/03. New endpoints:

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | /api/admin/audit-log | admin:audit:read | Audit log list |
| GET | /api/admin/audit-log/stats | admin:audit:read | Audit stats |
| GET | /api/admin/dashboard | admin:access | Dashboard aggregates |
| POST | /api/admin/notifications | admin:pricing:manage | Create notification |
| GET | /api/admin/notifications | admin:access | List notifications |
| DELETE | /api/admin/notifications/:id | admin:pricing:manage | Delete notification |

Endpoints reused from previous milestones (frontend built in MS-04):

| Method | Path | From | Purpose |
|---|---|---|---|
| GET | /api/admin/users | MS-01 | User list |
| GET | /api/admin/users/:id | MS-01 | User detail |
| PATCH | /api/admin/users/:id/ban | MS-01 | Ban/unban |
| GET | /api/admin/permissions | MS-01 | Permission list |
| PUT | /api/admin/permissions/:userId | MS-01 | Update permissions |
| GET | /api/admin/pricing/config | MS-02 | Pricing config |
| PUT | /api/admin/pricing/config | MS-02 | Update config |
| GET | /api/admin/pricing/tools | MS-02 | Tool list |
| PUT | /api/admin/pricing/tools/:key | MS-02 | Update tool |
| GET | /api/admin/pricing/subscriptions | MS-02 | Sub configs |
| PUT | /api/admin/pricing/subscriptions/:tier | MS-02 | Update sub |
| GET | /api/admin/pricing/org-tiers | MS-02 | Org tiers |
| PUT | /api/admin/pricing/org-tiers | MS-02 | Update tiers |
| POST | /api/admin/users/:id/grant-energy | MS-02 | Grant energy |
| POST | /api/admin/users/:id/grant-subscription | MS-02 | Grant sub |
| POST | /api/admin/users/:id/revoke-subscription | MS-02 | Revoke sub |
| GET | /api/admin/platform-requests | MS-03 | Platform requests |
| POST | /api/admin/platform-requests/:id/resolve | MS-03 | Resolve request |

---

## File Structure (New Files)

```
apps/api/src/feature/
├── audit/
│   ├── audit.table.ts                     ← EXISTS (from MS-01)
│   ├── audit.repository.ts               ← EXISTS (from MS-01)
│   ├── audit.service.ts                   ← EXISTS (from MS-01)
│   ├── audit.v1.ts                        ← NEW (admin endpoints)
│   ├── audit.type.ts                      ← EXISTS (from MS-01)
│   └── _test/
│       └── audit.integration.test.ts      ← NEW
│
├── notification/
│   ├── notification.table.ts              ← NEW
│   ├── notification.repository.ts         ← NEW
│   ├── notification.service.ts            ← NEW
│   ├── notification.v1.ts                 ← NEW
│   ├── notification.type.ts               ← NEW
│   └── _test/
│       └── notification.integration.test.ts ← NEW
│
├── admin-dashboard/
│   ├── admin-dashboard.service.ts         ← NEW
│   ├── admin-dashboard.v1.ts              ← NEW
│   └── admin-dashboard.type.ts            ← NEW

apps/admin/src/app/routes/_private/
├── dashboard.tsx                          ← UPDATED (real dashboard)
├── user/
│   ├── index.tsx                          ← UPDATED (enhanced filters)
│   └── $userId.tsx                        ← UPDATED (energy, subs, audit tabs)
├── pricing/
│   └── index.tsx                          ← NEW (full pricing page)
├── platform/
│   └── index.tsx                          ← NEW (platforms + requests)
├── audit/
│   └── index.tsx                          ← NEW (audit log viewer)
└── notification/
    └── index.tsx                          ← NEW (notification management)
```

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Two admins edit same tool pricing simultaneously | Last write wins. price_version incremented on each save. UI shows "config has been updated" if version mismatch on save (optimistic locking) |
| Admin changes global markup while users are active | All tool prices recomputed immediately. Active clients get 409 on next tool use with stale price_version. Frontend shows dialog with new price |
| Dashboard stats query is slow on large dataset | Cached in Redis for 60 seconds. Cache invalidated on any admin mutation. First load after invalidation is slow, subsequent loads fast |
| Notification expires while user has it open | Harmless. User sees it, dismisses it. Next auth context load won't include it |
| Admin grants admin:all to someone else | Only possible if granter has admin:all. Audit logged. Both users now have full admin access |
| Admin pricing simulator shows different result than actual deduction | Simulator uses same calculateToolCost function as actual deduction. If results differ, it's a bug. Both paths share code |
