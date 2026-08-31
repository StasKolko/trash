### File and Directory Naming

#### Singular names — always

All file names and all directory names use **singular** form. No exceptions.

- File: `user.service.ts`, `social-account.page.tsx`, `admin-audit-log.ts`
- Directory: `user/`, `social-account/`, `voice-model/`, `util/`, `overlay/`

#### Internal prefix `_`

Files and directories prefixed with `_` are **internal to their parent directory** — they must not be imported from outside that directory.

```
packages/ui/src/
  _model/              ← internal to packages/ui/src/
  _util/               ← internal to packages/ui/src/
  overlay/
    popover/
      popover.tsx
      _floating-calc.ts  ← internal to popover/
```

This applies equally to files and directories at any nesting level.

---

#### File Naming

**Format:** `{entity-name}.{suffix}.{ext}`

- Entity name: `kebab-case` (e.g., `user`, `browser-fingerprint`, `social-account`)
- Suffix: **reserved word** that defines the file's role (see tables below)
- Dot separates entity name from suffix: `user.service.ts`, `browser-fingerprint.page.tsx`

Files without a reserved suffix are allowed for unique/standalone files: `env.ts`, `client.ts`, `instance.ts`.

---

#### Reserved Suffixes — API (`apps/api`, `apps/worker`)

| Suffix | Purpose | Contents |
|--------|---------|----------|
| `.table` | Drizzle schema | Table definitions, enums, relations. **Nothing else.** |
| `.type` | TypeScript types | `InferSelectModel`, `InferInsertModel`, param types, response types |
| `.schema` | Validation | TypeBox schemas and compiled validators |
| `.repository` | Data access | Database queries, no business logic |
| `.service` | Business logic | Transactions, validations, orchestration |
| `.middleware` | Elysia plugins | Auth, role checks, request extraction |
| `.v1` | Route handlers | Elysia endpoints for API version 1 |
| `.audit` | Audit snapshot | `toAuditSnapshot` function for the entity |
| `.dev-repository` | Dev test data | `createMany` and `deleteAll` for dev data |
| `.dev.v1` | Dev-only routes | Test data seed/cleanup endpoints. Never in production. |

#### Reserved Suffixes — Frontend (`apps/admin`, `apps/hub`)

| Suffix | Purpose | Contents |
|--------|---------|----------|
| `.page` | Page component | Top-level route component |
| `.layout` | Layout component | Wraps child routes |
| `.filter` | Filter UI | Filter controls for lists |
| `.data-table` | Table UI | Data table component (NOT `.table` — reserved for Drizzle) |
| `.list` | List UI | List/card-based display component |
| `.form` | Form UI | Create/edit form component |
| `.dialog` | Dialog UI | Modal dialog component |
| `.api` | Backend communication | API methods object, TanStack Query wrappers, route paths |
| `.use-{name}` | Custom hook | Any reactive hook |
| `.style` | Style constants | UPPER_SNAKE_CASE style strings and variant maps |

#### Reserved Suffixes — UI Package (`packages/ui`)

| Suffix | Purpose | Contents |
|--------|---------|----------|
| `.style` | Style constants | UPPER_SNAKE_CASE style strings and variant maps |
| `.type` | TypeScript types | Component prop types, shared internal types |
| `.constant` | Constants | UPPER_SNAKE_CASE values |

#### Reserved Suffixes — Shared (any app/package)

| Suffix | Purpose | Contents |
|--------|---------|----------|
| `.config` | Configuration | Environment, app config |
| `.util` | Utility functions | Pure helpers |
| `.constant` | Constants | `UPPER_SNAKE_CASE` values |
| `.test` | Test file | Vitest tests |

---

#### index.ts Rules

**`index.ts` is forbidden** except for:

**Package entry points** — `packages/*/src/index.ts` for public API of a workspace package.

**Why forbidden everywhere else:**
- Drizzle breaks on re-exports from index files — migrations, generation, and typing fail
- Creates hidden dependencies and circular imports
- Must be manually maintained — forgotten re-export = bug

**If a package serves both frontend and backend**, use named entry points instead of index.ts:

```
packages/contracts/src/
  frontend.ts    ← re-exports for frontend consumers
  backend.ts     ← re-exports for backend consumers
```

If a package is used identically everywhere (e.g., `packages/contracts` with no split), use `index.ts`.

---

