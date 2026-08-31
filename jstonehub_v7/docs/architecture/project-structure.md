# Project Structure

## Root Directories

All root-level directories use **plural** names:

```
apps/           — deployable applications
configs/        — dev tooling configs (TypeScript, Biome, etc.)
docs/           — documentation for contributors
packages/       — shared production code (UI, utils, API modules)
scripts/        — dev-time automation & CLI scripts
```

---

## Naming Convention

Everything inside root directories uses **kebab-case** in **singular** form:

```
user-role/      ✅ singular
user-roles/     ❌ plural
access-log/     ✅ singular
```

---

## Dot Notation

Dot notation separates a **domain** from its **role suffix**: `{domain}.{role}.{ext}`

Use dot notation when a file represents a **specific role** within a domain.
Use kebab-case (no dots) when a name is a **compound noun** — a single concept, not a role:

```
user.service.ts     ✅ domain "user" + role "service"
user.type.ts        ✅ domain "user" + role "type"
user-role.type.ts   ✅ compound domain "user-role" + role "type"

user.role.ts        ❌ "role" is not a role suffix, it's part of the domain
user-service.ts     ❌ "service" is a role, must use dot
```

**Rule of thumb:** if the last segment is a **role from the table below** — use a dot. Otherwise it's part of the domain name and uses a hyphen.

### Role suffixes

**Frontend (SolidJS):**

| Suffix       | Purpose                 | Example              |
|--------------|-------------------------|----------------------|
| `.grid`      | data grid / table view  | `user.grid.tsx`      |
| `.list`      | list component          | `user.list.tsx`      |
| `.form`      | form component          | `user.form.tsx`      |
| `.trigger`   | action / trigger button | `user.trigger.tsx`   |

**Backend (API):**

| Suffix        | Purpose              | Example                |
|---------------|----------------------|------------------------|
| `.table`      | Drizzle schema       | `user.table.ts`        |
| `.repository` | data access layer    | `user.repository.ts`   |
| `.service`    | business logic       | `user.service.ts`      |
| `.v1`         | controller (v1)      | `user.v1.ts`           |

**Shared:**

| Suffix      | Purpose            | Example             |
|-------------|--------------------|---------------------|
| `.type`     | type definitions   | `user.type.ts`      |
| `.constant` | constants          | `user.constant.ts`  |
| `.helper`   | utility functions  | `user.helper.ts`    |

### Compound domain examples

```
user-role.type.ts           — types for the "user-role" domain
access-log.repository.ts    — repository for "access-log"
project-member.grid.tsx     — grid component for "project-member"
```

---

## Private Files and Directories

The `_` prefix marks files and directories as **module-private** — not intended for use outside their parent module:

```
_helper.ts          — private file
_test/              — private directory
_main.test.ts       — private test file
```

Files without `_` prefix are public — safe to import from other modules.

---

## Index Files

`index.ts` is used **only** as a workspace package entry point — referenced by `package.json` `exports`:

```
packages/user/index.ts          ✅ package entry point
packages/user/model/index.ts    ❌ barrel re-export
```

Never use `index.ts` as a barrel file for convenience re-exports inside a module.