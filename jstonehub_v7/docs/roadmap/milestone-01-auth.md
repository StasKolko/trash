# Milestone 01: Auth & Permissions

---

## Overview

Users sign in via Google OAuth. Sessions managed with JWT access +
refresh tokens in httpOnly cookies. Pure permission system (no roles)
controls access to all features.

**Duration:** ~8 hours
**Depends on:** Nothing (first milestone)

---

## Step-by-Step Execution Order

```
Step 1:  @packages/contract — permission types, auth errors
Step 2:  Database tables — user, auth_account, session, permission, audit_log
Step 3:  Shared helpers — JWT, hashing, cookies, user-agent parsing
Step 4:  Auth middleware + permission guards
Step 5:  Auth feature — OAuth flow, session CRUD
Step 6:  User feature — basic user CRUD (for admin)
Step 7:  Permission feature — CRUD, grant, revoke
Step 8:  Hub frontend — login, private layout, session, logout
Step 9:  Admin frontend — login, private layout, permission check
Step 10: Dev seed — test users with various permissions
Step 11: Tests — unit, integration, E2E
```

---

## Step 1: @packages/contract Updates

### Permission types

```
packages/contract/src/permission.ts

ADMIN_ENTITY = ["access", "user", "joke", "language", 
                "pricing", "feedback", "audit"] as const
ADMIN_ACTION = ["read", "write", "delete", "ban", 
                "grant_energy", "grant_subscription", 
                "manage", "all"] as const

ORG_ACTION = ["all", "manage", "fund", "view_logs",
              "project:create", "project:delete"] as const

RESOURCE_ACTION = ["manage", "view"] as const

Permission format: "scope:entity:action" or "scope:id:action"

Functions:
  isAdminPermission(p: string): boolean
  isOrgPermission(p: string): boolean  
  isResourcePermission(p: string): boolean
  hasPermission(userPerms: string[], required: string): boolean
    — checks specific → :all for entity → scope :all
  extractScope(p: string): "admin" | "org" | "project" | "account"
  extractEntityId(p: string): string | null
```

### Auth errors

Already exists. Verify format matches:

```
AUTH_ERROR = [
  "UNAUTHORIZED",
  "SESSION_EXPIRED",  
  "BANNED",
  "INSUFFICIENT_PERMISSION",
  "UNKNOWN",
] as const
```

Note: `INSUFFICIENT_ROLE` renamed to `INSUFFICIENT_PERMISSION` (no roles).

---

## Step 2: Database Tables

### user

```
user
├── id              : text (PK, cuid2)
├── email           : text (UNIQUE, NOT NULL)
├── name            : text (NOT NULL)
├── avatar_url      : text (nullable)
├── is_banned       : boolean (NOT NULL, default false)
├── energy_balance  : bigint (NOT NULL, default 0)
├── timezone        : text (NOT NULL, default 'UTC')
├── last_energy_claim_at : timestamp with tz (nullable)
├── login_streak    : integer (NOT NULL, default 0)
├── created_at      : timestamp with tz (NOT NULL, default now)
├── updated_at      : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(email)                                    — login lookup O(log n)
  GIN(name gin_trgm_ops)                           — fuzzy search
  GIN(email gin_trgm_ops)                          — fuzzy search
  INDEX(created_at)                                — sort
  INDEX(is_banned, created_at)                     — filtered sort
```

Note: `energy_balance`, `timezone`, `last_energy_claim_at`, `login_streak`
are created in this milestone but populated in MS-02. This avoids
ALTER TABLE later.

### auth_account

```
auth_account
├── id                  : text (PK, cuid2)
├── user_id             : text (NOT NULL, FK → user ON DELETE CASCADE)
├── provider            : text (NOT NULL)  — "google"
├── provider_account_id : text (NOT NULL)
├── email               : text (NOT NULL)
├── created_at          : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(provider, provider_account_id)   — one provider account = one record
  UNIQUE(provider, user_id)               — one provider per user
  INDEX(user_id)                          — FK lookup
```

### session

```
session
├── id                  : text (PK, cuid2)
├── user_id             : text (NOT NULL, FK → user ON DELETE CASCADE)
├── refresh_token_hash  : text (NOT NULL, UNIQUE)
├── ip_address          : text (nullable)
├── device_type         : text (nullable)  — "desktop" | "mobile" | "tablet"
├── os                  : text (nullable)
├── browser             : text (nullable)
├── created_at          : timestamp with tz (NOT NULL, default now)
├── last_used_at        : timestamp with tz (NOT NULL, default now)
├── expires_at          : timestamp with tz (NOT NULL)

Indexes:
  UNIQUE(refresh_token_hash)              — token lookup O(log n)
  INDEX(user_id)                          — list user sessions
  INDEX(expires_at)                       — cleanup expired
```

