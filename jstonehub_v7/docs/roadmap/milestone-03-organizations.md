# Milestone 03: Organizations

---

## Overview

Users can create organizations, invite members with granular
permissions, allocate energy budgets to projects and social
accounts. Full hierarchical structure: org → project → social
account → content type.

**Duration:** ~4 hours
**Depends on:** MS-01 (auth, permissions), MS-02 (energy, subscriptions)

---

## Step-by-Step Execution Order

```
Step 1:  @packages/contract — org types, resource permissions
Step 2:  Database tables — organization, project, social_account,
         content_type, social_platform
Step 3:  Organization service — CRUD, member management
Step 4:  Budget service — allocation, tracking, enforcement
Step 5:  Project & social account services
Step 6:  Social platform service — platform entity, requests
Step 7:  API endpoints
Step 8:  Hub frontend — org dashboard, projects, accounts
Step 9:  Admin frontend — org overview (read-only for admin)
Step 10: Dev seed
Step 11: Tests
```

---

## Step 1: @packages/contract Updates

### Organization types

```
packages/contract/src/organization.ts

ORG_PERMISSION_ACTION = [
  "all", "manage", "fund", "view_logs",
  "project:create", "project:delete"
] as const

PROJECT_PERMISSION_ACTION = ["manage", "view"] as const
ACCOUNT_PERMISSION_ACTION = ["manage", "view"] as const

BUDGET_MODE = ["limited", "unlimited"] as const
type BudgetMode = typeof BUDGET_MODE[number]

Functions:
  formatOrgPermission(orgId: string, action: string): string
    — returns "org:{orgId}:{action}"
  
  formatProjectPermission(projectId: string, action: string): string
    — returns "project:{projectId}:{action}"
  
  formatAccountPermission(accountId: string, action: string): string
    — returns "account:{accountId}:{action}"
```

---

## Step 2: Database Tables

### organization

```
organization
├── id              : text (PK, cuid2)
├── name            : text (NOT NULL)
├── slug            : text (UNIQUE, NOT NULL)
├── owner_id        : text (NOT NULL, FK → user ON DELETE RESTRICT)
├── energy_balance  : bigint (NOT NULL, default 0)
├── total_purchased_usd : numeric(20,2) (NOT NULL, default 0)
├── budget_mode     : text (NOT NULL, default "limited")
├── created_at      : timestamp with tz (NOT NULL, default now)
├── updated_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(slug)
  UNIQUE(owner_id)              — one org per owner
  INDEX(created_at)
```

`ON DELETE RESTRICT` on owner_id: cannot delete user who owns
an organization. Must delete org first.

`total_purchased_usd`: running total of all direct purchases
for this org. Used to determine volume discount tier. Updated
atomically on each purchase.

`budget_mode`: "limited" = budgets enforced on projects/accounts.
"unlimited" = no budget limits, spend from org balance freely.

### project

```
project
├── id              : text (PK, cuid2)
├── organization_id : text (NOT NULL, FK → organization ON DELETE CASCADE)
├── name            : text (NOT NULL)
├── slug            : text (NOT NULL)
├── description     : text (nullable)
├── budget_allocated: bigint (NOT NULL, default 0) — reserved from org
├── budget_spent    : bigint (NOT NULL, default 0) — consumed so far
├── is_archived     : boolean (NOT NULL, default false)
├── created_at      : timestamp with tz (NOT NULL, default now)
├── updated_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(organization_id, slug)          — unique slug within org
  INDEX(organization_id, is_archived)    — list active projects
```

`budget_allocated`: energy reserved from organization balance.
This amount is subtracted from org.energy_balance when allocated.
`budget_spent`: how much of allocated budget has been consumed.
Available = budget_allocated - budget_spent.

When budget_mode = "unlimited", budget_allocated = 0, spending
draws directly from org.energy_balance.

### social_account

```
social_account
├── id              : text (PK, cuid2)
├── project_id      : text (NOT NULL, FK → project ON DELETE CASCADE)
├── platform_id     : text (NOT NULL, FK → social_platform ON DELETE RESTRICT)
├── name            : text (NOT NULL)
├── platform_url    : text (nullable)          — link to channel/page
├── platform_data   : jsonb (nullable)         — cached API data (logo, subs)
├── platform_data_fetched_at : timestamp with tz (nullable)
├── languages       : text[] (NOT NULL, default '{}')
├── budget_allocated: bigint (NOT NULL, default 0)
├── budget_spent    : bigint (NOT NULL, default 0)
├── is_archived     : boolean (NOT NULL, default false)
├── created_at      : timestamp with tz (NOT NULL, default now)
├── updated_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  INDEX(project_id, is_archived)          — list active accounts
  INDEX(platform_id)                      — FK lookup
```

### content_type

