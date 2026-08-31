### Drizzle ORM

| Category | Pattern | Example |
|----------|---------|---------|
| Table variable | `{entities}Table` (plural) | `usersTable`, `socialAccountsTable` |
| Enum variable | `{entityProperty}Enum` | `globalRoleEnum`, `taskStatusEnum` |
| Relations variable | `{entities}TableRelations` | `usersTableRelations` |
| Table name (in DB) | `snake_case`, **plural** | `"users"`, `"social_accounts"` |
| Column name (in DB) | `snake_case` | `"created_at"`, `"user_id"` |
| Enum name (in DB) | `snake_case` | `"global_role"`, `"task_status"` |

**Key distinction:** directory is **singular** (`user/`), DB table name is **plural** (`"users"`), variable is **plural** (`usersTable`).

Drizzle config discovers tables via glob pattern `**/*.table.ts`. This is why `.table` suffix is **strictly reserved** for Drizzle schema files.

#### Dev Repositories

| Category | Pattern | Example |
|----------|---------|---------|
| File | `{entity}.dev-repository.ts` | `user.dev-repository.ts` |
| Variable | `{entity}DevRepository` | `userDevRepository` |

See `testing.md` for method signatures and production safety rules.

#### Entity display names

| Column | When to use | Examples |
|--------|-------------|---------|
| `name` | Entity the user owns and manages directly | `organizations.name`, `projects.name`, `media_collections.name` |
| `label` | Technical record the user tags for identification | `ai_provider_accounts.label`, `browser_fingerprints.label` |