### permission

```
permission
├── id          : text (PK, cuid2)
├── user_id     : text (NOT NULL, FK → user ON DELETE CASCADE)
├── permission  : text (NOT NULL)
├── granted_by  : text (nullable, FK → user ON DELETE SET NULL)
├── granted_at  : timestamp with tz (NOT NULL, default now)

Indexes:
  UNIQUE(user_id, permission)             — no duplicates
  INDEX(user_id)                          — list user permissions
  INDEX(permission)                       — find all users with specific permission
```

### audit_log

```
audit_log
├── id          : text (PK, cuid2)
├── actor_id    : text (NOT NULL, FK → user ON DELETE SET NULL)
├── target_id   : text (nullable)        — user_id, org_id, etc.
├── target_type : text (nullable)        — "user", "organization", etc.
├── action      : text (NOT NULL)        — "ban", "unban", "grant_energy", etc.
├── reason      : text (nullable)
├── metadata    : jsonb (nullable)       — extra data (amount, old_value, new_value)
├── created_at  : timestamp with tz (NOT NULL, default now)

Indexes:
  INDEX(actor_id, created_at)            — "what did this admin do"
  INDEX(target_id, target_type, created_at) — "what happened to this user"
  INDEX(action, created_at)              — "all bans this month"
  INDEX(created_at)                      — chronological browsing
```

Note: audit_log has **no UPDATE, no DELETE** operations in the entire
codebase. Append-only.

---

## Step 3: Shared Helpers

### token.helper.ts

```
Location: apps/api/src/shared/helper/token.helper.ts

Functions:
  generateAccessToken(payload: AccessTokenPayload): Promise<string>
    — signs JWT with jose, exp = ACCESS_TOKEN_EXPIRES_IN
    — payload: { sub, email, isBanned, permissions: string[] }
    
  verifyAccessToken(token: string): Promise<AccessTokenPayload>
    — verifies JWT signature + expiry
    — throws on invalid/expired

AccessTokenPayload:
  sub: string (user_id)
  email: string
  isBanned: boolean
  permissions: string[]
```

**Critical decision: permissions in JWT.**

Permissions are included in the access token payload. This means
permission checks are O(1) — no database query needed per request.

Trade-off: permission changes take up to 15 minutes to propagate
(access token lifetime). This is acceptable because:
1. Permission changes are rare admin actions
2. Refresh cycle picks up new permissions every 15 min
3. For immediate revocation (ban), all sessions are deleted

**Size concern:** with 50 permissions, JWT payload adds ~2KB.
Cookie size limit is 4KB. With typical JWT overhead, this is safe.
If a user has 100+ permissions — unlikely but possible — we switch
to a permission hash + server-side check. For MVP, inline is optimal.

### hash.helper.ts

```
Location: apps/api/src/shared/helper/hash.helper.ts

Functions:
  hashToken(token: string): string
    — SHA-256 hash using crypto built-in
    — used for refresh tokens

  generateRefreshToken(): string
    — 64 random bytes, hex encoded (128 chars)
    — cryptographically secure (crypto/auth/callback
    — maxAge: 600 (10 minutes)

  clearAuthCookies(set: SetCookieFunction): void
    — clears access_token and refresh_token cookies
```

### user-agent.helper.ts

```
Location: apps/api/src/shared/helper/user-agent.helper.ts

Functions:
  parseUserAgent(ua: string): DeviceInfo
    — lightweight regex parsing (no heavy library)
    — returns: { deviceType, os, browser }

DeviceInfo:
  deviceType: "desktop" | "mobile" | "tablet"
  os: string        — "Windows 11", "macOS 14", "iOS 17", "Android 14"
  browser: string   — "Chrome 120", "Safari 17", "Firefox 121"
```

---

## Step 4: Auth Middleware + Permission Guards

### auth.middleware.ts

```
Location: apps/api/src/shared/middleware/auth.middleware.ts

Attaches to: all protected routes

Logic:
  1. Read access_token from cookie
  2. If missing → 401
  3. Verify JWT (signature + expiry)
  4. If invalid/expired → 401
  5. Read isBanned from payload
  6. If banned → 403 "Account is banned"
  7. Store payload in Elysia context (store.user)

Context shape after middleware:
  store.user: {
    id: string
    email: string
    isBanned: boolean
    permissions: string[]
  }
```

### permission.guard.ts

```
Location: apps/api/src/shared/middleware/permission.guard.ts

Factory function:
  requirePermission(required: string): ElysiaMiddleware
  
Logic:
  1. Read store.user.permissions
  2. Call hasPermission(permissions, required) from @packages/contract
  3. hasPermission checks:
     a. Exact match: permissions.includes(required)
     b. Entity wildcard: "admin:joke:read" → check "admin:joke:all"
     c. Scope wildcard: "admin:joke:read" → check "admin:all"
     d. For org/resource: similar chain
  4. If no match → 403 Forbidden

Performance: O(n) where n = number of user's permissions.
With typical n < 50, this is effectively O(1).
Using Set for O(1) lookup if n grows.
```

