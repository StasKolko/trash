### API Routes

**URL structure:** `/{version}/{feature}/{?id}/{?action}`

#### Rules

| Rule | Detail |
|------|--------|
| **Version** | Always prefixed: `v1`, `v2` |
| **Feature** | Plural, kebab-case: `fingerprints`, `voice-models` |
| **ID** | Always `:id` (cuid2) |
| **Actions** | `POST` + verb in kebab-case: `/retry`, `/approve`, `/cancel` |
| **Nesting** | Max 2 levels: `/:id/items/:itemId` — OK, deeper — NO |
| **Query params** | camelCase: `providerId`, `isActive`, `limit`, `offset` |
| **Request body** | camelCase |
| **Response body** | camelCase |
| **No role prefixes** | No `/admin/`, `/public/` in paths. Access control is handled by middleware per endpoint. |
| **No `/api/` in path** | API lives on a subdomain (`api.jstonehub.com`). No `/api/` prefix in routes. |

#### CRUD

```
GET    /v1/fingerprints          — list
GET    /v1/fingerprints/:id      — get by ID
POST   /v1/fingerprints          — create
PATCH  /v1/fingerprints/:id      — update
DELETE /v1/fingerprints/:id      — delete
```

#### Actions

```
POST   /v1/voiceovers/:id/retry    — retry
POST   /v1/voiceovers/:id/approve  — approve
```

#### Nested Resources

```
GET    /v1/voiceovers/:id/items                  — list items
POST   /v1/voiceovers/:id/items/:itemId/retry    — retry item
```

#### Filtering

```
GET    /v1/fingerprints?providerId=xxx&isActive=true
GET    /v1/voiceovers?status=completed&limit=20&offset=0
```

#### Access Control

Access is enforced **per endpoint** via middleware, not via URL structure. The same endpoint can serve different permission levels — middleware determines access.

```typescript
// Any authenticated user
.use(requireAuth)
.get('/v1/auth/me', ...)

// Specific permission required
.use(requirePermission('users.view'))
.get('/v1/users', ...)

// Different permission for mutations
.use(requirePermission('users.manage'))
.patch('/v1/users/:id/role', ...)
.post('/v1/users/:id/ban', ...)

// Grant permission required
.use(requirePermission('users.grant'))
.patch('/v1/users/:id/permissions', ...)
```

Owner bypasses all permission checks automatically (handled in `requirePermission` middleware).

#### Auth Handlers

BetterAuth routes are mounted without version prefix:

```
/auth/**    — BetterAuth handlers (login, callback, session)
```

This is the only "public" route group. All other routes require authentication.

#### Dev-Only Routes

Test data routes for development. Never available in production.

```
POST   /dev/v1/{entities}/seed    — create test entities
DELETE /dev/v1/{entities}/seed    — delete all test entities
```

| Rule | Detail |
|------|--------|
| **Prefix** | `/dev/v1/` — clearly separated from production routes |
| **Registration** | Conditional: only when `NODE_ENV !== "production"` |
| **Runtime guard** | Each handler throws if `NODE_ENV === "production"` |
| **File suffix** | `.dev.v1.ts` |

See `testing.md` for full dev-only route specification.
```