```
content_type
├── id              : text (PK, cuid2)
├── social_account_id : text (NOT NULL, FK → social_account ON DELETE CASCADE)
├── name            : text (NOT NULL)         — "Vertical video + dynamic bg"
├── description     : text (nullable)
├── category        : text (NOT NULL)         — from platform's categories
├── energy_limit    : bigint (nullable)       — max energy for this type (null=no limit)
├── energy_spent    : bigint (NOT NULL, default 0)
├── publish_target  : jsonb (nullable)        — { daily: 2, weekly: 10, monthly: 30 }
├── publish_actual  : jsonb (NOT NULL, default '{}') — tracked counts
├── is_active       : boolean (NOT NULL, default true)
├── created_at      : timestamp with tz (NOT NULL, default now)
├── updated_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  INDEX(social_account_id, is_active)
```

### social_platform

```
social_platform
├── id              : text (PK, cuid2)
├── name            : text (UNIQUE, NOT NULL)  — "YouTube", "Instagram"
├── slug            : text (UNIQUE, NOT NULL)  — "youtube", "instagram"
├── icon_url        : text (nullable)
├── categories      : text[] (NOT NULL)        — ["horizontal_video", "vertical_video", 
│                                                  "short", "post", "story", "audio"]
├── api_supported   : boolean (NOT NULL, default false)
├── is_active       : boolean (NOT NULL, default true)
├── created_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(name)
  UNIQUE(slug)
```

### platform_request

```
platform_request
├── id              : text (PK, cuid2)
├── user_id         : text (NOT NULL, FK → user ON DELETE CASCADE)
├── platform_name   : text (NOT NULL)
├── platform_url    : text (nullable)
├── reason          : text (nullable)
├── status          : text (NOT NULL, default "pending")
│                     — "pending" | "approved" | "rejected"
├── resolved_by     : text (nullable, FK → user ON DELETE SET NULL)
├── resolved_at     : timestamp with tz (nullable)
├── created_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  INDEX(status, created_at)              — pending requests queue
  INDEX(user_id)
```

---

## Step 3: Organization Service

```
Location: apps/api/src/feature/organization/organization.service.ts

Functions:

  createOrganization(params: {
    ownerId: string
    name: string
    slug: string
  })
    1. Validate slug format (lowercase, alphanumeric + hyphens)
    2. In transaction:
       a. INSERT organization (owner_id = ownerId)
          — UNIQUE(owner_id) prevents second org
       b. INSERT permission:
          user_id = ownerId
          permission = "org:{newOrgId}:all"
          granted_by = ownerId
    3. Return organization

  getOrganization(orgId: string, userId: string)
    1. Load org by ID
    2. Check: user has any org:{orgId}:* permission
    3. Return org with budget info

  updateOrganization(params: {
    orgId: string
    actorId: string
    name?: string
    slug?: string
    budgetMode?: BudgetMode
  })
    Permission: org:{orgId}:manage
    On budgetMode change to "unlimited":
      — All project/account budgets become informational only
    On budgetMode change to "limited":
      — Existing allocated budgets become enforced again

  deleteOrganization(params: {
    orgId: string
    actorId: string
  })
    1. Verify actor is owner (org.owner_id === actorId)
    2. In transaction:
       a. DELETE FROM permission WHERE permission LIKE 'org:{orgId}:%'
       b. DELETE FROM permission WHERE permission LIKE 'project:{any project id}:%'
       c. DELETE FROM permission WHERE permission LIKE 'account:{any account id}:%'
       d. DELETE organization (CASCADE deletes projects, accounts, content_types)
    3. Energy in org balance is LOST (burns)
    4. Audit log

  listMembers(orgId: string)
    SELECT DISTINCT p.user_id, u.name, u.email, u.avatar_url,
           array_agg(p.permission) as permissions
    FROM permission p
    JOIN "user" u ON u.id = p.user_id
    WHERE p.permission LIKE 'org:{orgId}:%'
       OR p.permission LIKE 'project:{project_ids}:%'
       OR p.permission LIKE 'account:{account_ids}:%'
    GROUP BY p.user_id, u.name, u.email, u.avatar_url
    
    Note: "member" = anyone with any permission scoped to this org
    or its resources. No separate member table needed.

  inviteMember(params: {
    orgId: string
    actorId: string
    targetUserId: string
    permissions: string[]       — ["org:{orgId}:fund", "project:{id}:manage"]
  })
    Permission: org:{orgId}:manage
    Validation:
      - Cannot invite self (already owner)
      - Cannot grant org:{orgId}:all (reserved for owner)
      - All permission strings must reference this org or its resources
      - Target user must exist and not be banned
    Logic:
      1. INSERT permissions (batch)
      2. Audit log

  removeMember(params: {
    orgId: string
    actorId: string
    targetUserId: string
  })
    Permission: org:{orgId}:manage
    Validation:
      - Cannot remove owner
      - Cannot remove self (owner cannot leave)
    Logic:
      1. DELETE FROM permission
         WHERE user_id = targetId
         AND (permission LIKE 'org:{orgId}:%'
              OR permission LIKE 'project:{any project of org}:%'
              OR permission LIKE 'account:{any account of org}:%')
      2. Audit log

  updateMemberPermissions(params: {
    orgId: string
    actorId: string
    targetUserId: string
    permissions: string[]
  })
    Permission: org:{orgId}:manage
    Same validation as inviteMember
    Logic: diff + delete removed + insert added
```