---

## Step 5: Auth Feature

### OAuth Flow

```
GET /api/auth/google?from=hub&redirect=/dashboard

  1. Validate from: "hub" | "admin"
  2. Validate redirect: string (sanitize)
  3. Generate PKCE code_verifier + code_challenge
  4. Create state = { from, redirect }
  5. Sign state with JWT_SECRET (short-lived, 10min)
  6. Set oauth_state cookie (httpOnly, 10min, path=/api/auth/callback)
     containing: { state_jwt, code_verifier }
  7. Redirect to Google authorization URL with:
     - client_id
     - redirect_uri = API_URL + /api/auth/callback/google
     - code_challenge
     - state = state_jwt
     - scope: openid email profile

GET /api/auth/callback/google?code=XXX&state=YYY

  1. Read oauth_state cookie
  2. Verify state JWT signature + expiry
  3. Extract code_verifier from cookie
  4. Exchange code for tokens (Arctic + PKCE)
  5. Fetch user info from Google (email, name, avatar)
  6. Clear oauth_state cookie
  
  7. Find user by email:
     a. User exists → update name/avatar, link provider if new
     b. User not found → create user
        - If email === OWNER_EMAIL → create permission "admin:all"
  
  8. Check if banned → redirect to login with error=BANNED
  
  9. If from === "admin":
     - Load permissions
     - If no "admin:access" and no "admin:all" → redirect with error
  
  10. Create session:
      - Generate refresh token (64 random bytes)
      - Hash refresh token (SHA-256)
      - Store session in DB (hash, device info, expiry)
      - Set access_token cookie (JWT with permissions)
      - Set refresh_token cookie (raw token, path=/api/auth/refresh)
  
  11. Redirect to frontend:
      - hub: HUB_URL + redirect
      - admin: ADMIN_URL + redirect
      - error: respective login + ?error=XXX
```

### Session Endpoints

```
GET /api/auth/context
  Auth: required
  Response: {
    user: { id, email, name, avatarUrl, isBanned },
    permissions: string[],
    subscription: { tier, expiresAt } | null,
    energyBalance: string (bigint as string),
    loginStreak: number
  }
  
  Note: single endpoint for all auth context.
  Hub and Admin both use this. Permissions array
  lets frontend decide what to show/hide.

POST /api/auth/refresh
  Cookie: refresh_token (auto-sent, path matches)
  Logic:
    1. Read refresh_token from cookie
    2. Hash it
    3. Find session by hash
    4. If not found → 401 (clear cookies)
    5. If found:
       a. Load user from DB (fresh data: isBanned, permissions)
       b. If banned → 403, delete session, clear cookies
       c. Delete old session
       d. Create new session (new refresh token, rotation)
       e. Generate new access token (with fresh permissions)
       f. Set new cookies
    6. Return 200

POST /api/auth/logout
  Cookie: refresh_token
  Logic:
    1. Read refresh_token from cookie
    2. Hash it
    3. Delete session by hash (if exists)
    4. Clear all auth cookies
    5. Return 200

GET /api/auth/sessions
  Auth: required
  Response: [{
    id, deviceType, os, browser, ipAddress,
    createdAt, lastUsedAt, isCurrent
  }]
  
  isCurrent: determined by matching refresh_token_hash
  from the current request's refresh token.

DELETE /api/auth/sessions/:id
  Auth: required
  Logic: delete session if owned by current user

DELETE /api/auth/sessions
  Auth: required
  Logic: delete ALL sessions for current user, clear cookies
```

### Auth Provider Endpoints

```
GET /api/auth/providers
  Auth: required
  Response: [{ id, provider, email, createdAt }]

DELETE /api/auth/providers/:id
  Auth: required
  Validation: count(auth_accounts) > 1 (cannot remove last)
```

---

## Step 6: User Feature (Admin)

```
GET /api/admin/users
  Permission: admin:user:read
  Pagination: cursor mode
  Search: trigram on name, email
  Filters: is_banned (boolean)
  Sort: created_at, name, email
  Response: CursorPageResponse<UserListItem>

GET /api/admin/users/:id
  Permission: admin:user:read
  Response: full user + permissions + active sessions count

PATCH /api/admin/users/:id/ban
  Permission: admin:user:ban
  Body: { isBanned: boolean, reason: string }
  Validation:
    - Cannot ban self
    - Cannot ban user with admin:all
  On ban:
    1. Set is_banned = true
    2. DELETE FROM permission WHERE user_id AND permission LIKE 'admin:%'
    3. DELETE FROM session WHERE user_id
    4. Create audit_log entry
  On unban:
    1. Set is_banned = false
    2. Create audit_log entry
    (permissions start at zero — must be re-granted)
```

