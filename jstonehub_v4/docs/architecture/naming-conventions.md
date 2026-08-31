# Naming Conventions

## Types (`*.type.ts`)

### Entities

Derived from Drizzle tables via `InferSelectModel`. Named as plain nouns:

```ts
type User = InferSelectModel<typeof usersTable>;
type Session = InferSelectModel<typeof sessionsTable>;
```

### Method Inputs

Format: `{Action}{Entity}Input`

```ts
type CreateUserInput = { email: string; name: string; ... };
type UpdateUserInput = Partial<{ name: string; ... }>;
type SetUserPermissionsInput = { userId: string; permissions: AdminPermission[]; grantedBy: string };
```

- `Input` — unambiguous, means "data going into a method"
- Never `Data` (too vague) or `Params` (implies query/route parameters)

## Exported Objects

Always use the full word. Never abbreviate:

```ts
// ✅
export const authRepository = { ... };
export const authService = { ... };
export const authSeed = { ... };

// ❌
export const authRepo = { ... };
export const authSvc = { ... };
```

## Drizzle Schema (`*.table.ts`)

### Tables

- Code: `{pluralEntity}Table` in camelCase
- Database: `snake_case`

```ts
const usersTable = pgTable("users", { ... });
const oauthAccountsTable = pgTable("oauth_accounts", { ... });
```

### Enums

- Code: `{name}Enum` in camelCase
- Database: `snake_case`

```ts
const globalRoleEnum = pgEnum("global_role", GLOBAL_ROLES);
```

### Fields

- Code: `camelCase`
- Database: `snake_case` via column name string

```ts
avatarUrl: text("avatar_url"),
isBanned: boolean("is_banned").notNull().default(false),
createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
```