### Permission Cleanup Helper

```
Location: apps/api/src/feature/organization/org-permission.helper.ts

When a project or account is deleted, we need to clean up
permissions. This helper handles it efficiently:

  cleanupResourcePermissions(resourceType: "project" | "account", resourceId: string)
    DELETE FROM permission
    WHERE permission LIKE '{resourceType}:{resourceId}:%'
    
    Uses INDEX(permission) → index scan, not full table scan.
    Pattern matching with LIKE on indexed column uses the index
    when the pattern has a fixed prefix (which it does).
```

---

## Step 4: Budget Service

```
Location: apps/api/src/feature/organization/budget.service.ts

Functions:

  allocateBudget(params: {
    orgId: string
    targetType: "project" | "account"
    targetId: string
    amount: bigint
    actorId: string
  })
    Permission: org:{orgId}:manage
    Logic (in transaction):
      1. If target is project:
         a. UPDATE organization
            SET energy_balance = energy_balance - amount
            WHERE id = orgId AND energy_balance >= amount
            — If no rows → InsufficientOrgBalanceError
         b. UPDATE project
            SET budget_allocated = budget_allocated + amount
            WHERE id = targetId
      2. If target is account:
         a. Get parent project
         b. UPDATE project
            SET budget_allocated = budget_allocated - amount
            WHERE id = projectId
            AND (budget_allocated - budget_spent) >= amount
            — Available budget check
         c. UPDATE social_account
            SET budget_allocated = budget_allocated + amount
            WHERE id = targetId
      3. Energy transaction log
      4. Audit log

  releaseBudget(params: {
    orgId: string
    targetType: "project" | "account"
    targetId: string
    amount: bigint
    actorId: string
  })
    Reverse of allocate: moves unspent budget back up.
    Validation: amount <= (budget_allocated - budget_spent)
    Cannot release already-spent budget.

  debitFromBudget(params: {
    accountId: string
    amount: bigint
    toolId: string
    priceVersion: number
  })
    Called by tool execution.
    Logic:
      1. If org budget_mode = "unlimited":
         UPDATE organization
         SET energy_balance = energy_balance - amount
         WHERE id = orgId AND energy_balance >= amount
      2. If org budget_mode = "limited":
         a. UPDATE social_account
            SET budget_spent = budget_spent + amount
            WHERE id = accountId
            AND (budget_allocated - budget_spent) >= amount
            — Hard limit enforcement
         b. Also update project.budget_spent
         c. If account has no budget (budget_allocated = 0):
            Fall back to project budget
         d. If project budget also insufficient → error
      3. Energy transaction log (with org_id, tool_id)
      4. Update content_type.energy_spent if applicable

  getBudgetSummary(orgId: string)
    Returns:
      orgBalance, totalAllocated, totalSpent,
      projects: [{ id, name, allocated, spent, available,
        accounts: [{ id, name, allocated, spent, available }]
      }]
```

### Budget Flow Diagram

```
Organization (energy_balance: 10M)
  │
  ├─ allocateBudget(project-A, 5M)
  │   Organization: energy_balance = 5M
  │   Project A: budget_allocated = 5M, budget_spent = 0
  │   │
  │   ├─ allocateBudget(account-X, 2M)  [from project A]
  │   │   Project A: budget_allocated = 5M (unchanged, tracked at account level)
  │   │   Account X: budget_allocated = 2M, budget_spent = 0
  │   │   │
  │   │   ├─ debitFromBudget(account-X, 500)  [tool usage]
  │   │   │   Account X: budget_spent = 500
  │   │   │   Project A: budget_spent = 500
  │   │   │
  │   │   └─ Available: 2M - 500 = 1,999,500
  │   │
  │   └─ Project A available (unallocated to accounts): 3M
  │
  └─ Org unallocated: 5M
```

---

## Step 5: Project & Social Account Services

### Project Service