---

## Step 7: Permission Feature

```
GET /api/admin/permissions
  Permission: admin:user:read
  Response: [{ userId, userName, userEmail, permissions: string[] }]
  Note: returns only users who have at least one admin: permission
  Query: SELECT user_id, array_agg(permission)
         FROM permission
         WHERE permission LIKE 'admin:%'
         GROUP BY user_id

GET /api/admin/permissions/:userId
  Permission: admin:user:read
  Response: { permissions: string[] }

PUT /api/admin/permissions/:userId
  Permission: admin:user:manage
  Body: { permissions: string[] }
  Validation:
    - Cannot modify own permissions
    - Cannot grant admin:all (unless caller has admin:all)
    - Cannot grant permissions caller doesn't have
      (except: admin:all holder can grant anything)
    - All permission strings must be valid format
  Logic:
    1. Diff current vs desired permissions
    2. DELETE removed permissions
    3. INSERT new permissions (with granted_by)
    4. Create audit_log entry for each change
```

---

## Step 8: Hub Frontend

### Route Structure

```
routes/
├── __root.tsx              ← prefetch auth context
├── _public.tsx             ← public layout
├── _public/
│   ├── index.tsx           ← landing page
│   └── login.tsx           ← login with error handling
├── _private.tsx            ← private layout (auth guard)
└── _private/
    ├── dashboard.tsx
    └── settings/
        ├── profile.tsx
        ├── sessions.tsx    ← manage active sessions
        └── providers.tsx   ← manage OAuth providers
```

### Auth Context Query

```ts
// shared/auth/auth-context.query.ts

queryOptions({
  queryKey: ["auth-context"],
  queryFn: () => client.api.auth.context.get(),
  staleTime: Infinity,
  gcTime: Infinity,
  retry: false,
})
```

Single query for everything: user, permissions, subscription,
energy balance, streak. One HTTP request.

### Auth Guard (beforeLoad in _private.tsx)

```ts
// shared/auth/auth-guard.ts

async function authGuard({ context }: BeforeLoadContext) {
  const data = await context.queryClient.ensureQueryData(
    authContextQueryOptions
  );
  
  if (!data) {
    throw redirect({ to: "/login" });
  }
  
  if (data.user.isBanned) {
    context.queryClient.clear();
    throw redirect({ to: "/login", search: { error: "BANNED" } });
  }
}
```

### Interceptor

```ts
// shared/api/interceptor.ts

State:
  refreshPromise: Promise<boolean> | null = null

On every request:
  1. Execute request
  2. If not 401 → return response
  3. If 401:
     a. If refreshPromise exists → await it
     b. Else:
        - refreshPromise = POST /api/auth/refresh
        - await result
        - refreshPromise = null
     c. If refresh succeeded → retry original request
     d. If refresh failed:
        - queryClient.clear()
        - redirect to /login?error=SESSION_EXPIRED
        
  Exception: do NOT intercept /api/auth/refresh itself
```

### Login Page

```
Search params (validated via Valibot):
  error?: "SESSION_EXPIRED" | "BANNED" | "INSUFFICIENT_PERMISSION" | "UNKNOWN"
  redirect?: string (default "/dashboard")

Display:
  - Error message based on error param
  - "Sign in with Google" button → GET /api/auth/google?from=hub&redirect=...
  - Support email link for banned users
```

### Logout

```ts
// shared/auth/logout.ts

async function logout() {
  await client.api.auth.logout.post();
  queryClient.clear();
  navigate({ to: "/login" });
}
```

---

## Step 9: Admin Frontend

### Route Structure

```
routes/
├── __root.tsx              ← prefetch auth context
├── _public.tsx
├── _public/
│   └── login.tsx           ← admin login with permission error
├── _private.tsx            ← auth guard + permission check
└── _private/
    ├── dashboard.tsx
    ├── user/
    │   ├── index.tsx       ← user list (cursor pagination)
    │   └── $userId.tsx     ← user detail: permissions, ban, etc.
    └── settings/
        ├── profile.tsx
        ├── sessions.tsx
        └── providers.tsx
```

### Auth Guard (beforeLoad in _private.tsx)

