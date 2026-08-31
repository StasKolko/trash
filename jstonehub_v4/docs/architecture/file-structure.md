# File Structure

## Feature Directory Layout

Each feature follows a consistent file structure:

```
feature/{name}/
  {name}.table.ts          — Drizzle schema (tables, enums)
  {name}.type.ts           — All types (entities, method inputs)
  {name}.repository.ts     — Database CRUD
  {name}.seed.ts           — Test data fixtures (optional)
  {name}.service.ts        — Business logic
  {name}.schema.ts         — Request validation (TypeBox/Valibot)
  {name}.middleware.ts      — Elysia middleware (optional)
  {name}.v1.ts             — Routes (versioned)
```

### Rules

- Every file in a feature is prefixed with the feature name
- Suffix determines responsibility — never mix concerns across suffixes
- `.type.ts` is the single source of truth for all feature types
- `.table.ts` only contains Drizzle `pgTable` and `pgEnum` definitions
- `.repository.ts` only talks to the database — no business logic
- `.service.ts` orchestrates repositories, external calls, and business rules
- `.seed.ts` is only used for development/testing — never imported in production code
- `.v1.ts` is the route file — thin layer that delegates to service

### When a feature has sub-entities

If a feature manages multiple related route groups, split routes by entity:

```
feature/auth/
  auth.v1.ts               — /v1/auth/* (login, session, OAuth)
  user.v1.ts               — /v1/users/* (user management)
```

The repository, types, and service remain unified per feature.