```
Location: apps/api/src/feature/project/project.service.ts

Functions:

  createProject(params: {
    orgId: string
    actorId: string
    name: string
    slug: string
    description?: string
    budgetAmount?: bigint       — initial budget allocation
  })
    Permission: org:{orgId}:project:create
    Logic:
      1. INSERT project
      2. If budgetAmount > 0:
         allocateBudget(orgId, "project", projectId, budgetAmount)
      3. Return project

  updateProject(params: {
    projectId: string
    actorId: string
    name?: string
    slug?: string
    description?: string
  })
    Permission: project:{projectId}:manage
    
  archiveProject(params: {
    projectId: string
    actorId: string
  })
    Permission: org:{orgId}:project:delete
    Logic:
      1. Set is_archived = true
      2. Release unspent budget back to org
      3. Archive all social accounts within
      4. Cleanup resource permissions

  deleteProject(params: {
    projectId: string
    actorId: string
  })
    Permission: org:{orgId}:project:delete
    Validation: must be archived first (soft delete → hard delete)
    Logic:
      1. Verify is_archived = true
      2. DELETE project (CASCADE: accounts, content_types)
      3. cleanupResourcePermissions("project", projectId)
      4. Clean up account permissions for all accounts
```

### Social Account Service

```
Location: apps/api/src/feature/social-account/social-account.service.ts

Functions:

  createAccount(params: {
    projectId: string
    actorId: string
    platformId: string
    name: string
    platformUrl?: string
    languages: string[]
  })
    Permission: project:{projectId}:manage
    Logic:
      1. Validate platform exists and is active
      2. INSERT social_account
      3. If platformUrl provided → queue platform data fetch
      4. Return account

  updateAccount(...)
    Permission: account:{accountId}:manage

  archiveAccount(...)
    Permission: project:{projectId}:manage
    Release unspent budget back to project.

  fetchPlatformData(accountId: string)
    Called by worker or manually:
    1. Read platform_url
    2. Based on platform (YouTube, etc.), call appropriate API
    3. Extract: name, logo, subscriber count, etc.
    4. Store in platform_data, update platform_data_fetched_at
    
    For YouTube: use YouTube Data API v3 (channels endpoint)
    Cache for 24h. Rate limited.
```

### Content Type Service

```
Location: apps/api/src/feature/content-type/content-type.service.ts

Functions:

  createContentType(params: {
    accountId: string
    actorId: string
    name: string
    category: string        — must be in platform's categories
    energyLimit?: bigint
    publishTarget?: { daily?: number, weekly?: number, monthly?: number }
  })
    Permission: account:{accountId}:manage
    Validation: category must exist in social_platform.categories

  updateContentType(...)
    Permission: account:{accountId}:manage

  trackPublish(contentTypeId: string)
    Increment publish_actual counters.
    Called when content is published (manually or via API tracking).
```

---

## Step 6: Social Platform Service

```
Location: apps/api/src/feature/social-platform/social-platform.service.ts

Functions:

  listPlatforms()
    — Returns all active platforms
    — Cached in memory, refreshed on mutation

  createPlatform(params: {
    name: string
    slug: string
    categories: string[]
    apiSupported: boolean
  })
    Permission: admin:access (admin only for now)

  requestPlatform(params: {
    userId: string
    platformName: string
    platformUrl?: string
    reason?: string
  })
    — Any authenticated user can request
    — Creates platform_request with status "pending"

  resolveRequest(params: {
    requestId: string
    actorId: string
    status: "approved" | "rejected"
  })
    Permission: admin:access
    If approved:
      — Create social_platform from request data
      — Update request status
    If rejected:
      — Update request status
```

---

## Step 7: API Endpoints

### Organization Endpoints

```
POST /api/org
  Auth: required
  Body: { name, slug }
  → 201: organization created
  → 409: already owns an organization

GET /api/org/mine
  Auth: required
  Response: [{ id, name, slug, role: "owner" | "member",
               energyBalance, budgetMode }]
  Returns all orgs where user has any permission.

GET /api/org/:orgId
  Permission: any org:{orgId}:* permission
  Response: full org details + budget summary

PUT /api/org/:orgId
  Permission: org:{orgId}:manage
  Body: { name?, slug?, budgetMode? }

DELETE /api/org/:orgId
  Validation: must be owner
  Body: { confirmSlug: string }  — must match org slug
  → Deletes org, burns energy, cleans permissions

GET /api/org/:orgId/members
  Permission: org:{orgId}:manage or org:{orgId}:view_logs
  Response: [{ userId, name, email, avatar, permissions }]

POST /api/org/:orgId/members
  Permission: org:{orgId}:manage
  Body: { userId, permissions: string[] }
  → Invites member with permissions

PUT /api/org/:orgId/members/:userId
  Permission: org:{orgId}:manage
  Body: { permissions: string[] }
  → Updates member permissions

DELETE /api/org/:orgId/members/:userId
  Permission: org:{orgId}:manage
  → Removes member (deletes all org-scoped permissions)
```

### Budget Endpoints

```
POST /api/org/:orgId/budget/allocate
  Permission: org:{orgId}:manage
  Body: { targetType, targetId, amount }

POST /api/org/:orgId/budget/release
  Permission: org:{orgId}:manage
  Body: { targetType, targetId, amount }

GET /api/org/:orgId/budget
  Permission: org:{orgId}:manage or org:{orgId}:view_logs
  Response: full budget tree (org → projects → accounts)
```