```ts
// shared/auth/auth-guard.ts

async function adminAuthGuard({ context }: BeforeLoadContext) {
  const data = await context.queryClient.ensureQueryData(
    authContextQueryOptions
  );
  
  if (!data) {
    throw redirect({ to: "/login" });
  }
  
  if (data.user.isBanned) {
    context.queryClient.clear();
    throw redirect({ to: "/login", search: { error: "BANNED" } });
  }
  
  // Admin-specific: must have admin:access or admin:all
  const hasAccess = hasPermission(
    data.permissions, "admin:access"
  );
  
  if (!hasAccess) {
    context.queryClient.clear();
    throw redirect({
      to: "/login",
      search: { error: "INSUFFICIENT_PERMISSION" }
    });
  }
}
```

### Permission Hook

```ts
// shared/auth/use-permission.ts

function usePermission() {
  const authContext = useAuthContext();  // reads from TanStack Query cache
  
  function can(required: string) {
    return hasPermission(authContext().permissions, required);
  }
  
  function canAny(required: string[]) {
    return required.some((p) => can(p));
  }
  
  function canAll(required: string[]) {
    return required.every((p) => can(p));
  }
  
  return { can, canAny, canAll };
}
```

Usage in components:

```tsx
function UserActions(props: { userId: string }) {
  const { can } = usePermission();
  
  return (
    <div>
      <Show when={can("admin:user:ban")}>
        <BanButton userId={props.userId} />
      </Show>
      <Show when={can("admin:user:grant_energy")}>
        <GrantEnergyButton userId={props.userId} />
      </Show>
    </div>
  );
}
```

### Admin Login Page

```
Search params (validated via Valibot):
  error?: "SESSION_EXPIRED" | "BANNED" | "INSUFFICIENT_PERMISSION" | "UNKNOWN"
  redirect?: string (default "/dashboard")

Display:
  - Error message based on error param:
    SESSION_EXPIRED  → "Session expired. Please sign in again."
    BANNED           → "Your account is banned. Contact support."
    INSUFFICIENT_PERMISSION → "You don't have permission to access 
                               the admin panel. Contact the platform owner."
    UNKNOWN          → "Something went wrong. Please try again."
  - "Sign in with Google" button → GET /api/auth/google?from=admin&redirect=...
  - Support email link
```

### User List Page (user/index.tsx)

```
Mode: cursor pagination (potentially thousands of users)
Search: trigram on name, email
Filters: is_banned (all / true / false)
Sort: created_at (default desc), name, email
Columns: avatar, name, email, is_banned, permissions count, created_at

Features:
  - Search input with shared debounce
  - Filter dropdown for ban status
  - Sort toggles on column headers
  - Virtualized rows (@tanstack/solid-virtual)
  - Infinite scroll (bidirectional)
  - Click row → navigate to user detail

Permission required: admin:user:read
```

### User Detail Page (user/$userId.tsx)

```
Sections:
  1. User Info (read-only)
     - Avatar, name, email, created_at
     - Ban status with toggle (if admin:user:ban)
     
  2. Ban/Unban Action
     - Dialog with reason input (required)
     - Shows warning about cascade effects
     - Permission: admin:user:ban
     
  3. Permissions
     - List of current permissions
     - Add/remove permissions (if admin:user:manage)
     - Cannot modify own permissions
     - Cannot grant admin:all unless caller has admin:all
     - Grouped by scope: admin, org, project, account
     
  4. Active Sessions
     - List of sessions (device, os, browser, last used)
     - Read-only for admin (no force-revoke from here,
       ban cascade handles it)
     
  5. Audit History
     - Actions performed ON this user
     - Filtered audit_log: target_id = userId
     - Chronological, newest first

Permission required: admin:user:read (view), 
  admin:user:ban (ban actions),
  admin:user:manage (permission changes)
```

---

## Step 10: Dev Seed

### Dev Seed Architecture

```
apps/api/src/feature/{entity}/_dev/
  {entity}.seed.ts          — seed functions
  {entity}.seed.v1.ts       — dev-only API routes

Seed routes mounted ONLY when NODE_ENV === "development":
  POST /api/dev/seed/users    { count: number }
  DELETE /api/dev/seed/users

All test records identified by __test__ prefix in name/email:
  name: "__test__ John Smith"
  email: "__test__john.smith.{random}@example.com"
```

### Test Users for Auth

```
Seed creates users with known permissions for manual testing:

1. Platform Owner
   email: OWNER_EMAIL (from env)
   permissions: ["admin:all"]

2. Admin User
   name: "__test__ Admin User"
   permissions: ["admin:access", "admin:user:read", "admin:user:ban",
                 "admin:user:manage", "admin:joke:all"]

3. Moderator (limited admin)
   name: "__test__ Moderator"
   permissions: ["admin:access", "admin:joke:read", "admin:joke:write",
                 "admin:feedback:read", "admin:feedback:manage"]

4. Regular User (no admin permissions)
   name: "__test__ Regular User"
   permissions: []

5. Banned User
   name: "__test__ Banned User"
   is_banned: true
   permissions: []

6. Bulk random users (count parameter)
   name: "__test__ {random_name}"
   Random subset of permissions, random ban status
```

