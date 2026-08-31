# Repository Standard

## Method Naming

| Operation | Prefix | Returns | Example |
|-----------|--------|---------|---------|
| Find one | `findBy{Field}` | `T \| null` | `findUserById(id): User \| null` |
| Find many | `findAll` / `findAllBy{X}` | `T[]` | `findAllUsers(): User[]` |
| Create | `create` | `T` | `createUser(input): User` |
| Update | `update` | `T \| null` | `updateUser(id, input): User \| null` |
| Delete one | `delete` | `boolean` | `deleteSession(id): boolean` |
| Delete many | `deleteAllBy{X}` | `number` | `deleteAllUserSessions(userId): number` |
| Bulk set | `set{X}` | `void` | `setUserAdminPermissions(input): void` |

### `find` vs `get`

- **Repository**: always `find` — returns `T | null`, never throws
- **Service**: may use `get` — throws if not found

```ts
// repository — returns null
findUserById(id: string): Promise<User | null>

// service — throws
async getUserOrThrow(id: string): Promise<User> {
  const user = await authRepository.findUserById(id);
  if (!user) throw new Error("User not found");
  return user;
}
```

### Return values

- `create` → always returns the created entity
- `update` → returns updated entity or `null` if not found
- `delete` (single) → `boolean` (deleted or not)
- `delete` (multiple) → `number` (count of deleted rows)
- Never return the deleted entity — it adds complexity with no practical use

### Method arguments

- Single primitive → pass directly: `findUserById(id: string)`
- Multiple fields → use an `Input` type: `setUserAdminPermissions(input: SetUserPermissionsInput)`
- Update methods → `(id: string, input: UpdateUserInput)` — id is always first

## Seed (`*.seed.ts`)

For creating and cleaning up test fixtures during development and testing.

### Marker

All seeded records use the email prefix `__seed_`:

```ts
const SEED_EMAIL_PREFIX = "__seed_";
// Example: __seed_user_0@test.local
```

Double underscore ensures no collision with real data. The prefix enables bulk cleanup via `LIKE '__seed_%'`.

### Methods

```ts
const authSeed = {
  createUsers(count: number): Promise<User[]>,
  deleteAllSeeded(): Promise<number>,
};
```

- `createUsers(count)` — creates `count` users with seeded emails
- `deleteAllSeeded()` — deletes all records matching the seed prefix, returns count

### Export

```ts
export { authSeed };
```

Seed files are never imported in production code. They are used in:
- Migration scripts
- Dev server startup
- E2E test setup/teardown