### Project Endpoints

```
POST /api/org/:orgId/projects
  Permission: org:{orgId}:project:create
  Body: { name, slug, description?, budgetAmount? }

GET /api/org/:orgId/projects
  Permission: any project permission within org, or org-level
  Response: projects the user can see

GET /api/project/:projectId
  Permission: project:{projectId}:view or :manage
  Response: project + accounts + budget info

PUT /api/project/:projectId
  Permission: project:{projectId}:manage

POST /api/project/:projectId/archive
  Permission: org:{orgId}:project:delete

DELETE /api/project/:projectId
  Permission: org:{orgId}:project:delete
  Validation: must be archived
```

### Social Account Endpoints

```
POST /api/project/:projectId/accounts
  Permission: project:{projectId}:manage
  Body: { platformId, name, platformUrl?, languages }

GET /api/project/:projectId/accounts
  Permission: project view or manage, or account-level
  Response: accounts the user can see

GET /api/account/:accountId
  Permission: account:{accountId}:view or :manage
  Response: account + content types + platform data

PUT /api/account/:accountId
  Permission: account:{accountId}:manage

POST /api/account/:accountId/archive
  Permission: project:{projectId}:manage

POST /api/account/:accountId/fetch-platform-data
  Permission: account:{accountId}:manage
  → Queues platform data refresh
```

### Content Type Endpoints

```
POST /api/account/:accountId/content-types
  Permission: account:{accountId}:manage
  Body: { name, category, energyLimit?, publishTarget? }

GET /api/account/:accountId/content-types
  Permission: account:{accountId}:view or :manage

PUT /api/content-type/:id
  Permission: account:{accountId}:manage

DELETE /api/content-type/:id
  Permission: account:{accountId}:manage
```

### Social Platform Endpoints

```
GET /api/platforms
  Auth: required
  Response: [{ id, name, slug, iconUrl, categories }]
  Cached in memory.

POST /api/platforms/request
  Auth: required
  Body: { platformName, platformUrl?, reason? }

GET /api/admin/platform-requests
  Permission: admin:access
  Pagination: cursor
  Filter: status

POST /api/admin/platform-requests/:id/resolve
  Permission: admin:access
  Body: { status: "approved" | "rejected", categories? }
```

### Energy Tracking Endpoints

```
GET /api/org/:orgId/energy-logs
  Permission: org:{orgId}:view_logs
  Pagination: cursor
  Filters: project, account, tool, type, date range
  Response: energy transactions scoped to this org

GET /api/org/:orgId/energy-summary
  Permission: org:{orgId}:view_logs
  Query: period (e.g. "2024-01")
  Response: aggregated spend by project, account, tool
```

---

## Step 8: Hub Frontend

### Organization Routes

```
routes/_private/
├── org/
│   ├── create.tsx              ← create organization form
│   ├── index.tsx               ← org selector (if member of multiple)
│   └── $orgSlug/
│       ├── index.tsx           ← org dashboard (budget overview)
│       ├── members.tsx         ← member management
│       ├── settings.tsx        ← org settings
│       ├── energy.tsx          ← energy logs, transfer, purchase
│       ├── projects/
│       │   ├── index.tsx       ← project list
│       │   ├── create.tsx      ← create project
│       │   └── $projectSlug/
│       │       ├── index.tsx   ← project dashboard
│       │       ├── accounts/
│       │       │   ├── index.tsx     ← account list
│       │       │   ├── create.tsx    ← create account
│       │       │   └── $accountId/
│       │       │       ├── index.tsx       ← account dashboard
│       │       │       └── content-types/
│       │       │           └── index.tsx   ← content type management
│       │       └── settings.tsx
│       └── budget.tsx          ← budget allocation tree
```

### Organization Dashboard

```
Route: /org/:orgSlug
Permission-aware: shows only what user can see

Sections:
  1. Header: org name, balance (if can view), budget mode indicator
  2. Quick stats: total projects, total accounts, active members
  3. Budget tree (if org:{id}:manage or :view_logs):
     Visual tree: org → projects → accounts
     Each node shows: allocated / spent / available
     Color coding: green (>50% available), yellow (20-50%), red (<20%)
  4. Recent activity: latest energy transactions
  5. Quick actions: create project, invite member, fund org
```

### Member Management

```
Route: /org/:orgSlug/members
Permission: org:{id}:manage

Features:
  - List members with their permissions (grouped by scope)
  - Invite new member:
    1. Search user by email
    2. Select permissions via checkbox tree:
       ├── Organization
       │   ├── Manage org settings
       │   ├── Fund org balance
       │   ├── View energy logs
       │   ├── Create projects
       │   └── Delete projects
       ├── Project: [select project]
       │   ├── Manage project
       │   └── View project
       └── Account: [select account]
           ├── Manage account
           └── View account
    3. Confirm and send invite
  - Edit member permissions (same checkbox tree)
  - Remove member (with confirmation dialog)
  
  Owner shown separately at top, not editable.
```