### Dev Seed Card (Frontend Component)

```
@packages/ui/src/dev/dev-seed-card.tsx

Props:
  entityName: string
  onSeed: (count: number) => Promise<void>
  onClear: () => Promise<void>

Renders:
  - Only when import.meta.env.DEV === true
  - Returns null in production (tree-shaken from bundle)
  - Orange dashed border, robot icon
  - Number input (default: 10)
  - "Create" button → calls onSeed(count)
  - "Delete all test" button → calls onClear
  - Loading state during operations
  - Success/error toast feedback
```

---

## Step 11: Tests

### Unit Tests

```
packages/contract/src/_test/permission.test.ts
  - hasPermission: exact match
  - hasPermission: entity wildcard (admin:joke:all → admin:joke:read)
  - hasPermission: scope wildcard (admin:all → admin:joke:read)
  - hasPermission: no match → false
  - hasPermission: org permissions with ID
  - hasPermission: resource permissions with ID
  - isAdminPermission / isOrgPermission / isResourcePermission
  - extractScope / extractEntityId

apps/api/src/shared/helper/_test/token.helper.test.ts
  - generateAccessToken: produces valid JWT
  - verifyAccessToken: valid token → payload
  - verifyAccessToken: expired token → throws
  - verifyAccessToken: tampered token → throws

apps/api/src/shared/helper/_test/hash.helper.test.ts
  - hashToken: consistent for same input
  - hashToken: different for different input
  - generateRefreshToken: 128 chars hex

apps/api/src/shared/helper/_test/user-agent.helper.test.ts
  - parseUserAgent: Chrome on Windows
  - parseUserAgent: Safari on macOS
  - parseUserAgent: Mobile Chrome on Android
  - parseUserAgent: unknown/empty → sensible defaults
```

### Integration Tests (API)

```
apps/api/src/feature/auth/_test/auth.integration.test.ts
  - OAuth callback: new user created
  - OAuth callback: existing user linked
  - OAuth callback: OWNER_EMAIL → admin:all permission
  - OAuth callback: banned user → redirect with error
  - OAuth callback: admin login without admin:access → redirect with error
  - Refresh: valid token → new tokens, old invalidated
  - Refresh: invalid token → 401
  - Refresh: expired session → 401
  - Refresh: banned user → 403, session deleted
  - Logout: session deleted, cookies cleared
  - Session list: returns all user sessions
  - Session revoke: specific session deleted
  - Session revoke all: all sessions deleted

apps/api/src/feature/user/_test/user.integration.test.ts
  - List users: with search, filter, pagination
  - Get user: returns full details
  - Ban: sets is_banned, deletes admin permissions, deletes sessions
  - Ban: cannot ban self → 403
  - Ban: cannot ban admin:all holder → 403
  - Unban: clears is_banned

apps/api/src/feature/permission/_test/permission.integration.test.ts
  - List permissions: returns users with admin permissions
  - Get user permissions: returns permission array
  - Update permissions: add new, remove old, audit logged
  - Update permissions: cannot modify own → 403
  - Update permissions: cannot grant admin:all without having it → 403
  - Update permissions: invalid format → 400
```

### E2E Tests (Playwright)

```
apps/hub/e2e/auth.spec.ts
  - Full OAuth login flow (mock Google)
  - Redirect to dashboard after login
  - Private route: unauthenticated → redirect to login
  - Logout: redirect to login, cache cleared
  - Session expired: interceptor refreshes, user unaware

apps/admin/e2e/auth.spec.ts
  - Admin login with admin:access → dashboard
  - Admin login without admin:access → error on login page
  - User list: search, filter, paginate
  - User detail: view permissions
  - Ban user: dialog, confirmation, cascade visible
```

---

## API Endpoint Summary

| Method | Path | Permission | Purpose |
|---|---|---|---|
| GET | /api/auth/google | public | Start OAuth |
| GET | /api/auth/callback/google | public | OAuth callback |
| GET | /api/auth/context | authenticated | Session + permissions |
| POST | /api/auth/refresh | cookie only | Refresh tokens |
| POST | /api/auth/logout | cookie only | End session |
| GET | /api/auth/sessions | authenticated | List sessions |
| DELETE | /api/auth/sessions/:id | authenticated | Revoke session |
| DELETE | /api/auth/sessions | authenticated | Revoke all |
| GET | /api/auth/providers | authenticated | List OAuth providers |
| DELETE | /api/auth/providers/:id | authenticated | Unlink provider |
| GET | /api/admin/users | admin:user:read | User list |
| GET | /api/admin/users/:id | admin:user:read | User detail |
| PATCH | /api/admin/users/:id/ban | admin:user:ban | Ban/unban |
| GET | /api/admin/permissions | admin:user:read | All admin perms |
| GET | /api/admin/permissions/:userId | admin:user:read | User perms |
| PUT | /api/admin/permissions/:userId | admin:user:manage | Update perms |
| POST | /api/dev/seed/users | dev only | Create test users |
| DELETE | /api/dev/seed/users | dev only | Delete test users |