### Energy Page (Org)

```
Route: /org/:orgSlug/energy
Permission: org:{id}:fund or org:{id}:view_logs

Tabs:
  1. Overview
     - Org balance
     - Volume discount tier + current discount
     - Purchase history chart (monthly)
  
  2. Fund Organization
     Permission: org:{id}:fund
     Two options:
       a. Transfer from personal balance
          - Amount input
          - Preview: "Transfer 1M energy → org balance"
          - Warning: "This action is irreversible"
       b. Purchase directly for org
          - Amount in USD
          - Shows: discount breakdown (owner sub + volume tier)
          - Shows: energy to receive
          - (For MVP: triggers admin grant. For MS-09: Stripe checkout)
  
  3. Transaction Log
     Permission: org:{id}:view_logs
     - Filterable table (cursor pagination)
     - Filters: project, account, tool, type, date range
     - Export capability (future)
  
  4. Summary
     Permission: org:{id}:view_logs
     - Monthly aggregated view
     - Breakdown by: project, account, tool
     - Charts (bar/line)
```

---

## Step 9: Admin Frontend

### Organization Overview (Admin)

```
Route: /admin/organizations (future — not critical for MVP)
Permission: admin:access

For MS-03 MVP, admin can view organizations through user detail page:
  User Detail → "Organizations" section
  Shows: orgs owned, orgs member of, permissions in each

Full admin org management page deferred to post-MVP.
```

---

## Step 10: Dev Seed

```
POST /api/dev/seed/organizations
Body: { count: number }

Creates:
  1. Organization with full hierarchy:
     - "__test__ Content Studio"
     - 3 projects: "English Jokes", "Spanish Stories", "German Quotes"
     - Each project: 2 social accounts (YouTube, Instagram)
     - Each account: 2 content types
     - Budget allocated at each level
     
  2. Members with various permissions:
     - Owner with org:all
     - Manager with org:manage + org:fund
     - Project manager with project:{id}:manage for one project
     - Account worker with account:{id}:manage for one account
     - Viewer with org:view_logs only

  3. Energy transactions (50 random within org)

  4. Social platforms:
     - YouTube, Instagram, TikTok, VK, RuTube
     - Each with appropriate categories

  5. Platform requests (3 pending)

DELETE /api/dev/seed/organizations
  Removes all __test__ org data
```

---

## Step 11: Tests

### Unit Tests

```
packages/contract/src/_test/organization.test.ts
  - formatOrgPermission: correct format
  - formatProjectPermission: correct format
  - formatAccountPermission: correct format

apps/api/src/feature/organization/_test/budget.service.test.ts
  - Allocate: org balance decreases, project budget increases
  - Allocate: insufficient org balance → error
  - Release: project budget decreases, org balance increases
  - Release: cannot release more than unspent
  - Debit limited mode: checks account budget
  - Debit limited mode: insufficient → error
  - Debit unlimited mode: draws from org balance directly
  - Nested: account budget from project budget
```

### Integration Tests

```
apps/api/src/feature/organization/_test/organization.integration.test.ts
  - Create org: success

  Продолжаю:

---

# docs/roadmap/milestone-03-organizations.md (продолжение)

```md
### Integration Tests (continued)