---

## File Structure (New Files)

```
packages/contract/src/
├── permission.ts                          ← NEW
├── _test/
│   └── permission.test.ts                 ← NEW

apps/api/src/
├── shared/
│   ├── helper/
│   │   ├── token.helper.ts                ← NEW
│   │   ├── hash.helper.ts                 ← NEW
│   │   ├── cookie.helper.ts               ← NEW
│   │   ├── user-agent.helper.ts           ← NEW
│   │   └── _test/
│   │       ├── token.helper.test.ts       ← NEW
│   │       ├── hash.helper.test.ts        ← NEW
│   │       └── user-agent.helper.test.ts  ← NEW
│   ├── middleware/
│   │   ├── auth.middleware.ts             ← NEW
│   │   └── permission.guard.ts           ← NEW
│   └── db/
│       └── schema.ts                      ← UPDATED (add all tables)
│
├── feature/
│   ├── auth/
│   │   ├── auth.table.ts                  ← NEW (auth_account)
│   │   ├── auth.repository.ts             ← NEW
│   │   ├── auth.service.ts                ← NEW
│   │   ├── auth.v1.ts                     ← NEW
│   │   ├── auth.type.ts                   ← NEW
│   │   ├── _dev/
│   │   │   └── auth.seed.ts               ← NEW
│   │   └── _test/
│   │       └── auth.integration.test.ts   ← NEW
│   │
│   ├── session/
│   │   ├── session.table.ts               ← NEW
│   │   ├── session.repository.ts          ← NEW
│   │   ├── session.service.ts             ← NEW
│   │   ├── session.v1.ts                  ← NEW
│   │   └── session.type.ts               ← NEW
│   │
│   ├── user/
│   │   ├── user.table.ts                  ← UPDATED (add new fields)
│   │   ├── user.repository.ts             ← NEW
│   │   ├── user.service.ts                ← NEW
│   │   ├── user.v1.ts                     ← NEW
│   │   ├── user.type.ts                   ← NEW
│   │   ├── _dev/
│   │   │   ├── user.seed.ts               ← NEW
│   │   │   └── user.seed.v1.ts            ← NEW
│   │   └── _test/
│   │       └── user.integration.test.ts   ← NEW
│   │
│   ├── permission/
│   │   ├── permission.table.ts            ← NEW
│   │   ├── permission.repository.ts       ← NEW
│   │   ├── permission.service.ts          ← NEW
│   │   ├── permission.v1.ts              ← NEW
│   │   ├── permission.type.ts            ← NEW
│   │   └── _test/
│   │       └── permission.integration.test.ts ← NEW
│   │
│   └── audit/
│       ├── audit.table.ts                 ← NEW
│       ├── audit.repository.ts            ← NEW
│       ├── audit.service.ts               ← NEW
│       └── audit.type.ts                 ← NEW

apps/hub/src/
├── shared/
│   ├── api/
│   │   └── interceptor.ts                ← NEW
│   ├── auth/
│   │   ├── auth-context.query.ts         ← NEW
│   │   ├── use-auth-context.ts           ← NEW
│   │   ├── auth-guard.ts                 ← NEW
│   │   └── logout.ts                     ← NEW
│   └── config/
│       └── env.ts                         ← EXISTS
│
├── app/routes/
│   ├── __root.tsx                         ← UPDATED (prefetch)
│   ├── _public.tsx                        ← NEW
│   ├── _public/
│   │   ├── index.tsx                      ← UPDATED (landing)
│   │   └── login.tsx                      ← NEW
│   ├── _private.tsx                       ← NEW
│   └── _private/
│       ├── dashboard.tsx                  ← NEW
│       └── settings/
│           ├── profile.tsx                ← NEW
│           ├── sessions.tsx               ← NEW
│           └── providers.tsx              ← NEW

apps/admin/src/
├── shared/
│   ├── api/
│   │   └── interceptor.ts                ← NEW
│   ├── auth/
│   │   ├── auth-context.query.ts         ← NEW
│   │   ├── use-auth-context.ts           ← NEW
│   │   ├── use-permission.ts             ← NEW
│   │   ├── auth-guard.ts                 ← NEW
│   │   └── logout.ts                     ← NEW
│   └── config/
│       └── env.ts                         ← EXISTS
│
├── app/routes/
│   ├── __root.tsx                         ← UPDATED (prefetch)
│   ├── _public.tsx                        ← NEW
│   ├── _public/
│   │   └── login.tsx                      ← NEW
│   ├── _private.tsx                       ← NEW
│   └── _private/
│       ├── dashboard.tsx                  ← NEW
│       ├── user/
│       │   ├── index.tsx                  ← NEW
│       │   └── $userId.tsx                ← NEW
│       └── settings/
│           ├── profile.tsx                ← NEW
│           ├── sessions.tsx               ← NEW
│           └── providers.tsx              ← NEW

packages/ui/src/
├── dev/
│   └── dev-seed-card.tsx                  ← NEW
```