```
apps/api/src/feature/organization/_test/organization.integration.test.ts
  - Create org: success, owner gets org:{id}:all permission
  - Create org: second org → 409 (one per owner)
  - Create org: duplicate slug → 409
  - Get org: owner sees full details
  - Get org: member with view_logs sees budget info
  - Get org: user without permission → 403
  - Update org: owner can change name, slug, budgetMode
  - Update org: member without manage → 403
  - Delete org: owner can delete, energy burns
  - Delete org: must confirm slug
  - Delete org: non-owner → 403
  - Delete org: cascades projects, accounts, content_types
  - Delete org: cleans all org/project/account permissions

apps/api/src/feature/organization/_test/member.integration.test.ts
  - List members: returns all users with org-scoped permissions
  - Invite member: permissions created, user appears in list
  - Invite member: cannot grant org:{id}:all → 400
  - Invite member: target user not found → 404
  - Invite member: target user banned → 400
  - Invite member: permission must reference this org → 400
  - Update member: add/remove permissions, diff applied correctly
  - Remove member: all org/project/account permissions deleted
  - Remove member: cannot remove owner → 400
  - Remove member: owner cannot remove self → 400

apps/api/src/feature/organization/_test/budget.integration.test.ts
  - Allocate to project: org balance decreases, project allocated increases
  - Allocate to project: exceeds org balance → 402
  - Allocate to account: from project available budget
  - Allocate to account: exceeds project available → 402
  - Release from project: unspent returns to org
  - Release from account: unspent returns to project
  - Release: cannot release more than available (allocated - spent) → 400
  - Debit (limited mode): account budget_spent increases
  - Debit (limited mode): project budget_spent increases
  - Debit (limited mode): exceeds account budget → 402
  - Debit (unlimited mode): org balance decreases directly
  - Debit (unlimited mode): exceeds org balance → 402
  - Concurrent debit: two requests, PostgreSQL row lock prevents race
  - Budget summary: correct tree with allocated/spent/available at each level

apps/api/src/feature/project/_test/project.integration.test.ts
  - Create project: success with budget allocation
  - Create project: without permission → 403
  - Create project: duplicate slug within org → 409
  - Update project: with project:manage permission
  - Update project: without permission → 403
  - Archive project: releases unspent budget to org
  - Archive project: cascades to archive all accounts
  - Delete project: must be archived first → 400
  - Delete project: cascades accounts, content_types
  - Delete project: cleans project and account permissions

apps/api/src/feature/social-account/_test/social-account.integration.test.ts
  - Create account: success with platform validation
  - Create account: invalid platform → 400
  - Create account: without project:manage → 403
  - Update account: with account:manage permission
  - Archive account: releases unspent budget to project
  - Fetch platform data: queues worker job (or direct for YouTube)
  - Platform data: cached, not re-fetched within 24h

apps/api/src/feature/content-type/_test/content-type.integration.test.ts
  - Create content type: category must match platform categories
  - Create content type: invalid category → 400
  - Update content type: energy limit, publish target
  - Energy tracking: energy_spent incremented on tool usage
  - Publish tracking: publish_actual updated

apps/api/src/feature/social-platform/_test/social-platform.integration.test.ts
  - List platforms: returns active platforms
  - Request platform: creates pending request
  - Request platform: duplicate name from same user → 409
  - Resolve request (approve): platform created, request updated
  - Resolve request (reject): request updated, no platform created
```

### E2E Tests (Playwright)

```
apps/hub/e2e/organization.spec.ts
  - Create organization: fill form, submit, redirected to org dashboard
  - Create second org: error displayed
  - Org dashboard: budget tree visible for owner
  - Invite member: search user, select permissions, confirm
  - Member list: shows all members with permissions
  - Remove member: confirmation dialog, member disappears
  - Fund org: transfer from personal balance
  - Fund org: irreversible warning displayed
  - Create project: form, budget allocation, appears in list
  - Create account: select platform, add languages
  - Budget allocation: visual tree updates after allocation
  - Archive project: confirmation, budget released
```

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Owner tries to leave organization | Cannot. Must delete org. Enforced in service |
| Delete user who owns organization | ON DELETE RESTRICT on owner_id. Must delete org first (or admin bans user, but org persists with banned owner — energy frozen) |
| Ban user who owns organization | User banned, but org persists. Other members can still work if they have permissions. Owner cannot login. Energy in org preserved but owner cannot manage. Unban restores access |
| Ban user who is org member | Admin permissions deleted (from MS-01). Org permissions: configurable — for now, also deleted on ban. User loses all org access |
| Two admins allocate budget simultaneously | PostgreSQL row lock on UPDATE WHERE balance >= amount. First succeeds, second may fail if balance insufficient |
| Project slug collision across different orgs | UNIQUE(organization_id, slug) allows same slug in different orgs |
| Platform data fetch fails (YouTube API down) | Retry in worker (3 attempts with exponential backoff). After failure: platform_data stays null, UI shows "data unavailable" |
| User has account:manage but not project:view | Can manage the account but cannot see project-level info. This is valid — worker assigned to specific account only |
| Budget mode changed from unlimited to limited | Projects/accounts retain current budget_allocated (which was 0 in unlimited mode). Owner must allocate budgets explicitly |
| Org energy balance goes to 0 | All operations requiring energy fail with 402. No automatic notification (future: email/SSE notification) |

---

## File Structure (New Files)