---

## Changes to Existing Files

### @packages/contract/package.json

Add export:
```json
"./permission": "./src/permission.ts"
```

Update auth-error.ts: rename INSUFFICIENT_ROLE → INSUFFICIENT_PERMISSION.
Remove global-role.ts export (no longer needed).

### apps/api/src/shared/config/env.ts

Remove GOOGLE_CALLBACK. Build callback URL from env:
```ts
const GOOGLE_CALLBACK_URL = `${env.HUB_URL}/api/auth/callback/google`
```

Wait — callback goes to API, not Hub. Correct:
```ts
// Constructed at usage site, not in env:
// `${request.url.origin}/api/auth/callback/google`
// Or use a constant derived from PORT:
const GOOGLE_CALLBACK_URL = `http://localhost:${env.PORT}/api/auth/callback/google`
```

For production, derive from the request origin or a dedicated API_URL env var.
Current env already has PORT. Add API_URL for explicitness:

```
API_URL=http://localhost:4000   (for dev)
```

Note: API_URL is not currently in env.ts. But HUB_URL and ADMIN_URL exist.
The callback URL is always `{wherever_api_is}/api/auth/callback/google`.
In dev: `http://localhost:4000/api/auth/callback/google`.
In prod: `https://api.jstonehub.com/api/auth/callback/google`.

Decision: construct from request headers in callback, or add API_URL
to env. Recommend: **add API_URL to env** for explicitness.

### apps/api/src/shared/db/schema.ts

Import and re-export all table definitions:

```ts
import { userTable } from "#api/feature/user/user.table";
import { authAccountTable } from "#api/feature/auth/auth.table";
import { sessionTable } from "#api/feature/session/session.table";
import { permissionTable } from "#api/feature/permission/permission.table";
import { auditLogTable } from "#api/feature/audit/audit.table";

const schema = {
  user: userTable,
  authAccount: authAccountTable,
  session: sessionTable,
  permission: permissionTable,
  auditLog: auditLogTable,
};

export { schema };
```

### apps/api/src/app/api.ts

Mount auth, session, user, permission routes:

```ts
const apiApp = new Elysia()
  .use(createCorsPlugin())
  .use(healthcheckV1)
  .use(authV1)
  .use(sessionV1)
  .use(adminUserV1)
  .use(adminPermissionV1)
  .use(devSeedV1);  // conditionally, only in development
```

---

## Edge Cases & Error Handling

### OAuth Edge Cases

| Scenario | Handling |
|---|---|
| User denies Google consent | Google redirects with error param → redirect to login with UNKNOWN |
| State cookie expired (>10min) | Cannot verify state → redirect to login with SESSION_EXPIRED |
| State tampered | JWT verification fails → redirect to login with UNKNOWN |
| Google returns no email | Should not happen with openid scope → treat as UNKNOWN |
| Two users register simultaneously with same email | UNIQUE constraint on email → second INSERT fails → find existing user → link provider |
| Provider already linked to different user | UNIQUE(provider, provider_account_id) → error, suggest login with original account |

### Session Edge Cases

| Scenario | Handling |
|---|---|
| Refresh token used twice (theft detection) | First use succeeds + rotates. Second use finds no session → 401. Original user gets 401 on next refresh → signals compromise |
| All sessions revoked while request in-flight | Access token still valid for up to 15min. Next refresh fails → 401 |
| User banned while request in-flight | Access token has isBanned flag from mint time. Next refresh checks DB → 403 |
| Cookie domain mismatch (dev vs prod) | COOKIE_DOMAIN env var, different per environment |

### Permission Edge Cases

| Scenario | Handling |
|---|---|
| Admin removes own admin:access | Prevented: cannot modify own permissions |
| Last admin:all holder tries to remove their permission | Prevented: cannot modify own permissions. To transfer ownership, grant admin:all to new owner first |
| Permission granted during active session | Takes effect on next refresh (up to 15min) or on re-login |
| Deleted resource has orphaned permissions | Cleanup in service layer on resource delete. Orphaned permissions are harmless (permission check for non-existent resource never triggers) |