```
packages/contract/src/
├── organization.ts                                ← NEW
├── _test/
│   └── organization.test.ts                       ← NEW

apps/api/src/feature/
├── organization/
│   ├── organization.table.ts                      ← NEW
│   ├── organization.repository.ts                 ← NEW
│   ├── organization.service.ts                    ← NEW
│   ├── organization.v1.ts                         ← NEW
│   ├── organization.type.ts                       ← NEW
│   ├── budget.service.ts                          ← NEW
│   ├── org-permission.helper.ts                   ← NEW
│   ├── _dev/
│   │   ├── organization.seed.ts                   ← NEW
│   │   └── organization.seed.v1.ts                ← NEW
│   └── _test/
│       ├── organization.integration.test.ts       ← NEW
│       ├── member.integration.test.ts             ← NEW
│       └── budget.integration.test.ts             ← NEW
│
├── project/
│   ├── project.table.ts                           ← NEW
│   ├── project.repository.ts                      ← NEW
│   ├── project.service.ts                         ← NEW
│   ├── project.v1.ts                              ← NEW
│   ├── project.type.ts                            ← NEW
│   └── _test/
│       └── project.integration.test.ts            ← NEW
│
├── social-account/
│   ├── social-account.table.ts                    ← NEW
│   ├── social-account.repository.ts               ← NEW
│   ├── social-account.service.ts                  ← NEW
│   ├── social-account.v1.ts                       ← NEW
│   ├── social-account.type.ts                     ← NEW
│   └── _test/
│       └── social-account.integration.test.ts     ← NEW
│
├── content-type/
│   ├── content-type.table.ts                      ← NEW
│   ├── content-type.repository.ts                 ← NEW
│   ├── content-type.service.ts                    ← NEW
│   ├── content-type.v1.ts                         ← NEW
│   ├── content-type.type.ts                       ← NEW
│   └── _test/
│       └── content-type.integration.test.ts       ← NEW
│
├── social-platform/
│   ├── social-platform.table.ts                   ← NEW
│   ├── social-platform.repository.ts              ← NEW
│   ├── social-platform.service.ts                 ← NEW
│   ├── social-platform.v1.ts                      ← NEW
│   ├── social-platform.type.ts                    ← NEW
│   ├── platform-request.table.ts                  ← NEW
│   └── _test/
│       └── social-platform.integration.test.ts    ← NEW

apps/hub/src/app/routes/_private/
├── org/
│   ├── create.tsx                                 ← NEW
│   ├── index.tsx                                  ← NEW
│   └── $orgSlug/
│       ├── index.tsx                              ← NEW
│       ├── members.tsx                            ← NEW
│       ├── settings.tsx                           ← NEW
│       ├── energy.tsx                             ← NEW
│       ├── budget.tsx                             ← NEW
│       └── projects/
│           ├── index.tsx                          ← NEW
│           ├── create.tsx                         ← NEW
│           └── $projectSlug/
│               ├── index.tsx                      ← NEW
│               ├── settings.tsx                   ← NEW
│               └── accounts/
│                   ├── index.tsx                  ← NEW
│                   ├── create.tsx                 ← NEW
│                   └── $accountId/
│                       ├── index.tsx              ← NEW
│                       └── content-types/
│                           └── index.tsx          ← NEW
```

---

## API Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| POST | /api/org | authenticated | Create org |
| GET | /api/org/mine | authenticated | My orgs |
| GET | /api/org/:orgId | org permission | Org detail |
| PUT | /api/org/:orgId | org:manage | Update org |
| DELETE | /api/org/:orgId | owner only | Delete org |
| GET | /api/org/:orgId/members | org:manage | List members |
| POST | /api/org/:orgId/members | org:manage | Invite member |
| PUT | /api/org/:orgId/members/:userId | org:manage | Update perms |
| DELETE | /api/org/:orgId/members/:userId | org:manage | Remove member |
| POST | /api/org/:orgId/budget/allocate | org:manage | Allocate budget |
| POST | /api/org/:orgId/budget/release | org:manage | Release budget |
| GET | /api/org/:orgId/budget | org:manage/view_logs | Budget tree |
| GET | /api/org/:orgId/energy-logs | org:view_logs | Energy log |
| GET | /api/org/:orgId/energy-summary | org:view_logs | Monthly summary |
| POST | /api/org/:orgId/projects | org:project:create | Create project |
| GET | /api/org/:orgId/projects | scoped | List projects |
| GET | /api/project/:id | project:view/manage | Project detail |
| PUT | /api/project/:id | project:manage | Update project |
| POST | /api/project/:id/archive | org:project:delete | Archive |
| DELETE | /api/project/:id | org:project:delete | Delete (archived) |
| POST | /api/project/:id/accounts | project:manage | Create account |
| GET | /api/project/:id/accounts | scoped | List accounts |
| GET | /api/account/:id | account:view/manage | Account detail |
| PUT | /api/account/:id | account:manage | Update account |
| POST | /api/account/:id/archive | project:manage | Archive |
| POST | /api/account/:id/fetch-platform-data | account:manage | Refresh data |
| POST | /api/account/:id/content-types | account:manage | Create type |
| GET | /api/account/:id/content-types | account:view/manage | List types |
| PUT | /api/content-type/:id | account:manage | Update type |
| DELETE | /api/content-type/:id | account:manage | Delete type |
| GET | /api/platforms | authenticated | List platforms |
| POST | /api/platforms/request | authenticated | Request platform |
| GET | /api/admin/platform-requests | admin:access | List requests |
| POST | /api/admin/platform-requests/:id/resolve | admin:access | Resolve |
| POST | /api/dev/seed/organizations | dev only | Seed |
| DELETE | /api/dev/seed/organizations | dev only | Clear |
