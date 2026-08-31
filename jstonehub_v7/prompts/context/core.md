D:/1_Projects/jstonehub/apps/api/.env.development

```
NODE_ENV=development

PORT=4000
API_URL=http://localhost:4000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://192.168.0.116:3000,http://192.168.0.116:3001

DATABASE_URL=postgresql://user:password@localhost:5433/jstonehub
REDIS_URL=redis://localhost:6379

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
MINIO_BUCKET=jstonehub

JWT_SECRET=dev-jwt-secret-change-in-production
JWT_ISSUER=jstonehub
JWT_AUDIENCE=jstonehub
INTERNAL_SECRET=dev-internal-secret-change-in-production
GOOGLE_CLIENT_ID=262481646500-rj6pahkald0ufkv3oec17jr2tj4obdg9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

COOKIE_DOMAIN=localhost
ACCESS_TOKEN_EXPIRES_IN=900
REFRESH_TOKEN_EXPIRES_IN=1209600

OWNER_EMAIL=b2bstas@gmail.com

TRUST_INBOUND_REQUEST_ID=true
```

D:/1_Projects/jstonehub/apps/api/drizzle.config.ts

```
import process from "node:process";
import { defineConfig } from "drizzle-kit";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/*.table.ts",
  out: "./drizzle",
  dbCredentials: { url: DATABASE_URL },
  verbose: true,
  strict: true,
});

```

D:/1_Projects/jstonehub/apps/api/package.json

```
{
  "name": "@apps/api",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "cd ../.. && bun --watch --env-file=apps/api/.env.development apps/api/src/app/main.ts",
    "build": "bun build src/app/main.ts --minify --outdir dist --target bun",
    "start": "bun dist/main.js",

    "typecheck": "tsc --noEmit",

    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",

    "db:generate": "bun --env-file=.env.development drizzle-kit generate",
    "db:migrate": "bun --env-file=.env.development src/shared/db/migrate.ts",
    "db:push": "bun --env-file=.env.development drizzle-kit push",
    "db:studio": "bun --env-file=.env.development drizzle-kit studio"
  },
  "dependencies": {
    "@packages/contract": "workspace:*",
    "@packages/util": "workspace:*",
    "@elysiajs/cron": "catalog:api",
    "@elysiajs/cors": "catalog:api",
    "elysia": "catalog:api",
    "drizzle-orm": "catalog:api",
    "drizzle-typebox": "catalog:api",
    "jose": "catalog:api",
    "arctic": "catalog:api",
    "typebox": "catalog:backend",
    "bullmq": "catalog:backend",
    "ioredis": "catalog:backend",
    "minio": "catalog:backend"
  },
  "devDependencies": {
    "@configs/typescript": "workspace:*",
    "@configs/vitest": "workspace:*",
    "vitest": "catalog:test",
    "@vitest/coverage-v8": "catalog:test",
    "drizzle-kit": "catalog:api-dev"
  }
}

```

D:/1_Projects/jstonehub/apps/api/tsconfig.json

```
{
  "extends": "@configs/typescript/backend",
  "include": ["src"],
  "compilerOptions": {
    "paths": {
      "#api/*": ["./src/*"]
    }
  }
}

```

D:/1_Projects/jstonehub/apps/api/vitest.config.ts

```
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createBackendConfig } from "@configs/vitest";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default createBackendConfig({
  resolve: {
    alias: {
      "#api": resolve(__dirname, "./src"),
    },
  },
});

```

D:/1_Projects/jstonehub/docs/architecture/code-organization.md

# Code Organization

## Scoping Principle

See [DRY — Scoping Rule](./coding-principles.md#scoping-rule-where-shared-code-lives) for the complete extraction table and rules on when to share code.

### Inline-first examples

**Type** — inline if used in one place, extract when shared:

```ts
// ✅ Used in one function — inline
function createUser(input: { name: string; email: string }) { ... }
```

```ts
// ✅ Used in multiple functions — extract to file top
type UserInput = { name: string; email: string };

function createUser(input: UserInput) { ... }
function updateUser(id: string, input: UserInput) { ... }
```

**Constant** — same rule. See [Reference-stable values](./coding-principles.md#reference-stable-values) for the array/object exception.

---

## File Layout Order

Top-to-bottom within a file:

```
1. Type imports
2. Value imports
3. Types (shared across the file)
4. Constants (shared across the file)
5. Primary function / component
6.   └── Helpers used only by primary
7. Secondary function / component
8.   └── Helpers used only by secondary
9. Shared helpers (used by multiple functions above)
10. Export statement
```

Reading flows **top-down, general-to-specific**.

---

## Naming Conventions

### Functions

Use **verb + noun** for functions that perform an action:

```ts
createUser()        ✅
deleteProject()     ✅
validateConfig()    ✅
normalizeTarget()   ✅
```

Use **adjective or noun** for functions that compute / check a value:

```ts
isProduction()      ✅  — returns boolean
isRetryableError()  ✅  — returns boolean
hasMarkerFile()     ✅  — returns boolean
calcElapsedMs()     ✅  — computes a value
```

Use **verb** for assertion functions that throw:

```ts
assertNonEmpty()         ✅
assertPathExists()       ✅
assertUniqueNames()      ✅
validateIncludes()       ✅  — "validate" implies throw
```

### Variables and constants

| Scope | Convention | Example |
|---|---|---|
| Inside a function | `camelCase` | `const maxAttempts = 3;` |
| Outside a function (module-level) | `UPPER_SNAKE_CASE` | `const MAX_ATTEMPTS = 3;` |

### Types

Use `PascalCase`. Prefer descriptive nouns or noun phrases:

```ts
type UserInput = { ... };
type SyncOptions = { ... };
type NormalizedConfig = { ... };
type BuildResult = { ... };
```

---

## Function Design

### Primary vs helper functions

**Primary functions** are declarative — they describe *what* happens as a sequence of named steps. No implementation details, no branching logic, no loops:

```ts
async function buildBundle(options: BuildOptions) {
  await validateOptions(options);
  const config = await loadConfig(options.configPath);
  validateConfig(config);
  const normalized = normalizeConfig(config);
  const results = await processTargets(normalized, options);
  await printResults(results);
  return results;
}
```

**Helper functions** are imperative — they contain the actual logic: loops, conditions, transformations, error handling.

**Always split, even for simple logic.** A primary function should read like a table of contents. If a function body contains *any* implementation detail — extract it into a named helper:

```ts
// ❌ Mixed — declarative + imperative in one function
function getActiveUsers(users: User[]) {
  const now = Date.now();
  return users.filter(u => u.isActive && u.lastLogin > now - 30 * 24 * 60 * 60 * 1000);
}
```

```ts
// ✅ Split — primary reads clearly, helper holds the logic
function getActiveUsers(users: User[]) {
  return users.filter(isRecentlyActive);
}

function isRecentlyActive(user: User) {
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  return user.isActive && user.lastLogin > Date.now() - thirtyDaysMs;
}
```

### Function arguments

**Maximum 3 parameters.** If a function needs more — group into an object:

```ts
// ❌ Wrong — too many arguments
function syncSchema(
  biomeJsonPath: string,
  configSrcDir: string,
  entries: ConfigEntry[],
  version: string,
) { ... }

// ✅ Right — grouped into an object
function syncSchema(params: {
  biomeJsonPath: string;
  configSrcDir: string;
  entries: ConfigEntry[];
  version: string;
}) { ... }
```

**No two arguments of the same primitive type.** If a function takes two strings (or two numbers, etc.), they **must** be grouped into an object. Positional arguments of the same type are trivially swappable — a bug that is nearly impossible to spot:

```ts
// ❌ Dangerous — which string is which?
function replaceSchemaValue(absolutePath: string, schemaUrl: string) { ... }
// Was it replaceSchemaValue(url, path) or replaceSchemaValue(path, url)?

// ✅ Safe — named keys eliminate ambiguity
function replaceSchemaValue(params: {
  absolutePath: string;
  schemaUrl: string;
}) { ... }
```

**Object arguments don't have this problem** — keys enforce correct assignment at the call site.

**Mixed primitives of different types are fine** when the function is simple and the meaning is obvious:

```ts
// ✅ OK — string and number, no ambiguity
function truncate(text: string, maxLength: number) { ... }

// ✅ OK — one primitive + one object
function writeOutput(outputDir: string, result: BuildResult) { ... }
```

---

## TypeScript Rules

### No explicit return types

Do **not** annotate return types on functions. TypeScript infers them accurately, and explicit return types add cognitive noise without benefit:

```ts
// ❌ Wrong — redundant annotation
function isProduction(): boolean {
  return env.NODE_ENV === "production";
}

// ✅ Right — inferred by TypeScript
function isProduction() {
  return env.NODE_ENV === "production";
}
```

```ts
// ❌ Wrong — verbose for no reason
async function loadConfig(path: string): Promise<BundlerConfig> { ... }

// ✅ Right — TypeScript infers Promise<BundlerConfig>
async function loadConfig(path: string) { ... }
```

If you need to know what a function returns — hover in the IDE or read the function body.

**Exception:** annotate when the return type is part of a **public API contract** and must not accidentally change (e.g., library exports).

### Prefer `type` over `interface`

Use `type` for all type definitions. Interfaces are only used when required by a library or for declaration merging (which should be avoided).

### Use `as const` for literal objects

```ts
// ✅ Const assertion — precise types, immutable
const ROLES = ["admin", "editor", "viewer"] as const;

// ❌ Don't use enums
enum Role { Admin, Editor, Viewer }
```

---

## Export Rules

### Single-category export

A file must export **only one category** of things:

| File | Exports |
|---|---|
| `user.service.ts` | functions only |
| `user.type.ts` | types only |
| `user.constant.ts` | constants only |

```ts
// ❌ Wrong — mixed export categories
export type { UserInput };
export { createUser };
```

If a file exports both types and functions, the types are used in multiple places and should be extracted to a dedicated `.type.ts` file.

### Constant bound to a function

When a constant is tightly coupled with a specific function and has no independent meaning, **don't export the constant** — expose it through an accessor function instead. This keeps the constant immutable and the file single-category:

```ts
// ✅ Constant stays private, accessed via function
const MAX_ATTEMPTS = 3;

function getMaxAttempts() {
  return MAX_ATTEMPTS;
}

export { getMaxAttempts };
```

```ts
// ❌ Wrong — exporting a constant alongside functions
const MAX_ATTEMPTS = 3;

function retry() { ... }

export { MAX_ATTEMPTS, retry };
```

### Export statement style

Always use a **named export statement at the bottom** of the file — regardless of what is being exported:

**Functions:**

```ts
function createUser() { ... }
function deleteUser() { ... }

export { createUser, deleteUser };
```

**Types:**

```ts
type UserInput = { ... };
type UserOutput = { ... };

export type { UserInput, UserOutput };
```

**Constants:**

```ts
const MAX_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

export { MAX_ATTEMPTS, DEFAULT_TIMEOUT };
```

```ts
// ❌ Wrong — inline export
export function doSomething() { ... }
```

```ts
// ❌ Wrong — arrow + export const
export const doSomething = () => { ... };
```

---

## Test File Structure

Test files follow **all the same principles** as production code: file layout order, function extraction, naming conventions, and DRY rules.

### Layout

```
1. Imports
2. Module-level mocks & spies
3. Module-level constants
4. Primary describe block
5.   └── Lifecycle hooks (beforeEach, afterEach)
6.   └── Test cases (it blocks)
7. Secondary describe block (if needed)
8.   └── ...
9. Helper types (used across describe blocks)
10. Helper functions (used across describe blocks)
```

### Example

```ts
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { cleanProject } from "./main";

// Module-level mocks
const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("cleanProject", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
    consoleSpy.mockClear();
  });

  it("deletes directories matching includes", async () => {
    const root = createFixture(dirs, ["node_modules/pkg/index.js"]);

    const stats = await cleanProject({
      rootDir: root,
      includes: ["**/node_modules"],
    });

    expect(stats.deleted).toHaveLength(1);
  });

  it("throws when includes is empty", async () => {
    const root = createFixture(dirs, ["src/app.ts"]);

    await expect(
      cleanProject({ rootDir: root, includes: [] }),
    ).rejects.toThrow("must have at least one pattern");
  });
});

// --- Helpers ---

function createFixture(dirs: string[], files: string[]) {
  const root = join(tmpdir(), `test-${Date.now()}`);
  mkdirSync(root, { recursive: true });
  dirs.push(root);

  for (const file of files) {
    const fullPath = join(root, file);
    mkdirSync(join(fullPath, ".."), { recursive: true });
    writeFileSync(fullPath, "");
  }

  return root;
}
```

### Rules

- **Extract helpers** to the bottom of the file, below all describe blocks — same as production code
- **Types** used by helpers go above the helper functions (in the helper section)
- **Constants** used only in tests (e.g. `UPDATED_VERSION`) go at module level, below mocks
- **Each `describe` block** is self-contained with its own lifecycle hooks
- **Don't nest `describe` blocks** more than 2 levels deep
- **Use the same naming conventions** — `createFixture`, `readJsonFile`, not `setup` or `helper1`

D:/1_Projects/jstonehub/docs/architecture/coding-principles.md

# Coding Principles

## DRY — Don't Repeat Yourself

DRY is about **knowledge duplication**, not code duplication. Two pieces of code that look similar but represent different concepts are **not** a DRY violation.

### When DRY applies

Extract shared code when:

- The **same knowledge** is expressed in multiple places
- A change in one place **must** be reflected in all others
- The abstraction is **natural** and doesn't require contortions

### When duplication is acceptable

Keep code duplicated when:

- Two functions have **similar structure** but **different domain logic**
- Extracting the common part requires **flags, switches, or awkward parameters**
- The shared abstraction would be **harder to understand** than the duplication
- Code is used in **only one place** — don't pre-extract

```ts
// ✅ Acceptable duplication — similar structure, different domain logic
function validateCreateUser(input: CreateUserInput) {
  assertNonEmpty(input.name, "name");
  assertEmailFormat(input.email);
  assertMinLength(input.password, 8);
}

function validateCreateOrganization(input: CreateOrgInput) {
  assertNonEmpty(input.name, "name");
  assertSlugFormat(input.slug);
  assertNonEmpty(input.ownerId, "ownerId");
}
// Both call assertNonEmpty, but forcing them into a generic
// "validateEntity" with switches would hurt readability.
```

```ts
// ❌ Wrong — forcing DRY through a generic function with flags
function validateEntity(input: unknown, type: "user" | "org") {
  if (type === "user") { ... }
  if (type === "org") { ... }
}
```

### Scoping rule (where shared code lives)

| Used in | Lives in |
|---|---|
| One function only | Inside that function body |
| Multiple functions in one file | Top of the file |
| Multiple files in one module | Dedicated file in that module (e.g. `_type.ts`, `_constant.ts`) |
| Multiple modules in one package | Dedicated public file in the nearest common parent |
| Multiple packages | Shared workspace package |

> Don't pre-engineer shared code. Extract when the second consumer appears and the abstraction is obvious.

### Reference-stable values

Arrays and objects are **always** declared outside the function body, even if used in only one place. This avoids re-creating a new reference on every call — critical for component props and memoization:

```ts
// ✅ Array outside — stable reference, created once
const ALLOWED_ROLES = ["admin", "editor", "viewer"] as const;

function validateRole(role: string) {
  return ALLOWED_ROLES.includes(role);
}
```

```ts
// ❌ Wrong — new array on every call
function validateRole(role: string) {
  const allowedRoles = ["admin", "editor", "viewer"];
  return allowedRoles.includes(role);
}
```

**Naming rule:** constants inside a function use `camelCase`. Constants outside a function use `UPPER_SNAKE_CASE`.

---

## YAGNI — You Aren't Gonna Need It

Build only what is needed **right now**. Do not add abstractions, parameters, or extension points for hypothetical future use.

```ts
// ❌ Wrong — designing for a future that may never come
function createLogger(options: {
  transport: "console" | "file" | "http";
  format: "json" | "text";
  level: "debug" | "info" | "warn" | "error";
  rotationPolicy?: RotationConfig;
}) { ... }

// ✅ Right — solve today's problem
function logError(message: string) {
  console.error(`[error] ${message}`);
}
```

When the second use case appears — refactor. Not before.

---

## Fail Fast

Detect errors **as early as possible** and throw immediately. The later a bug is caught, the harder it is to diagnose.

### Where to throw

**Startup & initialization** — config loading, environment validation, dependency resolution:

```ts
function loadDatabaseConfig() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return { url };
}
```

**Function entry** — invalid arguments, precondition violations:

```ts
function transferFunds(params: { from: string; to: string; amount: number }) {
  if (params.amount <= 0) {
    throw new Error("Transfer amount must be positive");
  }
  // ... proceed with valid data
}
```

**Data parsing** — external input, API responses, file contents:

```ts
function parseVersion(segment: string, filePath: string) {
  const match = segment.match(VERSION_REGEX);

  if (!match) {
    throw new Error(`Failed to extract version in: ${filePath}`);
  }

  return match[0];
}
```

### Where to recover gracefully

**Runtime operations** — network requests, file I/O during normal app flow. Log the error and continue or return a fallback:

```ts
async function readEntries(dirPath: string, stats: CleanStats) {
  try {
    return await readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    stats.errors.push({ path: dirPath, error: `Failed to read: ${message}` });
    return null;
  }
}
```

**Rule of thumb:** if the app **cannot continue** without the result — throw. If the app **can skip or retry** — recover and log.

---

## SRP — Single Responsibility Principle

Every function, file, and module should have **one reason to change**.

**Functions:** a function does one thing. If you can describe it with "and" — split it.

**Files:** a file exports one category (see [Export Rules](./code-organization.md#export-rules)).

**Modules:** a module owns one domain. Cross-domain logic lives in a shared package.

---

## Composition Over Configuration

Prefer composing small, focused functions over building configurable mega-functions with many options.

```ts
// ❌ Wrong — one function with many modes
function processFile(path: string, options: {
  validate?: boolean;
  transform?: boolean;
  format?: "json" | "yaml";
}) { ... }

// ✅ Right — compose small steps
async function processFile(path: string) {
  const content = await readFile(path);
  const validated = validateContent(content);
  const transformed = transformContent(validated);
  return formatAsJson(transformed);
}
```

---

## Immutability by Default

Prefer `const` over `let`. Avoid mutating function arguments. Return new values instead of modifying existing ones.

```ts
// ❌ Wrong — mutating the input
function addDefaults(config: Config) {
  config.timeout = config.timeout ?? 5000;
  return config;
}

// ✅ Right — return a new object
function addDefaults(config: Config) {
  return { timeout: 5000, ...config };
}
```

---

## Explicit Over Implicit

Code should be **obvious** at the call site. Avoid boolean traps, positional ambiguity, and hidden side effects.

```ts
// ❌ Implicit — what does `true` mean?
await removeFile(path, true);

// ✅ Explicit — clear intent
await removeFile(path, { dryRun: true });
```

---

## SolidJS Reactivity

Frontend code uses SolidJS. Its reactivity model has **strict rules** that must be followed:

### Never destructure props

Destructuring breaks reactivity tracking. Always access props via `props.x`:

```tsx
// ❌ Breaks reactivity
function UserCard({ name, email }: UserCardProps) {
  return <div>{name}</div>;
}

// ✅ Preserves reactivity
function UserCard(props: UserCardProps) {
  return <div>{props.name}</div>;
}
```

### Wrap reactive values in functions for conditional rendering

```tsx
// ✅ Reactive conditional
<Show when={props.isVisible}>
  <Content />
</Show>
```

### Derive, don't duplicate state

```ts
// ❌ Wrong — duplicated state
const [firstName, setFirstName] = createSignal("John");
const [lastName] = createSignal("Doe");
const [fullName, setFullName] = createSignal("John Doe");

// ✅ Right — derived value
const [firstName, setFirstName] = createSignal("John");
const [lastName] = createSignal("Doe");
const fullName = () => `${firstName()} ${lastName()}`;
```

D:/1_Projects/jstonehub/docs/architecture/data-lists.md

# Data Lists

Every list, table, or feed in the application follows the same architecture.
This document is the single source of truth for how lists work — from API
response format to frontend rendering.

---

## Loading Modes

Every list endpoint operates in one of two modes.

### Mode: `all`

The server returns **every record** in a single response. No pagination
query parameters are accepted.

The frontend handles filtering, sorting, and search locally using
TanStack Table. All filter/sort/search state is stored in URL search
params via `createValidateSearch` from
`@packages/contract/pagination/client`.

### Mode: `cursor`

The server accepts query parameters (`query`, `sort`, `order`, filters,
`cursor`, `limit`) and returns a page of results with cursor pointers
for bidirectional navigation.

### Decision algorithm

The only criterion is the **total number of records** in a given scope.
The number of users accessing the data is irrelevant — synchronization
between clients is handled through optimistic updates, SSE events, or
polling. The point is: if the dataset is small, it is simpler to return
everything at once and let the client work with it locally, avoiding
unnecessary database queries.

```
┌──────────────────────────────────────────────────┐
│ What is the weight of list items?                │
└──────┬──────────────────┬──────────────┬─────────┘
       │ Light            │ Medium       │ Heavy
       │ (3–5 fields)     │ (5–15 fields)│ (15+ fields)
       ▼                  ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ≤ 5000       │  │ ≤ 1000       │  │ ≤ 500        │
│ records?     │  │ records?     │  │ records?     │
└───┬─────┬────┘  └───┬─────┬────┘  └───┬─────┬────┘
    │ Yes │ No        │ Yes │ No        │ Yes │ No
    ▼     ▼           ▼     ▼           ▼     ▼
  ┌────┐┌──────┐   ┌────┐┌──────┐   ┌────┐┌──────┐
  │all ││cursor│   │all ││cursor│   │all ││cursor│
  └────┘└──────┘   └────┘└──────┘   └────┘└──────┘
```

Threshold values are defined as constants in
`@packages/contract/pagination/constant`:

| Item weight | Fields per item | `all` → `cursor` threshold | Approx. size of 100 records |
|---|---|---|---|
| Light | 3–5 scalar fields | `ALL_MODE_THRESHOLD_LIGHT` | ~10–15 KB |
| Medium | 5–15 fields | `ALL_MODE_THRESHOLD_MEDIUM` | ~30–50 KB |
| Heavy | 15+ fields or nested objects | `ALL_MODE_THRESHOLD_HEAVY` | ~60–100 KB |

Example: "User's projects" — medium weight, typically < 100 records → `all`.
Example: "Admin: all users" — potentially tens of thousands → `cursor`.

---

## Cursor-Based Pagination

All paginated lists use cursor-based pagination. No offset/page-based
pagination anywhere in the system.

### Why cursors over offset

| Criteria | Cursor | Offset |
|---|---|---|
| Insert/delete stability | Stable — no skipped/duplicated items | Shifts on data change |
| Performance at depth | O(log n) index seek at any position | O(n) linear degradation |
| Infinite scroll fit | Natural — no page numbers | Requires page tracking |

### What is a cursor

An opaque base64-encoded string containing the sort field value and
the record id:

```
cursor = base64(JSON.stringify({
  sortValue: "2024-01-15T10:30:00Z",
  id: "clxyz123abc"
}))
```

**Why both values?** The sort value enables a direct composite index
seek — O(log n). The id guarantees uniqueness when multiple records
share the same sort value. Clients never parse cursors, only pass
them back.

### Server response format

```ts
type CursorPageResponse<Item> = {
  items: Item[];
  nextCursor: string | null;   // null = no more data below
  prevCursor: string | null;   // null = no more data above
};
```

No `totalCount` — expensive on large tables, useless for infinite scroll.
`nextCursor === null` signals the end.

### How cursor queries work

Next page (sorted by `created_at DESC`):

```sql
SELECT * FROM "user"
WHERE (created_at, id) < (:cursor_sort_value, :cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT :limit + 1
```

Fetch `limit + 1` rows. If all return → more data exists, set
`nextCursor` from last row, return first `limit`. If fewer → set
`nextCursor` to `null`.

Previous page mirrors with reversed comparison and order.

---

## Search Params as Source of Truth

All list state is stored in **URL search params**, never in component
state. Three reasons:

1. **Page refresh** preserves the exact view
2. **Sharing a URL** gives another user the same view
3. **Browser back/forward** navigates through filter history

### What lives in search params

| Parameter | Mode | Purpose |
|---|---|---|
| `sort` | all, cursor | Active sort field |
| `order` | all, cursor | Sort direction (`asc` / `desc`) |
| `query` | all, cursor | Search text |
| Filter values | all, cursor | Active filter values |
| `anchor` | cursor only | Encoded top visible item |

### What does NOT live in search params

- Pagination cursors — internal to TanStack Query
- UI state (sidebar, modals)
- Selection state (checked rows)
- Scroll pixel offset

### Scroll anchor (cursor mode only)

The URL contains `?anchor=<encoded>` — base64 string with the **id
and sort field value** of the top visible element.

When another user opens the shared URL:

1. Client reads and decodes `anchor`
2. Sends request with decoded values as starting point
3. Server returns items centered on that position + cursors
4. Virtualizer renders from the anchor item

In `all` mode, anchor is unnecessary — all data is loaded, the
virtualizer scrolls to the element by id.

---

## Debounce and Change Batching

All list control components (search, filters, sorting, scroll anchor)
use **one shared debounce**. Not a separate debounce per input, but a
single timer on search params updates.

### Why a shared debounce

Users act fast: select a filter, change sorting, start typing a search
query — all within a couple of seconds. There is no point sending
intermediate requests after each individual action. A single shared
debounce waits until the user finishes the series of changes and only
then applies the result.

### Comparison before applying

When the debounce fires, it **compares new parameters with the current
ones**. If the user clicked back and forth but returned all values to
their original state — no request is sent, no cache is reset.

### Implementation

Debounce duration and the list of debounced interactions are defined as
constants in `@packages/contract/pagination/constant`. List components
use `@tanstack/solid-pacer` for implementation.

Debounced interactions:

- Search text input
- Filter selection / deselection
- Sort field or direction change
- Scroll anchor update

---

## List Loading States

When list parameters change, the user must see feedback. A semi-transparent
overlay with a spinner and a brief status appears over the table/list.

### States

States are determined based on TanStack Query (`isPending`, `isFetching`,
`isRefetching`) and the internal debounce status:

| State | What is happening | What the user sees |
|---|---|---|
| **Awaiting input** | Debounce has not fired yet — user is still changing parameters | Overlay + "Applying filters…" (or similar) |
| **Loading** | Request sent to server (cursor mode) or local re-indexing (all mode) | Overlay + spinner |
| **Ready** | Data received and rendered | Overlay removed |

In `all` mode, "loading" is a local TanStack Table operation (instant
for small volumes) — the overlay may be imperceptibly short, which
is fine.

---

## Parameter Changes and Cache Reset

When the debounce fires and new parameters differ from current ones:

| Mode | Behavior |
|---|---|
| **Cursor** | Cache cleared, cursor reset to `null`, fresh first-page request |
| **All** | No server request; TanStack Table re-applies filtering/sorting locally |

If new parameters **match** the current ones — nothing happens.

---

## Sorting

Single sort field + single direction. No multi-column sorting.

Sort field and direction stored in search params (`sort` + `order`).
Allowed sort fields defined per endpoint via pagination factory.

---

## Filtering

Multiple fields, each with multiple selected values.

Filter value `"all"` = do not filter by this field. This is distinct
from `mode: "all"` (loading mode):

| Concept | Meaning |
|---|---|
| `mode: "all"` | Server returns all records |
| Filter value `"all"` | No filtering on this field |

---

## Infinite Scroll

Bidirectional loading (down and up). No page numbers.

### Prefetch threshold

Next page fetch triggers when the user is within a configurable number
of items from the boundary. The threshold is defined as the
`PREFETCH_THRESHOLD` constant in `@packages/contract/pagination/constant`:

```
Loaded items:  [1] [2] [3] ... [46] [47] [48] [49] [50]
                                            ▲
                                PREFETCH_THRESHOLD items from end
                                → fetchNextPage()
```

If `nextCursor` is `null`, no request. Same logic applies upward.

### Cache structure

```
TanStack Query cache (useInfiniteQuery):

Page 0:  [item_1  ... item_50 ]  ← prevCursor
Page 1:  [item_51 ... item_100]
Page 2:  [item_101... item_150]  ← anchor (top visible)
Page 3:  [item_151... item_200]  ← nextCursor
```

Cursors live only in TanStack Query cache, never in URL.

---

## Virtualization

Virtualization is the **default** for all lists. Use
`@tanstack/solid-virtual`.

Only visible rows plus overscan buffer are rendered. Skip
virtualization only for **guaranteed static and tiny** lists
(e.g. settings page with 5 toggles).

---

## Optimistic Updates

Optimistic updates are the **default strategy** for mutations.

### How it works

```
User triggers mutation (create, update, delete)
  │
  ├─→ Immediately update TanStack Query cache
  │   (UI reflects the change instantly)
  │
  └─→ Send request to server
        │
        ├─→ Server confirms → done (UI already correct)
        │
        └─→ Server returns error → roll back cache, show error
```

### Decision algorithm

```
┌──────────────────────────────┐
│ Is the action irreversible?  │
│ (payment, permanent delete)  │
└──────┬───────────┬───────────┘
       │ Yes       │ No
       ▼           ▼
┌─────────────┐ ┌──────────────────────────────┐
│ pessimistic │ │ Can the result be predicted   │
└─────────────┘ │ from client state alone?      │
                └──────┬───────────┬────────────┘
                       │ No        │ Yes
                       ▼           ▼
                ┌─────────────┐ ┌──────────────────────────┐
                │ pessimistic │ │ Is rollback on error      │
                └─────────────┘ │ straightforward?          │
                                │ (single cache entry)      │
                                └──────┬───────────┬────────┘
                                       │ No        │ Yes
                                       ▼           ▼
                                ┌─────────────┐ ┌────────────┐
                                │ pessimistic │ │ optimistic │
                                └─────────────┘ └────────────┘
```

Example: "Delete a joke" — reversible (soft delete), predictable,
simple rollback → **optimistic**.
Example: "Process payment" — irreversible → **pessimistic**.

---

## Data Synchronization

### Single-user changes

When the current user mutates data, optimistic updates handle the UI
immediately (see above).

### Multi-user changes

When multiple users can modify the same data, changes split into two
categories.

#### Non-critical changes

Cosmetic or metadata updates (project name, logo, description).
Do not block other users' work.

Strategy: **no real-time sync**. Changes picked up on next automatic
refetch (`refetchOnWindowFocus` or manual refresh).

#### Critical changes

Destructive or access-breaking changes (resource deletion, permission
revocation, ban).

Strategy: **server-initiated notification**. Affected clients must be
informed promptly.

### Sync mechanism decision algorithm

```
┌─────────────────────────────────────────────────┐
│ Must affected clients know within seconds?       │
└──────────┬──────────────────────┬────────────────┘
           │ No                   │ Yes
           ▼                     ▼
┌─────────────────────┐  ┌─────────────────────────────────┐
│ Passive sync        │  │ Is the client already connected  │
│ (refetchOnFocus,    │  │ to an SSE stream for this scope? │
│  staleTime expiry)  │  └──────────┬──────────┬────────────┘
└─────────────────────┘             │ Yes      │ No
                                    ▼          ▼
                          ┌──────────────┐ ┌────────────────────────────┐
                          │ SSE event    │ │ Does the client discover   │
                          │ → invalidate │ │ the change on next action? │
                          │   cache key  │ │ (e.g. API returns 404/410) │
                          └──────────────┘ └──────────┬─────────┬───────┘
                                                      │ Yes     │ No
                                                      ▼         ▼
                                            ┌───────────────┐ ┌─────────────┐
                                            │ Handle API    │ │ Add SSE     │
                                            │ error code    │ │ stream for  │
                                            │ (404 → toast  │ │ this scope  │
                                            │  + redirect)  │ └─────────────┘
                                            └───────────────┘
```

### Cache update strategies

When a sync event arrives (SSE, polling, or error response):

```
┌──────────────────────────────────────────┐
│ Does the event carry the full new state? │
└──────────┬───────────────────┬───────────┘
           │ Yes               │ No
           ▼                   ▼
┌────────────────────┐  ┌─────────────────────────────────┐
│ Update cache       │  │ Is the resource deleted/revoked? │
│ directly via       │  └──────────┬──────────┬────────────┘
│ setQueryData()     │             │ Yes      │ No
└────────────────────┘             ▼          ▼
                        ┌────────────────┐ ┌──────────────────┐
                        │ Remove from    │ │ Invalidate query │
                        │ cache +        │ │ key → automatic  │
                        │ redirect/toast │ │ refetch          │
                        └────────────────┘ └──────────────────┘
```

| Strategy | When | Example |
|---|---|---|
| `setQueryData()` | Event contains full object | SSE: project renamed, payload has new name |
| `invalidateQueries()` | Something changed, need fresh data | SSE: "project X updated" (no payload) |
| Remove + redirect | Resource no longer accessible | API returns 404, or SSE: "project X deleted" |
| `queryClient.clear()` + redirect | User context changed | Ban, role downgrade → clear everything, go to login |

---

## Standardization

All list behavior is standardized through factories in `@packages/contract`:

- **`@packages/contract/pagination/server`** — `createQueryParamsSchema`
  (TypeBox) for API endpoint validation
- **`@packages/contract/pagination/client`** — `createValidateSearch`
  (Valibot) for TanStack Router search params validation

Both share the same constants from `@packages/contract/pagination/constant`
ensuring client and server always agree on field names, limits, and defaults.

### Shared entity constants

For each paginated entity, create a constants file in contract:

```ts
// @packages/contract/src/user-list.constant.ts
const USER_SORTS = ["createdAt", "name", "email"] as const;
const USER_SORT_DEFAULT = "createdAt" as const;
const USER_FILTERS = {
  globalRole: { values: GLOBAL_ROLE },
} as const;
```

Both client and server import from the same file — TypeScript catches
any mismatch at compile time.

Custom list implementations are not allowed. If a use case does not fit
the factory — extend the factory, do not bypass it.

---

## Page Size Guidelines

The `limitDefault` parameter controls how many records the server
returns per request in `cursor` mode. Values are defined as constants
in `@packages/contract/pagination/constant`:

| Item weight | Fields per item | `limitDefault` | Approx. page size |
|---|---|---|---|
| Light | 3–5 scalar fields | `CURSOR_LIMIT_LIGHT` | ~10–15 KB |
| Medium | 5–15 fields | `CURSOR_LIMIT_MEDIUM` (default) | ~30–50 KB |
| Heavy | 15+ fields or nested objects | `CURSOR_LIMIT_HEAVY` | ~30–60 KB |

Configured **per endpoint** via the factory's `limitDefault`. No
device-based adaptation — the payload size difference is negligible,
while reducing the limit increases round-trips, which hurts mobile
more.

D:/1_Projects/jstonehub/docs/architecture/documentation.md

# Documentation Principles

These rules apply to all documentation, code comments, and any written
material that a human reads to understand the system.

---

## Core Rules

### One file = one concept

Each documentation file covers **one topic**. A reader should fully
understand that topic without opening other files. Cross-references
to other files are allowed only for **deeper details**, not for
completing the core understanding.

```
✅ "Data Lists" — everything about lists in one file
✅ "Performance" — everything about performance in one file
❌ "Data Lists Part 1" + "Data Lists Part 2" — split concept
❌ "Performance: Caching" separate from "Performance: Indexes" — fragmented
```

### 3–4 abstractions at a time

A human can hold **3–4 complex abstractions** in working memory
simultaneously. Each section within a file should introduce no more
than that before providing a concrete example or summary.

If a section requires understanding 5+ new concepts at once — split
it into subsections, each introducing 1–2 concepts with examples.

### General to specific

Every file, every section follows the same structure:

```
1. What is this? (one sentence)
2. Why does it matter? (motivation)
3. Algorithm (step-by-step decision process)
4. Example (concrete application of the algorithm)
5. Edge cases / exceptions (if any)
```

Never start with implementation details. Never start with exceptions.

### Algorithm → Example

Every decision that a developer must make should have:

1. A **step-by-step algorithm** (flowchart or numbered steps)
   that produces a clear answer
2. A **concrete example** showing the algorithm applied to a real
   case from this project

```
✅ Algorithm: "Step 1: Is data scoped? → Yes → Step 2: Can exceed 1000? ..."
   Example: "User's projects — scoped, < 100 → mode: all"

❌ "Use mode: all for small datasets and mode: cursor for large ones"
   (no algorithm, no clear threshold, no example)
```

---

## No Duplication

### Single source of truth

Every piece of knowledge exists in **exactly one place**:

| Knowledge type | Source of truth | Documentation role |
|---|---|---|
| Type definitions, constants | Code (`@packages/contract`, etc.) | Do not copy into markdown |
| API signatures, function params | Code (the function itself) | Reference files may summarize, never duplicate |
| Architectural decisions | `docs/architecture/*.md` | The canonical source |
| Usage examples for stable packages | `docs/reference/*.md` | Brief snapshot of types and usage |

### When code is the source of truth

If a value, type, or behavior is defined in code — **do not repeat it
in documentation**. Instead:

- Mention that it exists and where to find it
- Describe the **principle** behind it, not the implementation
- Give the file path or import path

```
✅ "Pagination factories live in `@packages/contract/pagination/client`
   and `@packages/contract/pagination/server`"

❌ Copying the full TypeScript type definition into the markdown file
```

### Reference files

Stable, tested packages get a reference file (`docs/reference`)
that provides a **brief snapshot** — function signatures, key behaviors,
usage notes. These are intentionally concise to avoid going stale.

Contracts and frequently-changing code are provided as **code in context**
(included directly when working with AI or reviewing), not as markdown
references.

---

## Formatting Rules

### Algorithms — use flowcharts

Decision processes use ASCII flowcharts, not prose paragraphs:

```
┌─────────────────┐
│ Question?       │
└────┬───────┬────┘
     │ Yes   │ No
     ▼       ▼
┌─────────┐ ┌─────────┐
│ Answer  │ │ Answer  │
└─────────┘ └─────────┘
```

### Data — use tables

Uniform data (comparisons, option lists, mappings) uses tables:

```
| Option | When | Example |
|---|---|---|
| A | condition | ... |
| B | condition | ... |
```

### Code — use fenced blocks

All code examples use fenced code blocks with language annotation.
Examples must be **minimal** — show only what is relevant to the point
being made.

### Prose — use short paragraphs

No paragraph longer than 3–4 sentences. If a paragraph needs more —
it should be split or converted to a list.

D:/1_Projects/jstonehub/docs/architecture/overrides.md

### Привязка нескольких провайдеров

Автоматическое объединение аккаунтов по email ЗАПРЕЩЕНО (security risk).

Если при OAuth callback найден auth_account с таким (provider, providerAccountId):
→ Обычный логин, создаём сессию.

Если auth_account не найден, но user с таким email существует:
→ НЕ создаём auth_account автоматически.
→ Показываем страницу конфликта с предложением привязать.
→ Для привязки пользователь должен:
  1. Подтвердить желание привязать (создаётся auth_link_request, TTL 15 мин)
  2. Войти через существующий провайдер (подтверждение владения аккаунтом)
  3. Подтвердить привязку в настройках или сразу после входа
→ После подтверждения: создаём auth_account, удаляем auth_link_request.

Если auth_account не найден и user с таким email не существует:
→ Создаём нового user + auth_account.

Отвязка провайдера возможна в настройках.
Нельзя отвязать последний провайдер (минимум один обязателен).

Email пользователя НЕ обновляется автоматически при смене email в провайдере.
Привязка работает по providerAccountId, не по email.

D:/1_Projects/jstonehub/docs/architecture/performance.md

# Performance & Complexity

Every feature must be designed with four cost dimensions in mind:
**CPU**, **Memory**, **Network**, and **Growth rate (Big O)**.

---

## Big O — Algorithmic Complexity

Before writing any loop, filter, or data transformation, consider how
the operation scales as data grows.

### Target complexities

| Acceptable | Avoid | Refactor immediately |
|---|---|---|
| O(1) — constant | O(n log n) — without justification | O(n²) — nested loops over same data |
| O(log n) — binary search, index seek | | O(n³) — triple nesting |
| O(n) — single pass | | O(2ⁿ) — exponential |

### Decision algorithm

```
┌──────────────────────────────────────┐
│ Does the operation iterate over data?│
└──────────┬───────────────┬───────────┘
           │ No            │ Yes
           ▼               ▼
    ┌────────────┐  ┌──────────────────────────────┐
    │ O(1) — ok  │  │ How many nested iterations    │
    └────────────┘  │ over the same or related data?│
                    └──────┬───────────┬────────────┘
                           │ 1         │ 2+
                           ▼           ▼
                    ┌────────────┐ ┌──────────────────────────┐
                    │ O(n) — ok  │ │ Can an inner loop be     │
                    └────────────┘ │ replaced with a Set/Map  │
                                   │ lookup?                  │
                                   └──────┬───────────┬───────┘
                                          │ Yes       │ No
                                          ▼           ▼
                                   ┌────────────┐ ┌──────────────────┐
                                   │ Refactor   │ │ Can the work be  │
                                   │ to O(n)    │ │ moved to SQL     │
                                   │ using      │ │ (index seek)?    │
                                   │ Map/Set    │ └────┬────────┬────┘
                                   └────────────┘      │ Yes    │ No
                                                       ▼       ▼
                                                ┌──────────┐ ┌────────────┐
                                                │ Move to  │ │ Document   │
                                                │ SQL with │ │ why O(n²)  │
                                                │ index    │ │ is needed  │
                                                └──────────┘ └────────────┘
```

### Common refactoring patterns

**O(n²) → O(n) with Map/Set:**

```ts
// ❌ O(n²) — for each user, scan all permissions
for (const user of users) {
  const perm = permissions.find((p) => p.userId === user.id);
}

// ✅ O(n) — build lookup first, then single pass
const permByUser = new Map(permissions.map((p) => [p.userId, p]));
for (const user of users) {
  const perm = permByUser.get(user.id);
}
```

**O(n) in JS → O(log n) in SQL:**

```ts
// ❌ O(n) — fetch all, filter in JS
const all = await db.select().from(userTable);
const admins = all.filter((u) => u.globalRole === "admin");

// ✅ O(log n) — filter in SQL using index
const admins = await db
  .select()
  .from(userTable)
  .where(eq(userTable.globalRole, "admin"));
```

---

## Database Indexes

### Checklist before creating a table

1. Which columns will be filtered? → Add B-tree indexes
2. Which columns will be sorted? → Include in composite indexes
3. Which columns will be searched (fuzzy)? → Add GIN trigram indexes
4. What is the expected row count? → Thousands? Millions?
5. Which queries will be most frequent? → Optimize those first
6. Which foreign keys exist? → Add index on FK columns (not automatic in PostgreSQL)

### Index types

```
Single filter:          index(column)
Filter + sort:          index(filter_column, sort_column)
Fuzzy text search:      index USING gin(column gin_trgm_ops)
Unique lookup:          unique(column) — already indexed
Foreign key:            index(fk_column)
Cursor pagination:      index(sort_column, id)
```

### Decision algorithm

```
┌───────────────────────────────────────┐
│ Will this column appear in WHERE?     │
└──────────┬────────────────┬───────────┘
           │ No             │ Yes
           ▼                ▼
┌──────────────────┐ ┌─────────────────────────────┐
│ Will it appear   │ │ Is it a text search (ILIKE)? │
│ in ORDER BY?     │ └──────┬───────────┬───────────┘
└────┬────────┬────┘        │ Yes       │ No
     │ No     │ Yes         ▼           ▼
     ▼        ▼      ┌───────────┐ ┌──────────────────────┐
┌─────────┐ ┌─────┐  │ GIN trgm  │ │ Will it also be      │
│ No      │ │ Add │  │ index     │ │ sorted?              │
│ index   │ │ idx │  └───────────┘ └────┬────────┬────────┘
│ needed  │ └─────┘                     │ Yes    │ No
└─────────┘                             ▼       ▼
                                 ┌────────────┐ ┌───────────┐
                                 │ Composite  │ │ Single    │
                                 │ index      │ │ column    │
                                 │ (filter,   │ │ index     │
                                 │  sort_col) │ └───────────┘
                                 └────────────┘
```

### Example: user table

```
Filter by role + sort by created_at  →  index(global_role, created_at)
Fuzzy search by name                 →  GIN index(name gin_trgm_ops)
Fuzzy search by email                →  GIN index(email gin_trgm_ops)
Sort by created_at alone             →  index(created_at)
Cursor pagination by created_at      →  index(created_at, id)
```

---

## API Response Efficiency

### Select only needed columns

```ts
// ❌ Returns all columns including heavy ones
const users = await db.select().from(userTable);

// ✅ Returns only what the list needs
const users = await db
  .select({
    id: userTable.id,
    name: userTable.name,
    email: userTable.email,
    globalRole: userTable.globalRole,
  })
  .from(userTable);
```

### Decision algorithm

```
┌───────────────────────────────────────────┐
│ Does the client need ALL columns?         │
└──────────┬────────────────────┬───────────┘
           │ Yes                │ No
           ▼                   ▼
┌─────────────────────┐  ┌──────────────────────────────┐
│ Select all          │  │ Select only required columns  │
│ (detail page,       │  │ (lists, search results,       │
│  edit form)         │  │  autocomplete, summaries)     │
└─────────────────────┘  └──────────────────────────────┘
```

### Response shape

- Return **flat structures** — avoid deeply nested objects
- Use **consistent naming** — camelCase for all fields
- **Never return unbounded result sets** — every list endpoint
  uses either `mode: "all"` (bounded by scope) or `mode: "cursor"`
  (bounded by limit)

### Batch operations

Prefer a single request with array payload over N individual requests:

```ts
// ❌ N requests
for (const id of ids) {
  await client.api.jokes[id].delete();
}

// ✅ Single request
await client.api.jokes.batch.delete({ ids });
```

---

## Network Request Consolidation

Multiple pieces of data that are fetched or refreshed together must be
served by a **single API endpoint**. TanStack Query does not merge
separate queryKeys into one HTTP request — consolidation happens at
the **API design** level.

### Why consolidate

- Fewer HTTP round-trips — lower latency, less server load
- Atomic freshness — related data is consistent within one response
- Simpler polling — one `refetchInterval` instead of N independent timers

### Decision algorithm

```
┌──────────────────────────────────────────────────┐
│ Are there 2+ queries that are always fetched     │
│ together (same page, same lifecycle)?            │
└──────────┬───────────────────────┬───────────────┘
           │ No                    │ Yes
           ▼                      ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│ Keep as separate    │  │ Do they share the same            │
│ endpoints           │  │ staleTime / refetchInterval?      │
└─────────────────────┘  └──────────┬───────────┬────────────┘
                                    │ Yes       │ No
                                    ▼           ▼
                          ┌──────────────────┐ ┌─────────────────────┐
                          │ Merge into ONE   │ │ Can the faster one  │
                          │ endpoint         │ │ piggyback on the    │
                          │ (single query)   │ │ slower interval?    │
                          └──────────────────┘ └──────┬──────┬───────┘
                                                      │ Yes  │ No
                                                      ▼      ▼
                                            ┌──────────────┐ ┌───────────┐
                                            │ Align to the │ │ Keep      │
                                            │ slower       │ │ separate  │
                                            │ interval,    │ │ endpoints │
                                            │ merge        │ └───────────┘
                                            └──────────────┘
```

### Example: auth context

Session and admin permissions are always loaded together on the admin
app and share `staleTime: Infinity` (manual invalidation only).

```
❌ Two endpoints, two queries:
   GET /api/auth/session       → { id, name, role, ... }
   GET /api/admin/permissions/me → ["joke:read", ...]

✅ One endpoint, one query:
   GET /api/auth/context?scope=admin
   → { user: { id, name, role }, permissions: ["joke:read", ...] }

   For hub (no permissions needed):
   GET /api/auth/context?scope=hub
   → { user: { id, name, role }, permissions: null }
```

One queryKey `["auth-context"]`, one HTTP request, one `staleTime`.

### Example: periodic background data

Two datasets both need refreshing every 5 minutes:

```
❌ Two independent polling queries:
   useQuery({ queryKey: ["stats"], refetchInterval: 300_000 })
   useQuery({ queryKey: ["alerts"], refetchInterval: 300_000 })
   → 2 requests every 5 minutes, potentially at different times

✅ One combined endpoint:
   GET /api/dashboard/live → { stats: {...}, alerts: [...] }
   useQuery({ queryKey: ["dashboard-live"], refetchInterval: 300_000 })
   → 1 request every 5 minutes
```

### Interval alignment rule

When a new dataset needs periodic refresh and a combined endpoint
already exists with a suitable interval:

```
┌─────────────────────────────────────────────────────┐
│ Does an existing combined endpoint already refresh  │
│ at a similar interval (within 2x)?                  │
└──────────┬──────────────────────────┬───────────────┘
           │ Yes                      │ No
           ▼                         ▼
┌───────────────────────────┐  ┌──────────────────────┐
│ Add to existing endpoint  │  │ Create new endpoint  │
│ Align to its interval     │  │ with own interval    │
└───────────────────────────┘  └──────────────────────┘
```

"Within 2x" means: if existing interval is 5 min and new data
needs 3–10 min freshness → add to existing. If new data needs
30 sec freshness → keep separate.

### What NOT to consolidate

- Queries with vastly different freshness requirements (5 min vs 10 sec)
- Queries used on different pages with no shared lifecycle
- Heavy queries that would slow down a lightweight polling endpoint

---

## Server-Side Caching

### Four storage levels

| Level | Storage | Speed | Survives restart | Shared across processes |
|---|---|---|---|---|
| 1 | **In-memory** (variable in process) | Fastest | No | No |
| 2 | **Redis** | Fast (network hop) | Yes (persistent) | Yes |
| 3 | **S3 / MinIO** | Moderate | Yes | Yes |
| 4 | **PostgreSQL** | Moderate | Yes | Yes |

**PostgreSQL is always the source of truth.** Levels 1–3 are caches
that are rebuilt from PostgreSQL on process restart.

### Decision algorithm: should I cache?

```
┌─────────────────────────────────────────────┐
│ Is this data read more than once per minute │
│ by one or more clients?                     │
└──────────┬──────────────────────┬───────────┘
           │ No                   │ Yes
           ▼                     ▼
┌─────────────────────┐  ┌──────────────────────────────┐
│ No caching needed.  │  │ Is the query fast (<10ms)    │
│ Read from           │  │ with proper indexes?         │
│ PostgreSQL directly │  └──────────┬───────────┬───────┘
└─────────────────────┘             │ Yes       │ No
                                    ▼           ▼
                          ┌──────────────┐  ┌────────────┐
                          │ No caching   │  │ Cache it   │
                          │ needed.      │  │ (choose    │
                          │ Index is     │  │  level     │
                          │ sufficient   │  │  below)    │
                          └──────────────┘  └────────────┘
```

### Decision algorithm: which cache level?

```
┌──────────────────────────────────────────────┐
│ Is the data needed by multiple processes     │
│ (API + Worker, or multiple API instances)?   │
└──────────┬───────────────────────┬───────────┘
           │ No                    │ Yes
           ▼                      ▼
┌─────────────────────┐   ┌──────────────────────────────┐
│ In-memory (level 1) │   │ Is the data binary or large  │
│                     │   │ (images, files, audio)?      │
│ Invalidate via      │   └──────────┬───────────┬───────┘
│ API mutation        │              │ Yes       │ No
│ (same process)      │              ▼           ▼
└─────────────────────┘   ┌──────────────┐ ┌───────────────┐
                          │ S3 / MinIO   │ │ Redis         │
                          │ (level 3)    │ │ (level 2)     │
                          │              │ │               │
                          │ Store object,│ │ TTL or event- │
                          │ cache URL    │ │ based         │
                          │ in Redis or  │ │ invalidation  │
                          │ in-memory    │ └───────────────┘
                          └──────────────┘
```

### Cache invalidation

Every cached value must have a defined invalidation strategy **before**
it is cached:

| Strategy | When to use | Example |
|---|---|---|
| **Synchronous** — update cache in same mutation | Data changes through your own API | Admin updates fingerprint → update in-memory + PostgreSQL |
| **TTL** — cache expires after fixed time | External data, acceptable staleness | Voice list → cache 24h in S3, URL in Redis |
| **Event-based** — invalidate on specific event | Data changes from another process | Worker completes job → event → API invalidates Redis key |

### Decision algorithm: how to invalidate?

```
┌──────────────────────────────────────────────┐
│ Does the data change through your own API?   │
└──────────┬───────────────────────┬───────────┘
           │ Yes                   │ No
           ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│ Synchronous:         │  │ Is stale data acceptable     │
│ update cache in the  │  │ for some time?               │
│ same mutation handler│  └──────────┬───────────┬───────┘
└──────────────────────┘             │ Yes       │ No
                                     ▼           ▼
                           ┌──────────────┐ ┌────────────────┐
                           │ TTL-based    │ │ Event-based    │
                           │ (set expiry) │ │ (listen for    │
                           └──────────────┘ │  change event) │
                                            └────────────────┘
```

---

## Client-Side Caching (TanStack Query)

### staleTime and gcTime

| Data type | `staleTime` | `gcTime` | Invalidation |
|---|---|---|---|
| Auth context (session + permissions) | `Infinity` | `Infinity` | Manual on refresh/logout |
| User's own data (projects, accounts) | 30s–60s | 5min | On mutation (optimistic) |
| Admin lists (all users, all jokes) | 0 | 5min | On parameter change |
| Dashboard live data | 0 | 5min | `refetchInterval` on combined endpoint |

### When NOT to cache on the client

- Computation takes **< 1ms** (e.g. `cn()`, string concatenation)
- Value is already reactive (SolidJS derived signals)
- Caching overhead (memory + invalidation) exceeds recomputation cost

---

## Checklist

Before shipping any feature that reads or writes data:

- [ ] Queries use proper indexes (no sequential scans on large tables)
- [ ] API returns only needed columns (no `SELECT *` for lists)
- [ ] No O(n²) loops without documented justification
- [ ] Lists follow the standard pagination contract
      (see [data-lists.md](./data-lists.md))
- [ ] Cache has defined invalidation strategy (if caching is used)
- [ ] No unbounded result sets from API
- [ ] Related data with same lifecycle served by single endpoint
      (see [Network Request Consolidation](#network-request-consolidation))

D:/1_Projects/jstonehub/docs/architecture/project-structure.md

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

D:/1_Projects/jstonehub/docs/roadmap/milestone-01-auth.md

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


D:/1_Projects/jstonehub/docs/roadmap/milestones.md

# Milestones

Ordered list of development milestones. Each milestone builds on
previous ones. Total target: 3 intensive days with AI-assisted
development.

---

## Overview

```
Day 1 (8-10h):
  MS-01: Auth & Permissions .............. ~8h
  
Day 2 (8-10h):
  MS-02: Energy & Subscriptions .......... ~5h
  MS-03: Organizations (basic) ........... ~4h

Day 3 (8-10h):
  MS-04: Admin Panel ..................... ~4h
  MS-05: Audio Processing & Worker ....... ~5h

Post-Day 3 (ongoing):
  MS-06: AI Providers .................... ~6h
  MS-07: Content DB & Feedback ........... ~5h
  MS-08: Blueprints ...................... ~8h
  MS-09: Payments Integration ............ ~6h
```

---

## MS-01: Auth & Permissions

**Goal:** Users can sign in via Google OAuth. Sessions are managed
with JWT access + refresh tokens. Permissions system controls access
to admin panel and future features.

**Depends on:** Nothing (first milestone)

### Scope

| Included | NOT included |
|---|---|
| Google OAuth flow (PKCE) | Other OAuth providers |
| JWT access token (15min) in httpOnly cookie | |
| Refresh token (14 days) with rotation | |
| Session management (list, revoke, revoke all) | |
| Permission table + CRUD | Role-based access (no roles) |
| `admin:all` assignment via OWNER_EMAIL | |
| Auth middleware + permission guards | |
| Hub: login page, private layout, session | |
| Admin: login page, private layout, permission check | |
| Interceptor with refresh + mutex | |
| Logout with full cache clear | |
| Dev seed: test users with various permissions | |

### Completion Criteria

- [ ] User can sign in via Google OAuth on Hub
- [ ] User can sign in via Google OAuth on Admin (requires `admin:access`)
- [ ] Access token expires after 15min, refresh works transparently
- [ ] Refresh token rotation: old token invalidated on use
- [ ] Session list shows all active sessions with device info
- [ ] User can revoke individual sessions and all sessions
- [ ] Banned user gets 403 on all API requests
- [ ] Platform owner (OWNER_EMAIL) gets `admin:all` on first login
- [ ] Permission checks work: `admin:access`, `admin:user:read`, etc.
- [ ] Interceptor handles concurrent 401s with mutex
- [ ] Logout clears cookies + queryClient.clear()
- [ ] Dev seed creates test users with assorted permissions

### Testing Checklist

- [ ] OAuth flow: happy path (new user, existing user)
- [ ] OAuth flow: banned user redirected with error
- [ ] OAuth flow: admin login without `admin:access` → error
- [ ] Refresh: expired access token → transparent refresh → retry
- [ ] Refresh: expired refresh token → redirect to login
- [ ] Refresh: concurrent requests → single refresh call (mutex)
- [ ] Refresh: stolen token detection (rotation)
- [ ] Permission: `admin:all` bypasses all checks
- [ ] Permission: `admin:joke:all` bypasses `admin:joke:*` checks
- [ ] Permission: missing permission → 403
- [ ] Ban: cascades to delete admin permissions + all sessions
- [ ] Session: revoke specific session → that device gets 401
- [ ] Session: revoke all → all devices get 401

### Critical Warnings

1. **Refresh token stored as SHA-256 hash** — never store raw
2. **Refresh token cookie path = `/api/auth/refresh`** — not sent to other endpoints
3. **`queryClient.clear()` on logout** — prevents data leak between accounts
4. **Permission resolution order:** specific → `:all` for entity → scope `:all`
5. **OWNER_EMAIL check only on user creation** — not on every login

**Detailed breakdown:** [milestone-01-auth.md](./milestone-01-auth.md)

---

## MS-02: Energy & Subscriptions

**Goal:** Users have energy balances. Subscriptions provide daily
energy and purchase discounts. Pricing engine configurable via admin.

**Depends on:** MS-01 (auth, permissions, user table)

### Scope

| Included | NOT included |
|---|---|
| User energy balance (bigint) | Payment provider integration |
| Subscription tiers (common/rare/epic/legendary) | Auto-renewal |
| Subscription purchase (manual via admin for MVP) | |
| Daily energy claim on login (timezone-aware) | |
| Energy pack on subscription purchase | |
| Subscription stacking on upgrade | |
| Energy purchase (personal) with subscription discount | |
| Price versioning (409 on mismatch) | |
| Tool pricing config in admin | |
| Subscription config in admin | |
| Global markup + per-tool adjustment | |
| Coefficients (bitrate, resolution, etc.) | |
| Admin: grant energy to user (audit logged) | |
| Admin: grant/revoke subscription (audit logged) | |
| Audit log for all energy/subscription mutations | |
| Dev seed: users with various balances and subscriptions | |

### Completion Criteria

- [ ] User has energy balance displayed in Hub header (abbreviated)
- [ ] Hover on balance shows full number
- [ ] Admin can grant energy to user (reason required, audit logged)
- [ ] Admin can grant subscription to user (audit logged)
- [ ] Daily energy claimed on login, respects timezone, no duplicates
- [ ] Login streak tracked and displayed
- [ ] Subscription stacking works (two active subs, bonuses stack)
- [ ] Discount = max of active subscriptions
- [ ] Tool energy cost calculated: real_cost × markup × coefficient
- [ ] Price version sent with requests, 409 on mismatch
- [ ] Admin pricing page: tools, subscriptions, markups, discounts
- [ ] Validation: higher tier must have higher discount
- [ ] All energy mutations logged in audit (append-only)

### Testing Checklist

- [ ] Daily claim: first login of day → energy credited
- [ ] Daily claim: second login same day → no duplicate credit
- [ ] Daily claim: login after midnight in user's timezone → new credit
- [ ] Subscription: active sub → correct daily amount
- [ ] Subscription: common (free) → 0 daily energy
- [ ] Subscription: two active subs → bonuses stacked, discount = max
- [ ] Subscription: expired sub → no more daily energy
- [ ] Energy deduction: sufficient balance → success
- [ ] Energy deduction: insufficient balance → 402 Payment Required
- [ ] Price version: matching → success
- [ ] Price version: mismatch → 409 with new pricing
- [ ] Admin grant: energy credited, audit log created
- [ ] Admin grant: subscription assigned, audit log created
- [ ] Integer arithmetic: no floating point anywhere

### Critical Warnings

1. **All energy operations use bigint** — no floating point ever
2. **ceil() when converting USD to energy** — user always pays at least 1
3. **Price version prevents stale-price attacks** — client must send version
4. **Audit log is append-only** — no UPDATE, no DELETE
5. **Timezone stored per user** — daily claim uses user's timezone

**Detailed breakdown:** [milestone-02-energy.md](./milestone-02-energy.md)

---

## MS-03: Organizations

**Goal:** Users can create organizations, invite members with
granular permissions, allocate energy budgets to projects and
social accounts.

**Depends on:** MS-02 (energy balance, permission system)

### Scope

| Included | NOT included |
|---|---|
| Organization CRUD (one per user as owner) | Organization transfer |
| Org energy balance | Payment integration for org |
| Energy transfer: personal → org (irreversible) | |
| Direct purchase for org (with org:fund permission) | |
| Org volume discount tiers | |
| Projects within organization | |
| Social accounts within projects | |
| Content types within social accounts | |
| Budget allocation: org → project → account (hard) | |
| Org permissions: fund, manage, view_logs, etc. | |
| Resource permissions: project:manage, account:manage | |
| Social platform entity (YouTube, Instagram, etc.) | |
| Platform request system (users request new platforms) | |
| Energy spend tracking per tool/account/project | |
| Dev seed: orgs with projects, accounts, members | |

### Completion Criteria

- [ ] User can create one organization
- [ ] Owner gets `org:{id}:all` permission automatically
- [ ] Owner can invite members with specific permissions
- [ ] Member with `org:{id}:fund` can transfer personal energy
- [ ] Member with `org:{id}:fund` can buy energy directly for org
- [ ] Org discount = owner subscription discount + volume tier
- [ ] Discount capped at MAX_DISCOUNT_PERCENT
- [ ] Projects created with budget from org balance (reserved)
- [ ] Social accounts created with optional budget from project
- [ ] Content types defined per social account
- [ ] Resource permissions (project:manage, account:manage) work
- [ ] Deleting project → cleanup resource permissions
- [ ] Energy spend logged per tool, per account, per project
- [ ] Organization deletion: only owner, energy burns

### Testing Checklist

- [ ] Create org: user can create one, second attempt → 409
- [ ] Permissions: owner bypasses all org checks
- [ ] Permissions: member without fund → cannot transfer energy
- [ ] Transfer: personal → org, balance updated, irreversible
- [ ] Transfer: attempt to exceed personal balance → error
- [ ] Budget: allocate to project → reserved from org balance
- [ ] Budget: project spend exceeds budget → blocked (hard limit)
- [ ] Discount: correct calculation with owner sub + volume tier
- [ ] Discount: cap at MAX_DISCOUNT_PERCENT
- [ ] Delete project: all resource permissions cleaned up
- [ ] Delete org: all energy burns, members lose access

### Critical Warnings

1. **Energy transfer is irreversible** — no refunds from org
2. **Budget is hard-reserved** — cannot be spent elsewhere
3. **Permission cleanup on resource delete** — single indexed DELETE
4. **One org per user as owner** — DB constraint
5. **Owner cannot leave** — must delete org to exit

**Detailed breakdown:** [milestone-03-organizations.md](./milestone-03-organizations.md)

---

## MS-04: Admin Panel

**Goal:** Full admin interface for managing users, permissions,
pricing, audit logs, and platform configuration.

**Depends on:** MS-01 (auth), MS-02 (energy, subscriptions)

### Scope

| Included | NOT included |
|---|---|
| User list with search, filter, sort (cursor pagination) | |
| User detail: permissions, subscription, energy, sessions | |
| Ban/unban with reason (cascade: permissions, sessions) | |
| Grant/revoke energy with reason | |
| Grant/revoke subscription | |
| Permission management: view all, grant, revoke | |
| Pricing management: tools, subscriptions, discounts | |
| Audit log viewer (filterable, cursor pagination) | |
| Platform configuration (discount caps, tiers) | |
| Dev seed cards on all admin pages | |

### Completion Criteria

- [ ] User list: search by name/email (trigram), filter by ban status
- [ ] User detail: full info, edit permissions, view sessions
- [ ] Ban: sets is_banned, deletes admin permissions, deletes sessions
- [ ] Unban: clears is_banned, user starts with zero permissions
- [ ] Energy grant: amount + reason required, audit logged
- [ ] Subscription grant: tier + duration, audit logged
- [ ] Permission page: see who has what, bulk operations
- [ ] Pricing page: configure all tools, subscriptions, markups
- [ ] Audit log: filterable by actor, target, action, date range
- [ ] All admin actions require appropriate permissions

### Critical Warnings

1. **Cannot ban user with `admin:all`** — platform owner protection
2. **Cannot modify own permissions** — prevent self-lockout
3. **Audit log is read-only in UI** — no delete capability
4. **Pricing changes increment price_version** — immediate effect

**Detailed breakdown:** [milestone-04-admin.md](./milestone-04-admin.md)

---

## MS-05: Audio Processing & Worker Pipeline

**Goal:** Users can upload audio/video files, process them
(silence removal, noise reduction, merging), and download results.
Worker infrastructure established for all future heavy tasks.

**Depends on:** MS-02 (energy deduction), MS-01 (auth)

### Scope

| Included | NOT included |
|---|---|
| MinIO presigned upload/download URLs | Video rendering |
| Worker queue infrastructure (BullMQ) | AI-powered processing |
| Audio processing: silence removal | Image generation |
| Audio processing: noise reduction | TTS |
| Audio processing: spike removal | |
| Audio processing: merge multiple files | |
| Video: extract audio, process, reattach | |
| Configurable parameters per operation | |
| Energy cost calculation with coefficients | |
| Job progress tracking (SSE to client) | |
| Job result storage in MinIO | |
| Dev seed: sample audio files for testing | |

### Completion Criteria

- [ ] User uploads audio via presigned URL to MinIO
- [ ] API creates worker job, deducts energy
- [ ] Worker processes audio (FFmpeg)
- [ ] Result uploaded to MinIO, user notified
- [ ] User downloads result via presigned URL
- [ ] All processing parameters configurable
- [ ] Coefficients applied (duration, bitrate)
- [ ] Job progress visible in UI (SSE)
- [ ] Failed jobs: energy refunded, user notified
- [ ] Video: audio extracted, processed, reattached

### Critical Warnings

1. **Energy deducted before processing** — refund on failure
2. **Presigned URLs expire** — 15min for upload, 1h for download
3. **Worker must not block** — each job isolated
4. **FFmpeg is CPU-heavy** — limit concurrent jobs per worker

**Detailed breakdown:** [milestone-05-audio.md](./milestone-05-audio.md)

---

## MS-06: AI Providers

**Goal:** Integrate external AI services (TTS, image generation)
with rate limiting, account rotation, and fingerprint management
for browser-based providers.

**Depends on:** MS-05 (worker infrastructure)

### Scope

| Included | NOT included |
|---|---|
| AI provider entity (name, type, config) | Advanced browser emulation |
| Provider account management (multiple per provider) | |
| Rate limiting per account (req/min, req/day, req/month) | |
| Account rotation (round-robin, free-first) | |
| Basic fingerprint management | |
| TTS integration (first provider) | |
| Queue system for cheap energy (off-peak) | |
| Provider health monitoring | |

**Detailed breakdown:** [milestone-06-ai-providers.md](./milestone-06-ai-providers.md)

---

## MS-07: Content Database & Feedback

**Goal:** Joke database with translations, categories, tags.
Universal feedback system for reporting errors in any entity.

**Depends on:** MS-04 (admin panel), MS-06 (AI providers for TTS generation)

### Scope

| Included | NOT included |
|---|---|
| Joke entity: text, category, tags, rating, length | Other content DBs (stories, etc.) |
| Joke translations (per language) | User-submitted jokes |
| Joke audio generation (TTS per translation) | |
| Language entity (managed in admin) | |
| Category / tag system (per content type, not shared) | |
| Feedback system: report errors on any entity | |
| Feedback resolution: admin reviews, grants energy reward | |
| Admin: joke CRUD, moderation, bulk operations | |
| Admin: feedback queue, resolve/reject with reason | |
| Content permission checks (admin:joke:read, etc.) | |
| Dev seed: test jokes with translations, tags, feedback | |

### Completion Criteria

- [ ] Jokes created via admin with text, category, tags
- [ ] Translations added per language (multiple per joke)
- [ ] TTS audio generated per translation (via AI provider)
- [ ] Audio stored in MinIO, URL cached in DB
- [ ] Joke list in admin: search, filter by category/tag/language
- [ ] Feedback: user can report error on any joke (from Hub)
- [ ] Feedback includes entity type, entity ID, description
- [ ] Feedback visible to: assigned content moderator + global feedback viewers
- [ ] Admin resolves feedback: fix issue, optionally reward energy to reporter
- [ ] Admin rejects feedback: mark as invalid, optionally warn reporter
- [ ] All feedback actions audit logged
- [ ] Joke data accessible to blueprints (API endpoint)

### Testing Checklist

- [ ] Joke CRUD: create, update, delete with permissions
- [ ] Translation: add multiple languages, update, delete
- [ ] TTS generation: triggered on translation create/update
- [ ] TTS generation: energy deducted from admin budget (platform account)
- [ ] Feedback: user submits on joke → visible in admin
- [ ] Feedback: moderator resolves → energy reward to user
- [ ] Feedback: moderator rejects → no reward, optional warning
- [ ] Feedback: duplicate prevention (same user, same entity, open feedback)
- [ ] Search: trigram search on joke text works across languages
- [ ] Filter: by category, tag, language, has-audio, feedback-pending

### Critical Warnings

1. **TTS generation costs energy** — deducted from platform operational account
2. **Feedback is scoped to entity** — `entity_type` + `entity_id`, not free-form
3. **Energy reward for valid feedback** — amount configurable in admin
4. **Duplicate feedback prevention** — one open feedback per user per entity

**Detailed breakdown:** [milestone-07-content.md](./milestone-07-content.md)

---

## MS-08: Blueprints

**Goal:** First blueprint implemented: "Vertical Jokes — Dynamic
Background". Blueprint purchase system. Full video generation
pipeline.

**Depends on:** MS-05 (worker, audio), MS-06 (AI providers, TTS),
MS-07 (joke database)

### Scope

| Included | NOT included |
|---|---|
| Blueprint entity (name, description, price, config) | Blueprint marketplace UI |
| Blueprint purchase (energy, one-time, permanent) | User-created blueprints |
| Subscription discount on blueprint purchase | |
| First blueprint: "Vertical Jokes — Dynamic Background" | Other blueprint types |
| Pipeline steps: joke selection, TTS, background, overlay | |
| Speaker system: platform speakers + user-uploaded | |
| Speaker positioning (randomized within bounds) | |
| Text reveal animation (white background, top-down) | |
| Logo + subscriber count overlay | |
| Laugh track (configurable: on/off) | |
| Multi-language generation (batch, one click) | |
| Long joke splitting (multiple reveals) | |
| Video composition (FFmpeg) | |
| Result upload to MinIO | |
| Social account integration (logo, subscribers from API) | |
| Dev seed: test blueprints, speakers | |

### Completion Criteria

- [ ] Blueprint entity in DB, purchasable with energy
- [ ] Subscription discount applied to blueprint price
- [ ] User configures blueprint: joke, background, speaker, languages
- [ ] Worker executes full pipeline: TTS → background → overlay → compose
- [ ] Speaker: platform default + user-uploaded, random selection/position
- [ ] Text reveal: animated white background, supports long jokes
- [ ] Logo + subscriber count from social account (YouTube API)
- [ ] Laugh track toggleable
- [ ] Multi-language: one config → multiple videos generated
- [ ] Progress visible in UI (SSE per pipeline step)
- [ ] Result downloadable from MinIO
- [ ] Energy deducted per generated video (tool pricing × duration)

### Testing Checklist

- [ ] Purchase blueprint: energy deducted, permanent access
- [ ] Purchase blueprint: subscription discount applied correctly
- [ ] Purchase blueprint: already owned → error
- [ ] Generate: all pipeline steps execute in order
- [ ] Generate: TTS failure → partial refund, error reported
- [ ] Generate: multi-language → N videos, N × energy cost
- [ ] Speaker: random selection from available pool
- [ ] Speaker: position within configured bounds
- [ ] Long joke: auto-split into multiple reveals
- [ ] YouTube API: fetches logo + subscriber count
- [ ] YouTube API: failure → fallback to manual input

### Critical Warnings

1. **Pipeline is multi-step** — partial failure must refund proportionally
2. **Video rendering is CPU-intensive** — limit concurrent renders
3. **YouTube API has rate limits** — cache social account data, refresh daily
4. **Speaker files stored in MinIO** — presigned URLs for upload
5. **Multi-language multiplies cost** — user must confirm total before starting

**Detailed breakdown:** [milestone-08-blueprints.md](./milestone-08-blueprints.md)

---

## MS-09: Payments Integration

**Goal:** Connect payment providers (Stripe, possibly YooKassa)
for energy purchases and subscription payments. Replace admin
manual grants with real payment flow.

**Depends on:** MS-02 (energy, subscriptions), all previous milestones stable

### Scope

| Included | NOT included |
|---|---|
| Stripe integration (primary) | Auto-renewal (future) |
| Energy purchase flow (fixed packs + custom amount) | YooKassa (deferred) |
| Subscription purchase flow | |
| Organization energy purchase flow | |
| Webhook handling (payment confirmation) | |
| Payment history (user-facing) | |
| Refund handling (admin-initiated) | |
| Currency display (USD primary, conversion for display) | |
| Purchase validation (min/max amounts) | |
| Receipt generation | |
| Admin: payment history viewer | |

### Completion Criteria

- [ ] User can purchase energy via Stripe checkout
- [ ] Fixed packs displayed with prices and energy amounts
- [ ] Custom amount with live energy calculation (with discount)
- [ ] Subscription purchase via Stripe checkout
- [ ] Organization purchase via Stripe (requires org:fund permission)
- [ ] Webhook confirms payment → energy/subscription credited
- [ ] Failed payment → no credit, user notified
- [ ] Payment history visible to user (Hub settings)
- [ ] Admin can view all payments, initiate refunds
- [ ] Refund → energy deducted, audit logged
- [ ] All payment operations idempotent (webhook retry safe)

### Testing Checklist

- [ ] Stripe test mode: full purchase flow
- [ ] Webhook: successful payment → energy credited exactly once
- [ ] Webhook: duplicate delivery → idempotent, no double credit
- [ ] Webhook: failed payment → no credit
- [ ] Subscription: correct tier activated after payment
- [ ] Org purchase: discount calculated correctly
- [ ] Refund: energy deducted, balance cannot go negative (error if spent)
- [ ] Edge case: payment during price change → uses price at checkout time

### Critical Warnings

1. **Webhook idempotency** — store payment_intent_id, skip duplicates
2. **Price at checkout time** — lock price when checkout session created
3. **Refund with spent energy** — if balance < refund amount, partial refund or deny
4. **Stripe webhook signature verification** — mandatory, prevents spoofing
5. **No auto-renewal in MVP** — manual repurchase only

**Detailed breakdown:** [milestone-09-payments.md](./milestone-09-payments.md)

---

## Dependency Graph

```
MS-01: Auth & Permissions
  │
  ├──→ MS-02: Energy & Subscriptions
  │      │
  │      ├──→ MS-03: Organizations
  │      │
  │      ├──→ MS-04: Admin Panel
  │      │
  │      └──→ MS-05: Audio Processing & Worker
  │             │
  │             └──→ MS-06: AI Providers
  │                    │
  │                    └──→ MS-07: Content DB & Feedback
  │                           │
  │                           └──→ MS-08: Blueprints
  │
  └──→ MS-09: Payments (after all milestones stable)
```

---

## Cross-Cutting Concerns

These are NOT separate milestones. They are built incrementally
with each milestone:

| Concern | How it grows |
|---|---|
| **@packages/ui** | Components added as needed per milestone. Button in MS-01, energy display in MS-02, tables in MS-04, file upload in MS-05, video player in MS-08 |
| **@packages/contract** | Permission types in MS-01, energy/subscription types in MS-02, org types in MS-03, pricing types in MS-02, content types in MS-07 |
| **Audit log** | Schema in MS-01, energy actions in MS-02, org actions in MS-03, admin actions in MS-04, payment actions in MS-09 |
| **Dev seed** | Users in MS-01, balances/subs in MS-02, orgs in MS-03, jokes in MS-07, blueprints in MS-08 |
| **E2E tests (Playwright)** | Auth flow in MS-01, energy flow in MS-02, admin flow in MS-04. Added per milestone |
| **Error handling** | Auth errors in MS-01, payment errors in MS-02, permission errors in MS-03. Consistent pattern established in MS-01 |


D:/1_Projects/jstonehub/docs/roadmap/vision.md

# Product Vision

## What is JStoneHub

JStoneHub is a content production platform where users leverage AI tools
to create, process, and manage social media content at scale. The platform
serves both individual creators and organized teams through a unified
energy-based economy.

---

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                    │
│                                                                    │
│  ┌─────────────┐  ┌──────────────┐                                │
│  │  Hub (3000)  │  │ Admin (3001) │  SolidJS + TanStack            │
│  │  User-facing │  │ Staff-facing │  Router / Query / Table / Form │
│  └──────┬───────┘  └──────┬───────┘                                │
│         │                 │                                        │
│         │  HTTP + httpOnly cookies                                 │
│         ▼                 ▼                                        │
│  ┌─────────────────────────────────────┐                          │
│  │           API (4000)                │  Elysia + Bun             │
│  │                                     │                          │
│  │  Auth, Permissions, Users,          │                          │
│  │  Energy, Subscriptions, Orgs,       │                          │
│  │  Projects, Social Accounts,         │                          │
│  │  Content DBs, Blueprints,           │                          │
│  │  AI Provider orchestration,         │                          │
│  │  Feedback, Audit, Pricing           │                          │
│  └──────┬──────────────┬──────────────┘                          │
│         │              │                                          │
│         │  BullMQ      │  SQL / Redis / S3                        │
│         ▼              ▼                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │   Worker   │ │ PostgreSQL │ │   Redis    │ │   MinIO    │    │
│  │   (4001)   │ │            │ │            │ │   (S3)     │    │
│  │            │ │ Source of  │ │ Queues,    │ │ Files,     │    │
│  │ Audio,     │ │ truth for  │ │ cache,     │ │ audio,     │    │
│  │ Video,     │ │ all data   │ │ rate       │ │ video,     │    │
│  │ AI tasks,  │ │            │ │ limiting   │ │ images     │    │
│  │ Browser    │ │            │ │            │ │            │    │
│  │ automation │ │            │ │            │ │            │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Core Domain Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│                                                                   │
│  Identity: email, name, avatar (from OAuth)                       │
│  Auth: OAuth accounts (Google, future: others)                    │
│  Sessions: multiple devices, managed                              │
│  Permissions: admin:*, org:*, project:*, account:*                │
│  Economy: energy balance, subscription, purchase history          │
│  Timezone: for daily energy claim                                 │
│                                                                   │
│  ┌─────────────────────────────┐                                 │
│  │       SUBSCRIPTION          │                                 │
│  │  common (free) / rare /     │                                 │
│  │  epic / legendary           │                                 │
│  │                             │                                 │
│  │  Provides:                  │                                 │
│  │  - Discount on energy       │                                 │
│  │  - Daily energy (on login)  │                                 │
│  │  - Energy pack (on purchase)│                                 │
│  │  - Blueprint discounts      │                                 │
│  │  - Premium features         │                                 │
│  │                             │                                 │
│  │  Stacking: multiple active  │                                 │
│  │  subscriptions stack        │                                 │
│  │  bonuses, discount = max    │                                 │
│  └─────────────────────────────┘                                 │
│                                                                   │
│  Can: buy energy (personal), transfer to org (irreversible),      │
│       buy directly for org (with org:fund permission),            │
│       use tools, buy blueprints, create one organization          │
└────────────────────┬────────────────────────────────────────────┘
                     │ creates / owns (max one)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORGANIZATION                                │
│                                                                   │
│  No subscription. Energy balance only.                            │
│  Funded by: member transfers + direct purchases.                  │
│  Volume discount: based on total purchased amount.                │
│                                                                   │
│  Members: users with org-scoped permissions                       │
│  Owner: creator (owner_id FK, immutable, cannot leave)            │
│                                                                   │
│  ┌──────────────┐                                                │
│  │   PROJECT     │  Budget allocated from org balance             │
│  │              │  (hard limit — reserved, not advisory)          │
│  │  ┌──────────────────┐                                         │
│  │  │ SOCIAL ACCOUNT   │  Budget from project (optional)         │
│  │  │                  │  Platform: YouTube, Instagram, etc.     │
│  │  │  ┌──────────────────┐                                      │
│  │  │  │ CONTENT TYPE     │  e.g. "Vertical video + dynamic bg"  │
│  │  │  │                  │  Energy limit, publish schedule       │
│  │  │  └──────────────────┘                                      │
│  │  └──────────────────┘                                         │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Energy Economy

### Pricing Flow

```
┌──────────────────────────────────────────────────────────┐
│                   ADMIN: PRICING CONFIG                    │
│                                                            │
│  1. Base rate: $1 = 1,000,000 energy (fixed)               │
│                                                            │
│  2. Per tool: real cost (USD) + global markup (%)           │
│     + individual adjustment (+/- %)                        │
│     + optional coefficients (bitrate, resolution, etc.)    │
│     → final energy cost per unit (ceil to integer)         │
│                                                            │
│  3. Subscriptions: price, discount %, daily %, pack %      │
│     Validation: higher tier must have higher discount      │
│                                                            │
│  4. Org volume tiers: total purchased → bonus discount %   │
│     Validation: sum of owner subscription + org tier       │
│     must not exceed MAX_DISCOUNT_PERCENT                   │
│                                                            │
│  5. Blueprint prices: energy amount (one-time purchase)    │
│                                                            │
│  Every change increments price_version per tool.           │
│  Client sends price_version with requests.                 │
│  Mismatch → 409 Conflict with new pricing.                 │
└──────────────────────────────────────────────────────────┘
```

### Purchase Paths

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  PATH 1: Buy for yourself                                     │
│    discount = your subscription discount                      │
│    energy = usd × ENERGY_PER_DOLLAR / (1 - discount/100)     │
│    → goes to personal balance                                 │
│                                                               │
│  PATH 2: Transfer personal → organization                     │
│    amount chosen by user                                      │
│    irreversible                                               │
│    logged in audit                                            │
│                                                               │
│  PATH 3: Buy directly for organization                        │
│    requires permission org:{id}:fund                          │
│    discount = owner_sub_discount + org_volume_discount        │
│    capped at MAX_DISCOUNT_PERCENT                             │
│    energy = usd × ENERGY_PER_DOLLAR / (1 - discount/100)     │
│    → goes directly to org balance                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Permission System

No roles. Only permissions. One table, one mechanism.

```
┌──────────────────────────────────────────────────────────────┐
│                    PERMISSION FORMAT                           │
│                                                                │
│  scope:entity:action                                           │
│                                                                │
│  ADMIN SCOPE (platform-wide):                                  │
│    admin:all                  — platform owner (bypasses all)  │
│    admin:access               — can enter admin panel          │
│    admin:user:read            — view user list                 │
│    admin:user:ban             — ban/unban users                │
│    admin:user:grant_energy    — credit energy to users         │
│    admin:joke:all             — all joke actions               │
│    admin:joke:read            — view jokes                     │
│    admin:pricing:manage       — manage pricing config          │
│    ...                                                         │
│                                                                │
│  ORG SCOPE (per organization):                                 │
│    org:{org_id}:all           — org owner (auto-assigned)      │
│    org:{org_id}:fund          — fund org balance               │
│    org:{org_id}:manage        — edit org settings              │
│    org:{org_id}:view_logs     — view energy logs               │
│    org:{org_id}:project:create                                 │
│    org:{org_id}:project:delete                                 │
│                                                                │
│  RESOURCE SCOPE (per project / account):                       │
│    project:{project_id}:manage                                 │
│    project:{project_id}:view                                   │
│    account:{account_id}:manage                                 │
│    account:{account_id}:view                                   │
│                                                                │
│  RESOLUTION ORDER:                                             │
│    Check specific → check :all for entity → check scope :all   │
│    Example: checking admin:joke:read                           │
│      1. Has "admin:joke:read"? → yes → allow                  │
│      2. Has "admin:joke:all"?  → yes → allow                  │
│      3. Has "admin:all"?       → yes → allow                  │
│      4. None found → deny                                      │
│                                                                │
│  ON RESOURCE DELETE:                                           │
│    DELETE FROM permission                                      │
│    WHERE permission LIKE 'project:{id}:%'                      │
│    (cleanup in service layer, single indexed query)            │
│                                                                │
│  ON USER BAN:                                                  │
│    DELETE FROM permission WHERE user_id = :id                  │
│    AND permission LIKE 'admin:%'                               │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## User Journeys

### Journey 1: Individual Creator

```
Sign up (Google OAuth)
  → Land on Hub dashboard (common tier, 0 energy)
  → Buy energy ($10 → 10M energy) or subscription
  → Use audio processing tools
  → Use TTS generation
  → Use image generation
  → Results stored in MinIO, downloadable
```

### Journey 2: Team Content Production

```
Creator sets up organization
  → Creates projects ("English Jokes", "Spanish Stories")
  → Adds social accounts per project (YouTube, Instagram)
  → Defines content types per account
  → Invites team members with specific permissions
  → Allocates energy budgets (org → project → account)
  → Team members produce content using blueprints
  → Track energy spend per tool / account / project
```

### Journey 3: Blueprint Usage (Vertical Jokes)

```
User buys "Vertical Jokes — Dynamic Background" blueprint
  → Selects joke from joke database (or random)
  → Selects background category (funny fail, cute animals, etc.)
  → Configures: speaker, logo, subscriber count, languages
  → Clicks "Generate"
  → Worker pipeline:
     1. Fetch joke text + translations
     2. Generate TTS audio (multi-voice)
     3. Fetch dynamic background video
     4. Render text overlay animation
     5. Render speaker overlay (position, size randomized)
     6. Add laugh track (optional)
     7. Compose final video
     8. Upload to MinIO
  → User downloads or queues for publishing
```

### Journey 4: Admin Operations

```
Admin with admin:access + specific permissions
  → View/search/filter users
  → Ban/unban users (with reason, audit logged)
  → Credit energy to users (with reason, audit logged)
  → Grant/revoke subscriptions
  → Manage permissions for other staff
  → Configure pricing (tools, subscriptions, discounts)
  → Moderate content (jokes, feedback)
  → View audit logs
```

---

## Revenue Model

```
┌──────────────────────────────────────────────────────────┐
│                    REVENUE STREAMS                         │
│                                                            │
│  1. SUBSCRIPTIONS (recurring)                              │
│     Monthly (30 days) or yearly (365 days, 1-2 mo free)   │
│     Tiers: rare, epic, legendary                           │
│     Margin: SUBSCRIPTION_MARGIN_PERCENT on energy value    │
│                                                            │
│  2. ENERGY SALES (transactional)                           │
│     Personal purchases: markup on base rate                │
│     Organization purchases: volume-discounted but still    │
│     above cost due to GLOBAL_MARKUP_PERCENT on tools       │
│                                                            │
│  3. BLUEPRINTS (one-time)                                  │
│     Energy-priced modules for content generation           │
│     User pays once, permanent access                       │
│                                                            │
│  4. TOOL USAGE (per-use)                                   │
│     Every tool action costs energy                         │
│     Markup over real infrastructure cost                   │
│     Coefficients for heavy operations                      │
│                                                            │
│  5. FUTURE:                                                │
│     - Telegram subscription channel                        │
│     - Merchandise store                                    │
│     - Blog monetization                                    │
│                                                            │
│  COST STRUCTURE:                                           │
│     - Server compute (audio/video processing)              │
│     - AI API costs (TTS, image gen, LLM)                   │
│     - Storage (MinIO / S3)                                 │
│     - Infrastructure (DB, Redis, networking)               │
│     All tracked per-tool, configurable in admin panel      │
└──────────────────────────────────────────────────────────┘
```

---

## Technical Principles

| Principle | Implementation |
|---|---|
| Source of truth | PostgreSQL for all data, Redis for queues/cache only |
| Auth | OAuth only (Google first), JWT access + refresh in httpOnly cookies |
| Authorization | Pure permissions, no roles. One table, hierarchical resolution |
| Energy | bigint, integer arithmetic only, ceil() on calculations |
| Processing | API orchestrates, Worker executes. BullMQ queues |
| File storage | MinIO (S3-compatible). Presigned URLs for upload/download |
| Caching | 4 levels: in-memory → Redis → S3 → PostgreSQL |
| Lists | Standardized via contract factories. mode: all / cursor |
| Frontend | SolidJS, TanStack Router/Query. URL search params as source of truth |
| Testing | Unit + integration (Vitest), E2E (Playwright) |
| Dev experience | Dev seed cards, `__test__` prefix, excluded from prod bundle |
| Performance | O(1) preferred, O(log n) acceptable, O(n) justified only |


D:/1_Projects/jstonehub/packages/contract/package.json

```
{
  "name": "@packages/contract",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "typecheck": "tsc --noEmit",

    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "exports": {
    "./feature/user": "./src/feature/user.ts",
    "./pagination/client": "./src/pagination/client.ts",
    "./pagination/server": "./src/pagination/server.ts",
    "./permission/admin": "./src/permission/admin.ts",
    "./permission/org": "./src/permission/org.ts",
    "./permission/resource": "./src/permission/resource.ts",
    "./permission/scope": "./src/permission/scope.ts",
    "./permission/check": "./src/permission/check.ts",
    "./permission/extract": "./src/permission/extract.ts",
    "./permission/format": "./src/permission/format.ts",
    "./auth-error": "./src/auth-error.ts",
    "./device": "./src/device.ts",
    "./http-status": "./src/http-status.ts"
  },
  "dependencies": {
    "@packages/util": "workspace:*",
    "typebox": "catalog:backend",
    "valibot": "catalog:frontend"
  },
  "devDependencies": {
    "@configs/typescript": "workspace:*",
    "@configs/vitest": "workspace:*",
    "vitest": "catalog:test",
    "vite": "catalog:frontend-dev",
    "@vitest/coverage-v8": "catalog:test"
  }
}

```

D:/1_Projects/jstonehub/packages/contract/tsconfig.json

```
{
  "extends": "@configs/typescript/universal",
  "include": ["src"]
}

```

D:/1_Projects/jstonehub/packages/contract/vitest.config.ts

```
import { createBackendConfig } from "@configs/vitest";

export default createBackendConfig({
  test: {
    coverage: {
      exclude: [
        "src/auth-error.ts",
        "src/http-status.ts",
        "src/pagination/client.ts",
        "src/pagination/server.ts",
      ],
    },
  },
});

```

D:/1_Projects/jstonehub/docs/reference/packages/devtool.md

# @packages/devtool

```ts
import { Devtools } from "@packages/devtool";
```

---

## Devtools

```ts
function Devtools(): JSX.Element | null
// Returns null in production (import.meta.env.PROD)
// Hidden on screens < lg (CSS: hidden lg:block)
```

Wraps two lazy-loaded devtool panels:

```ts
RouterDevtool  // — @tanstack/solid-router-devtools
QueryDevtool   // — @tanstack/solid-query-devtools
```

**Why lazy:** Vite's Rolldown bundler includes devtools in the production bundle
unlike the old esbuild-based bundler. `lazy()` from `solid-js` ensures
devtools are code-split into a separate chunk that is only loaded in development.

**Usage:** placed once in root layout of each frontend app:

```tsx
<Devtools />
```

D:/1_Projects/jstonehub/docs/reference/packages/util.md

# @packages/util

```ts
import { assertNever, devFrontendAssert } from "@packages/util/assert";
import { cn } from "@packages/util/css";
import { getElementByIdOrThrow, focusFirstElement } from "@packages/util/dom";
import { is } from "@packages/util/guard";
import { createId } from "@packages/util/id";
import { safeJsonParse, safeJsonStringify } from "@packages/util/json";
```

---

## assert

```ts
assertNever(
  value: never,       // — exhaustive check; throws if reached
  message?: string,   // — optional custom error message
): never

devFrontendAssert(
  condition: boolean,  // — throws when true
  message: string,
): void
// No-op in production (import.meta.env.DEV === false)
// Zero cost in bundle — dead code eliminated
```

---

## css

```ts
cn(...inputs: ClassArguments[]): string
// Merges class names via tailwind-merge
// Accepts: string, null, undefined, boolean, array, { className: condition }
// Do NOT memoize (createMemo) — <1ms execution, memo overhead is worse
```

---

## dom

```ts
getElementByIdOrThrow(
  id: string,  // — throws if element not found
): HTMLElement

focusFirstElement(
  container: HTMLElement | null | undefined,
): boolean  // — true if focused, false if no focusable element
// Targets: a[href], button, input, select, textarea, [tabindex]
// Skips: disabled elements, tabindex="-1"
```

---

## guard

```ts
is.string(value)     // => value is string
is.number(value)     // => value is number (excludes NaN)
is.boolean(value)    // => value is boolean
is.null(value)       // => value is null
is.undefined(value)  // => value is undefined
is.nullish(value)    // => value is null | undefined
is.object(value)     // => value is Record<string, unknown> (excludes arrays, null)
is.array(value)      // => value is unknown[]
is.function(value)   // => value is (...args) => unknown
is.error(value)      // => value is Error
is.truthy(value)     // => value is NonNullable<unknown>
is.falsy(value)      // => boolean (not a type guard)

// Negated — all preserve type narrowing via Exclude<T, ...>
is.not.string(value)    // => Exclude<T, string>
is.not.nullish(value)   // => NonNullable<T>
// ... same for all guards above
```

---

## id

```ts
createId(): string      // 24 chars, URL-friendly [a-z0-9]
```

---

## json

```ts
safeJsonParse(
  value: string,
): Record<string, unknown> | unknown[] | null
// Returns parsed object or array
// Returns null for: primitives (string, number, boolean, null), invalid JSON
// Uses is.object / is.array to validate parsed result

safeJsonStringify(
  value: unknown,
): string | null
// Returns JSON string
// Returns null on: circular references, BigInt, other stringify errors
```

D:/1_Projects/jstonehub/packages/contract/src/auth-error.ts

```
type AuthError = (typeof AUTH_ERROR)[number];

const AUTH_ERROR = [
  "UNAUTHORIZED",
  "SESSION_EXPIRED",
  "BANNED",
  "INSUFFICIENT_PERMISSION",
  "UNKNOWN",
] as const;

export type { AuthError };
export { AUTH_ERROR };

```

D:/1_Projects/jstonehub/packages/contract/src/device.ts

```
type DeviceType = (typeof DEVICE_TYPE)[number];

const DEVICE_TYPE = ["desktop", "mobile", "tablet"] as const;

export type { DeviceType };
export { DEVICE_TYPE };

```

D:/1_Projects/jstonehub/packages/contract/src/http-status.ts

```
type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type { HttpStatus };
export { HTTP_STATUS };

```

D:/1_Projects/jstonehub/prompts/elysia/1_getting_started/4_key_concept.md

# Key Concept `MUST READ`

## Encapsulation `MUST READ`

Elysia lifecycle methods are **encapsulated** to its own instance only.

Which means if you create a new instance, it will not share the lifecycle methods with others.

```ts
import { Elysia } from 'elysia'

const profile = new Elysia()
	.onBeforeHandle(({ cookie }) => {
		throwIfNotSignIn(cookie)
	})
	.get('/profile', () => 'Hi there!')

const app = new Elysia()
	.use(profile)
	// ⚠️ This will NOT have sign in check
	.patch('/rename', ({ body }) => updateProfile(body))
```

> In this example, the `isSignIn` check will only apply to `profile` but not `app`.


**Elysia isolates lifecycle by default** unless explicitly stated. This is similar to **export** in JavaScript, where you need to export the function to make it available outside the module.

To "**export**" the lifecycle to other instances, you must add specify the scope.

```ts
import { Elysia } from 'elysia'

const profile = new Elysia()
	.onBeforeHandle(
		{ as: 'global' }, 
		({ cookie }) => {
			throwIfNotSignIn(cookie)
		}
	)
	.get('/profile', () => 'Hi there!')

const app = new Elysia()
	.use(profile)
	// This has sign in check
	.patch('/rename', ({ body }) => updateProfile(body))
```

Casting lifecycle to "**global**" will export lifecycle to **every instance**.

## Method Chaining `Important`

Elysia code should **ALWAYS** use method chaining.

This is **important to ensure type safety**.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .state('build', 1)
    // Store is strictly typed
    .get('/', ({ store: { build } }) => build)
    .listen(3000)
```

In the code above, **state** returns a new **ElysiaInstance** type, adding a typed `build` property.

### Without method chaining

As Elysia type system is complex, every method in Elysia returns a new type reference.

Without using method chaining, Elysia doesn't save these new types, leading to no type inference.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()

app.state('build', 1)

app.get('/', ({ store: { build } }) => build)
Property 'build' does not exist on type '{}'.

app.listen(3000)
```

We recommend to <u>**always use method chaining**</u> to provide an accurate type inference.

## Dependency `MUST READ`

Elysia, by design, is composed of multiple mini Elysia apps which can run **independently** like microservices that communicate with each other.

Each Elysia instance is independent and **can run as a standalone server**.

When an instance needs to use another instance's service, you **must explicitly declare the dependency**.

```ts
import { Elysia } from 'elysia'

const auth = new Elysia()
	.decorate('Auth', Auth)
	.model(Auth.models)

const main = new Elysia()
 	// ❌ 'auth' is missing
	.get('/', ({ Auth }) => Auth.getProfile())
Property 'Auth' does not exist on type '{ body: unknown; query: Record<string, string>; params: {}; headers: Record<string, string | undefined>; cookie: Record<string, Cookie<unknown>>; server: Server<unknown> | null; ... 6 more ...; status: <const Code extends number | keyof StatusMap, const T = Code extends 100 | ... 59 more ... | 511 ? { ...; }[Code] :...'.
	// auth is required to use Auth's service
	.use(auth) 
	.get('/profile', ({ Auth }) => Auth.getProfile())
```

This is similar to **Dependency Injection** where each instance must declare its dependencies.

This approach forces you to be explicit about dependencies, allowing better tracking and modularity.

### Deduplication `Important`

By default, each plugin will be re-executed **every time** applying to another instance.

To prevent this, Elysia can deduplicate lifecycle with **a unique identifier** using `name` and optional `seed` property.

```ts
import { Elysia } from 'elysia'

// `name` is a unique identifier
const ip = new Elysia({ name: 'ip' }) 
	.derive(
		{ as: 'global' },
		({ server, request }) => ({
			ip: server?.requestIP(request)
		})
	)
	.get('/ip', ({ ip }) => ip)

const router1 = new Elysia()
	.use(ip)
	.get('/ip-1', ({ ip }) => ip)

const router2 = new Elysia()
	.use(ip)
	.get('/ip-2', ({ ip }) => ip)

const server = new Elysia()
	.use(router1)
	.use(router2)
```

Adding the `name` and optional `seed` to the instance will make it a unique identifier, preventing it from being called multiple times.

### Global vs Explicit Dependency

There are some cases where global dependency makes more sense than an explicit one.

**Global** plugin example:

- **Plugins that don't add types** - eg. cors, compress, helmet
- Plugins that add global lifecycle that no instance should have control over - eg. tracing, logging

Example use cases:

- OpenAPI/Open - Global document
- OpenTelemetry - Global tracer
- Logging - Global logger

In cases like this, it makes more sense to create it as global dependency instead of applying it to every instance.

However, if your dependency doesn't fit into these categories, it's recommended to use **explicit dependency** instead.

**Explicit dependency** example:

- **Plugins that add types** - eg. macro, state, model
- Plugins that add business logic that an instance can interact with - eg. Auth, Database

Example use cases:

- State management - eg. Store, Session
- Data modeling - eg. ORM, ODM
- Feature module - eg. Chat, Notification
- Business logic - eg. Auth, Database

## Order of code `Important`

The order of Elysia's life-cycle code is very important.

Because events will only apply to routes **after** they are registered.

If you put the onError before plugin, plugin will not inherit the onError event.

```ts
import { Elysia } from 'elysia'

new Elysia()
 	.onBeforeHandle(() => {
        console.log('1')
    })
	.get('/', () => 'hi')
    .onBeforeHandle(() => {
        console.log('2')
    })
    .listen(3000)
```

Console should log the following:

`1`

Notice that it doesn't log **2**, because the event is registered after the route so it is not applied to the route.

## Type Inference

Elysia has a complex type system that allows you to infer types from the instance.

```ts
import { Elysia, t } from 'elysia'

const app = new Elysia()
	.post('/', ({ body }) => body, {




		body: t.Object({
			name: t.String()
		})
	})
```

You should **always use an inline function** to provide an accurate type inference.

If you need to apply a separate function, eg. MVC's controller pattern, it's recommended to destructure properties from inline function to prevent unnecessary type inference as follows:

```ts
import { Elysia, t } from 'elysia'

abstract class Controller {
	static greet({ name }: { name: string }) {
		return 'hello ' + name
	}
}

const app = new Elysia()
	.post('/', ({ body }) => Controller.greet(body), {
		body: t.Object({
			name: t.String()
		})
	})
```

### TypeScript

We can get type definitions for every Elysia/TypeBox type by accessing the `static` property as follows:

```ts
import { t } from 'elysia'

const MyType = t.Object({
	hello: t.Literal('Elysia')
})

type MyType = typeof MyType.static
```

This allows Elysia to infer and provide types automatically, reducing the need to declare duplicate schemas.

A single Elysia/TypeBox schema can be used for:

- Runtime validation
- Data coercion
- TypeScript type
- OpenAPI schema

This allows us to make a schema as a **single source of truth**.

D:/1_Projects/jstonehub/prompts/elysia/2_essential/1_routing.md

# Routing 

## Path type

Paths in Elysia can be grouped into 3 types:

- **static paths** - static strings to locate the resource
- **dynamic paths** - segments can be any value
- **wildcards** - path until a specific point can be anything

You can use all of the path types together to compose a behavior for your web server.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/id/1', 'static path')
    .get('/id/:id', 'dynamic path')
    .get('/id/*', 'wildcard path')
    .listen(3000)
```

## Static Path

Static path is a hardcoded string to locate the resource on the server.

```ts
import { Elysia } from 'elysia'

new Elysia()
	.get('/hello', 'hello')
	.get('/hi', 'hi')
	.listen(3000)
```

## Dynamic path

Dynamic paths match some part and capture the value to extract extra information.

To define a dynamic path, we can use a colon `:` followed by a name.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/id/:id', ({ params: { id } }) => id)
    .listen(3000)
```

Here, a dynamic path is created with `/id/:id`, which tells Elysia to capture the value `:id` segment with values like **/id/1**, **/id/123**, **/id/anything**.

When requested, the server should return the response as follows:

| Path                   | Response  |
|------------------------|-----------|
| /id/1                  | 1         |
| /id/123                | 123       |
| /id/anything           | anything  |
| /id/anything?name=salt | anything  |
| /id                    | Not Found |
| /id/anything/rest      | Not Found |

Dynamic paths are great to include things like IDs that can be used later.

We refer to the named variable path as **path parameter** or **params** for short.

### Multiple path parameters

You can have as many path parameters as you like, which will then be stored into a `params` object.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/id/:id', ({ params: { id } }) => id)
    .get('/id/:id/:name', ({ params: { id, name } }) => id + ' ' + name)
    .listen(3000)
```

The server will respond as follows:

| Path                   | Response      |
|------------------------|---------------|
| /id/1                  | 1             |
| /id/123                | 123           |
| /id/anything           | anything      |
| /id/anything?name=salt | anything      |
| /id                    | Not Found     |
| /id/anything/rest      | anything rest |

## Optional path parameters

Sometimes we might want a static and dynamic path to resolve the same handler.

We can make a path parameter optional by adding a question mark `?` after the parameter name.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/id/:id?', ({ params: { id } }) => `id ${id}`)
    .listen(3000)
```

## Wildcards

Dynamic paths allow capturing a single segment while wildcards allow capturing the rest of the path.

To define a wildcard, we can use an asterisk `*`.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/id/*', ({ params }) => params['*'])
    .listen(3000)
```

## Path priority

Elysia has path priorities as follows:

1. static paths
2. dynamic paths
3. wildcards

If both a static and a dynamic path are present, Elysia will resolve the static path rather than the dynamic path.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/id/1', 'static path')
    .get('/id/:id', 'dynamic path')
    .get('/id/*', 'wildcard path')
    .listen(3000)
```

## HTTP Verb

HTTP defines a set of request methods to indicate the desired action to be performed for a given resource

There are several HTTP verbs, but the most common ones are:

### GET

Requests using GET should only retrieve data.

### POST

Submits a payload to the specified resource, often causing state changes or side effects.

### PUT

Replaces all current representations of the target resource using the request's payload.

### PATCH

Applies partial modifications to a resource.

### DELETE

Deletes the specified resource.

---

To handle each of the different verbs, Elysia has a built-in API for several HTTP verbs by default, similar to `Elysia.get`

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', 'hello')
    .post('/hi', 'hi')
    .listen(3000)
```

The Elysia HTTP method accepts the following parameters:

- **path**: Pathname
- **function**: Function to respond to the client
- **hook**: Additional metadata

## Custom Method

We can accept custom HTTP Methods with Elysia.route.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/get', 'hello')
    .post('/post', 'hi')
    .route('M-SEARCH', '/m-search', 'connect') 
    .listen(3000)
```

**Elysia.route** accepts the following:

- **method**: HTTP Verb
- **path**: Pathname
- **function**: Function to respond to the client
- **hook**: Additional metadata

> **TIP**: 
> Based on <u>**RFC 7231**</u>, HTTP Verb is case-sensitive.
> It's recommended to use the UPPERCASE convention for defining a custom HTTP Verb with Elysia.

### ALL method

Elysia provides an `Elysia.all` for handling any HTTP method for a specified path using the same API like **Elysia.get** and **Elysia.post**

```ts
import { Elysia } from 'elysia'

new Elysia()
    .all('/', 'hi')
    .listen(3000)
```

Any HTTP method that matches the path, will be handled as follows:

| Path | Method | Result |
|------|--------|--------|
| /    | GET    | hi     |
| /    | POST   | hi     |
| /    | DELETE | hi     |

## Handle

Most developers use REST clients like Postman, Insomnia or Hoppscotch to test their API.

However, Elysia can be programmatically tested using `Elysia.handle`.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/', 'hello')
    .post('/hi', 'hi')
    .listen(3000)

app.handle(new Request('http://localhost/')).then(console.log)
```

**Elysia.handle** is a function to process an actual request sent to the server.

> **TIP**:
> Unlike unit test's mock, **you can expect it to behave like an actual request** sent to the server.
> But also useful for simulating or creating unit tests.

## Group

When creating a web server, you will often have multiple routes sharing the same prefix:

```ts
import { Elysia } from 'elysia'

new Elysia()
    .post('/user/sign-in', 'Sign in')
    .post('/user/sign-up', 'Sign up')
    .post('/user/profile', 'Profile')
    .listen(3000)
```

This can be improved with `Elysia.group`, allowing us to apply prefixes to multiple routes at the same time by grouping them together:

```ts
import { Elysia } from 'elysia'

new Elysia()
    .group('/user', (app) =>
        app
            .post('/sign-in', 'Sign in')
            .post('/sign-up', 'Sign up')
            .post('/profile', 'Profile')
    )
    .listen(3000)
```

This code behaves the same as our first example and should be structured as follows:

| Path            | Result  |
|-----------------|---------|
| /user/sign-in   | Sign in |
| /user/sign-up   | Sign up |
| /user/profile   | Profile |

`.group()` can also accept an optional guard parameter to reduce boilerplate of using groups and guards together:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .group(
        '/user',
        {
            body: t.Literal('Rikuhachima Aru')
        },
        (app) => app
            .post('/sign-in', 'Sign in')
            .post('/sign-up', 'Sign up')
            .post('/profile', 'Profile')
    )
    .listen(3000)
```

### Prefix

We can separate a group into a separate plugin instance to reduce nesting by providing **a prefix** to the constructor.

```ts
import { Elysia } from 'elysia'

const users = new Elysia({ prefix: '/user' })
    .post('/sign-in', 'Sign in')
    .post('/sign-up', 'Sign up')
    .post('/profile', 'Profile')

new Elysia()
    .use(users)
    .get('/', 'hello world')
    .listen(3000)
```

D:/1_Projects/jstonehub/prompts/elysia/2_essential/2_handler.md

# Handler

**Handler** - a function that accepts an HTTP request and returns a response.

```ts
import { Elysia } from 'elysia'

new Elysia()
    // the function `() => 'hello world'` is a handler
    .get('/', () => 'hello world')
    .listen(3000)
```

A handler may be a literal value, and can be inlined.

```ts
import { Elysia, file } from 'elysia'

new Elysia()
    .get('/', 'Hello Elysia')
    .get('/video', file('kyuukurarin.mp4'))
    .listen(3000)
```

Using an **inline value** always returns the same value which is useful to optimize performance for static resources like files.

This allows Elysia to compile the response ahead of time to optimize performance.

> **TIP**:
> Providing an inline value is not a cache.
> Static resource values, headers and status can be mutated dynamically using lifecycle.

## Context

**Context** contains request information which is unique for each request, and is not shared except for `store` (global mutable state).

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', (context) => context.path)
              // ^ This is a context
```

**Context** can only be retrieved in a route handler. It consists of:

### Property

- **body** - HTTP message, form or file upload.
- **query** - Query String, includes additional parameters for search query as JavaScript Object. (Query is extracted from a value after pathname starting from `?` question mark sign)
- **params** - Elysia's path parameters parsed as JavaScript object
- **headers** - HTTP Header, additional information about the request like User-Agent, Content-Type, Cache Hint.
- **cookie** - A global mutable signal store for interacting with Cookie (including get/set)
- **store** - A global mutable store for Elysia instance

### Utility Function

- **redirect** - A function to redirect a response
- **status** - A function to return custom status code
- **set** - Property to apply to Response:
    - **headers** - Response headers

### Additional Property

- **request** - Web Standard Request
- **server** - Bun server instance
- **path** - Pathname of the request

## status

A function to return a custom status code with type narrowing.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ status }) => status(418, "Kirifuji Nagisa"))
    .listen(3000)
```

It's recommended to use the **never-throw** approach to return **status** instead of throwing as it:

- allows TypeScript to check if a return value is correctly typed to the response schema
- autocompletion for type narrowing based on status code
- type narrowing for error handling using End-to-end type safety (Eden)

## Set

**set** is a mutable property that forms a response accessible via `Context.set`.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ set, status }) => {
        set.headers = { 'X-Teapot': 'true' }

        return status(418, 'I am a teapot')
    })
    .listen(3000)
```

### set.headers

Allows us to append or delete response headers represented as an Object.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ set }) => {
        set.headers['x-powered-by'] = 'Elysia'

        return 'a mimir'
    })
    .listen(3000)
```

> **TIP**:
> Elysia provides auto-completion for lowercase for case-sensitivity consistency, eg. use `set-cookie` rather than `Set-Cookie`.

## Cookie

Elysia provides a mutable store for interacting with cookies.

There's no need for get/set; you can extract the cookie name and retrieve or update its value directly.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/set', ({ cookie: { name } }) => {
        // Get
        name.value

        // Set
        name.value = "New Value"
    })
```

## Redirect

Redirect a request to another resource.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ redirect }) => {
        return redirect('https://youtu.be/whpVWVWBW4U?&t=8')
    })
    .get('/custom-status', ({ redirect }) => {
        // You can also set custom status to redirect
        return redirect('https://youtu.be/whpVWVWBW4U?&t=8', 302)
    })
    .listen(3000)
```

When using redirect, returned value is not required and will be ignored. As response will be from another resource.

## Formdata

We can return a `FormData` by returning the `form` utility directly from the handler.

```ts
import { Elysia, form, file } from 'elysia'

new Elysia()
    .get('/', () => form({
        name: 'Tea Party',
        images: [file('nagi.web'), file('mika.webp')]
    }))
    .listen(3000)
```

This pattern is useful if you ever need to return a file or multipart form data.

### Return a file

Or alternatively, you can return a single file by returning `file` directly without `form`.

```ts
import { Elysia, file } from 'elysia'

new Elysia()
    .get('/', file('nagi.web'))
    .listen(3000)
```

## Stream

To return a response streaming out of the box, use a generator function with the `yield` keyword.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/ok', function* () {
        yield 1
        yield 2
        yield 3
    })
```

In this example, we stream a response by using the `yield` keyword.

### Server Sent Events (SSE)

Elysia supports <u>**Server Sent Events**</u> by providing a `sse` utility function.

```ts
import { Elysia, sse } from 'elysia'

new Elysia()
    .get('/sse', function* () {
        yield sse('hello world')
        yield sse({
            event: 'message',
            data: {
                message: 'This is a message',
                timestamp: new Date().toISOString()
            },
        })
    })
```

When a value is wrapped in `sse`, Elysia will automatically set the response headers to `text/event-stream` and format the data as an SSE event.

### Headers in Server-Sent Event

Headers can only be set before the first chunk is yielded.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/ok', function* ({ set }) {
        // This will set headers
        set.headers['x-name'] = 'Elysia'
        yield 1
        yield 2

        // This will do nothing
        set.headers['x-id'] = '1'
        yield 3
    })
```

Once the first chunk is yielded, Elysia will send the headers to the client, therefore mutating headers after the first chunk is yielded will do nothing.

### Conditional Stream

If the response is returned without `yield`, Elysia will automatically convert stream to normal response instead.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .get('/ok', function* () {
        if (Math.random() > 0.5) return 'ok'

        yield 1
        yield 2
        yield 3
    })
```

This allows us to conditionally stream a response or return a normal response if necessary.

### Automatic cancellation

Before response streaming is completed, if the user cancels the request, Elysia will automatically stop the generator function.

### Eden

Eden will interpret a stream response as `AsyncGenerator` allowing us to use `for await` loop to consume the stream.

```ts
import { Elysia } from 'elysia'
import { treaty } from '@elysiajs/eden'

const app = new Elysia()
    .get('/ok', function* () {
        yield 1
        yield 2
        yield 3
    })

const { data, error } = await treaty(app).ok.get()
if (error) throw error

for await (const chunk of data)
    console.log(chunk)
```

## Request

Elysia is built on top of <u>**Web Standard Request**</u> which is shared between multiple runtime like Node, Bun, Deno, Cloudflare Worker, Vercel Edge Function, and more.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/user-agent', ({ request }) => {
        return request.headers.get('user-agent')
    })
    .listen(3000)
```

This allows access to low-level request information if necessary.

## Server

> **Bun only**

Server instance is a Bun server instance, allowing us to access server information like port number or request IP.

Server will only be available when HTTP server is running with `listen`.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/port', ({ server }) => {
        return server?.port
    })
    .listen(3000)
```

### Request IP

> **Bun only**

We can get request IP by using `server.requestIP` method

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/ip', ({ server, request }) => {
        return server?.requestIP(request)
    })
    .listen(3000)
```

## Extending context

> **Advanced concept**

Elysia provides a minimal Context by default, allowing you to extend the Context for your specific needs using `state`, `decorate`, `derive`, and `resolve`.

D:/1_Projects/jstonehub/prompts/elysia/2_essential/3_plugin.md

# Plugin

A plugin is a part that is decoupled from the main instance.

Every Elysia instance can run independently or be used as part of another instance.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .decorate('plugin', 'hi')
    .get('/plugin', ({ plugin }) => plugin)

const app = new Elysia()
    .use(plugin)
    .get('/', ({ plugin }) => plugin)
    .listen(3000)
```

We can use the plugin by passing an instance to `Elysia.use`.

The plugin will inherit all properties of the plugin instance like `state`, `decorate` but **WILL NOT** inherit plugin lifecycle as it's isolated by default (mentioned in the next section ↓).

Elysia will also handle the type inference automatically as well.

> **TIP**:
> It's highly recommended that you have read **Key Concept: Dependency** before continuing.

## Dependency

> **MUST READ**

Elysia, by design, is composed of multiple mini Elysia apps which can run independently like microservices that communicate with each other.

Each Elysia instance is independent and can run as a standalone server.

When an instance needs to use another instance's service, you must explicitly declare the dependency.

```ts
import { Elysia } from 'elysia'

const auth = new Elysia()
    .decorate('Auth', Auth)
    .model(Auth.models)

const main = new Elysia()
    // ❌ 'auth' is missing
    .get('/', ({ Auth }) => Auth.getProfile())
    // auth is required to use Auth's service
    .use(auth)
    .get('/profile', ({ Auth }) => Auth.getProfile())
```

This is similar to Dependency Injection where each instance must declare its dependencies.

This approach force you to be explicit about dependencies allowing better tracking, modularity.

## Deduplication

> **Important**

By default, each plugin will be re-executed every time applying to another instance.

To prevent this, Elysia can deduplicate lifecycle with a unique identifier using `name` and optional `seed` property.

```ts
import { Elysia } from 'elysia'

// `name` is an unique identifier
const ip = new Elysia({ name: 'ip' })
    .derive(
        { as: 'global' },
        ({ server, request }) => ({
            ip: server?.requestIP(request)
        })
    )
    .get('/ip', ({ ip }) => ip)

const router1 = new Elysia()
    .use(ip)
    .get('/ip-1', ({ ip }) => ip)

const router2 = new Elysia()
    .use(ip)
    .get('/ip-2', ({ ip }) => ip)

const server = new Elysia()
    .use(router1)
    .use(router2)
```

Adding the `name` and optional `seed` to the instance will make it a unique identifier to prevent it from being called multiple times.

Learn more about this in **plugin deduplication**.

### Global vs Explicit Dependency

There are some cases where global dependency makes more sense than an explicit one.

**Global plugin example:**

- Plugin that doesn't add types - eg. cors, compress, helmet
- Plugin that add global lifecycle that no instance should have control over - eg. tracing, logging

**Example use cases:**

- OpenAPI/Open - Global document
- OpenTelemetry - Global tracer
- Logging - Global logger

In cases like this, it makes more sense to create it as a global dependency instead of applying it to every instance.

However, if your dependency doesn't fit into these categories, it's recommended to use explicit dependency instead.

**Explicit dependency example:**

- Plugin that add types - eg. macro, state, model
- Plugin that add business logic that instance can interact with - eg. Auth, Database

**Example use cases:**

- State management - eg. Store, Session
- Data modeling - eg. ORM, ODM
- Business logic - eg. Auth, Database
- Feature module - eg. Chat, Notification

## Scope

> **MUST READ**

Elysia lifecycle methods are encapsulated within their own instance.

This means if you create a new instance, it will not share the lifecycle methods with other instances.

```ts
import { Elysia } from 'elysia'

const profile = new Elysia()
    .onBeforeHandle(({ cookie }) => {
        throwIfNotSignIn(cookie)
    })
    .get('/profile', () => 'Hi there!')

const app = new Elysia()
    .use(profile)
    // ⚠️ This will NOT have a sign-in check
    .patch('/rename', ({ body }) => updateProfile(body))
```

In this example, the `isSignIn` check will only apply to `profile` but not `app`.

Elysia isolate lifecycle by default unless explicitly stated. This is similar to `export` in JavaScript, where you need to export the function to make it available outside the module.

To "export" the lifecycle to other instances, you must specify the scope.

```ts
import { Elysia } from 'elysia'

const profile = new Elysia()
    .onBeforeHandle(
        { as: 'global' },
        ({ cookie }) => {
            throwIfNotSignIn(cookie)
        }
    )
    .get('/profile', () => 'Hi there!')

const app = new Elysia()
    .use(profile)
    // This has sign in check
    .patch('/rename', ({ body }) => updateProfile(body))
```

Casting lifecycle to `"global"` will export lifecycle to every instance.

### Scope level

Elysia has 3 levels of scope as the following:

- **local** (default) - applies to the current instance and its descendants only
- **scoped** - applies to the parent, current instance, and descendants
- **global** - applies to all instances that use the plugin (all parents, current, and descendants)

Let's review what each scope level does by using the following example:

```ts
import { Elysia } from 'elysia'

const child = new Elysia()
    .get('/child', 'hi')

const current = new Elysia()
    // ? Value based on the table provided below
    .onBeforeHandle({ as: 'local' }, () => {
        console.log('hi')
    })
    .use(child)
    .get('/current', 'hi')

const parent = new Elysia()
    .use(current)
    .get('/parent', 'hi')

const main = new Elysia()
    .use(parent)
    .get('/main', 'hi')
```

By changing the `type` value, the result should be as follows:

| type   | child | current | parent | main |
|--------|-------|---------|--------|------|
| local  | ✅    | ✅      | ❌     | ❌   |
| scoped | ✅    | ✅      | ✅     | ❌   |
| global | ✅    | ✅      | ✅     | ✅   |

### Descendant

By default, a plugin will apply a hook to itself and its descendants only.

If the hook is registered in a plugin, instances that use the plugin will **NOT** inherit hooks and schema.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .onBeforeHandle(() => {
        console.log('hi')
    })
    .get('/child', 'log hi')

const main = new Elysia()
    .use(plugin)
    .get('/parent', 'not log hi')
```

To apply a hook globally, we need to specify the hook as global.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .onBeforeHandle(() => {
        return 'hi'
    })
    .get('/child', 'child')
    .as('scoped')

const main = new Elysia()
    .use(plugin)
    .get('/parent', 'parent')
```

## Config

To make the plugin more useful, allowing customization via config is recommended.

You can create a function that accepts parameters that may change the behavior of the plugin to make it more reusable.

```ts
import { Elysia } from 'elysia'

const version = (version = 1) => new Elysia()
        .get('/version', version)

const app = new Elysia()
    .use(version(1))
    .listen(3000)
```

## Functional callback

It's recommended to define a new plugin instance instead of using a function callback.

Functional callbacks allow access to existing properties of the main instance. For example, checking if specific routes or stores exist, but they make encapsulation and scope harder to handle correctly.

To define a functional callback, create a function that accepts Elysia as a parameter.

```ts
import { Elysia } from 'elysia'

const plugin = (app: Elysia) => app
    .state('counter', 0)
    .get('/plugin', () => 'Hi')

const app = new Elysia()
    .use(plugin)
    .get('/counter', ({ store: { counter } }) => counter)
    .listen(3000)
```

Once passed to `Elysia.use`, functional callback behaves as a normal plugin except the property is assigned directly to the main instance.

> **TIP**:
> You should not worry about the performance difference between a functional callback and creating an instance.
> Elysia can create 10k instances in a matter of milliseconds, the `new Elysia` instance has even better type inference performance than the functional callback.

## Guard

Guard allows you to apply a hook and schema to multiple routes all at once.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .guard(
        {
            body: t.Object({
                username: t.String(),
                password: t.String()
            })
        },
        (app) =>
            app
                .post('/sign-up', ({ body }) => signUp(body))
                .post('/sign-in', ({ body }) => signIn(body), {
                    beforeHandle: isUserExists
                })
    )
    .get('/', 'hi')
    .listen(3000)
```

This code applies validation for `body` to both `/sign-in` and `/sign-up` instead of inlining the schema one by one, but does not apply to `/`.

We can summarize the route validation as the following:

| Path     | Has validation |
|----------|----------------|
| /sign-up | ✅             |
| /sign-in | ✅             |
| /        | ❌             |

Guard accepts the same parameters as inline hooks; the only difference is that you can apply a hook to multiple routes in the scope.

This means that the code above is translated into:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/sign-up', ({ body }) => signUp(body), {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .post('/sign-in', ({ body }) => body, {
        beforeHandle: isUserExists,
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .get('/', () => 'hi')
    .listen(3000)
```

### Grouped Guard

We can use a group with prefixes by providing 3 parameters to the group.

- **Prefix** - Route prefix
- **Guard** - Schema
- **Scope** - Elysia app callback

With the same API as guard apply to the 2nd parameter, instead of nesting group and guard together.

Consider the following example:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .group('/v1', (app) =>
        app.guard(
            {
                body: t.Literal('Rikuhachima Aru')
            },
            (app) => app.post('/student', ({ body }) => body)
        )
    )
    .listen(3000)
```

From nested grouped guards, we can merge group and guard together by providing guard scope to the 2nd parameter of group:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .group(
        '/v1',
        (app) => app.guard(
            {
                body: t.Literal('Rikuhachima Aru')
            },
            (app) => app.post('/student', ({ body }) => body)
        )
    )
    .listen(3000)
```

This results in the following syntax:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .group(
        '/v1',
        {
            body: t.Literal('Rikuhachima Aru')
        },
        (app) => app.post('/student', ({ body }) => body)
    )
    .listen(3000)
```

## Scope cast

> **Advanced Concept**

To apply a hook to a parent, you may use one of the following:

- **inline `as`** applies to only a single hook
- **guard `as`** applies to all hooks in a guard
- **instance `as`** applies to all hooks in an instance

### Inline as

Every event listener will accept `as` parameter to specify the scope of the hook.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .derive({ as: 'scoped' }, () => {
        return { hi: 'ok' }
    })
    .get('/child', ({ hi }) => hi)

const main = new Elysia()
    .use(plugin)
    // ✅ Hi is now available
    .get('/parent', ({ hi }) => hi)
```

However, this method applies to only a single hook and may not be suitable for multiple hooks.

### Guard as

Every event listener will accept `as` parameter to specify the scope of the hook.

```ts
import { Elysia, t } from 'elysia'

const plugin = new Elysia()
    .guard({
        as: 'scoped',
        response: t.String(),
        beforeHandle() {
            console.log('ok')
        }
    })
    .get('/child', 'ok')

const main = new Elysia()
    .use(plugin)
    .get('/parent', 'hello')
```

Guard allows us to apply schema and hook to multiple routes all at once while specifying the scope.

However, it doesn't support `derive` and `resolve` method.

### Instance as

`as` reads all hooks and schema scopes of the current instance, modifying them.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia()
    .derive(() => {
        return { hi: 'ok' }
    })
    .get('/child', ({ hi }) => hi)
    .as('scoped')

const main = new Elysia()
    .use(plugin)
    // ✅ Hi is now available
    .get('/parent', ({ hi }) => hi)
```

Sometimes we want to reapply plugin to parent instance as well but as it's limited by scoped mechanism, it's limited to 1 parent only.

To apply to the parent instance, we need to lift the scope up to the parent instance, and `as` is the perfect method to do so.

Which means if you have local scope, and want to apply it to the parent instance, you can use `as('scoped')` to lift it up.

```ts
import { Elysia, t } from 'elysia'

const plugin = new Elysia()
    .guard({
        response: t.String()
    })
    .onBeforeHandle(() => { console.log('called') })
    .get('/ok', () => 'ok')
    .get('/not-ok', () => 1)
    .as('scoped')

const instance = new Elysia()
    .use(plugin)
    .get('/no-ok-parent', () => 2)
    .as('scoped')

const parent = new Elysia()
    .use(instance)
    // This now error because `scoped` is lifted up to parent
    .get('/ok', () => 3)
```

## Lazy Load

Modules are eagerly loaded by default.

Elysia will make sure that all modules are registered before the server starts.

However, some modules may be computationally heavy or blocking, making the server startup slow.

To solve this, Elysia allows you to provide an async plugin that will not block the server startup.

### Deferred Module

The deferred module is an async plugin that can be registered after the server is started.

```ts
// plugin.ts
import { Elysia, file } from 'elysia'
import { loadAllFiles } from './files'

export const loadStatic = async (app: Elysia) => {
    const files = await loadAllFiles()

    files.forEach((asset) => app
        .get(asset, file(file))
    )

    return app
}
```

And in the main file:

```ts
import { Elysia } from 'elysia'
import { loadStatic } from './plugin'

const app = new Elysia()
    .use(loadStatic)
```

### Lazy Load Module

Same as an async plugin, the lazy-load module will be registered after the server is started.

A lazy-load module can be either synchronous or asynchronous; as long as the module is used with `import`, the module will be lazy-loaded.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .use(import('./plugin'))
```

Using module lazy-loading is recommended when the module is computationally heavy and/or blocking.

To ensure module registration before the server starts, we can use `await` on the deferred module.

### Testing

In a test environment, we can use `await app.modules` to wait for deferred and lazy-loading modules.

```ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

describe('Modules', () => {
    it('inline async', async () => {
        const app = new Elysia()
              .use(async (app) =>
                  app.get('/async', () => 'async')
              )

        await app.modules

        const res = await app
            .handle(new Request('http://localhost/async'))
            .then((r) => r.text())

        expect(res).toBe('async')
    })
})
```

D:/1_Projects/jstonehub/prompts/elysia/2_essential/4_life_cycle.md

# Lifecycle

Instead of a sequential process, Elysia's request handling is divided into multiple stages called **lifecycle events**.

It's designed to separate the process into distinct phases based on their responsibility without interfering with each others.

Here are the lifecycle events in order:

1. **Request** - Notify new event is received
2. **Parse** - Parse body into `Context.body`
3. **Transform** - Modify Context before validation
4. **Before Handle** - Custom validation before route handler
5. **After Handle** - Tweak returned value from route handler
6. **Map Response** - Map returned value into HTTP response
7. **On Error** (Error Handling) - Handle errors thrown in the life-cycle
8. **After Response** - Clean up after response is sent
9. **Trace** - Audit and capture timespan of each event

## Why

Let's say we want to send back some HTML.

Normally, we'd set the "Content-Type" header to "text/html" so the browser can render it.

But manually setting one for each route is tedious.

Instead, what if the framework could detect when a response is HTML and automatically set the header for you? That's where the idea of a lifecycle comes in.

## Hook

Each function that intercepts the lifecycle event is called a **"hook"**.

(as the function "hooks" into the lifecycle event)

Hooks can be categorized into 2 types:

- **Local Hook**: Execute on a specific route
- **Interceptor Hook**: Execute on every route after the hook is registered

> **TIP**:
> The hook will accept the same Context as a handler; you can imagine adding a route handler but at a specific point.

### Local Hook

A local hook is executed on a specific route.

To use a local hook, you can inline hook into a route handler:

```ts
import { Elysia } from 'elysia'
import { isHtml } from '@elysiajs/html'

new Elysia()
    .get('/', () => '<h1>Hello World</h1>', {
        afterHandle({ responseValue, set }) {
            if (isHtml(responseValue))
                set.headers['Content-Type'] = 'text/html; charset=utf8'
        }
    })
    .get('/hi', () => '<h1>Hello World</h1>')
    .listen(3000)
```

The response should be listed as follows:

| Path | Content-Type            |
|------|-------------------------|
| /    | text/html; charset=utf8 |
| /hi  | text/plain; charset=utf8|

### Interceptor Hook

Register hook into every handler of the current instance that came after.

To add an interceptor hook, you can use `.on` followed by a lifecycle event in camelCase:

```ts
import { Elysia } from 'elysia'
import { isHtml } from '@elysiajs/html'

new Elysia()
    .get('/none', () => '<h1>Hello World</h1>')
    .onAfterHandle(({ responseValue, set }) => {
        if (isHtml(responseValue))
            set.headers['Content-Type'] = 'text/html; charset=utf8'
    })
    .get('/', () => '<h1>Hello World</h1>')
    .get('/hi', () => '<h1>Hello World</h1>')
    .listen(3000)
```

The response should be listed as follows:

| Path  | Content-Type             |
|-------|--------------------------|
| /none | text/plain; charset=utf8 |
| /     | text/html; charset=utf8  |
| /hi   | text/html; charset=utf8  |

Events from other plugins are also applied to the route, so the order of code is important.

## Order of code

Event will only apply to routes after it is registered.

If you put the `onError` before plugin, plugin will not inherit the `onError` event.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onBeforeHandle(() => {
        console.log('1')
    })
    .get('/', () => 'hi')
    .onBeforeHandle(() => {
        console.log('2')
    })
    .listen(3000)
```

Console should log the following:

```
1
```

Notice that it doesn't log `2`, because the event is registered after the route so it is not applied to the route.

This also applies to the plugin.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onBeforeHandle(() => {
        console.log('1')
    })
    .use(someRouter)
    .onBeforeHandle(() => {
        console.log('2')
    })
    .listen(3000)
```

In this example, only `1` will be logged because the event is registered after the plugin.

Every event follows the same rule except `onRequest`. Because `onRequest` happens on request, it doesn't know which route to apply it to, so it's a global event.

## Request

The first lifecycle event to be executed for every new request.

As `onRequest` is designed to provide only the most crucial context to reduce overhead, it is recommended to use in the following scenarios:

- Caching
- Rate Limiter / IP/Region Lock
- Analytic
- Provide custom header, eg. CORS

### Example

Below is a pseudocode to enforce rate-limits on a certain IP address.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .use(rateLimiter)
    .onRequest(({ rateLimiter, ip, set, status }) => {
        if (rateLimiter.check(ip)) return status(420, 'Enhance your calm')
    })
    .get('/', () => 'hi')
    .listen(3000)
```

If a value is returned from `onRequest`, it will be used as the response and the rest of the lifecycle will be skipped.

### Pre Context

The `onRequest` context is typed as `PreContext`, a minimal representation of Context with the following attributes:

- `request`: Request
- `set`: Set
- `store`
- `decorators`

Context doesn't provide derived value because `derive` is based on `onTransform` event.

## Parse

Parse is an equivalent of body parser in Express.

A function to parse the body; the return value will be appended to `Context.body`. If not, Elysia will continue iterating through additional parser functions assigned by `onParse` until either body is assigned or all parsers have been executed.

By default, Elysia will parse the body with content-type of:

- `text/plain`
- `application/json`
- `multipart/form-data`
- `application/x-www-form-urlencoded`

It's recommended to use the `onParse` event to provide a custom body parser that Elysia doesn't provide.

### Example

Below is an example code to retrieve value based on custom headers.

```ts
import { Elysia } from 'elysia'

new Elysia().onParse(({ request, contentType }) => {
    if (contentType === 'application/custom-type') return request.text()
})
```

The returned value will be assigned to `Context.body`. If not, Elysia will continue iterating through additional parser functions from `onParse` stack until either body is assigned or all parsers have been executed.

### Context

`onParse` context extends from Context with the following additional properties:

- **contentType**: Content-Type header of the request

All of the context is based on normal context and can be used like normal context in route handler.

### Parser

By default, Elysia will try to determine body parsing function ahead of time and pick the most suitable function to speed up the process.

Elysia is able to determine that body function by reading `body`.

Take a look at this example:

```ts
import { Elysia, t } from 'elysia'

new Elysia().post('/', ({ body }) => body, {
    body: t.Object({
        username: t.String(),
        password: t.String()
    })
})
```

Elysia reads the body schema and finds that the type is entirely an object, so it's likely that the body will be JSON. Elysia then picks the JSON body parser function ahead of time and tries to parse the body.

Here are the criteria that Elysia uses to select the body parser type:

- **application/json**: body typed as `t.Object`
- **multipart/form-data**: body typed as `t.Object`, and is 1 level deep with `t.File`
- **application/x-www-form-urlencoded**: body typed as `t.URLEncoded`
- **text/plain**: other primitive type

This allows Elysia to optimize body parser ahead of time, and reduce overhead in compile time.

### Explicit Parser

However, in some scenarios if Elysia fails to pick the correct body parser function, we can explicitly tell Elysia to use a certain function by specifying `type`.

```ts
import { Elysia } from 'elysia'

new Elysia().post('/', ({ body }) => body, {
    // Short form of application/json
    parse: 'json'
})
```

This allows us to control Elysia behavior for picking body parser function to fit our needs in a complex scenario.

`type` may be one of the following:

```ts
type ContentType = |
    // Shorthand for 'text/plain'
    | 'text'
    // Shorthand for 'application/json'
    | 'json'
    // Shorthand for 'multipart/form-data'
    | 'formdata'
    // Shorthand for 'application/x-www-form-urlencoded'
    | 'urlencoded'
    // Skip body parsing entirely
    | 'none'
    | 'text/plain'
    | 'application/json'
    | 'multipart/form-data'
    | 'application/x-www-form-urlencoded'
```

### Skip Body Parsing

When you need to integrate a third-party library with an HTTP handler like trpc or orpc, and it throws `Body is already used`.

This is because Web Standard Request can be parsed only once.

Both Elysia and the third-party library both has its own body parser, so you can skip body parsing on Elysia side by specifying `parse: 'none'`

```ts
import { Elysia } from 'elysia'

new Elysia()
    .post(
        '/',
        ({ request }) => library.handle(request),
        {
            parse: 'none'
        }
    )
```

### Custom Parser

You can register a custom parser with `parser`:

```ts
import { Elysia } from 'elysia'

new Elysia()
    .parser('custom', ({ request, contentType }) => {
        if (contentType === 'application/elysia') return request.text()
    })
    .post('/', ({ body }) => body, {
        parse: ['custom', 'json']
    })
```

## Transform

Executed just before Validation process, designed to mutate context to conform with the validation or appending new value.

It's recommended to use transform for the following:

- Mutating the existing context to conform with validation.
- `derive` is based on `onTransform` with support for providing type.

### Example

Below is an example of using transform to mutate params to be numeric values.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/id/:id', ({ params: { id } }) => id, {
        params: t.Object({
            id: t.Number()
        }),
        transform({ params }) {
            const id = +params.id

            if (!Number.isNaN(id)) params.id = id
        }
    })
    .listen(3000)
```

### Derive

Append new value to context directly before validation. It's stored in the same stack as `transform`.

Unlike `state` and `decorate`, which assign values before the server starts, `derive` assigns a property when each request happens. This allows us to extract a piece of information into a property.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .derive(({ headers }) => {
        const auth = headers['Authorization']

        return {
            bearer: auth?.startsWith('Bearer ') ? auth.slice(7) : null
        }
    })
    .get('/', ({ bearer }) => bearer)
```

Because `derive` is assigned once a new request starts, `derive` can access Request properties like `headers`, `query`, `body` where `store`, and `decorate` can't.

Unlike `state` and `decorate`, properties assigned by `derive` are unique and not shared with other requests.

> **TIP**:
> You might want to use `resolve` instead of `derive` in most cases.
> Resolve is similar to derive but execute after validation. This makes resolve more secure as we can validate the incoming data before using it to derive new properties.

### Queue

`derive` and `transform` are stored in the same queue.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onTransform(() => {
        console.log(1)
    })
    .derive(() => {
        console.log(2)

        return {}
    })
```

The console should log as the following:

```
1
2
```

## Before Handle

Executed after validation and before the main route handler.

Designed to provide a custom validation to provide a specific requirement before running the main handler.

If a value is returned, the route handler will be skipped.

It's recommended to use Before Handle in the following situations:

- Restricted access check: authorization, user sign-in
- Custom request requirement over data structure

### Example

Below is an example of using the before handle to check for user sign-in.

```ts
import { Elysia } from 'elysia'
import { validateSession } from './user'

new Elysia()
    .get('/', () => 'hi', {
        beforeHandle({ set, cookie: { session }, status }) {
            if (!validateSession(session.value)) return status(401)
        }
    })
    .listen(3000)
```

The response should be listed as follows:

| Is signed in | Response     |
|--------------|--------------|
| ❌           | Unauthorized |
| ✅           | Hi           |

### Guard

When we need to apply the same before handle to multiple routes, we can use `guard` to apply the same before handle to multiple routes.

```ts
import { Elysia } from 'elysia'
import { signUp, signIn, validateSession, isUserExists } from './user'

new Elysia()
    .guard(
        {
            beforeHandle({ set, cookie: { session }, status }) {
                if (!validateSession(session.value)) return status(401)
            }
        },
        (app) =>
            app
                .get('/user/:id', ({ body }) => signUp(body))
                .post('/profile', ({ body }) => signIn(body), {
                    beforeHandle: isUserExists
                })
    )
    .get('/', () => 'hi')
    .listen(3000)
```

### Resolve

Append new value to context after validation. It's stored in the same stack as `beforeHandle`.

Resolve syntax is identical to `derive`, below is an example of retrieving a bearer header from the Authorization plugin.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .guard(
        {
            headers: t.Object({
                authorization: t.TemplateLiteral('Bearer ${string}')
            })
        },
        (app) =>
            app
                .resolve(({ headers: { authorization } }) => {
                    return {
                        bearer: authorization.split(' ')[1]
                    }
                })
                .get('/', ({ bearer }) => bearer)
    )
    .listen(3000)
```

Using `resolve` and `onBeforeHandle` is stored in the same queue.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onBeforeHandle(() => {
        console.log(1)
    })
    .resolve(() => {
        console.log(2)

        return {}
    })
    .onBeforeHandle(() => {
        console.log(3)
    })
```

The console should log as the following:

```
1
2
3
```

Same as `derive`, properties assigned by `resolve` are unique and not shared with other requests.

### Guard resolve

As `resolve` is not available in local hook, it's recommended to use `guard` to encapsulate the resolve event.

```ts
import { Elysia } from 'elysia'
import { isSignIn, findUserById } from './user'

new Elysia()
    .guard(
        {
            beforeHandle: isSignIn
        },
        (app) =>
            app
                .resolve(({ cookie: { session } }) => ({
                    userId: findUserById(session.value)
                }))
                .get('/profile', ({ userId }) => userId)
    )
    .listen(3000)
```

## After Handle

Execute after the main handler, for mapping a returned value of before handle and route handler into a proper response.

It's recommended to use After Handle in the following situations:

- Transform requests into a new value, eg. Compression, Event Stream
- Add custom headers based on the response value, eg. Content-Type

### Example

Below is an example of using the after handle to add HTML content type to response headers.

```ts
import { Elysia } from 'elysia'
import { isHtml } from '@elysiajs/html'

new Elysia()
    .get('/', () => '<h1>Hello World</h1>', {
        afterHandle({ response, set }) {
            if (isHtml(response))
                set.headers['content-type'] = 'text/html; charset=utf8'
        }
    })
    .get('/hi', () => '<h1>Hello World</h1>')
    .listen(3000)
```

The response should be listed as follows:

| Path | Content-Type             |
|------|--------------------------|
| /    | text/html; charset=utf8  |
| /hi  | text/plain; charset=utf8 |

### Returned Value

If a value is returned After Handle will use a return value as a new response value unless the value is `undefined`.

The above example could be rewritten as the following:

```ts
import { Elysia } from 'elysia'
import { isHtml } from '@elysiajs/html'

new Elysia()
    .get('/', () => '<h1>Hello World</h1>', {
        afterHandle({ response, set }) {
            if (isHtml(response)) {
                set.headers['content-type'] = 'text/html; charset=utf8'
                return new Response(response)
            }
        }
    })
    .get('/hi', () => '<h1>Hello World</h1>')
    .listen(3000)
```

Unlike `beforeHandle`, after a value is returned from `afterHandle`, the iteration of `afterHandle` will **NOT** be skipped.

### Context

`onAfterHandle` context extends from Context with the additional property of `response`, which is the response to return to the client.

The `onAfterHandle` context is based on the normal context and can be used like the normal context in route handlers.

## Map Response

Executed just after "afterHandle", designed to provide custom response mapping.

It's recommended to use Map Response for the following:

- Compression
- Map value into a Web Standard Response

### Example

Below is an example of using `mapResponse` to provide Response compression.

```ts
import { Elysia } from 'elysia'

const encoder = new TextEncoder()

new Elysia()
    .mapResponse(({ responseValue, set }) => {
        const isJson = typeof responseValue === 'object'

        const text = isJson
            ? JSON.stringify(responseValue)
            : (responseValue?.toString() ?? '')

        set.headers['Content-Encoding'] = 'gzip'

        return new Response(Bun.gzipSync(encoder.encode(text)), {
            headers: {
                'Content-Type': `${
                    isJson ? 'application/json' : 'text/plain'
                }; charset=utf-8`
            }
        })
    })
    .get('/text', () => 'mapResponse')
    .get('/json', () => ({ map: 'response' }))
    .listen(3000)
```

Like `parse` and `beforeHandle`, after a value is returned, the next iteration of `mapResponse` will be skipped.

Elysia automatically handles merging `set.headers` from `mapResponse`. You don't need to worry about appending `set.headers` to the Response manually.

## On Error (Error Handling)

Designed for error handling. It will be executed when an error is thrown in any lifecycle.

It's recommended to use `onError` in the following situations:

- providing custom error messages
- fail-safe handling, an error handler, or retrying a request
- logging and analytics

### Example

Elysia catches all the errors thrown in the handler, classifies the error code, and pipes them to `onError` middleware.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onError(({ error }) => {
        return new Response(error.toString())
    })
    .get('/', () => {
        throw new Error('Server is during maintenance')

        return 'unreachable'
    })
```

With `onError` we can catch and transform the error into a custom error message.

> **TIP**:
> It's important that `onError` must be registered before the handler you want to apply it to.

### Custom 404 message

For example, returning custom 404 messages:

```ts
import { Elysia, NotFoundError } from 'elysia'

new Elysia()
    .onError(({ code, status, set }) => {
        if (code === 'NOT_FOUND') return status(404, 'Not Found :(')
    })
    .post('/', () => {
        throw new NotFoundError()
    })
    .listen(3000)
```

### Context

`onError` context extends from Context with the following additional properties:

- **error**: A value that was thrown
- **code**: Error Code

### Error Code

Elysia error code consists of:

- `NOT_FOUND`
- `PARSE`
- `VALIDATION`
- `INTERNAL_SERVER_ERROR`
- `INVALID_COOKIE_SIGNATURE`
- `INVALID_FILE_TYPE`
- `UNKNOWN`
- `number` (based on HTTP Status)

By default, the thrown error code is `UNKNOWN`.

> **TIP**:
> If no error response is returned, the error will be returned using `error.name`.

### Local Error

Same as other lifecycle events, we provide an error into a scope using guard:

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', () => 'Hello', {
        beforeHandle({ set, request: { headers }, error }) {
            if (!isSignIn(headers)) throw error(401)
        },
        error() {
            return 'Handled'
        }
    })
    .listen(3000)
```

## After Response

Executed after the response sent to the client.

It's recommended to use After Response in the following situations:

- Clean up response
- Logging and analytics

### Example

Below is an example of using the response handle to check for user sign-in.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onAfterResponse(() => {
        console.log('Response', performance.now())
    })
    .listen(3000)
```

Console should log as the following:

```
Response 0.0000
Response 0.0001
Response 0.0002
```

### Response

Similar to Map Response, `afterResponse` also accepts a `responseValue` value.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onAfterResponse(({ responseValue }) => {
        console.log(responseValue)
    })
    .get('/', () => 'Hello')
    .listen(3000)
```

`response` from `onAfterResponse` is not a Web Standard Response but is a value that is returned from the handler.

To get headers and status returned from the handler, we can access `set` from the context.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onAfterResponse(({ set }) => {
        console.log(set.status, set.headers)
    })
    .get('/', () => 'Hello')
    .listen(3000)
```

D:/1_Projects/jstonehub/prompts/elysia/2_essential/5_validation.md

# Validation

Elysia provides a schema to validate data out of the box to ensure that the data is in the correct format.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/id/:id', ({ params: { id } }) => id, {
        params: t.Object({
            id: t.Number()
        })
    })
    .listen(3000)
```

## TypeBox

`Elysia.t` is a schema builder based on TypeBox that provides type-safety at runtime, compile-time, and OpenAPI schema generation from a single source of truth.

Elysia tailors TypeBox for server-side validation for a seamless experience.

## Standard Schema

Elysia also supports Standard Schema, allowing you to use your favorite validation library:

- Zod
- Valibot
- ArkType
- Effect Schema
- Yup
- Joi
- and more

To use Standard Schema, simply import the schema and provide it to the route handler.

```ts
import { Elysia } from 'elysia'
import { z } from 'zod'
import * as v from 'valibot'

new Elysia()
    .get('/id/:id', ({ params: { id }, query: { name } }) => id, {
        params: z.object({
            id: z.coerce.number()
        }),
        query: v.object({
            name: v.literal('Lilith')
        })
    })
    .listen(3000)
```

You can use any validator together in the same handler without any issue.

## Schema type

Elysia supports declarative schemas with the following types:

- **Body** - Validate an incoming HTTP Message
- **Query** - Query string or URL parameter
- **Params** - Path parameters
- **Headers** - Headers of the request
- **Cookie** - Cookie of the request
- **Response** - Response of the request

These properties should be provided as the third argument of the route handler to validate the incoming request.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/id/:id', () => 'Hello World!', {
        query: t.Object({
            name: t.String()
        }),
        params: t.Object({
            id: t.Number()
        })
    })
    .listen(3000)
```

The response should be as follows:

| URL                    | Query | Params |
|------------------------|-------|--------|
| /id/a                  | ❌    | ❌     |
| /id/1?name=Elysia      | ✅    | ✅     |
| /id/1?alias=Elysia     | ❌    | ✅     |
| /id/a?name=Elysia      | ✅    | ❌     |
| /id/a?alias=Elysia     | ❌    | ❌     |

When a schema is provided, the type will be inferred from the schema automatically and an OpenAPI type will be generated for API documentation, eliminating the redundant task of providing the type manually.

## Guard

Guard can be used to apply a schema to multiple handlers.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/none', ({ query }) => 'hi')
    .guard({
        query: t.Object({
            name: t.String()
        })
    })
    .get('/query', ({ query }) => query)
    .listen(3000)
```

This code ensures that the query must have `name` with a string value for every handler after it. The response should be listed as follows:

| Path         | Response |
|--------------|----------|
| /none        | hi       |
| /none?name=a | hi       |
| /query       | error    |
| /query?name=a| a        |

If multiple global schemas are defined for the same property, the latest one will take precedence. If both local and global schemas are defined, the local one will take precedence.

### Guard Schema Type

Guard supports 2 types to define a validation.

- **override** (default) - Override schemas if they collide with each other.
- **standalone** - Separate collided schemas, and run both independently resulting in both being validated.

To define schema type of guard with schema:

```ts
import { Elysia } from 'elysia'

new Elysia()
    .guard({
        schema: 'standalone',
        response: t.Object({
            title: t.String()
        })
    })
```

## Body

An HTTP message is data sent to the server. It can be in the form of JSON, form-data, or any other format.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/body', ({ body }) => body, {
        body: t.Object({
            name: t.String()
        })
    })
    .listen(3000)
```

The validation should be as follows:

| Body                  | Validation |
|-----------------------|------------|
| { name: 'Elysia' }   | ✅         |
| { name: 1 }          | ❌         |
| { alias: 'Elysia' }  | ❌         |
| undefined             | ❌         |

Elysia disables body-parser for **GET** and **HEAD** messages by default, following the specs of HTTP/1.1 RFC2616

> If the request method does not include defined semantics for an entity-body, then the message-body SHOULD be ignored when handling the request.

Most browsers disable the attachment of the body by default for GET and HEAD methods.

### Specs

Validate an incoming HTTP Message (or body).

These are additional messages for the web server to process.

The body is provided in the same way as the body in fetch API. The content type should be set accordingly to the defined body.

```ts
fetch('https://elysiajs.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Elysia'
    })
})
```

### File

File is a special type of body that can be used to upload files.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/body', ({ body }) => body, {
        body: t.Object({
            file: t.File({ format: 'image/*' }),
            multipleFiles: t.Files()
        })
    })
    .listen(3000)
```

By providing a file type, Elysia will automatically assume that the content-type is `multipart/form-data`.

### File (Standard Schema)

If you're using Standard Schema, it's important to note that Elysia will not be able to validate content type automatically similar to `t.File`.

But Elysia export a `fileType` that can be used to validate file type by using magic number.

```ts
import { Elysia, fileType } from 'elysia'
import { z } from 'zod'

new Elysia()
    .post('/body', ({ body }) => body, {
        body: z.object({
            file: z.file().refine((file) => fileType(file, 'image/jpeg'))
        })
    })
```

It's very important that you should use the `fileType` utility to validate the file type as most validators don't actually validate the file correctly, like checking the content type value which can lead to security vulnerabilities.

## Query

Query is the data sent through the URL. It can be in the form of `?key=value`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/query', ({ query }) => query, {
        query: t.Object({
            name: t.String()
        })
    })
    .listen(3000)
```

Query must be provided in the form of an object.

The validation should be as follows:

| Query                          | Validation |
|--------------------------------|------------|
| /?name=Elysia                  | ✅         |
| /?name=1                       | ✅         |
| /?alias=Elysia                 | ❌         |
| /?name=ElysiaJS&alias=Elysia   | ✅         |
| /                              | ❌         |

### Specs

A query string is part of the URL that starts with `?` and can contain one or more query parameters, which are key-value pairs used to convey additional information to the server, usually for customized behavior like filtering or searching.

Query is provided after the `?` in Fetch API.

```ts
fetch('https://elysiajs.com/?name=Elysia')
```

When specifying query parameters, it's crucial to understand that all query parameter values are represented as strings. This is due to how they are encoded and appended to the URL.

### Coercion

Elysia will coerce applicable schema on query to respective type automatically.

See **Elysia behavior** for more information.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/', ({ query }) => query, {
        query: t.Object({
            id: t.Number()
        })
    })
    .listen(3000)
```

### Array

By default, Elysia treats query parameters as a single string even if specified multiple times.

To use arrays, we need to explicitly declare them as arrays.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/', ({ query }) => query, {
        query: t.Object({
            name: t.Array(t.String())
        })
    })
    .listen(3000)
```

Once Elysia detect that a property is assignable to array, Elysia will coerce it to an array of the specified type.

By default, Elysia format query array with the following format:

#### nuqs

This format is used by nuqs.

By using `,` as a delimiter, a property will be treated as array.

```
http://localhost?name=rapi,anis,neon&squad=counter
```

```json
{
    "name": ["rapi", "anis", "neon"],
    "squad": "counter"
}
```

#### HTML form format

If a key is assigned multiple times, the key will be treated as an array.

This is similar to HTML form format when an input with the same name is specified multiple times.

```
http://localhost?name=rapi&name=anis&name=neon&squad=counter
// name: ['rapi', 'anis', 'neon']
```

## Params

Params or path parameters are the data sent through the URL path.

They can be in the form of `/key`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/id/:id', ({ params }) => params, {
        params: t.Object({
            id: t.Number()
        })
    })
```

Params must be provided in the form of an object.

The validation should be as follows:

| URL   | Validation |
|-------|------------|
| /id/1 | ✅         |
| /id/a | ❌         |

### Specs

Path parameters (not to be confused with query string or query parameter).

This is usually not needed as Elysia can infer types from path parameters automatically, unless there is a need for a specific value pattern, such as a numeric value or template literal pattern.

```ts
fetch('https://elysiajs.com/id/1')
```

### Params type inference

If a params schema is not provided, Elysia will automatically infer the type as a string.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/id/:id', ({ params }) => params)
```

## Headers

Headers are the data sent through the request's header.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/headers', ({ headers }) => headers, {
        headers: t.Object({
            authorization: t.String()
        })
    })
```

Unlike other types, headers have `additionalProperties` set to `true` by default.

This means that headers can have any key-value pair, but the value must match the schema.

### Specs

HTTP headers let the client and the server pass additional information with an HTTP request or response, usually treated as metadata.

This field is usually used to enforce some specific header fields, for example, Authorization.

Headers are provided in the same way as the body in fetch API.

```ts
fetch('https://elysiajs.com/', {
    headers: {
        authorization: 'Bearer 12345'
    }
})
```

> **TIP**:
> Elysia will parse headers as lower-case keys only.
> Please make sure that you are using lower-case field names when using header validation.

## Cookie

Cookie is the data sent through the request's cookie.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/cookie', ({ cookie }) => cookie, {
        cookie: t.Cookie({
            cookieName: t.String()
        })
    })
```

Cookies must be provided in the form of `t.Cookie` or `t.Object`.

Same as headers, cookies have `additionalProperties` set to `true` by default.

### Specs

An HTTP cookie is a small piece of data that a server sends to the client. It's data sent with every visit to the same web server to let the server remember client information.

In simpler terms, it's a stringified state that is sent with every request.

This field is usually used to enforce some specific cookie fields.

A cookie is a special header field that the Fetch API doesn't accept a custom value for but is managed by the browser. To send a cookie, you must use a `credentials` field instead:

```ts
fetch('https://elysiajs.com/', {
    credentials: 'include'
})
```

### t.Cookie

`t.Cookie` is a special type that is equivalent to `t.Object` but allows to set cookie-specific options.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/cookie', ({ cookie }) => cookie.name.value, {
        cookie: t.Cookie({
            name: t.String()
        }, {
            secure: true,
            httpOnly: true
        })
    })
```

## Response

Response is the data returned from the handler.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/response', () => {
        return {
            name: 'Jane Doe'
        }
    }, {
        response: t.Object({
            name: t.String()
        })
    })
```

### Response per status

Responses can be set per status code.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/response', ({ status }) => {
        if (Math.random() > 0.5)
            return status(400, {
                error: 'Something went wrong'
            })

        return {
            name: 'Jane Doe'
        }
    }, {
        response: {
            200: t.Object({
                name: t.String()
            }),
            400: t.Object({
                error: t.String()
            })
        }
    })
```

This is an Elysia-specific feature, allowing us to make a field optional.

## Error Provider

There are two ways to provide a custom error message when the validation fails:

- Inline status property
- Using `onError` event

### Error Property

Elysia offers an additional `error` property, allowing us to return a custom error message if the field is invalid.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/', () => 'Hello World!', {
        body: t.Object({
            x: t.Number({
                error: 'x must be a number'
            })
        })
    })
    .listen(3000)
```

The following is an example of using the error property on various types:

| TypeBox | Error |
|---------|-------|
| `t.String({ format: 'email', error: 'Invalid email :(' })` | Invalid Email :( |
| `t.Array(t.String(), { error: 'All members must be a string' })` | All members must be a string |
| `t.Object({ x: t.Number() }, { error: 'Invalid object UnU' })` | Invalid object UnU |
| `t.Object({ x: t.Number({ error({ errors, type, validation, value }) { return 'Expected x to be a number' } }) })` | Expected x to be a number |

### Custom Error

TypeBox offers an additional "error" property, allowing us to return a custom error message if the field is invalid.

| TypeBox | Error |
|---------|-------|
| `t.String({ format: 'email', error: 'Invalid email :(' })` | Invalid Email :( |
| `t.Object({ x: t.Number() }, { error: 'Invalid object UnU' })` | Invalid object UnU |

### Error message as function

In addition to a string, Elysia type's error can also accept a function to programmatically return a custom error for each property.

The error function accepts the same arguments as `ValidationError`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/', () => 'Hello World!', {
        body: t.Object({
            x: t.Number({
                error() {
                    return 'Expected x to be a number'
                }
            })
        })
    })
    .listen(3000)
```

> **TIP**:
> Hover over the error to see the type.

### Error is Called Per Field

Please note that the error function will only be called if the field is invalid.

Please consider the following table:

| Code | Body | Error |
|------|------|-------|
| `t.Object({ x: t.Number({ error() { return 'Expected x to be a number' } }) })` | `{ x: "hello" }` | Expected x to be a number |
| `t.Object({ x: t.Number({ error() { return 'Expected x to be a number' } }) })` | `"hello"` | (default error, `t.Number.error` is not called) |
| `t.Object({ x: t.Number({ error() { return 'Expected x to be a number' } }) }, { error() { return 'Expected value to be an object' } })` | `"hello"` | Expected value to be an object |

### onError

We can customize the behavior of validation based on the `onError` event by narrowing down the error code to `"VALIDATION"`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .onError(({ code, error }) => {
        if (code === 'VALIDATION')
            return error.message
    })
    .listen(3000)
```

The narrowed-down error type will be typed as `ValidationError` imported from `elysia/error`.

`ValidationError` exposes a property named `validator`, typed as `TypeCheck`, allowing us to interact with TypeBox functionality out of the box.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .onError(({ code, error }) => {
        if (code === 'VALIDATION')
            return error.all[0].message
    })
    .listen(3000)
```

### Error List

`ValidationError` provides a method `ValidationError.all`, allowing us to list all of the error causes.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/', ({ body }) => body, {
        body: t.Object({
            name: t.String(),
            age: t.Number()
        }),
        error({ code, error }) {
            switch (code) {
                case 'VALIDATION':
                    console.log(error.all)

                    // Find a specific error name (path is OpenAPI Schema compliance)
                    const name = error.all.find(
                        (x) => x.summary && x.path === '/name'
                    )

                    // If there is a validation error, then log it
                    if(name)
                        console.log(name)
            }
        }
    })
    .listen(3000)
```

For more information about TypeBox's validator, see **TypeCheck**.

## Reference Model

Sometimes you might find yourself declaring duplicate models or re-using the same model multiple times.

With a reference model, we can name our model and reuse it by referencing the name.

Let's start with a simple scenario.

Suppose we have a controller that handles sign-in with the same model.

```ts
import { Elysia, t } from 'elysia'

const app = new Elysia()
    .post('/sign-in', ({ body }) => body, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        }),
        response: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
```

We can refactor the code by extracting the model as a variable and referencing it.

```ts
import { Elysia, t } from 'elysia'

// Maybe in a different file eg. models.ts
const SignDTO = t.Object({
    username: t.String(),
    password: t.String()
})

const app = new Elysia()
    .post('/sign-in', ({ body }) => body, {
        body: SignDTO,
        response: SignDTO
    })
```

This method of separating concerns is an effective approach, but we might find ourselves reusing multiple models with different controllers as the app gets more complex.

We can resolve that by creating a "reference model", allowing us to name the model and use auto-completion to reference it directly in schema by registering the models with `model`.

```ts
import { Elysia, t } from 'elysia'

const app = new Elysia()
    .model({
        sign: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .post('/sign-in', ({ body }) => body, {
        // with auto-completion for existing model name
        body: 'sign',
        response: 'sign'
    })
```

When we want to access the model's group, we can separate a model into a plugin, which when registered will provide a set of models instead of multiple imports.

```ts
// auth.model.ts
import { Elysia, t } from 'elysia'

export const authModel = new Elysia()
    .model({
        sign: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
```

Then in an instance file:

```ts
// index.ts
import { Elysia } from 'elysia'
import { authModel } from './auth.model'

const app = new Elysia()
    .use(authModel)
    .post('/sign-in', ({ body }) => body, {
        // with auto-completion for existing model name
        body: 'sign',
        response: 'sign'
    })
```

This approach not only allows us to separate concerns but also enables us to reuse the model in multiple places while integrating the model into OpenAPI documentation.

### Multiple Models

`model` accepts an object with the key as a model name and the value as the model definition. Multiple models are supported by default.

```ts
// auth.model.ts
import { Elysia, t } from 'elysia'

export const authModel = new Elysia()
    .model({
        number: t.Number(),
        sign: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
```

### Naming Convention

Duplicate model names will cause Elysia to throw an error. To prevent declaring duplicate model names, we can use the following naming convention.

Let's say that we have all models stored at `models/<name>.ts` and declare the prefix of the model as a namespace.

```ts
import { Elysia, t } from 'elysia'

// admin.model.ts
export const adminModels = new Elysia()
    .model({
        'admin.auth': t.Object({
            username: t.String(),
            password: t.String()
        })
    })

// user.model.ts
export const userModels = new Elysia()
    .model({
        'user.auth': t.Object({
            username: t.String(),
            password: t.String()
        })
    })
```

This can prevent naming duplication to some extent, but ultimately, it's best to let your team decide on the naming convention.

Elysia provides an opinionated option to help prevent decision fatigue.

## TypeScript

We can get type definitions of every Elysia/TypeBox's type by accessing the `static` property as follows:

```ts
import { t } from 'elysia'

const MyType = t.Object({
    hello: t.Literal('Elysia')
})

type MyType = typeof MyType.static
```

This allows Elysia to infer and provide type automatically, reducing the need to declare duplicate schema.

A single Elysia/TypeBox schema can be used for:

- Runtime validation
- Data coercion
- TypeScript type
- OpenAPI schema

This allows us to make a schema as a single source of truth.

D:/1_Projects/jstonehub/prompts/elysia/2_essential/6_best_practice.md

# Best Practice

Elysia is a pattern-agnostic framework, leaving the decision of which coding patterns to use up to you and your team.

However, there are several concerns when trying to adapt an MVC pattern (Model-View-Controller) with Elysia, and we found it hard to decouple and handle types.

This page is a guide on how to follow Elysia structure best practices combined with the MVC pattern, but it can be adapted to any coding pattern you prefer.

## Folder Structure

Elysia is unopinionated about folder structure, leaving you to decide how to organize your code yourself.

However, if you don't have a specific structure in mind, we recommend a feature-based folder structure where each feature has its own folder containing controllers, services, and models.

```
| src
  | modules
    | auth
      | index.ts (Elysia controller)
      | service.ts (service)
      | model.ts (model)
    | user
      | index.ts (Elysia controller)
      | service.ts (service)
      | model.ts (model)
  | utils
    | a
      | index.ts
    | b
      | index.ts
```

This structure allows you to easily find and manage your code and keep related code together.

Here's an example code of how to distribute your code into a feature-based folder structure:

```ts
// auth/index.ts
// Controller (HTTP adapter) eg. routing, request validation
// You can define another Controller that is not tied with Elysia
import { Elysia } from 'elysia'

import { Auth } from './service'
import { AuthModel } from './model'

export const auth = new Elysia({ prefix: '/auth' })
    .get(
        '/sign-in',
        async ({ body, cookie: { session } }) => {
            const response = await Auth.signIn(body)

            // Set session cookie
            // (Elysia cookie is proxy, it can never be null/undefined)
            session!.value = response.token

            return response
        }, {
            body: AuthModel.signInBody,
            // response is optional, use to enforce return type
            response: {
                200: AuthModel.signInResponse,
                400: AuthModel.signInInvalid
            }
        }
    )
```

Each file has its own responsibility:

- **Controller**: Handles HTTP routing, request validation, and cookies.
- **Service**: Handles business logic, decoupled from the Elysia controller if possible.
- **Model**: Defines the data structure and validation for the request and response.

Feel free to adapt this structure to your needs and use any coding pattern you prefer.

> **NOTE**:
> You may get a warning when using `cookie.name` as it might be undefined depending on your TypeScript configuration.
> Elysia cookie can never be undefined because it's a Proxy object. `cookie` is always defined, only its value (via `cookie.value`) can be undefined.
> This can be fixed by using a cookie schema or disable `strictNullChecks` in `tsconfig.json`.

## Controller

Due to the type soundness of Elysia, it's not recommended to use a traditional controller class that is tightly coupled with Elysia's Context because:

- Elysia types are complex and heavily depend on plugins and multiple levels of chaining.
- Hard to type; Elysia types could change at any time, especially with decorators and store.
- Loss of type integrity and inconsistency between types and runtime code.

We recommend one of the following approaches to implement a controller in Elysia.

1. Use Elysia instance as a controller itself
2. Create a controller that is not tied with HTTP request or Elysia.

### 1. Elysia instance as a controller

1 Elysia instance = 1 controller

Treat an Elysia instance as a controller, and define your routes directly on the Elysia instance.

```ts
// ✅ Do
import { Elysia } from 'elysia'
import { Service } from './service'

new Elysia()
    .get('/', ({ stuff }) => {
        Service.doStuff(stuff)
    })
```

This approach allows Elysia to infer the Context type automatically, ensuring type integrity and consistency between types and runtime code.

```ts
// ❌ Don't
import { Elysia, t, type Context } from 'elysia'

abstract class Controller {
    static root(context: Context) {
        return Service.doStuff(context.stuff)
    }
}

new Elysia()
    .get('/', Controller.root)
```

This approach makes it hard to type Context properly, and may lead to loss of type integrity.

### 2. Controller without HTTP request

If you want to create a controller class, we recommend creating a class that is not tied to HTTP request or Elysia at all.

This approach allows you to decouple the controller from Elysia, making it easier to test, reuse, and even swap a framework while still following the MVC pattern.

```ts
import { Elysia } from 'elysia'

abstract class Controller {
    static doStuff(stuff: string) {
        return Service.doStuff(stuff)
    }
}

new Elysia()
    .get('/', ({ stuff }) => Controller.doStuff(stuff))
```

Tying the controller to the Elysia Context may lead to:

- Loss of type integrity
- Making it harder to test and reuse
- Vendor lock-in

We recommend keeping the controller decoupled from Elysia as much as possible.

### ❌ Don't: Pass entire Context to a controller

Context is a highly dynamic type that can be inferred from Elysia instance.

Do not pass an entire Context to a controller, instead use object destructuring to extract what you need and pass it to the controller.

```ts
import type { Context } from 'elysia'

abstract class Controller {
    constructor() {}

    // ❌ Don't do this
    static root(context: Context) {
        return Service.doStuff(context.stuff)
    }
}
```

This approach makes it hard to type Context properly, and may lead to loss of type integrity.

### Testing

If you're using Elysia as a controller, you can test your controller using `handle` to directly call a function (and its lifecycle).

```ts
import { Elysia } from 'elysia'
import { Service } from './service'

import { describe, it, expect } from 'bun:test'

const app = new Elysia()
    .get('/', ({ stuff }) => {
        Service.doStuff(stuff)

        return 'ok'
    })

describe('Controller', () => {
    it('should work', async () => {
        const response = await app
            .handle(new Request('http://localhost/'))
            .then((x) => x.text())

        expect(response).toBe('ok')
    })
})
```

You may find more information about testing in **Unit Test**.

## Service

A service is a set of utility/helper functions decoupled as business logic to use in a module/controller, in our case, an Elysia instance.

Any technical logic that can be decoupled from controller may live inside a Service.

There are 2 types of service in Elysia:

1. Non-request dependent service
2. Request dependent service

### 1. Abstract away Non-request dependent service

We recommend abstracting service classes/functions away from Elysia.

If the service or function isn't tied to an HTTP request or doesn't access a Context, it's recommended to implement it as a static class or function.

```ts
import { Elysia, t } from 'elysia'

abstract class Service {
    static fibo(number: number): number {
        if(number < 2)
            return number

        return Service.fibo(number - 1) + Service.fibo(number - 2)
    }
}

new Elysia()
    .get('/fibo', ({ body }) => {
        return Service.fibo(body)
    }, {
        body: t.Numeric()
    })
```

If your service doesn't need to store a property, you can use an `abstract` class and `static` methods to avoid allocating a class instance.

### 2. Request dependent service as Elysia instance

If the service is a request-dependent service or needs to process HTTP requests, we recommend abstracting it as an Elysia instance to ensure type integrity and inference:

```ts
import { Elysia } from 'elysia'

// ✅ Do
const AuthService = new Elysia({ name: 'Auth.Service' })
    .macro({
        isSignIn: {
            resolve({ cookie, status }) {
                if (!cookie.session.value)
                    return status(401, 'Unauthorized')

                return {
                    session: cookie.session.value,
                }
            }
        }
    })

const UserController = new Elysia()
    .use(AuthService)
    .get('/profile', ({ Auth: { user } }) => user, {
        isSignIn: true
    })
```

> **TIP**:
> Elysia handles plugin deduplication by default, so you don't have to worry about performance, as it will be a singleton if you specify a "name" property.

### ✅ Do: Decorate only request dependent property

It's recommended to decorate only for request-dependent properties, such as `requestIP`, `requestTime`, or `session`.

Overusing decorators ties your code to Elysia, making it harder to test and reuse.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .decorate('requestIP', ({ request }) => request.headers.get('x-forwarded-for') || request.ip)
    .decorate('requestTime', () => Date.now())
    .decorate('session', ({ cookie }) => cookie.session.value)
    .get('/', ({ requestIP, requestTime, session }) => {
        return { requestIP, requestTime, session }
    })
```

## Model

Models or DTOs (Data Transfer Objects) are handled by `Elysia.t` (Validation).

Elysia has a built-in validation system that can infer types from your code and validate them at runtime.

### ✅ Do: Use Elysia's validation system

Elysia's strength is prioritizing a single source of truth for both types and runtime validation.

Instead of declaring an interface, reuse validation's model instead:

```ts
// ✅ Do
import { Elysia, t, type UnwrapSchema } from 'elysia'

export const models = {
    customBody: t.Object({
        username: t.String(),
        password: t.String()
    })
}

// Optional if you want to extract the type from the model
type CustomBody = UnwrapSchema<typeof models.customBody>

// Or make the entire object as type
type Models = {
    [k in keyof typeof models]: UnwrapSchema<typeof models[k]>
}
```

```ts
// ❌ Don't: declare model and type separately
interface ICustomBody {
    username: string
    password: string
}
```

We can get type of model by using `typeof` with `.static` property from the model.

Then you can use the `CustomBody` type to infer the type of the request body.

```ts
// ✅ Do
new Elysia()
    .post('/login', ({ body }) => {
        return body
    }, {
        body: models.customBody
    })
```

### ❌ Don't: Declare a class instance as a model

Do not declare a class instance as a model:

```ts
// ❌ Don't
class CustomBody {
    username: string
    password: string

    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
}

// ❌ Don't
interface ICustomBody {
    username: string
    password: string
}
```

### Group

You can group multiple models into a single object to make it more organized.

```ts
import { Elysia, t } from 'elysia'

export const AuthModel = {
    sign: t.Object({
        username: t.String(),
        password: t.String()
    })
}

const models = AuthModel.models
```

### Model Injection

Though this is optional, if you are strictly following MVC pattern, you may want to inject like a service into a controller. We recommended using **Elysia reference model**.

Using Elysia's model reference:

```ts
import { Elysia, t } from 'elysia'

const customBody = t.Object({
    username: t.String(),
    password: t.String()
})

const AuthModel = new Elysia()
    .model({
        sign: customBody
    })

const models = AuthModel.models

const UserController = new Elysia({ prefix: '/auth' })
    .use(AuthModel)
    .prefix('model', 'auth.')
    .post('/sign-in', async ({ body, cookie: { session } }) => {

        return true
    }, {
        body: 'auth.Sign'
    })
```

This approach provides several benefits:

- Allows you to name a model and provide auto-completion.
- Modifies schemas for later usage, or performs a remap.
- Shows up as "models" in OpenAPI-compliant clients, eg. OpenAPI.
- Improves TypeScript inference speed as model types will be cached during registration.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/10_open_telemetry.md

# OpenTelemetry

To start using OpenTelemetry, install `@elysiajs/opentelemetry` and apply plugin to any instance.

```ts
import { Elysia } from 'elysia'
import { opentelemetry } from '@elysiajs/opentelemetry'

new Elysia()
    .use(opentelemetry())
```

**Why use OpenTelemetry with Elysia?**

- 1 line config
- Span name is the function name
- Grouping relevant lifecycle together
- Wrap code to record a specific part
- Support Server-Sent Event, and response streaming
- Compatible with any OpenTelemetry compatible library

You may export telemetry data to Jaeger, Zipkin, New Relic, Axiom or any other OpenTelemetry compatible backend.

## Export OpenTelemetry Data

We can export OpenTelemetry data to any backend that supports OpenTelemetry protocol.

Here's an example of exporting telemetry to Axiom:

```ts
import { Elysia } from 'elysia'
import { opentelemetry } from '@elysiajs/opentelemetry'

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'

new Elysia().use(
    opentelemetry({
        spanProcessors: [
            new BatchSpanProcessor(
                new OTLPTraceExporter({
                    url: 'https://api.axiom.co/v1/traces', // [!code highlight]
                    headers: {
                        Authorization: `Bearer ${Bun.env.AXIOM_TOKEN}`, // [!code highlight]
                        'X-Axiom-Dataset': Bun.env.AXIOM_DATASET // [!code highlight]
                    }
                })
            )
        ]
    })
)
```

## OpenTelemetry SDK

Elysia OpenTelemetry is for applying OpenTelemetry to Elysia server only.

You may use OpenTelemetry SDK normally, and the span is run under Elysia's request span, it will automatically appear in Elysia trace.

However, we also provide a `getTracer`, and `record` utility to collect span from any part of your application.

```ts
import { Elysia } from 'elysia'
import { record } from '@elysiajs/opentelemetry'

export const plugin = new Elysia().get('', () => {
    return record('database.query', () => {
        return db.query('SELECT * FROM users')
    })
})
```

### Record Utility

`record` is equivalent to OpenTelemetry's `startActiveSpan` but it will handle auto-closing and capture exception automatically.

You may think of `record` as a label for your code that will be shown in trace.

## Prepare Your Codebase for Observability

Elysia OpenTelemetry will group lifecycle and read the function name of each hook as the name of the span.

It's a good time to **name your function**.

If your hook handler is an arrow function, you may refactor it to a named function to understand the trace better, otherwise your trace span will be named as `anonymous`.

```ts
const bad = new Elysia()
    // ⚠️ span name will be anonymous
    .derive(async ({ cookie: { session } }) => {
        return {
            user: await getProfile(session)
        }
    })

const good = new Elysia()
    // ✅ span name will be getProfile
    .derive(async function getProfile({ cookie: { session } }) {
        return {
            user: await getProfile(session)
        }
    })
```

## getCurrentSpan

`getCurrentSpan` is a utility to get the current span of the current request when you are outside of the handler.

```ts
import { getCurrentSpan } from '@elysiajs/opentelemetry'

function utility() {
    const span = getCurrentSpan()
    span.setAttributes({
        'custom.attribute': 'value'
    })
}
```

This works outside of the handler by retrieving current span from `AsyncLocalStorage`.

## setAttributes

`setAttributes` is a utility to set attributes to the current span.

```ts
import { setAttributes } from '@elysiajs/opentelemetry'

function utility() {
    setAttributes({
        'custom.attribute': 'value'
    })
}
```

This is a syntax sugar for `getCurrentSpan().setAttributes`.

## Configuration

See **opentelemetry plugin** for configuration option and definition.

## Instrumentations <Badge type="tip" text="Advanced Concept" />

Many instrumentation libraries required that the SDK **MUST** run before importing the module.

For example, to use `PgInstrumentation`, the OpenTelemetry SDK must run before importing the `pg` module.

To achieve this in Bun, we can:

1. Separate an OpenTelemetry setup into a different file
2. Create `bunfig.toml` to preload the OpenTelemetry setup file

Let's create a new file in `src/instrumentation.ts`:

```ts
import { opentelemetry } from '@elysiajs/opentelemetry'
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'

export const instrumentation = opentelemetry({
    instrumentations: [new PgInstrumentation()]
})
```

Then we can apply this instrumentation plugin into our main instance in `src/index.ts`:

```ts
import { Elysia } from 'elysia'
import { instrumentation } from './instrumentation.ts'

new Elysia().use(instrumentation).listen(3000)
```

Then create a `bunfig.toml` with the following:

```toml
preload = ["./src/instrumentation.ts"]
```

This will tell Bun to load and setup instrumentation before running the `src/index.ts` allowing OpenTelemetry to do its setup as needed.

## Deploying to Production <Badge type="tip" text="Advanced Concept" />

If you are using `bun build` or other bundlers.

As OpenTelemetry relies on monkey-patching `node_modules/<library>`. It's required to make instrumentations work properly, we need to specify libraries to be instrumented as an external module to exclude it from being bundled.

For example, if you are using `@opentelemetry/instrumentation-pg` to instrument `pg` library. We need to exclude `pg` from being bundled and make sure that it is importing `node_modules/pg`.

To make this work, we may specify `pg` as an external module with `--external pg`:

```bash
bun build --compile --external pg --outfile server src/index.ts
```

This tells bun not to bundle `pg` into the final output file, and will be imported from the `node_modules` directory at runtime. So on a production server, you must also keep the `node_modules` directory.

It's recommended to specify packages that should be available in a production server as `dependencies` in `package.json` and use `bun install --production` to install only production dependencies.

```json
{
    "dependencies": {
        "pg": "^8.15.6"
    },
    "devDependencies": {
        "@elysiajs/opentelemetry": "^1.2.0",
        "@opentelemetry/instrumentation-pg": "^0.52.0",
        "@types/pg": "^8.11.14",
        "elysia": "^1.2.25"
    }
}
```

Then after running a build command, on a production server:

```bash
bun install --production
```

If the `node_modules` directory still includes development dependencies, you may remove the `node_modules` directory and reinstall production dependencies again.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/11_trace.md

# Trace

Performance is an important aspect for Elysia.

We don't want to be fast for benchmarking purposes, we want you to have a really fast server in a real-world scenario.

There are many factors that can slow down our app — and it's hard to identify them, but **trace** can help solve that problem by injecting start and stop code to each life-cycle.

Trace allows us to inject code before and after each life-cycle event, block and interact with the execution of the function.

> **WARNING**
>
> `trace` doesn't work with dynamic mode `aot: false`, as it requires the function to be static and known at compile time otherwise it will have a large performance impact.

## Trace

Trace uses a callback listener to ensure that callback function is finished before moving on to the next lifecycle event.

To use trace, you need to call `trace` method on the Elysia instance, and pass a callback function that will be executed for each life-cycle event.

You may listen to each lifecycle by adding `on` prefix followed by the lifecycle name, for example `onHandle` to listen to the handle event.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .trace(async ({ onHandle }) => {
        onHandle(({ begin, onStop }) => {
            onStop(({ end }) => {
                console.log('handle took', end - begin, 'ms')
            })
        })
    })
    .get('/', () => 'Hi')
    .listen(3000)
```

Please refer to **Life Cycle Events** for more information.

## Children

Every event except `handle` has **children**, which is an array of events that are executed inside for each lifecycle event.

You can use `onEvent` to listen to each child event in order:

```ts
import { Elysia } from 'elysia'

const sleep = (time = 1000) =>
    new Promise((resolve) => setTimeout(resolve, time))

const app = new Elysia()
    .trace(async ({ onBeforeHandle }) => {
        onBeforeHandle(({ total, onEvent }) => {
            console.log('total children:', total)

            onEvent(({ onStop }) => {
                onStop(({ elapsed }) => {
                    console.log('child took', elapsed, 'ms')
                })
            })
        })
    })
    .get('/', () => 'Hi', {
        beforeHandle: [
            function setup() {},
            async function delay() {
                await sleep()
            }
        ]
    })
    .listen(3000)
```

In this example, `total` children will be **2** because there are 2 children in the `beforeHandle` event.

Then we listen to each child event by using `onEvent` and print the duration of each child event.

## Trace Parameter

When each lifecycle is called:

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    // This is trace parameter
    // hover to view the type
    .trace((parameter) => {
    })
    .get('/', () => 'Hi')
    .listen(3000)
```

`trace` accepts the following parameters:

- **id** - `number` — Randomly generated unique ID for each request
- **context** - `Context` — Elysia's Context, e.g. `set`, `store`, `query`, `params`
- **set** - `Context.set` — Shortcut for `context.set`, to set headers or status of the context
- **store** - `Singleton.store` — Shortcut for `context.store`, to access data in the context
- **time** - `number` — Timestamp of when request is called
- **on[Event]** - `TraceListener` — An event listener for each life-cycle event

You may listen to the following life-cycle:

- **onRequest** — get notified of every new request
- **onParse** — array of functions to parse the body
- **onTransform** — transform request and context before validation
- **onBeforeHandle** — custom requirement to check before the main handler, can skip the main handler if response returned
- **onHandle** — function assigned to the path
- **onAfterHandle** — interact with the response before sending it back to the client
- **onMapResponse** — map returned value into a Web Standard Response
- **onError** — handle error thrown during processing request
- **onAfterResponse** — cleanup function after response is sent

## Trace Listener

A listener for each life-cycle event:

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .trace(({ onBeforeHandle }) => {
        // This is trace listener
        // hover to view the type
        onBeforeHandle((parameter) => {

        })
    })
    .get('/', () => 'Hi')
    .listen(3000)
```

Each lifecycle listener accepts the following:

- **name** - `string` — The name of the function. If the function is anonymous, the name will be `anonymous`
- **begin** - `number` — The time when the function is started
- **end** - `Promise<number>` — The time when the function is ended, will be resolved when the function is ended
- **error** - `Promise<Error | null>` — Error that was thrown in the lifecycle, will be resolved when the function is ended
- **onStop** - `callback?: (detail: TraceEndDetail) => any` — A callback that will be executed when the lifecycle is ended

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .trace(({ onBeforeHandle, set }) => {
        onBeforeHandle(({ onStop }) => {
            onStop(({ elapsed }) => {
                set.headers['X-Elapsed'] = elapsed.toString()
            })
        })
    })
    .get('/', () => 'Hi')
    .listen(3000)
```

> It's recommended to mutate context in this function as there's a lock mechanism to ensure the context is mutated successfully before moving on to the next lifecycle event.

## TraceEndDetail

A parameter that is passed to `onStop` callback:

- **end** - `number` — The time when the function is ended
- **error** - `Error | null` — Error that was thrown in the lifecycle
- **elapsed** - `number` — Elapsed time of the lifecycle, or `end - begin`

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/12_elysia_t.md

# TypeBox (Elysia.t)

Here's common patterns for writing validation types using `Elysia.t`.

## Primitive Type

The TypeBox API is designed around and is similar to TypeScript types.

There are many familiar names and behaviors that intersect with TypeScript counterparts, such as `String`, `Number`, `Boolean`, and `Object`, as well as more advanced features like `Intersect`, `KeyOf`, and `Tuple` for versatility.

If you are familiar with TypeScript, creating a TypeBox schema behaves the same as writing a TypeScript type, except it provides actual type validation at runtime.

To create your first schema, import `Elysia.t` from Elysia and start with the most basic type:

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .post('/', ({ body }) => `Hello ${body}`, {
        body: t.String()
    })
    .listen(3000)
```

This code tells Elysia to validate an incoming HTTP body, ensuring that the body is a string. If it is a string, it will be allowed to flow through the request pipeline and handler.

If the shape doesn't match, it will throw an error into the **Error Life Cycle**.

## Basic Type

TypeBox provides basic primitive types with the same behavior as TypeScript types.

The following table lists the most common basic types:

| TypeBox | TypeScript |
|---------|------------|
| `t.String()` | `string` |
| `t.Number()` | `number` |
| `t.Boolean()` | `boolean` |
| `t.Array(t.Number())` | `number[]` |
| `t.Object({ x: t.Number() })` | `{ x: number }` |
| `t.Null()` | `null` |
| `t.Literal(42)` | `42` |

Elysia extends all types from TypeBox, allowing you to reference most of the API from TypeBox for use in Elysia.

See **TypeBox's Type** for additional types supported by TypeBox.

## Attribute

TypeBox can accept arguments for more comprehensive behavior based on the JSON Schema 7 specification.

| TypeBox | TypeScript |
|---------|------------|
| `t.String({ format: 'email' })` | `saltyaom@elysiajs.com` |
| `t.Number({ minimum: 10, maximum: 100 })` | `10` |
| `t.Array(t.Number(), { minItems: 1, maxItems: 5 })` | `[1, 2, 3, 4, 5]` |
| `t.Object({ x: t.Number() }, { additionalProperties: true })` | `x: 100, y: 200` |

See **JSON Schema 7 specification** for more explanation of each attribute.

## Honorable Mentions

The following are common patterns often found useful when creating a schema.

### Union

Allows a field in `t.Object` to have multiple types.

```ts
t.Union([
    t.String(),
    t.Number()
])
```

TypeScript equivalent: `string | number`

### Optional

Allows a field in `t.Object` to be undefined or optional.

```ts
t.Object({
    x: t.Number(),
    y: t.Optional(t.Number())
})
```

TypeScript equivalent: `{ x: number, y?: number }`

### Partial

Allows all fields in `t.Object` to be optional.

```ts
t.Partial(
    t.Object({
        x: t.Number(),
        y: t.Number()
    })
)
```

TypeScript equivalent: `{ x?: number, y?: number }`

---

## Elysia Type

`Elysia.t` is based on TypeBox with pre-configuration for server usage, providing additional types commonly found in server-side validation.

You can find all the source code for Elysia types in `elysia/type-system`.

The following are types provided by Elysia:

### UnionEnum

`UnionEnum` allows the value to be one of the specified values.

```ts
t.UnionEnum(['rapi', 'anis', 1, true, false])
```

### File

A singular file, often useful for file upload validation.

```ts
t.File()
```

File extends the attributes of the base schema, with additional properties as follows:

**type** — Specifies the format of the file, such as image, video, or audio. If an array is provided, it will attempt to validate if any of the formats are valid.

```ts
type?: MaybeArray<string>
```

**minSize** — Minimum size of the file. Accepts a number in bytes or a suffix of file units:

```ts
minSize?: number | `${number}${'k' | 'm'}`
```

**maxSize** — Maximum size of the file. Accepts a number in bytes or a suffix of file units:

```ts
maxSize?: number | `${number}${'k' | 'm'}`
```

> **File Unit Suffix:**
> - `m`: MegaByte (1048576 byte)
> - `k`: KiloByte (1024 byte)

### Files

Extends from `File`, but adds support for an array of files in a single field.

```ts
t.Files()
```

Files extends the attributes of the base schema, array, and File.

### Cookie

Object-like representation of a Cookie Jar extended from the Object type.

```ts
t.Cookie({
    name: t.String()
})
```

Cookie extends the attributes of Object and Cookie with additional properties as follows:

**secrets** — The secret key for signing cookies. Accepts a string or an array of strings.

```ts
secrets?: string | string[]
```

If an array is provided, **Key Rotation** will be used. The newly signed value will use the first secret as the key.

### Nullable

Allows the value to be null but not undefined.

```ts
t.Nullable(t.String())
```

### MaybeEmpty

Allows the value to be null and undefined.

```ts
t.MaybeEmpty(t.String())
```

For additional information, you can find the full source code of the type system in `elysia/type-system`.

### Form

A syntax sugar for `t.Object` with support for verifying return value of form (`FormData`).

```ts
t.Form({
    someValue: t.File()
})
```

### UInt8Array

Accepts a buffer that can be parsed into a `Uint8Array`.

```ts
t.UInt8Array()
```

This is useful when you want to accept a buffer that can be parsed into a `Uint8Array`, such as in a binary file upload. It's designed to use for the validation of body with `arrayBuffer` parser to enforce the body type.

### ArrayBuffer

Accepts a buffer that can be parsed into an `ArrayBuffer`.

```ts
t.ArrayBuffer()
```

This is useful when you want to accept a buffer that can be parsed into an `ArrayBuffer`, such as in a binary file upload. It's designed to use for the validation of body with `arrayBuffer` parser to enforce the body type.

### ObjectString

Accepts a string that can be parsed into an object.

```ts
t.ObjectString()
```

This is useful when you want to accept a string that can be parsed into an object but the environment does not allow it explicitly, such as in a query string, header, or FormData body.

### BooleanString

Accepts a string that can be parsed into a boolean.

```ts
t.BooleanString()
```

Similar to `ObjectString`, this is useful when you want to accept a string that can be parsed into a boolean but the environment does not allow it explicitly.

### Numeric

Numeric accepts a numeric string or number and then transforms the value into a number.

```ts
t.Numeric()
```

This is useful when an incoming value is a numeric string, for example, a path parameter or query string.

Numeric accepts the same attributes as Numeric Instance.

---

## Elysia Behavior

Elysia uses TypeBox by default.

However, to help make handling HTTP easier, Elysia has some dedicated types and has some behavioral differences from TypeBox.

### Optional

To make a field optional, use `t.Optional`.

This will allow clients to optionally provide a query parameter. This behavior also applies to `body`, `headers`.

This is different from TypeBox where optional is to mark a field of an object as optional.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/optional', ({ query }) => query, {
        query: t.Optional(
            t.Object({
                name: t.String()
            })
        )
    })
```

### Number to Numeric

By default, Elysia will convert a `t.Number` to `t.Numeric` when provided as route schema.

Because parsed HTTP headers, query, and URL parameters are always strings. This means that even if a value is a number, it will be treated as a string.

Elysia overrides this behavior by checking if a string value looks like a number then converting it appropriately.

This is only applied when it is used as a route schema and not in a nested `t.Object`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/:id', ({ id }) => id, {
        params: t.Object({
            // Converted to t.Numeric()
            id: t.Number()
        }),
        body: t.Object({
            // NOT converted to t.Numeric()
            id: t.Number()
        })
    })

// NOT converted to t.Numeric()
t.Number()
```

### Boolean to BooleanString

Similar to Number to Numeric.

Any `t.Boolean` will be converted to `t.BooleanString`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/:id', ({ id }) => id, {
        params: t.Object({
            // Converted to t.BooleanString()
            id: t.Boolean()
        }),
        body: t.Object({
            // NOT converted to t.BooleanString()
            id: t.Boolean()
        })
    })

// NOT converted to t.BooleanString()
t.Boolean()
```

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/13_typescript.md

# TypeScript

Elysia has first-class support for TypeScript out of the box.

Most of the time, you wouldn't need to add any TypeScript annotations manually.

## Inference

Elysia infers the type of request and response based on the schema you provide.

```ts
import { Elysia, t } from 'elysia'
import { z } from 'zod'

const app = new Elysia()
    .post('/user/:id', ({ body }) => body, {
        body: t.Object({
            id: t.String()
        }),
        query: z.object({
            name: z.string()
        })
    })
```

Elysia can automatically infer types from schema like TypeBox and your favorite validation library like:

- Zod
- Valibot
- ArkType
- Effect Schema
- Yup
- Joi

## Schema to Type

All schema libraries supported by Elysia can be converted to TypeScript type.

**TypeBox:**

```ts
import { Elysia, t } from 'elysia'

const User = t.Object({
    id: t.String(),
    name: t.String()
})

type User = typeof User['static']
```

**Zod:**

```ts
import { z } from 'zod'

const User = z.object({
    id: z.string(),
    name: z.string()
})

type User = z.infer<typeof User>
```

**Valibot:**

```ts
import * as v from 'valibot'

const User = v.object({
    id: v.string(),
    name: v.string()
})

type User = v.InferOutput<typeof User>
```

**ArkType:**

```ts
import { type } from 'arktype'

const User = type({
    id: 'string',
    name: 'string'
})

type User = typeof User.infer
```

## Type Performance

Elysia is built with type inference performance in mind.

Before every release, we have a local benchmark to ensure that type inference is always snappy, fast, and doesn't blow up your IDE with "Type instantiation is excessively deep and possibly infinite" error.

Most of the time writing Elysia, you wouldn't encounter any type performance issue.

However, if you do, here is how to break down what's slowing down your type inference:

1. Navigate to the root of your project and run:

```bash
tsc --generateTrace trace --noEmit --incremental false
```

This should generate a `trace` folder in your project root.

2. Open [Perfetto UI](https://ui.perfetto.dev/) and drag the `trace/trace.json` file

It should show you a flame graph. Then you can find a chunk that takes a long time to be evaluated, click on it and it should show you how long the inference takes, and which file and line number it is coming from.

This should help you to identify the bottleneck of your type inference.

## Eden

If you are having a slow type inference issue when using Eden, you can try using a sub app of Elysia to isolate the type inference.

```ts
import { Elysia } from 'elysia'
import { plugin1, plugin2, plugin3 } from './plugin'

const app = new Elysia()
    .use([plugin1, plugin2, plugin3])
    .listen(3000)

export type app = typeof app

// Export sub app
export type subApp = typeof plugin1 // [!code highlight]
```

And on your frontend, you can import the sub app instead of the whole app.

```ts
import { treaty } from '@elysiajs/eden'
import type { subApp } from 'backend/src'

const api = treaty<subApp>('localhost:3000') // [!code highlight]
```

This should make your type inference faster as it doesn't need to evaluate the whole app.

See **Eden Treaty** to learn more about Eden.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/14_unit_test.md

# Unit Test

Being WinterTC compliant, we can use `Request` / `Response` classes to test an Elysia server.

Elysia provides the `Elysia.handle` method, which accepts a Web Standard `Request` and returns `Response`, simulating an HTTP Request.

Bun includes a built-in test runner that offers a Jest-like API through the `bun:test` module, facilitating the creation of unit tests.

Create `test/index.test.ts` in the root of the project directory with the following:

```ts
// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

describe('Elysia', () => {
    it('returns a response', async () => {
        const app = new Elysia().get('/', () => 'hi')

        const response = await app
            .handle(new Request('http://localhost/'))
            .then((res) => res.text())

        expect(response).toBe('hi')
    })
})
```

Then we can perform tests by running `bun test`:

```bash
bun test
```

> **Important:** New requests to an Elysia server must be a fully valid URL, **NOT** a part of a URL.

The request must provide the URL as follows:

| URL | Valid |
|-----|-------|
| `http://localhost/user` | ✅ |
| `/user` | ❌ |

We can also use other testing libraries like Jest to create Elysia unit tests.

## Eden Treaty Test

We may use Eden Treaty to create an end-to-end type safety test for Elysia server as follows:

```ts
// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import { treaty } from '@elysiajs/eden'

const app = new Elysia().get('/hello', 'hi')

const api = treaty(app)

describe('Elysia', () => {
    it('returns a response', async () => {
        const { data, error } = await api.hello.get()

        expect(data).toBe('hi')
    })
})
```

See **Eden Treaty Unit Test** for setup and more information.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/15_web_socket.md

# WebSocket

WebSocket is a real-time protocol for communication between your client and server.

Unlike HTTP where our client repeatedly asks the website for information and waits for a reply each time, WebSocket sets up a direct line where our client and server can send messages back and forth directly, making the conversation quicker and smoother without having to start over with each message.

SocketIO is a popular library for WebSocket, but it is not the only one. Elysia uses uWebSocket which Bun uses under the hood with the same API.

To use WebSocket, simply call `Elysia.ws()`:

```ts
import { Elysia } from 'elysia'

new Elysia()
    .ws('/ws', {
        message(ws, message) {
            ws.send(message)
        }
    })
    .listen(3000)
```

## WebSocket Message Validation

Same as normal routes, WebSockets also accept a schema object to strictly type and validate requests.

```ts
import { Elysia, t } from 'elysia'

const app = new Elysia()
    .ws('/ws', {
        // validate incoming message
        body: t.Object({
            message: t.String()
        }),
        query: t.Object({
            id: t.String()
        }),
        message(ws, { message }) {
            // Get schema from `ws.data`
            const { id } = ws.data.query
            ws.send({
                id,
                message,
                time: Date.now()
            })
        }
    })
    .listen(3000)
```

WebSocket schema can validate the following:

- **message** — An incoming message.
- **query** — Query string or URL parameters.
- **params** — Path parameters.
- **header** — Request's headers.
- **cookie** — Request's cookie.
- **response** — Value returned from handler.

By default Elysia will parse incoming stringified JSON message as Object for validation.

## Configuration

You can set Elysia constructor to set the WebSocket value.

```ts
import { Elysia } from 'elysia'

new Elysia({
    websocket: {
        idleTimeout: 30
    }
})
```

Elysia's WebSocket implementation extends Bun's WebSocket configuration, please refer to **Bun's WebSocket documentation** for more information.

The following is a brief configuration from Bun WebSocket:

### perMessageDeflate

`@default false`

Enable compression for clients that support it. By default, compression is disabled.

### maxPayloadLength

The maximum size of a message.

### idleTimeout

`@default 120`

After a connection has not received a message for this many seconds, it will be closed.

### backpressureLimit

`@default 16777216 (16MB)`

The maximum number of bytes that can be buffered for a single connection.

### closeOnBackpressureLimit

`@default false`

Close the connection if the backpressure limit is reached.

---

## Methods

Below are the new methods that are available to the WebSocket route.

### ws

Create a websocket handler.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .ws('/ws', {
        message(ws, message) {
            ws.send(message)
        }
    })
    .listen(3000)
```

**Type:**

```ts
.ws(endpoint: path, options: Partial<WebSocketHandler<Context>>): this
```

- **endpoint** — A path to be exposed as websocket handler
- **options** — Customize WebSocket handler behavior

---

## WebSocketHandler

`WebSocketHandler` extends config from config.

Below is a config which is accepted by `ws`.

### open

Callback function for new websocket connection.

**Type:**

```ts
open(ws: ServerWebSocket<{
    // uid for each connection
    id: string
    data: Context
}>): this
```

### message

Callback function for incoming websocket message.

**Type:**

```ts
message(
    ws: ServerWebSocket<{
        // uid for each connection
        id: string
        data: Context
    }>,
    message: Message
): this
```

`Message` type based on `schema.message`. Default is `string`.

### close

Callback function for closing websocket connection.

**Type:**

```ts
close(ws: ServerWebSocket<{
    // uid for each connection
    id: string
    data: Context
}>): this
```

### drain

Callback function for the server is ready to accept more data.

**Type:**

```ts
drain(
    ws: ServerWebSocket<{
        // uid for each connection
        id: string
        data: Context
    }>,
    code: number,
    reason: string
): this
```

### parse

Parse middleware to parse the request before upgrading the HTTP connection to WebSocket.

### beforeHandle

Before Handle middleware which executes before upgrading the HTTP connection to WebSocket.

Ideal place for validation.

### transform

Transform middleware which executes before validation.

### transformMessage

Like `transform`, but executes before validation of WebSocket message.

### header

Additional headers to add before upgrading connection to WebSocket.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/1_configuration.md

# Config

Elysia comes with a configurable behavior, allowing us to customize various aspects of its functionality.

We can define a configuration by using a constructor.

```ts
import { Elysia, t } from 'elysia'

new Elysia({
    prefix: '/v1',
    normalize: true
})
```

## adapter

> Since 1.1.11

Runtime adapter for using Elysia in different environments.

Defaults to appropriate adapter based on the environment.

```ts
import { Elysia, t } from 'elysia'
import { BunAdapter } from 'elysia/adapter/bun'

new Elysia({
    adapter: BunAdapter
})
```

## allowUnsafeValidationDetails

> Since 1.4.13

Whether Elysia should include unsafe validation details in the error response on production.

```ts
import { Elysia, t } from 'elysia'

new Elysia({
    allowUnsafeValidationDetails: true
})
```

By default, Elysia will omit all validation detail on production.

This is done to prevent leaking sensitive information about the validation schema, such as field names and expected types, which could be exploited by an attacker.

Ideally, this should only be enabled on public APIs as it may leak sensitive information about the server implementation.

**Options** - @default `false`

- `true` - Include unsafe validation details in the error response on production
- `false` - Exclude unsafe validation details in the error response on production

## aot

> Since 0.4.0

Ahead of Time compilation.

Elysia has a built-in JIT "compiler" that can optimize performance.

```ts
import { Elysia } from 'elysia'

new Elysia({
    aot: true
})
```

**Options** - @default `false`

- `true` - Precompile every route before starting the server
- `false` - Disable JIT entirely. Faster startup time without cost of performance

## detail

Define an OpenAPI schema for all routes of an instance.

This schema will be used to generate OpenAPI documentation for all routes of an instance.

```ts
import { Elysia } from 'elysia'

new Elysia({
    detail: {
        hide: true,
        tags: ['elysia']
    }
})
```

## encodeSchema

Handle custom `t.Transform` schemas with custom Encode before returning the response to client.

This allows us to create custom encode functions for your data before sending response to the client.

```ts
import { Elysia, t } from 'elysia'

new Elysia({ encodeSchema: true })
```

**Options** - @default `true`

- `true` - Run Encode before sending the response to client
- `false` - Skip Encode entirely

## name

Define the name of an instance which is used for debugging and **Plugin Deduplication**.

```ts
import { Elysia } from 'elysia'

new Elysia({
    name: 'service.thing'
})
```

## nativeStaticResponse

> Since 1.1.11

Use optimized functions for handling inline values for each respective runtime.

```ts
import { Elysia } from 'elysia'

new Elysia({
    nativeStaticResponse: true
})
```

### Example

If enabled on Bun, Elysia will insert inline value into `Bun.serve.static` improving performance for static value.

```ts
import { Elysia } from 'elysia'

// This
new Elysia({
    nativeStaticResponse: true
}).get('/version', 1)

// is an equivalent to
Bun.serve({
    static: {
        '/version': new Response(1)
    }
})
```

## normalize

> Since 1.1.0

Whether Elysia should coerce fields into a specified schema.

```ts
import { Elysia, t } from 'elysia'

new Elysia({
    normalize: true
})
```

When unknown properties that are not specified in schema are found on either input and output, how should Elysia handle the field?

**Options** - @default `true`

- `true`: Elysia will coerce fields into a specified schema using exact mirror
- `typebox`: Elysia will coerce fields into a specified schema using TypeBox's `Value.Clean`
- `false`: Elysia will raise an error if a request or response contains fields that are not explicitly allowed in the schema of the respective handler.

## precompile

> Since 1.0.0

Whether Elysia should precompile all routes ahead of time before starting the server.

```ts
import { Elysia } from 'elysia'

new Elysia({
    precompile: true
})
```

**Options** - @default `false`

- `true`: Run JIT on all routes before starting the server
- `false`: Dynamically compile routes on demand

It's recommended to leave it as `false`.

## prefix

Define a prefix for all routes of an instance.

```ts
import { Elysia, t } from 'elysia'

new Elysia({
    prefix: '/v1'
})
```

When prefix is defined, all routes will be prefixed with the given value.

### Example

```ts
import { Elysia, t } from 'elysia'

new Elysia({ prefix: '/v1' }).get('/name', 'elysia') // Path is /v1/name
```

## sanitize

A function or an array of functions that calls and intercepts on every `t.String` while validation.

Allowing us to read and transform strings into new values.

```ts
import { Elysia, t } from 'elysia'

new Elysia({
    sanitize: (value) => Bun.escapeHTML(value)
})
```

## seed

Define a value that will be used to generate checksum of an instance, used for **Plugin Deduplication**.

```ts
import { Elysia } from 'elysia'

new Elysia({
    seed: {
        value: 'service.thing'
    }
})
```

The value could be any type not limited to string, number, or object.

## strictPath

Whether Elysia should handle paths strictly.

According to RFC 3986, a path should be strictly equal to the path defined in the route.

```ts
import { Elysia, t } from 'elysia'

new Elysia({ strictPath: true })
```

**Options** - @default `false`

- `true` - Follows RFC 3986 for path matching strictly
- `false` - Tolerate suffix `/` or vice-versa.

### Example

```ts
import { Elysia, t } from 'elysia'

// Path can be either /name or /name/
new Elysia({ strictPath: false }).get('/name', 'elysia')

// Path can be only /name
new Elysia({ strictPath: true }).get('/name', 'elysia')
```

## serve

Customize HTTP server behavior.

Bun serve configuration.

```ts
import { Elysia } from 'elysia'

new Elysia({
    serve: {
        hostname: 'elysiajs.com',
        tls: {
            cert: Bun.file('cert.pem'),
            key: Bun.file('key.pem')
        }
    },
})
```

This configuration extends Bun Serve API and Bun TLS.

### Example: Max body size

We can set the maximum body size by setting `serve.maxRequestBodySize` in the serve configuration.

```ts
import { Elysia } from 'elysia'

new Elysia({
    serve: {
        maxRequestBodySize: 1024 * 1024 * 256 // 256MB
    }
})
```

By default the maximum request body size is 128MB (`1024 * 1024 * 128`). Define body size limit.

```ts
import { Elysia } from 'elysia'

new Elysia({
    serve: {
        // Maximum message size (in bytes)
        maxPayloadLength: 64 * 1024,
    }
})
```

### Example: HTTPS / TLS

We can enable TLS (known as successor of SSL) by passing in a value for `key` and `cert`; both are required to enable TLS.

```ts
import { Elysia, file } from 'elysia'

new Elysia({
    serve: {
        tls: {
            cert: file('cert.pem'),
            key: file('key.pem')
        }
    }
})
```

### Example: Increase timeout

We can increase the idle timeout by setting `serve.idleTimeout` in the serve configuration.

```ts
import { Elysia } from 'elysia'

new Elysia({
    serve: {
        // Increase idle timeout to 60 seconds
        idleTimeout: 60
    }
})
```

By default the idle timeout is 30 seconds.

## serve properties

HTTP server configuration.

Elysia extends Bun configuration which supports TLS out of the box, powered by BoringSSL.

See `serve.tls` for available configuration.

### serve.hostname

@default `0.0.0.0`

Set the hostname which the server listens on.

### serve.id

Uniquely identify a server instance with an ID.

This string will be used to hot reload the server without interrupting pending requests or websockets. If not provided, a value will be generated. To disable hot reloading, set this value to `null`.

### serve.idleTimeout

@default `30` (30 seconds)

By default, Elysia sets idle timeout to 30 seconds, which means that if a request is not completed within 30 seconds, it will be aborted.

### serve.maxRequestBodySize

@default `1024 * 1024 * 128` (128MB)

Set the maximum size of a request body (in bytes).

### serve.port

@default `3000`

Port to listen on.

### serve.rejectUnauthorized

@default `NODE_TLS_REJECT_UNAUTHORIZED` environment variable

If set to `false`, any certificate is accepted.

### serve.reusePort

@default `true`

If the `SO_REUSEPORT` flag should be set.

This allows multiple processes to bind to the same port, which is useful for load balancing.

This configuration is overridden and turns on by default by Elysia.

### serve.unix

If set, the HTTP server will listen on a unix socket instead of a port.

(Cannot be used with hostname+port)

### serve.tls

We can enable TLS (known as successor of SSL) by passing in a value for `key` and `cert`; both are required to enable TLS.

```ts
import { Elysia, file } from 'elysia'

new Elysia({
    serve: {
        tls: {
            cert: file('cert.pem'),
            key: file('key.pem')
        }
    }
})
```

Elysia extends Bun configuration which supports TLS out of the box, powered by BoringSSL.

### serve.tls.ca

Optionally override the trusted CA certificates. Default is to trust the well-known CAs curated by Mozilla.

Mozilla's CAs are completely replaced when CAs are explicitly specified using this option.

### serve.tls.cert

Cert chains in PEM format. One cert chain should be provided per private key.

Each cert chain should consist of the PEM formatted certificate for a provided private key, followed by the PEM formatted intermediate certificates (if any), in order, and not including the root CA (the root CA must be pre-known to the peer, see `ca`).

When providing multiple cert chains, they do not have to be in the same order as their private keys in `key`.

If the intermediate certificates are not provided, the peer will not be able to validate the certificate, and the handshake will fail.

### serve.tls.dhParamsFile

File path to a `.pem` file custom Diffie Helman parameters.

### serve.tls.key

Private keys in PEM format. PEM allows the option of private keys being encrypted. Encrypted keys will be decrypted with `options.passphrase`.

Multiple keys using different algorithms can be provided either as an array of unencrypted key strings or buffers, or an array of objects in the form.

The object form can only occur in an array.

`object.passphrase` is optional. Encrypted keys will be decrypted with `object.passphrase` if provided, or `options.passphrase` if it is not.

### serve.tls.lowMemoryMode

@default `false`

This sets `OPENSSL_RELEASE_BUFFERS` to 1.

It reduces overall performance but saves some memory.

### serve.tls.passphrase

Shared passphrase for a single private key and/or a PFX.

### serve.tls.requestCert

@default `false`

If set to `true`, the server will request a client certificate.

### serve.tls.secureOptions

Optionally affect the OpenSSL protocol behavior, which is not usually necessary.

This should be used carefully if at all!

Value is a numeric bitmask of the `SSL_OP_*` options from OpenSSL Options.

### serve.tls.serverName

Explicitly set a server name.

## tags

Define tags for OpenAPI schema for all routes of an instance similar to `detail`.

```ts
import { Elysia } from 'elysia'

new Elysia({
    tags: ['elysia']
})
```

## systemRouter

Use runtime/framework provided router if possible.

On Bun, Elysia will use `Bun.serve.routes` and fallback to Elysia's own router.

## websocket

Override websocket configuration.

Recommended to leave this as default as Elysia will generate suitable configuration for handling WebSocket automatically.

This configuration extends Bun's WebSocket API.

### Example

```ts
import { Elysia } from 'elysia'

new Elysia({
    websocket: {
        // enable compression and decompression
        perMessageDeflate: true
    }
})
```

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/2_cookie.md

# Cookie

Elysia provides a mutable signal for interacting with Cookie.

There's no get/set, you can extract the cookie name and retrieve or update its value directly.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        // Get
        name.value

        // Set
        name.value = "New Value"
    })
```

By default, Reactive Cookie can automatically encode/decode object types allowing us to treat cookies as objects without worrying about the encoding/decoding. It just works.

> **WARNING**:
> You may get a warning when using `cookie.name` as it might be undefined.
> Elysia cookie can never be undefined because it's a Proxy object. `cookie` is always defined, only its value (via `cookie.value`) can be undefined.
> This can be fixed by using a cookie schema or disabling `strictNullChecks` in `tsconfig.json`.

## Reactivity

The Elysia cookie is reactive. This means that when you change the cookie value, the cookie will be updated automatically based on an approach like signals.

A single source of truth for handling cookies is provided by Elysia cookies, which have the ability to automatically set headers and sync cookie values.

Since cookies are Proxy-dependent objects by default, the extract value can never be undefined; instead, it will always be a value of `Cookie<unknown>`, which can be obtained by invoking the `.value` property.

We can treat the cookie jar as a regular object, iteration over it will only iterate over an already-existing cookie value.

## Cookie Attribute

To use Cookie attributes, you can use one of the following:

- Setting the property directly
- Using `set` or `add` to update cookie properties.

See cookie attribute config for more information.

### Assign Property

You can get/set properties of a cookie like any normal object, the reactivity model synchronizes the cookie value automatically.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        // get
        name.domain

        // set
        name.domain = 'millennium.sh'
        name.httpOnly = true
    })
```

### set

`set` permits updating multiple cookie properties all at once through reset all property and overwrite the property with a new value.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        name.set({
            domain: 'millennium.sh',
            httpOnly: true
        })
    })
```

### add

Like `set`, `add` allows us to update multiple cookie properties at once, but instead will only overwrite the properties defined instead of resetting.

### remove

To remove a cookie, you can use either:

- `name.remove`
- `delete cookie.name`

```ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ cookie, cookie: { name } }) => {
        name.remove()

        delete cookie.name
    })
```

## Cookie Schema

You can strictly validate cookie type and provide type inference for cookies by using cookie schema with `t.Cookie`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        // Set
        name.value = {
            id: 617,
            name: 'Summoning 101'
        }
    }, {
        cookie: t.Cookie({
            name: t.Object({
                id: t.Numeric(),
                name: t.String()
            })
        })
    })
```

### Nullable Cookie

To handle nullable cookie value, you can use `t.Optional` on the cookie name you want to be nullable.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        // Set
        name.value = {
            id: 617,
            name: 'Summoning 101'
        }
    }, {
        cookie: t.Cookie({
            name: t.Optional(
                t.Object({
                    id: t.Numeric(),
                    name: t.String()
                })
            )
        })
    })
```

## Cookie Signature

With the introduction of Cookie Schema and `t.Cookie` type, we can create a unified type for handling sign/verify cookie signature automatically.

Cookie signature is a cryptographic hash appended to a cookie's value, generated using a secret key and the content of the cookie to enhance security by adding a signature to the cookie.

This makes sure that the cookie value is not modified by malicious actors, helping verify the authenticity and integrity of the cookie data.

### Using Cookie Signature

By providing a cookie secret and `sign` property to indicate which cookie should have signature verification.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { profile } }) => {
        profile.value = {
            id: 617,
            name: 'Summoning 101'
        }
    }, {
        cookie: t.Cookie({
            profile: t.Object({
                id: t.Numeric(),
                name: t.String()
            })
        }, {
            secrets: 'Fischl von Luftschloss Narfidort',
            sign: ['profile']
        })
    })
```

Elysia then sign and unsign cookie value automatically.

### Constructor

You can use Elysia constructor to set global cookie secret and sign values to apply to all routes globally instead of inlining to every route you need.

```ts
import { Elysia, t } from 'elysia'

new Elysia({
    cookie: {
        secrets: 'Fischl von Luftschloss Narfidort',
        sign: ['profile']
    }
})
    .get('/', ({ cookie: { profile } }) => {
        profile.value = {
            id: 617,
            name: 'Summoning 101'
        }
    }, {
        cookie: t.Cookie({
            profile: t.Object({
                id: t.Numeric(),
                name: t.String()
            })
        })
    })
```

## Cookie Rotation

Elysia handles cookie secret rotation automatically.

Cookie Rotation is a migration technique to sign a cookie with a newer secret, while also being able to verify the old signature of the cookie.

```ts
import { Elysia } from 'elysia'

new Elysia({
    cookie: {
        secrets: ['Vengeance will be mine', 'Fischl von Luftschloss Narfidort']
    }
})
```

### Unsigned Cookie Transition

Elysia supports graceful transition from unsigned to signed cookies.

By setting `null` in an array of `cookie.secrets`, Elysia will allow unsigned cookies to pass through while checking invalid cookie signatures when available.

```ts
import { Elysia } from 'elysia'

new Elysia({
    cookie: {
        secrets: ['Vengeance will be mine', 'Fischl von Luftschloss Narfidort', null]
    }
})
```

Elysia will then use the first secrets to sign the new cookie allowing graceful transition.

It's recommended to only allow unsigned cookies during the transition period to prevent unsafe cookies from occurring.

## Config

Below is a cookie config accepted by Elysia.

### secret

The secret key for signing/verifying cookies.

If an array is passed, it will use **Key Rotation**.

Key rotation is when an encryption key is retired and replaced by generating a new cryptographic key.

Below is a config that extends from cookie:

### domain

Specifies the value for the `Domain` Set-Cookie attribute.

By default, no domain is set, and most clients will consider the cookie to apply to only the current domain.

### encode

@default `encodeURIComponent`

Specifies a function that will be used to encode a cookie value.

Since the value of a cookie has a limited character set (and must be a simple string), this function can be used to encode a value into a string suited for a cookie value.

The default function is the global `encodeURIComponent`, which will encode a JavaScript string into UTF-8 byte sequences and then URL-encode any that fall outside of the cookie range.

### expires

Specifies the `Date` object to be the value for the `Expires` Set-Cookie attribute.

By default, no expiration is set, and most clients will consider this a "non-persistent cookie" and will delete it on conditions like exiting a web browser application.

> **TIP**:
> The cookie storage model specification states that if both `expires` and `maxAge` are set, then `maxAge` takes precedence, but not all clients may obey this, so if both are set, they should point to the same date and time.

### httpOnly

@default `false`

Specifies the boolean value for the `HttpOnly` Set-Cookie attribute.

When truthy, the `HttpOnly` attribute is set, otherwise, it is not.

By default, the `HttpOnly` attribute is not set.

> **TIP**:
> Be careful when setting this to `true`, as compliant clients will not allow client-side JavaScript to see the cookie in `document.cookie`.

### maxAge

@default `undefined`

Specifies the number (in seconds) to be the value for the `Max-Age` Set-Cookie attribute.

The given number will be converted to an integer by rounding down. By default, no maximum age is set.

> **TIP**:
> The cookie storage model specification states that if both `expires` and `maxAge` are set, then `maxAge` takes precedence, but not all clients may obey this, so if both are set, they should point to the same date and time.

### path

Specifies the value for the `Path` Set-Cookie attribute.

By default, the path handler is considered the default path.

### priority

Specifies the string to be the value for the `Priority` Set-Cookie attribute.

- `low` will set the Priority attribute to Low.
- `medium` will set the Priority attribute to Medium, the default priority when not set.
- `high` will set the Priority attribute to High.

More information about the different priority levels can be found in the specification.

> **TIP**:
> This is an attribute that has not yet been fully standardized and may change in the future. This also means many clients may ignore this attribute until they understand it.

### sameSite

Specifies the boolean or string to be the value for the `SameSite` Set-Cookie attribute.

- `true` will set the SameSite attribute to `Strict` for strict same-site enforcement.
- `false` will not set the SameSite attribute.
- `'lax'` will set the SameSite attribute to `Lax` for lax same-site enforcement.
- `'none'` will set the SameSite attribute to `None` for an explicit cross-site cookie.
- `'strict'` will set the SameSite attribute to `Strict` for strict same-site enforcement.

More information about the different enforcement levels can be found in the specification.

> **TIP**:
> This is an attribute that has not yet been fully standardized and may change in the future. This also means many clients may ignore this attribute until they understand it.

### secure

Specifies the boolean value for the `Secure` Set-Cookie attribute. When truthy, the `Secure` attribute is set, otherwise, it is not. By default, the `Secure` attribute is not set.

> **TIP**:
> Be careful when setting this to `true`, as compliant clients will not send the cookie back to the server in the future if the browser does not have an HTTPS connection.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/3_deploy_to_production.md

# Deploy to Production

This page provides a guide on how to deploy Elysia to production.

## Cluster Mode

Elysia is single-threaded by default. To take advantage of multi-core CPU, we can run Elysia in cluster mode.

Let's create an `index.ts` file that imports our main server from `server.ts` and fork multiple workers based on the number of CPU cores available.

```ts
// src/index.ts
import cluster from 'node:cluster'
import os from 'node:os'
import process from 'node:process'

if (cluster.isPrimary) {
    for (let i = 0; i < os.availableParallelism(); i++)
        cluster.fork()
} else {
    await import('./server')
    console.log(`Worker ${process.pid} started`)
}
```

```ts
// src/server.ts
import { Elysia } from 'elysia'

new Elysia()
    .get('/', 'Hello Elysia')
    .listen(3000)
```

This will ensure that Elysia is running on multiple CPU cores.

> **TIP**:
> Elysia on Bun uses `SO_REUSEPORT` by default, which allows multiple instances to listen on the same port. This only works on Linux.

## Compile to Binary

We recommend running the build command before deploying to production as it could potentially reduce memory usage and file size significantly.

We recommend compiling Elysia into a single binary using the command as follows:

```bash
bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    src/index.ts
```

This will generate a portable binary `server` which we can run to start our server.

Compiling server to binary usually significantly reduces memory usage by 2-3x compared to development environment.

This command is a bit long, so let's break it down:

- `--compile` Compile TypeScript to binary
- `--minify-whitespace` Remove unnecessary whitespace
- `--minify-syntax` Minify JavaScript syntax to reduce file size
- `--target bun` Optimize the binary for Bun runtime
- `--outfile server` Output the binary as `server`
- `src/index.ts` The entry file of our server (codebase)

To start our server, simply run the binary.

```bash
./server
```

Once binary is compiled, you don't need Bun installed on the machine to run the server.

This is great as the deployment server doesn't need to install an extra runtime to run making binary portable.

### Target

You can also add a `--target` flag to optimize the binary for the target platform.

```bash
bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun-linux-x64 \
    --outfile server \
    src/index.ts
```

Here's a list of available targets:

| Target                 | Operating System | Architecture | Modern | Baseline | Libc  |
|------------------------|------------------|--------------|--------|----------|-------|
| bun-linux-x64          | Linux            | x64          | ✅     | ✅       | glibc |
| bun-linux-arm64        | Linux            | arm64        | ✅     | N/A      | glibc |
| bun-windows-x64        | Windows          | x64          | ✅     | ✅       | -     |
| bun-windows-arm64      | Windows          | arm64        | ❌     | ❌       | -     |
| bun-darwin-x64         | macOS            | x64          | ✅     | ✅       | -     |
| bun-darwin-arm64       | macOS            | arm64        | ✅     | N/A      | -     |
| bun-linux-x64-musl     | Linux            | x64          | ✅     | ✅       | musl  |
| bun-linux-arm64-musl   | Linux            | arm64        | ✅     | N/A      | musl  |

### Why not --minify

Bun has a `--minify` flag that will minify the binary.

However if we are using OpenTelemetry, it will reduce a function name to a single character.

This makes tracing harder than it should as OpenTelemetry relies on function names.

However, if you're not using OpenTelemetry, you may opt in for `--minify` instead:

```bash
bun build \
    --compile \
    --minify \
    --outfile server \
    src/index.ts
```

### Permission

Some Linux distributions might not be able to run the binary, we suggest enabling execute permissions on the binary if you're on Linux:

```bash
chmod +x ./server

./server
```

### Unknown random Chinese error

If you're trying to deploy a binary to your server but are unable to run it and are receiving random Chinese character errors.

It means that the machine you're running on doesn't support AVX2.

Unfortunately, Bun requires a machine that has AVX2 hardware support.

There's no known workaround.

## Compile to JavaScript

If you are unable to compile to a binary or you are deploying on a Windows server.

You may bundle your server to a JavaScript file instead.

```bash
bun build \
    --minify-whitespace \
    --minify-syntax \
    --outfile ./dist/index.js \
    src/index.ts
```

This will generate a single portable JavaScript file that you can deploy on your server.

```bash
NODE_ENV=production bun ./dist/index.js
```

## Docker

On Docker, we recommend always compiling to a binary to reduce base image overhead.

Here's an example image using the Distroless image with a binary.

```dockerfile
FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install

COPY ./src ./src

ENV NODE_ENV=production

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --outfile server \
    src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000
```

## OpenTelemetry

If you are using OpenTelemetry to deploy production server.

As OpenTelemetry relies on monkey-patching `node_modules/<library>`. It's required to make instrumentations work properly, we need to specify libraries to be instrumented as an external module to exclude it from being bundled.

For example, if you are using `@opentelemetry/instrumentation-pg` to instrument the `pg` library. We need to exclude `pg` from being bundled and make sure that it is importing `node_modules/pg`.

To make this work, we may specify `pg` as an external module with `--external pg`:

```bash
bun build --compile --external pg --outfile server src/index.ts
```

This tells bun not to bundle `pg` into the final output file, and will be imported from the `node_modules` directory at runtime. So on a production server, you must also keep the `node_modules` directory.

It's recommended to specify packages that should be available in a production server as `dependencies` in `package.json` and use `bun install --production` to install only production dependencies.

```json
{
    "dependencies": {
        "pg": "^8.15.6"
    },
    "devDependencies": {
        "@elysiajs/opentelemetry": "^1.2.0",
        "@opentelemetry/instrumentation-pg": "^0.52.0",
        "@types/pg": "^8.11.14",
        "elysia": "^1.2.25"
    }
}
```

Then after running a build command, on a production server:

```bash
bun install --production
```

If the `node_modules` directory still includes development dependencies, you may remove the `node_modules` directory and reinstall production dependencies again.

## Monorepo

If you are using Elysia with Monorepo, you may need to include dependent packages.

If you are using Turborepo, you may place a Dockerfile inside your apps directory like `apps/server/Dockerfile`. This also applies to other monorepo managers such as Lerna, etc.

Assuming that our monorepo uses Turborepo with structure as follows:

```
apps
  server
    Dockerfile (place a Dockerfile here)
packages
  config
```

Then we can build our Dockerfile on monorepo root (not app root):

```bash
docker build -f apps/server/Dockerfile -t elysia-mono .
```

With Dockerfile as follows:

```dockerfile
FROM oven/bun:1 AS build

WORKDIR /app

# Cache packages
COPY package.json package.json
COPY bun.lock bun.lock

COPY /apps/server/package.json ./apps/server/package.json
COPY /packages/config/package.json ./packages/config/package.json

RUN bun install

COPY /apps/server ./apps/server
COPY /packages/config ./packages/config

ENV NODE_ENV=production

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --outfile server \
    src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000
```

## Railway

Railway is one of the popular deployment platforms.

Railway assigns a random port to expose for each deployment, which can be accessed via the `PORT` environment variable.

We need to modify our Elysia server to accept the `PORT` environment variable to comply with Railway port.

Instead of a fixed port, we may use `process.env.PORT` and provide a fallback on development instead.

```ts
new Elysia()
    // .listen(3000) // ❌
    .listen(process.env.PORT ?? 3000) // ✅
```

This should allow Elysia to intercept port provided by Railway.

> **TIP**:
> Elysia assigns the hostname to `0.0.0.0` automatically, which works with Railway.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/4_error_handling.md

# Error Handling

This page provides a more advanced guide for effectively handling errors with Elysia.

If you haven't read "Life Cycle (onError)" yet, we recommend you to read it first.

## Custom Validation Message

When defining a schema, you can provide a custom validation message for each field.

This message will be returned as-is when the validation fails.

```ts
import { Elysia, t } from 'elysia'

new Elysia().get('/:id', ({ params: { id } }) => id, {
    params: t.Object({
        id: t.Number({
            error: 'id must be a number'
        })
    })
})
```

If the validation fails on the `id` field, the response will be returned as `id must be a number`.

```
GET /string

id must be a number
```

## Validation Detail

Returning a value from `schema.error` will return the validation as-is, but sometimes you may also want to return the validation details, such as the field name and the expected type.

You can do this by using the `validationDetail` option.

```ts
import { Elysia, validationDetail, t } from 'elysia'

new Elysia().get('/:id', ({ params: { id } }) => id, {
    params: t.Object({
        id: t.Number({
            error: validationDetail('id must be a number')
        })
    })
})
```

This will include all of the validation details in the response, such as the field name and the expected type.

But if you plan to use `validationDetail` in every field, adding it manually can be annoying.

You can automatically add validation detail by handling it in `onError` hook.

```ts
new Elysia()
    .onError(({ error, code }) => {
        if (code === 'VALIDATION') return error.detail(error.message)
    })
    .get('/:id', ({ params: { id } }) => id, {
        params: t.Object({
            id: t.Number({
                error: 'id must be a number'
            })
        })
    })
    .listen(3000)
```

This will apply every validation error with a custom message with custom validation message.

### Validation Detail on Production

By default, Elysia will omit all validation detail if `NODE_ENV` is `production`.

This is done to prevent leaking sensitive information about the validation schema, such as field names and expected types, which could be exploited by an attacker.

Elysia will only return that validation failed without any details.

```json
{
    "type": "validation",
    "on": "body",
    "found": {},
    // Only shown for custom error
    "message": "x must be a number"
}
```

The `message` property is optional and is omitted by default unless you provide a custom error message in the schema.

This can be overridden by setting `Elysia.allowUnsafeValidationDetails` to `true`, see Elysia configuration for more details.

## Custom Error

Elysia supports custom errors both in the type-level and implementation level.

By default, Elysia has a set of built-in error types like `VALIDATION`, `NOT_FOUND` which will narrow down the type automatically.

If Elysia doesn't know the error, the error code will be `UNKNOWN` with default status of `500`.

But you can also add a custom error with type safety with `Elysia.error` which will help narrow down the error type for full type safety with auto-complete, and custom status code as follows:

```ts
import { Elysia } from 'elysia'

class MyError extends Error {
    constructor(public message: string) {
        super(message)
    }
}

new Elysia()
    .error({
        MyError
    })
    .onError(({ code, error }) => {
        switch (code) {
            // With auto-completion
            case 'MyError':
                // With type narrowing
                // Hover to see error is typed as `MyError`
                return error
        }
    })
    .get('/:id', () => {
        throw new MyError('Hello Error')
    })
```

### Custom Status Code

You can also provide a custom status code for your custom error by adding `status` property in your custom error class.

```ts
import { Elysia } from 'elysia'

class MyError extends Error {
    status = 418

    constructor(public message: string) {
        super(message)
    }
}
```

Elysia will then use this status code when the error is thrown.

Otherwise you can also set the status code manually in the `onError` hook.

```ts
import { Elysia } from 'elysia'

class MyError extends Error {
    constructor(public message: string) {
        super(message)
    }
}

new Elysia()
    .error({
        MyError
    })
    .onError(({ code, error, status }) => {
        switch (code) {
            case 'MyError':
                return status(418, error.message)
        }
    })
    .get('/:id', () => {
        throw new MyError('Hello Error')
    })
```

### Custom Error Response

You can also provide a custom `toResponse` method in your custom error class to return a custom response when the error is thrown.

```ts
import { Elysia } from 'elysia'

class MyError extends Error {
    status = 418

    constructor(public message: string) {
        super(message)
    }

    toResponse() {
        return Response.json({
            error: this.message,
            code: this.status
        }, {
            status: 418
        })
    }
}
```

## To Throw or Return

Most error handling in Elysia can be done by throwing an error and will be handled in `onError`.

But for `status` it can be a little bit confusing, since it can be used both as a return value or throw an error.

It could either be `return` or `throw` based on your specific needs.

- If a status is **throw**, it **will** be caught by `onError` middleware.
- If a status is **return**, it will **NOT** be caught by `onError` middleware.

See the following code:

```ts
import { Elysia } from 'elysia'

new Elysia()
    .onError(({ code, error, path }) => {
        if (code === 418) return 'caught'
    })
    .get('/throw', ({ status }) => {
        // This will be caught by onError
        throw status(418)
    })
    .get('/return', ({ status }) => {
        // This will NOT be caught by onError
        return status(418)
    })
```

Here we use `status(418)` which is the "I'm a teapot" status code. You can also use the string name directly: `status("I'm a teapot")`. See **Status** for more on using status codes.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/5_extend_context.md

# Extend Context

Elysia provides a minimal Context by default, allowing us to extend Context for our specific need using `state`, `decorate`, `derive`, and `resolve`.

Elysia allows us to extend Context for various use cases like:

- Extracting user ID as variable
- Injecting a common repository pattern
- Adding a database connection

We may extend Elysia's context by using the following APIs to customize the Context:

- **state** - a global mutable state
- **decorate** - additional property assigned to Context
- **derive / resolve** - create a new value from existing property

## When to Extend Context

You should only extend context when:

- A property is a global mutable state, and shared across multiple routes using `state`
- If a property is associated with a request or response using `decorate`
- A property is derived from an existing property using `derive` / `resolve`

Otherwise, we recommend defining a value or function separately than extending the context.

> **TIP**:
> It's recommended to assign properties related to request and response, or frequently used functions to Context for separation of concerns.

## State

State is a global mutable object or state shared across the Elysia app.

Once `state` is called, value will be added to `store` property once at call time, and can be used in handler.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .state('version', 1)
    .get('/a', ({ store: { version } }) => version)
    .get('/b', ({ store }) => store)
    .get('/c', () => 'still ok')
    .listen(3000)
```

```
GET /a

1
```

### When to use

- When you need to share a primitive mutable value across multiple routes
- If you want to use a non-primitive or a wrapper value or class that mutate an internal state, use `decorate` instead.

### Key takeaway

- `store` is a representation of a single-source-of-truth global mutable object for the entire Elysia app.
- `state` is a function to assign an initial value to `store`, which could be mutated later.
- Make sure to assign a value before using it in a handler.

```ts
import { Elysia } from 'elysia'

new Elysia()
    // ❌ TypeError: counter doesn't exist in store
    .get('/error', ({ store }) => store.counter)
    // Property 'counter' does not exist on type '{}'.
    .state('counter', 0)
    // ✅ Because we assigned a counter before, we can now access it
    .get('/', ({ store }) => store.counter)
```

> **TIP**:
> Beware that we cannot use a state value before assign.

Elysia registers state values into the store automatically without explicit type or additional TypeScript generic needed.

### Reference and Value Gotcha

To mutate the state, it's recommended to use **reference** to mutate rather than using an actual value.

When accessing the property from JavaScript, if we define a primitive value from an object property as a new value, the reference is lost, the value is treated as new separate value instead.

For example:

```ts
const store = {
    counter: 0
}

store.counter++
console.log(store.counter) // ✅ 1
```

We can use `store.counter` to access and mutate the property.

However, if we define a counter as a new value:

```ts
const store = {
    counter: 0
}

let counter = store.counter

counter++
console.log(store.counter) // ❌ 0
console.log(counter) // ✅ 1
```

Once a primitive value is redefined as a new variable, the reference "link" will be missing, causing unexpected behavior.

This can apply to `store`, as it's a global mutable object instead.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .state('counter', 0)
    // ✅ Using reference, value is shared
    .get('/', ({ store }) => store.counter++)
    // ❌ Creating a new variable on primitive value, the link is lost
    .get('/error', ({ store: { counter } }) => counter)
```

## Decorate

`decorate` assigns an additional property to Context directly at call time.

```ts
import { Elysia } from 'elysia'

class Logger {
    log(value: string) {
        console.log(value)
    }
}

new Elysia()
    .decorate('logger', new Logger())
    // ✅ defined from the previous line
    .get('/', ({ logger }) => {
        logger.log('hi')

        return 'hi'
    })
```

### When to use

- A constant or readonly value object to Context
- Non-primitive value or class that may contain internal mutable state
- Additional functions, singletons, or immutable property to all handlers.

### Key takeaway

- Unlike `state`, decorated value **SHOULD NOT** be mutated although it's possible
- Make sure to assign a value before using it in a handler.

## Derive

> ⚠️ Derive doesn't handle type integrity, you might want to use `resolve` instead.

Retrieve values from existing properties in Context and assign new properties.

Derive assigns when request happens at **transform** lifecycle allowing us to "derive" (create new properties from existing properties).

```ts
import { Elysia } from 'elysia'

new Elysia()
    .derive(({ headers }) => {
        const auth = headers['authorization']

        return {
            bearer: auth?.startsWith('Bearer ') ? auth.slice(7) : null
        }
    })
    .get('/', ({ bearer }) => bearer)
```

Because `derive` is assigned once a new request starts, `derive` can access request properties like `headers`, `query`, `body` where `store`, and `decorate` can't.

### When to use

- Create a new property from existing properties in Context without validation or type checking
- When you need to access request properties like `headers`, `query`, `body` without validation

### Key takeaway

- Unlike `state` and `decorate` instead of assigning at call time, `derive` is assigned once a new request starts.
- `derive` is called at **transform**, or before validation occurs, Elysia cannot safely confirm the type of request property resulting in `as unknown`. If you want to assign a new value from typed request properties, you may want to use `resolve` instead.

## Resolve

Similar as `derive` but ensure type integrity.

Resolve allows us to assign a new property to context.

Resolve is called at **beforeHandle** lifecycle or after validation, allowing us to resolve request properties safely.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .guard({
        headers: t.Object({
            bearer: t.String({
                pattern: '^Bearer .+$'
            })
        })
    })
    .resolve(({ headers }) => {
        return {
            bearer: headers.bearer.slice(7)
        }
    })
    .get('/', ({ bearer }) => bearer)
```

### When to use

- Create a new property from existing properties in Context with type integrity (type checked)
- When you need to access request properties like `headers`, `query`, `body` with validation

### Key takeaway

- `resolve` is called at **beforeHandle**, or after validation happens. Elysia can safely confirm the type of request property resulting in `as typed`.

### Error from resolve/derive

As `resolve` and `derive` is based on **transform** and **beforeHandle** lifecycle, we can return an error from `resolve` and `derive`. If error is returned from `derive`, Elysia will return early exit and return the error as response.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .derive(({ headers, status }) => {
        const auth = headers['authorization']

        if(!auth) return status(400)

        return {
            bearer: auth?.startsWith('Bearer ') ? auth.slice(7) : null
        }
    })
    .get('/', ({ bearer }) => bearer)
```

## Pattern

`state`, `decorate` offers a similar API pattern for assigning property to Context as the following:

- **key-value**
- **object**
- **remap**

Where `derive` can be only used with **remap** because it depends on existing value.

### key-value

We can use `state`, and `decorate` to assign a value using a key-value pattern.

```ts
import { Elysia } from 'elysia'

class Logger {
    log(value: string) {
        console.log(value)
    }
}

new Elysia()
    .state('counter', 0)
    .decorate('logger', new Logger())
```

This pattern is great for readability for setting a single property.

### Object

Assigning multiple properties is better contained in an object for a single assignment.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .decorate({
        logger: new Logger(),
        trace: new Trace(),
        telemetry: new Telemetry()
    })
```

The object offers a less repetitive API for setting multiple values.

### Remap

Remap is a function reassignment.

Allowing us to create a new value from existing value like renaming or removing a property by providing a function and returning an entirely new object to reassign the value.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .state('counter', 0)
    .state('version', 1)
    .state(({ version, ...store }) => ({
        ...store,
        elysiaVersion: 1
    }))
    // ✅ Create from state remap
    .get('/elysia-version', ({ store }) => store.elysiaVersion)
    // ❌ Excluded from state remap
    .get('/version', ({ store }) => store.version)
    // Property 'version' does not exist on type '{ elysiaVersion: number; counter: number; }'.
```

It's a good idea to use state remap to create a new initial value from the existing value.

However, it's important to note that Elysia doesn't offer reactivity from this approach, as remap only assigns an initial value.

> **TIP**:
> Using remap, Elysia will treat a returned object as a new property, removing any property that is missing from the object.

## Affix

To provide a smoother experience, some plugins might have a lot of property value which can be overwhelming to remap one-by-one.

The **Affix** function which consists of `prefix` and `suffix`, allowing us to remap all properties of an instance.

```ts
import { Elysia } from 'elysia'

const setup = new Elysia({ name: 'setup' })
    .decorate({
        argon: 'a',
        boron: 'b',
        carbon: 'c'
    })

const app = new Elysia()
    .use(setup)
    .prefix('decorator', 'setup')
    .get('/', ({ setupCarbon, ...rest }) => setupCarbon)
```

```
GET /

c
```

Allowing us to bulk remap a property of the plugin effortlessly, preventing the name collision of the plugin.

By default, affix will handle both runtime, type-level code automatically, remapping the property to camelCase as naming convention.

In some cases, we can also remap all properties of the plugin:

```ts
import { Elysia } from 'elysia'

const setup = new Elysia({ name: 'setup' })
    .decorate({
        argon: 'a',
        boron: 'b',
        carbon: 'c'
    })

const app = new Elysia()
    .use(setup)
    .prefix('all', 'setup')
    .get('/', ({ setupCarbon, ...rest }) => setupCarbon)
```

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/6_fullstack_dev_server.md

# Elysia with Bun Fullstack Dev Server

Bun 1.3 introduces a Fullstack Dev Server with HMR support.

This allows us to directly use React without any bundler like Vite or Webpack.

You can use [this example](https://github.com/example) to quickly try it out.

Otherwise, install it manually:

## Install Elysia Static Plugin

```ts
import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

new Elysia()
    .use(await staticPlugin()) // [!code highlight]
    .listen(3000)
```

> **TIP**:
> Notice that we need to add `await` before `staticPlugin()` to enable Fullstack Dev Server.
> This is required to setup the necessary HMR hooks.

## Create public/index.html and index.tsx

```html
<!-- public/index.html -->
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Elysia React App</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="./index.tsx"></script>
    </body>
</html>
```

```tsx
// public/index.tsx
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
    const [count, setCount] = useState(0)
    const increase = () => setCount((c) => c + 1)

    return (
        <main>
            <h2>{count}</h2>
            <button onClick={increase}>
                Increase
            </button>
        </main>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
```

## Enable JSX in tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

Navigate to `http://localhost:3000/public` and see the result.

This allows us to develop frontend and backend in a single project without any bundler.

We have verified that Fullstack Dev Server works with HMR, Tailwind, Tanstack Query, Eden Treaty, and path alias.

## Custom Prefix Path

We can change the default `/public` prefix by passing the `prefix` option to `staticPlugin`.

```ts
import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

new Elysia()
    .use(
        await staticPlugin({
            prefix: '/'
        })
    )
    .listen(3000)
```

This would serve the static files at `/` instead of `/public`.

See **static plugin** for more configuration options.

## Tailwind CSS

We can also use Tailwind CSS with Bun Fullstack Dev Server.

### Install dependencies

```bash
bun add tailwindcss@4
bun add -d bun-plugin-tailwind
```

### Create bunfig.toml with the following content:

```toml
[serve.static]
plugins = ["bun-plugin-tailwind"]
```

### Create a CSS file with Tailwind directives

```css
/* public/global.css */
@tailwind base;
```

### Add Tailwind to your HTML or alternatively JavaScript/TypeScript file

```html
<!-- public/index.html -->
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Elysia React App</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="tailwindcss"> <!-- [!code ++] -->
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="./index.tsx"></script>
    </body>
</html>
```

```tsx
// public/index.tsx (alternative)
import '@public/global.css'
```

## Path Alias

We can also use path alias in Bun Fullstack Dev Server.

### Add paths in tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@public/*": ["public/*"]
    }
  }
}
```

### Use the alias in your code

```tsx
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

import '@public/global.css'

function App() {
    const [count, setCount] = useState(0)
    const increase = () => setCount((c) => c + 1)

    return (
        <main>
            <h2>{count}</h2>
            <button onClick={increase}>
                Increase
            </button>
        </main>
    )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
```

This will work out of the box without any additional configuration.

## Build for Production

You can build fullstack server as if it's a normal Elysia server.

```bash
bun build --compile --target bun --outfile server src/index.ts
```

This would create a single executable file `server`.

When running the server executable, make sure to include the `public` folder similar to the development environment.

See **Deploy to Production** for more information.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/7_macro.md

# Macro

Macro is similar to a function that has control over the lifecycle event, schema, and context with full type safety.

Once defined, it will be available in the hook and can be activated by adding the property.

```ts
import { Elysia } from 'elysia'

const plugin = new Elysia({ name: 'plugin' })
    .macro({
        hi: (word: string) => ({
            beforeHandle() {
                console.log(word)
            }
        })
    })

const app = new Elysia()
    .use(plugin)
    .get('/', () => 'hi', {
        hi: 'Elysia'
    })
```

Accessing the path should log "Elysia" as a result.

## Property Shorthand

Starting from Elysia 1.2.10, each property in the macro object can be a function or an object.

If the property is an object, it will be translated to a function that accepts a boolean parameter and will be executed if the parameter is `true`.

```ts
import { Elysia } from 'elysia'

export const auth = new Elysia()
    .macro({
        // This property shorthand
        isAuth: {
            resolve: () => ({
                user: 'saltyaom'
            })
        },
        // is equivalent to
        isAuth(enabled: boolean) {
            if (!enabled) return

            return {
                resolve() {
                    return {
                        user
                    }
                }
            }
        }
    })
```

## Error Handling

You can return an error HTTP status by returning a `status`.

```ts
import { Elysia, status } from 'elysia'

new Elysia()
    .macro({
        auth: {
            resolve({ headers }) {
                if (!headers.authorization)
                    return status(401, 'Unauthorized')

                return {
                    user: 'SaltyAom'
                }
            }
        }
    })
    .get('/', ({ user }) => `Hello ${user}`, {
        auth: true
    })
```

It's recommended that you `return status` instead of `throw new Error()` to annotate correct HTTP status code.

If you throw an error instead, Elysia will convert it to `500 Internal Server Error` by default.

It's also recommended to use `return status` instead of `throw status` to ensure type inference for both Eden and OpenAPI Type Gen.

## Resolve

You can add a property to the context by returning an object with a `resolve` function.

```ts
import { Elysia } from 'elysia'

new Elysia()
    .macro({
        user: (enabled: true) => ({
            resolve: () => ({
                user: 'Pardofelis'
            })
        })
    })
    .get('/', ({ user }) => user, {
        user: true
    })
```

In the example above, we add a new property `user` to the context by returning an object with a `resolve` function.

Here's an example where macro resolve could be useful:

- Perform authentication and add the user to the context
- Run an additional database query and add data to the context
- Add a new property to the context

### Macro Extension with Resolve

Due to TypeScript's limitation, a macro that extends other macro cannot infer type into `resolve` function.

We provide a **named single macro** as a workaround to this limitation.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .macro('user', {
        resolve: () => ({
            user: 'lilith' as const
        })
    })
    .macro('user2', {
        user: true,
        resolve: ({ user }) => {
        }
    })
```

## Schema

You can define a custom schema for your macro to ensure that the route using the macro is passing the correct types.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .macro({
        withFriends: {
            body: t.Object({
                friends: t.Tuple([t.Literal('Fouco'), t.Literal('Sartre')])
            })
        }
    })
    .post('/', ({ body }) => body.friends, {
        body: t.Object({
            name: t.Literal('Lilith')
        }),
        withFriends: true
    })
```

Macro with schema will automatically validate and infer types to ensure type safety, and it can co-exist with existing schema as well.

You can also stack multiple schemas from different macros, or even from the Standard Validator, and it will work together seamlessly.

### Schema with Lifecycle in the Same Macro

Similar to **Macro extension with resolve**,

Macro schema also supports type inference for lifecycle within the same macro **BUT only with a named single macro** due to TypeScript limitation.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .macro('withFriends', {
        body: t.Object({
            friends: t.Tuple([t.Literal('Fouco'), t.Literal('Sartre')])
        }),
        beforeHandle({ body: { friends } }) {
        }
    })
```

If you want to use lifecycle type inference within the same macro, you might want to use a **named single macro** instead of multiple stacked macros.

> Not to be confused with using macro schema to infer type into the route's lifecycle event. That works just fine. This limitation only applies to using lifecycle within the same macro.

## Extension

Macro can extend other macros, allowing you to build upon an existing one.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .macro({
        sartre: {
            body: t.Object({
                sartre: t.Literal('Sartre')
            })
        },
        fouco: {
            body: t.Object({
                fouco: t.Literal('Fouco')
            })
        },
        lilith: {
            fouco: true,
            sartre: true,
            body: t.Object({
                lilith: t.Literal('Lilith')
            })
        }
    })
    .post('/', ({ body }) => body, {
        lilith: true
    })
```

This allows you to build upon existing macro, and add more functionality to it.

## Deduplication

Macro will automatically deduplicate the lifecycle event, ensuring that each lifecycle event is only executed once.

By default, Elysia will use the property value as the seed, but you can override it by providing a custom `seed`.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .macro({
        sartre: (role: string) => ({
            seed: role,
            body: t.Object({
                sartre: t.Literal('Sartre')
            })
        })
    })
```

However, if you ever accidentally create a circular dependency, Elysia has a limited stack of 16 to prevent an infinite loop in both runtime and type inference.

If the route already has OpenAPI detail, it will merge the details together but prefers the route detail over macro detail.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/8_mount.md

# Mount

WinterTC is a standard for building HTTP Server behind Cloudflare, Deno, Vercel, and others.

It allows web servers to run interoperably across runtimes by using `Request`, and `Response`.

Elysia is WinterTC compliant. Optimized to run on Bun, but also supports other runtimes if possible.

This allows any WinterTC-compliant framework or code to run together, allowing frameworks like Elysia, Hono, Remix, Itty Router to run together in a simple function.

## Mount

To use `.mount`, simply pass a `fetch` function:

```ts
import { Elysia } from 'elysia'
import { Hono } from 'hono'

const hono = new Hono()
    .get('/', (c) => c.text('Hello from Hono!'))

const app = new Elysia()
    .get('/', () => 'Hello from Elysia')
    .mount('/hono', hono.fetch)
```

Any framework that uses `Request` and `Response` can interoperate with Elysia like:

- Hono
- Nitro
- H3
- Next.js API Route
- Nuxt API Route
- SvelteKit API Route

And these can be used on multiple runtimes like:

- Bun
- Deno
- Vercel Edge Runtime
- Cloudflare Worker
- Netlify Edge Function

If the framework supports the `.mount` function, you can also mount Elysia inside another framework:

```ts
import { Elysia } from 'elysia'
import { Hono } from 'hono'

const elysia = new Elysia()
    .get('/', () => 'Hello from Elysia inside Hono inside Elysia')

const hono = new Hono()
    .get('/', (c) => c.text('Hello from Hono!'))
    .mount('/elysia', elysia.fetch)

const main = new Elysia()
    .get('/', () => 'Hello from Elysia')
    .mount('/hono', hono.fetch)
    .listen(3000)
```

This makes the possibility of an interoperable framework and runtime a reality.

D:/1_Projects/jstonehub/prompts/elysia/3_patterns/9_open_api.md

# OpenAPI

Elysia has first-class support and follows OpenAPI schema by default.

Elysia can automatically generate an API documentation page by using an OpenAPI plugin.

To generate the Swagger page, install the plugin:

```bash
bun add @elysiajs/openapi
```

And register the plugin to the server:

```ts
import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(openapi())
```

Accessing `/openapi` would show you a Scalar UI with the generated endpoint documentation from the Elysia server.

For OpenAPI plugin configuration, see the **OpenAPI plugin** page.

## OpenAPI from Types

> This is optional, but we highly recommend it for much better documentation experience.

By default, Elysia relies on runtime schema to generate OpenAPI documentation.

However, you can also generate OpenAPI documentation from types by using a generator from OpenAPI plugin as follows:

1. Specify your Elysia root file (if not specified, Elysia will use `src/index.ts`), and export an instance
2. Import a generator and provide a file path from project root to type generator

```ts
import { Elysia, t } from 'elysia'
import { openapi, fromTypes } from '@elysiajs/openapi'

export const app = new Elysia() // [!code highlight]
    .use(
        openapi({
            references: fromTypes() // [!code highlight]
        })
    )
    .get('/', { test: 'hello' as const })
    .post('/json', ({ body, status }) => body, {
        body: t.Object({
            hello: t.String()
        })
    })
    .listen(3000)
```

Elysia will attempt to generate OpenAPI documentation by reading the type of an exported instance to generate OpenAPI documentation.

This will co-exist with the runtime schema, and the runtime schema will take precedence over the type definition.

### Production

In production environment, it's likely that you might compile Elysia to a single executable with Bun or bundle into a single JavaScript file.

It's recommended that you should pre-generate the declaration file (`.d.ts`) to provide type declaration to the generator.

```ts
import { Elysia, t } from 'elysia'
import { openapi, fromTypes } from '@elysiajs/openapi'

const app = new Elysia()
    .use(
        openapi({
            references: fromTypes(
                process.env.NODE_ENV === 'production'
                    ? 'dist/index.d.ts'
                    : 'src/index.ts'
            )
        })
    )
```

## Standard Schema with OpenAPI

Elysia will try to use a native method from each schema to convert to OpenAPI schema.

However, if the schema doesn't provide a native method, you can provide a custom schema to OpenAPI by providing a `mapJsonSchema` as follows:

### Zod OpenAPI

As Zod doesn't have a `toJSONSchema` method on the schema, we need to provide a custom mapper to convert Zod schema to OpenAPI schema.

**Zod 4:**

```ts
import openapi from '@elysiajs/openapi'
import * as z from 'zod'

openapi({
    mapJsonSchema: {
        zod: z.toJSONSchema
    }
})
```

## Describing Routes

We can add route information by providing a schema type.

However, sometimes defining only a type does not make it clear what the route might do. You can use `detail` fields to explicitly describe the route.

```ts
import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(openapi())
    .post(
        '/sign-in',
        ({ body }) => body,
        {
            body: t.Object(
                {
                    username: t.String(),
                    password: t.String({
                        minLength: 8,
                        description: 'User password (at least 8 characters)'
                    })
                },
                {
                    description: 'Expected a username and password' // [!code highlight]
                }
            ),
            detail: { // [!code highlight]
                summary: 'Sign in the user', // [!code highlight]
                tags: ['authentication'] // [!code highlight]
            } // [!code highlight]
        }
    )
```

The `detail` fields follows an OpenAPI V3 definition with auto-completion and type-safety by default.

Detail is then passed to OpenAPI to put the description to OpenAPI route.

## Response Headers

We can add response headers by wrapping a schema with `withHeader`:

```ts
import { Elysia, t } from 'elysia'
import { openapi, withHeader } from '@elysiajs/openapi'

new Elysia()
    .use(openapi())
    .get(
        '/thing',
        ({ body, set }) => {
            set.headers['x-powered-by'] = 'Elysia'

            return body
        },
        {
            response: withHeader( // [!code highlight]
                t.Literal('Hi'), // [!code highlight]
                { // [!code highlight]
                    'x-powered-by': t.Literal('Elysia') // [!code highlight]
                } // [!code highlight]
            ) // [!code highlight]
        }
    )
```

> Note that `withHeader` is an annotation only, and does not enforce or validate the actual response headers. You need to set the headers manually.

## Hide Route

You can hide the route from the Swagger page by setting `detail.hide` to `true`:

```ts
import { Elysia, t } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(openapi())
    .post(
        '/sign-in',
        ({ body }) => body,
        {
            body: t.Object(
                {
                    username: t.String(),
                    password: t.String()
                },
                {
                    description: 'Expected a username and password'
                }
            ),
            detail: { // [!code highlight]
                hide: true // [!code highlight]
            } // [!code highlight]
        }
    )
```

## Tags

Elysia can separate the endpoints into groups by using the Swagger tag system.

Firstly define the available tags in the Swagger config object:

```ts
new Elysia().use(
    openapi({
        documentation: {
            tags: [
                { name: 'App', description: 'General endpoints' },
                { name: 'Auth', description: 'Authentication endpoints' }
            ]
        }
    })
)
```

Then use the `detail` property of the endpoint configuration section to assign that endpoint to the group:

```ts
new Elysia()
    .get('/', () => 'Hello Elysia', {
        detail: {
            tags: ['App']
        }
    })
    .group('/auth', (app) =>
        app.post(
            '/sign-up',
            ({ body }) =>
                db.user.create({
                    data: body,
                    select: {
                        id: true,
                        username: true
                    }
                }),
            {
                detail: {
                    tags: ['Auth']
                }
            }
        )
    )
```

### Tags Group

Elysia may accept `tags` to add an entire instance or group of routes to a specific tag.

```ts
import { Elysia, t } from 'elysia'

new Elysia({
    tags: ['user']
})
    .get('/user', 'user')
    .get('/admin', 'admin')
```

## Models

By using reference model, Elysia will handle the schema generation automatically.

By separating models into a dedicated section and linked by reference.

```ts
new Elysia()
    .model({
        User: t.Object({
            id: t.Number(),
            username: t.String()
        })
    })
    .get('/user', () => ({ id: 1, username: 'saltyaom' }), {
        response: {
            200: 'User'
        },
        detail: {
            tags: ['User']
        }
    })
```

## Guard

Alternatively, Elysia may accept guards to add an entire instance or group of routes to a specific guard.

```ts
import { Elysia, t } from 'elysia'

new Elysia()
    .guard({
        detail: {
            description: 'Require user to be logged in'
        }
    })
    .get('/user', 'user')
    .get('/admin', 'admin')
```

## Change OpenAPI Endpoint

You can change the OpenAPI endpoint by setting `path` in the plugin config.

```ts
import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(
        openapi({
            path: '/v2/openapi'
        })
    )
    .listen(3000)
```

## Customize OpenAPI Info

We can customize the OpenAPI information by setting `documentation.info` in the plugin config.

```ts
import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'

new Elysia()
    .use(
        openapi({
            documentation: {
                info: {
                    title: 'Elysia Documentation',
                    version: '1.0.0'
                }
            }
        })
    )
    .listen(3000)
```

This can be useful for:

- Adding a title
- Setting an API version
- Adding a description explaining what our API is about
- Explaining what tags are available, what each tag means

## Security Configuration

To secure your API endpoints, you can define security schemes in the Swagger configuration. The example below demonstrates how to use Bearer Authentication (JWT) to protect your endpoints:

```ts
new Elysia().use(
    openapi({
        documentation: {
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    })
)

export const addressController = new Elysia({
    prefix: '/address',
    detail: {
        tags: ['Address'],
        security: [
            {
                bearerAuth: []
            }
        ]
    }
})
```

This will ensure that all endpoints under the `/address` prefix require a valid JWT token for access.

D:/1_Projects/jstonehub/apps/api/src/app/api.type.ts

```
import type { apiApp } from "./_api";

type ApiApp = typeof apiApp;

export type { ApiApp };

```

D:/1_Projects/jstonehub/apps/api/src/app/main.ts

```
import { env } from "#api/shared/config/env";

import { apiApp } from "./_api";

apiApp.listen({
  port: env.PORT,
  hostname: "0.0.0.0",
});

```

D:/1_Projects/jstonehub/apps/api/src/app/_api.ts

```
import { Elysia } from "elysia";

import { requestIdPlugin } from "#api/shared/plugin/request-id.plugin";

const api = new Elysia()
  .use(requestIdPlugin)

export { api };
```

D:/1_Projects/jstonehub/apps/api/src/app/_healthcheck.v1.ts

```
import { Elysia } from "elysia";

const healthcheckV1 = new Elysia().get("/live", () => ({
  status: "ok",
}));

export { healthcheckV1 };

```

D:/1_Projects/jstonehub/packages/contract/src/feature/user.ts

```
type UserSort = (typeof USER_SORTS)[number];

const USER_SORTS = [
  "createdAt",
  "name",
  "email",
  "energyBalance",
  "loginStreak",
] as const;

const USER_SORT_DEFAULT: UserSort = "createdAt";

const USER_FILTERS = {
  isBanned: { values: ["true", "false"] as const },
} as const;

export { USER_FILTERS, USER_SORT_DEFAULT, USER_SORTS };

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/client.ts

```
export type { PaginationOrder } from "./constant";

export {
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  DEFAULT_PAGINATION_ORDER,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
} from "./constant";
export { createValidateSearch } from "./valibot";

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/constant.ts

```
type PaginationOrder = (typeof PAGINATION_ORDERS)[number];

const PAGINATION_ORDERS = ["asc", "desc"] as const;
const DEFAULT_PAGINATION_ORDER = "asc" as const;

const PAGINATION_QUERY_MAX_LENGTH = 200;

const PAGINATION_FILTER_ALL = "all" as const;

const DEFAULT_PAGINATION_CURSOR_LIMIT = 50;

export type { PaginationOrder };
export {
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  DEFAULT_PAGINATION_ORDER,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
};

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/server.ts

```
export type { PaginationOrder } from "./constant";

export {
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  DEFAULT_PAGINATION_ORDER,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
} from "./constant";
export { createQueryParamsSchema } from "./typebox";

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/typebox.ts

```
import { Type } from "typebox";

import {
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
} from "./constant";

type SchemaConfig = SchemaConfigAll | SchemaConfigCursor;

type SchemaConfigAll = { mode: "all" };
type SchemaConfigCursor = {
  mode: "cursor";
  sorts: readonly string[];
  filters?: Record<string, FilterConfig>;
  limitDefault?: number;
  limitMax?: number;
};

type FilterConfig = { values: readonly string[] };

function createQueryParamsSchema(config: SchemaConfig) {
  if (config.mode === "all") {
    return Type.Object({});
  }

  const base = buildBaseFields(config.sorts);
  const filterFields = buildFilterFields(config.filters);
  const cursorFields = buildCursorFields(config);

  return Type.Object({ ...base, ...filterFields, ...cursorFields });
}

function buildBaseFields(sorts: readonly string[]) {
  return {
    query: Type.Optional(
      Type.String({ maxLength: PAGINATION_QUERY_MAX_LENGTH }),
    ),
    sort: Type.Optional(Type.Union(sorts.map((s) => Type.Literal(s)))),
    order: Type.Optional(
      Type.Union(PAGINATION_ORDERS.map((o) => Type.Literal(o))),
    ),
  };
}

function buildFilterFields(filters: Record<string, FilterConfig> | undefined) {
  if (!filters) {
    return {};
  }

  const schemas: Record<string, unknown> = {};

  for (const [key, filter] of Object.entries(filters)) {
    schemas[key] = Type.Optional(
      Type.Union([
        Type.Literal(PAGINATION_FILTER_ALL),
        Type.Array(Type.Union(filter.values.map((val) => Type.Literal(val))), {
          minItems: 1,
        }),
      ]),
    );
  }

  return schemas;
}

function buildCursorFields(config: SchemaConfigCursor) {
  const limitDefault = config.limitDefault ?? DEFAULT_PAGINATION_CURSOR_LIMIT;
  const limitMax = config.limitMax ?? limitDefault;

  return {
    cursor: Type.Optional(Type.String()),
    limit: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: limitMax,
        default: limitDefault,
      }),
    ),
  };
}

export { createQueryParamsSchema };

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/valibot.ts

```
import type { GenericSchema } from "valibot";

import {
  array,
  fallback,
  integer,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  picklist,
  pipe,
  string,
  union,
} from "valibot";

import {
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  DEFAULT_PAGINATION_ORDER,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
} from "./constant";

type SearchConfig = SearchConfigAll | SearchConfigCursor;

type SearchConfigAll = SearchConfigBase & { mode: "all" };
type SearchConfigCursor = SearchConfigBase & {
  mode: "cursor";
  limitDefault?: number;
  limitMax?: number;
};

type SearchConfigBase = {
  sorts: readonly string[];
  sortDefault: string;
  orderDefault?: (typeof PAGINATION_ORDERS)[number];
  queryDefault?: string;
  filters?: Record<string, FilterConfig>;
};

type FilterConfig = {
  values: readonly string[];
  default?: typeof PAGINATION_FILTER_ALL | string[];
};

type BaseOutput = {
  query: string;
  sort: string;
  order: (typeof PAGINATION_ORDERS)[number];
  [key: string]: unknown;
};

type CursorOutput = BaseOutput & {
  cursor: string | undefined;
  limit: number;
};

function createValidateSearch(
  config: SearchConfigCursor,
): GenericSchema<unknown, CursorOutput>;

function createValidateSearch(
  config: SearchConfigAll,
): GenericSchema<unknown, BaseOutput>;

function createValidateSearch(
  config: SearchConfig,
): GenericSchema<unknown, BaseOutput | CursorOutput> {
  const base = buildBaseFields(config);
  const filterFields = buildFilterFields(config.filters);

  if (config.mode === "all") {
    return object({ ...base, ...filterFields }) as GenericSchema<
      unknown,
      BaseOutput
    >;
  }

  const cursorFields = buildCursorFields(config);

  return object({ ...base, ...filterFields, ...cursorFields }) as GenericSchema<
    unknown,
    CursorOutput
  >;
}

function buildBaseFields(config: SearchConfigBase) {
  return {
    query: fallback(
      pipe(string(), maxLength(PAGINATION_QUERY_MAX_LENGTH)),
      config.queryDefault ?? "",
    ),
    sort: fallback(
      picklist(config.sorts as unknown as readonly string[]),
      config.sortDefault,
    ),
    order: fallback(
      picklist(PAGINATION_ORDERS),
      config.orderDefault ?? DEFAULT_PAGINATION_ORDER,
    ),
  };
}

function buildFilterFields(filters: Record<string, FilterConfig> | undefined) {
  if (!filters) {
    return {};
  }

  const schemas: Record<string, ReturnType<typeof fallback>> = {};

  for (const [key, filter] of Object.entries(filters)) {
    const defaultValue = filter.default ?? PAGINATION_FILTER_ALL;
    schemas[key] = fallback(
      union([
        literal(PAGINATION_FILTER_ALL),
        pipe(
          array(picklist(filter.values as unknown as readonly string[])),
          minLength(1),
        ),
      ]),
      defaultValue,
    );
  }

  return schemas;
}

function buildCursorFields(config: SearchConfigCursor) {
  const limitDefault = config.limitDefault ?? DEFAULT_PAGINATION_CURSOR_LIMIT;
  const limitMax = config.limitMax ?? limitDefault;

  return {
    cursor: fallback(optional(string()), undefined),
    limit: fallback(
      pipe(number(), integer(), minValue(1), maxValue(limitMax)),
      limitDefault,
    ),
  };
}

export { createValidateSearch };

```

D:/1_Projects/jstonehub/packages/contract/src/permission/admin.ts

```
type AdminPermission = "admin:all" | AdminEntityPermission;
type AdminEntityPermission = {
  [E in AdminEntity]: `admin:${E}:${AdminEntityAction<E>}`;
}[AdminEntity];
type AdminEntity = keyof AdminEntityRegistry;
type AdminEntityAction<E extends AdminEntity> = AdminEntityRegistry[E][number];
type AdminEntityRegistry = typeof ADMIN_ENTITY_REGISTRY;

type AccessAction = (typeof ACCESS_ACTION)[number];
type AdminBaseAction = (typeof ADMIN_BASE_ACTION)[number];
type UserSpecificAction = (typeof USER_SPECIFIC_ACTION)[number];

const ADMIN_BASE_ACTION = [
  "create",
  "read",
  "update",
  "delete",
  "manage",
  "export",
  "all",
] as const;

const ACCESS_ACTION = ["read", "manage", "all"] as const;
const USER_SPECIFIC_ACTION = [
  "ban",
  "grant_energy",
  "grant_subscription",
] as const;

const ADMIN_ENTITY_REGISTRY = {
  access: ACCESS_ACTION,
  user: [...ADMIN_BASE_ACTION, ...USER_SPECIFIC_ACTION] as const,
  joke: ADMIN_BASE_ACTION,
  language: ADMIN_BASE_ACTION,
  pricing: ADMIN_BASE_ACTION,
  feedback: ADMIN_BASE_ACTION,
  audit: ADMIN_BASE_ACTION,
} as const;

const ADMIN_ENTITIES = Object.keys(ADMIN_ENTITY_REGISTRY) as AdminEntity[];
const VALID_ADMIN_PERMISSIONS = buildValidPermissions();

function isValidAdminPermission(value: string): value is AdminPermission {
  return VALID_ADMIN_PERMISSIONS.has(value);
}

function buildValidPermissions() {
  const set = new Set<string>();
  set.add("admin:all");

  for (const entity of ADMIN_ENTITIES) {
    const actions = ADMIN_ENTITY_REGISTRY[entity];
    for (const action of actions) {
      set.add(`admin:${entity}:${action}`);
    }
  }

  return set;
}

export type {
  AccessAction,
  AdminBaseAction,
  AdminEntity,
  AdminEntityAction,
  AdminEntityPermission,
  AdminEntityRegistry,
  AdminPermission,
  UserSpecificAction,
};
export {
  ACCESS_ACTION,
  ADMIN_BASE_ACTION,
  ADMIN_ENTITIES,
  ADMIN_ENTITY_REGISTRY,
  isValidAdminPermission,
  USER_SPECIFIC_ACTION,
};

```

D:/1_Projects/jstonehub/packages/contract/src/permission/check.ts

```
import type { AdminPermission } from "./admin";
import type { OrgPermission } from "./org";
import type { AccountPermission, ProjectPermission } from "./resource";

type Permission =
  | AdminPermission
  | OrgPermission
  | ProjectPermission
  | AccountPermission;

import { is } from "@packages/util/guard";

type ParsedPermission = {
  scope: string;
  resourceId: string | null;
  entity: string | null;
  action: string;
};

const ADMIN_PREFIX = "admin:";
const ALL_ACTION = "all";
const SCOPE_ALL = "admin:all";

function hasPermission(userPermissions: string[], required: Permission) {
  const parsed = parsePermission(required);

  if (is.null(parsed)) {
    return false;
  }

  if (parsed.scope === "admin") {
    return hasAdminPermission(userPermissions, required, parsed);
  }

  return hasScopedPermission(userPermissions, required, parsed);
}

function parsePermission(permission: string): ParsedPermission | null {
  if (!permission) {
    return null;
  }

  if (permission.startsWith(ADMIN_PREFIX)) {
    return parseAdminPermission(permission);
  }

  return parseScopedPermission(permission);
}

function parseAdminPermission(permission: string): ParsedPermission | null {
  const withoutPrefix = permission.slice(ADMIN_PREFIX.length);

  if (withoutPrefix === ALL_ACTION) {
    return {
      scope: "admin",
      resourceId: null,
      entity: null,
      action: ALL_ACTION,
    };
  }

  const colonIndex = withoutPrefix.indexOf(":");

  if (colonIndex === -1) {
    return null;
  }

  const entity = withoutPrefix.slice(0, colonIndex);
  const action = withoutPrefix.slice(colonIndex + 1);

  if (!(entity && action)) {
    return null;
  }

  return { scope: "admin", resourceId: null, entity, action };
}

function parseScopedPermission(permission: string): ParsedPermission | null {
  const firstColon = permission.indexOf(":");

  if (firstColon === -1) {
    return null;
  }

  const scope = permission.slice(0, firstColon);
  const rest = permission.slice(firstColon + 1);
  const secondColon = rest.indexOf(":");

  if (secondColon === -1) {
    return null;
  }

  const resourceId = rest.slice(0, secondColon);
  const action = rest.slice(secondColon + 1);

  if (!(scope && resourceId && action)) {
    return null;
  }

  return { scope, resourceId, entity: null, action };
}

function hasAdminPermission(
  userPermissions: string[],
  required: string,
  parsed: ParsedPermission,
) {
  if (userPermissions.includes(required)) {
    return true;
  }

  if (parsed.entity && parsed.action !== ALL_ACTION) {
    const entityWildcard = `admin:${parsed.entity}:${ALL_ACTION}`;

    if (userPermissions.includes(entityWildcard)) {
      return true;
    }
  }

  if (userPermissions.includes(SCOPE_ALL)) {
    return true;
  }

  return false;
}

function hasScopedPermission(
  userPermissions: string[],
  required: string,
  parsed: ParsedPermission,
) {
  if (userPermissions.includes(required)) {
    return true;
  }

  if (parsed.resourceId && parsed.action !== ALL_ACTION) {
    const resourceWildcard = `${parsed.scope}:${parsed.resourceId}:${ALL_ACTION}`;

    if (userPermissions.includes(resourceWildcard)) {
      return true;
    }
  }

  return false;
}

export type { ParsedPermission, Permission };
export { hasPermission, parsePermission };

```

D:/1_Projects/jstonehub/packages/contract/src/permission/extract.ts

```
import type { PermissionScope } from "./scope";

import { PERMISSION_SCOPE } from "./scope";

const ADMIN_PREFIX = "admin:";
const SCOPE_SET = new Set<string>(PERMISSION_SCOPE);

function extractScope(permission: string): PermissionScope | null {
  const colonIndex = permission.indexOf(":");

  if (colonIndex === -1) {
    return null;
  }

  const scope = permission.slice(0, colonIndex);

  if (!SCOPE_SET.has(scope)) {
    return null;
  }

  return scope as PermissionScope;
}

function extractEntityId(permission: string): string | null {
  if (permission.startsWith(ADMIN_PREFIX)) {
    return null;
  }

  const firstColon = permission.indexOf(":");

  if (firstColon === -1) {
    return null;
  }

  const rest = permission.slice(firstColon + 1);
  const secondColon = rest.indexOf(":");

  if (secondColon === -1) {
    return null;
  }

  const entityId = rest.slice(0, secondColon);

  return entityId || null;
}

function isAdminPermission(permission: string) {
  return permission.startsWith(ADMIN_PREFIX);
}

function isOrgPermission(permission: string) {
  return permission.startsWith("org:");
}

function isProjectPermission(permission: string) {
  return permission.startsWith("project:");
}

function isAccountPermission(permission: string) {
  return permission.startsWith("account:");
}

export {
  extractEntityId,
  extractScope,
  isAccountPermission,
  isAdminPermission,
  isOrgPermission,
  isProjectPermission,
};

```

D:/1_Projects/jstonehub/packages/contract/src/permission/format.ts

```
import type { AdminEntity, AdminEntityAction } from "./admin";
import type { OrgAction } from "./org";
import type { ResourceAction } from "./resource";

function formatAdminPermission<E extends AdminEntity>(params: {
  entity: E;
  action: AdminEntityAction<E>;
}) {
  return `admin:${params.entity}:${params.action}` as const;
}

function formatOrgPermission(params: { orgId: string; action: OrgAction }) {
  return `org:${params.orgId}:${params.action}` as const;
}

function formatProjectPermission(params: {
  projectId: string;
  action: ResourceAction | "all";
}) {
  return `project:${params.projectId}:${params.action}` as const;
}

function formatAccountPermission(params: {
  accountId: string;
  action: ResourceAction | "all";
}) {
  return `account:${params.accountId}:${params.action}` as const;
}

export {
  formatAccountPermission,
  formatAdminPermission,
  formatOrgPermission,
  formatProjectPermission,
};

```

D:/1_Projects/jstonehub/packages/contract/src/permission/org.ts

```
type OrgAction = (typeof ORG_ACTION)[number];
type OrgPermission = `org:${string}:${OrgAction}`;

const ORG_ACTION = [
  "all",
  "manage",
  "fund",
  "view_logs",
  "project:create",
  "project:delete",
] as const;

export type { OrgAction, OrgPermission };
export { ORG_ACTION };

```

D:/1_Projects/jstonehub/packages/contract/src/permission/resource.ts

```
type ResourceAction = (typeof RESOURCE_ACTION)[number];
type ProjectPermission = `project:${string}:${ResourceAction | "all"}`;
type AccountPermission = `account:${string}:${ResourceAction | "all"}`;

const RESOURCE_ACTION = ["manage", "view"] as const;

export type { AccountPermission, ProjectPermission, ResourceAction };
export { RESOURCE_ACTION };

```

D:/1_Projects/jstonehub/packages/contract/src/permission/scope.ts

```
type PermissionScope = (typeof PERMISSION_SCOPE)[number];

const PERMISSION_SCOPE = ["admin", "org", "project", "account"] as const;

export type { PermissionScope };
export { PERMISSION_SCOPE };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.repository.ts

```
import { and, eq, gt, lt } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { authAccountTable } from "#api/shared/db/schema/auth-account.table";
import { authLinkRequestTable } from "#api/shared/db/schema/auth-link-request.table";
import { userTable } from "#api/shared/db/schema/user.table";

const authRepository = {
  findUserByEmail(email: string) {
    return db.query.userTable.findFirst({
      where: eq(userTable.email, email),
    });
  },

  findUserById(userId: string) {
    return db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
    });
  },

  createUser(params: {
    email: string;
    name: string;
    avatarUrl: string | null;
  }) {
    return db
      .insert(userTable)
      .values({
        email: params.email,
        name: params.name,
        avatarUrl: params.avatarUrl,
      })
      .returning()
      .then((rows) => rows[0]);
  },

  updateUserProfile(params: {
    userId: string;
    name: string;
    avatarUrl: string | null;
  }) {
    return db
      .update(userTable)
      .set({
        name: params.name,
        avatarUrl: params.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, params.userId));
  },

  findAuthAccount(params: { provider: string; providerAccountId: string }) {
    return db
      .select()
      .from(authAccountTable)
      .where(
        and(
          eq(authAccountTable.provider, params.provider),
          eq(authAccountTable.providerAccountId, params.providerAccountId),
        ),
      )
      .then((rows) => rows[0] ?? null);
  },

  createAuthAccount(params: {
    userId: string;
    provider: string;
    providerAccountId: string;
  }) {
    return db
      .insert(authAccountTable)
      .values({
        userId: params.userId,
        provider: params.provider,
        providerAccountId: params.providerAccountId,
      })
      .returning()
      .then((rows) => rows[0]);
  },

  createAuthLinkRequest(params: {
    targetUserId: string;
    provider: string;
    providerAccountId: string;
    expiresAt: Date;
  }) {
    return db
      .insert(authLinkRequestTable)
      .values({
        targetUserId: params.targetUserId,
        provider: params.provider,
        providerAccountId: params.providerAccountId,
        expiresAt: params.expiresAt,
      })
      .onConflictDoUpdate({
        target: [
          authLinkRequestTable.provider,
          authLinkRequestTable.providerAccountId,
        ],
        set: {
          targetUserId: params.targetUserId,
          expiresAt: params.expiresAt,
        },
      })
      .returning()
      .then((rows) => rows[0]);
  },

  findAuthLinkRequest(params: { provider: string; providerAccountId: string }) {
    return db
      .select()
      .from(authLinkRequestTable)
      .where(
        and(
          eq(authLinkRequestTable.provider, params.provider),
          eq(authLinkRequestTable.providerAccountId, params.providerAccountId),
          gt(authLinkRequestTable.expiresAt, new Date()),
        ),
      )
      .then((rows) => rows[0] ?? null);
  },

  deleteAuthLinkRequest(id: string) {
    return db
      .delete(authLinkRequestTable)
      .where(eq(authLinkRequestTable.id, id));
  },

  deleteExpiredAuthLinkRequests() {
    return db
      .delete(authLinkRequestTable)
      .where(lt(authLinkRequestTable.expiresAt, new Date()));
  },
};

export { authRepository };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/auth.v1.ts

```
import { Elysia } from "elysia";

import { deleteAllSessionsRoute } from "./_route/delete-all-sessions.route";
import { deleteProviderRoute } from "./_route/delete-provider.route";
import { deleteSessionRoute } from "./_route/delete-session.route";
import { getCallbackGoogleRoute } from "./_route/get-callback-google.route";
import { getContextRoute } from "./_route/get-context.route";
import { getGoogleRoute } from "./_route/get-google.route";
import { getProvidersRoute } from "./_route/get-providers.route";
import { getSessionsRoute } from "./_route/get-sessions.route";
import { postExchangeRoute } from "./_route/post-exchange.route";
import { postLogoutRoute } from "./_route/post-logout.route";
import { postRefreshRoute } from "./_route/post-refresh.route";

const authV1 = new Elysia({ prefix: "/v1/auth" })
  .use(getContextRoute)
  .use(getSessionsRoute)
  .use(getProvidersRoute)
  .use(getGoogleRoute)
  .use(getCallbackGoogleRoute)
  .use(postExchangeRoute)
  .use(postRefreshRoute)
  .use(postLogoutRoute)
  .use(deleteSessionRoute)
  .use(deleteAllSessionsRoute)
  .use(deleteProviderRoute);

export { authV1 };

```

D:/1_Projects/jstonehub/apps/api/src/feature/permission/permission.repository.ts

```
import { eq, like, sql } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { permissionTable } from "#api/shared/db/schema/permission.table";
import { userTable } from "#api/shared/db/schema/user.table";

function findAdminPermissionUsers() {
  return db
    .select({
      userId: permissionTable.userId,
      permission: permissionTable.permission,
      userName: userTable.name,
      userEmail: userTable.email,
      userAvatarUrl: userTable.avatarUrl,
    })
    .from(permissionTable)
    .innerJoin(userTable, eq(permissionTable.userId, userTable.id))
    .where(like(permissionTable.permission, "admin:%"));
}

function countUserPermissions(userId: string) {
  return db
    .select({ count: sql<number>`count(*)::int` })
    .from(permissionTable)
    .where(eq(permissionTable.userId, userId))
    .then((rows) => rows[0]?.count ?? 0);
}

export { countUserPermissions, findAdminPermissionUsers };

```

D:/1_Projects/jstonehub/apps/api/src/feature/permission/permission.service.ts

```
import type {
  AdminPermissionUser,
  UpdatePermissionsInput,
  UserPermissions,
} from "./permission.type";

import { isValidAdminPermission } from "@packages/contract/permission/admin";

import { createAuditLog } from "#api/service/audit/audit.repository";
import {
  deletePermission,
  findPermissionsByUserId,
  insertPermission,
} from "#api/service/permission/permission.repository";

import { findAdminPermissionUsers } from "./permission.repository";

// ─── list admin permission users ───────────────────────

async function listAdminPermissionUsers(): Promise<AdminPermissionUser[]> {
  const rows = await findAdminPermissionUsers();
  return groupPermissionsByUser(rows);
}

function groupPermissionsByUser(
  rows: Array<{
    userId: string;
    permission: string;
    userName: string;
    userEmail: string;
    userAvatarUrl: string | null;
  }>,
): AdminPermissionUser[] {
  const userMap = new Map<string, AdminPermissionUser>();

  for (const row of rows) {
    const existing = userMap.get(row.userId);

    if (existing) {
      existing.permissions.push(row.permission);
    } else {
      userMap.set(row.userId, {
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        userAvatarUrl: row.userAvatarUrl,
        permissions: [row.permission],
      });
    }
  }

  return Array.from(userMap.values());
}

// ─── get user permissions ──────────────────────────────

async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const rows = await findPermissionsByUserId(userId);
  return { permissions: rows.map((r) => r.permission) };
}

// ─── update user permissions ───────────────────────────

type UpdateResult =
  | { kind: "success" }
  | { kind: "cannot_modify_self" }
  | { kind: "cannot_grant_admin_all" }
  | { kind: "invalid_permission"; permission: string };

async function updateUserPermissions(params: {
  targetUserId: string;
  actorId: string;
  actorPermissions: string[];
  input: UpdatePermissionsInput;
}): Promise<UpdateResult> {
  if (params.targetUserId === params.actorId) {
    return { kind: "cannot_modify_self" };
  }

  const validationError = validatePermissions(params);

  if (validationError) {
    return validationError;
  }

  const currentRows = await findPermissionsByUserId(params.targetUserId);
  const currentPerms = new Set(currentRows.map((r) => r.permission));
  const desiredPerms = new Set(params.input.permissions);

  const toAdd = params.input.permissions.filter((p) => !currentPerms.has(p));
  const toRemove = currentRows
    .map((r) => r.permission)
    .filter((p) => !desiredPerms.has(p));

  await applyPermissionChanges({
    targetUserId: params.targetUserId,
    actorId: params.actorId,
    toAdd,
    toRemove,
  });

  return { kind: "success" };
}

function validatePermissions(params: {
  actorPermissions: string[];
  input: UpdatePermissionsInput;
}): UpdateResult | null {
  const actorHasAdminAll = params.actorPermissions.includes("admin:all");

  for (const perm of params.input.permissions) {
    if (!isValidAdminPermission(perm)) {
      return { kind: "invalid_permission", permission: perm };
    }

    if (perm === "admin:all" && !actorHasAdminAll) {
      return { kind: "cannot_grant_admin_all" };
    }
  }

  return null;
}

async function applyPermissionChanges(params: {
  targetUserId: string;
  actorId: string;
  toAdd: string[];
  toRemove: string[];
}) {
  const removeOperations = params.toRemove.map((perm) =>
    removePermissionWithAudit({
      targetUserId: params.targetUserId,
      actorId: params.actorId,
      permission: perm,
    }),
  );

  await Promise.all(removeOperations);

  const addOperations = params.toAdd.map((perm) =>
    addPermissionWithAudit({
      targetUserId: params.targetUserId,
      actorId: params.actorId,
      permission: perm,
    }),
  );

  await Promise.all(addOperations);
}

async function removePermissionWithAudit(params: {
  targetUserId: string;
  actorId: string;
  permission: string;
}) {
  await deletePermission({
    userId: params.targetUserId,
    permission: params.permission,
  });

  await createAuditLog({
    actorId: params.actorId,
    targetId: params.targetUserId,
    targetType: "user",
    action: "revoke_permission",
    reason: null,
    metadata: { permission: params.permission },
  });
}

async function addPermissionWithAudit(params: {
  targetUserId: string;
  actorId: string;
  permission: string;
}) {
  await insertPermission({
    userId: params.targetUserId,
    permission: params.permission,
    grantedBy: params.actorId,
  });

  await createAuditLog({
    actorId: params.actorId,
    targetId: params.targetUserId,
    targetType: "user",
    action: "grant_permission",
    reason: null,
    metadata: { permission: params.permission },
  });
}

export { getUserPermissions, listAdminPermissionUsers, updateUserPermissions };

```

D:/1_Projects/jstonehub/apps/api/src/feature/permission/permission.type.ts

```
type AdminPermissionUser = {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl: string | null;
  permissions: string[];
};

type UserPermissions = {
  permissions: string[];
};

type UpdatePermissionsInput = {
  permissions: string[];
};

export type { AdminPermissionUser, UpdatePermissionsInput, UserPermissions };

```

D:/1_Projects/jstonehub/apps/api/src/feature/permission/permission.v1.ts

```
import { HTTP_STATUS } from "@packages/contract/http-status";
import { hasPermission } from "@packages/contract/permission/check";
import { Elysia, t } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";

import {
  getUserPermissions,
  listAdminPermissionUsers,
  updateUserPermissions,
} from "./permission.service";

const adminPermissionV1 = new Elysia({ prefix: "/admin/permissions" })
  .use(withAuth)
  .get("/", async ({ user, set }) => {
    if (!hasPermission(user.permissions, "admin:user:read")) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return { error: "INSUFFICIENT_PERMISSION" };
    }

    const users = await listAdminPermissionUsers();

    return { users };
  })
  .get(
    "/:userId",
    async ({ user, set, params }) => {
      if (!hasPermission(user.permissions, "admin:user:read")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const result = await getUserPermissions(params.userId);

      return result;
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
    },
  )
  .put(
    "/:userId",
    async ({ user, set, params, body }) => {
      if (!hasPermission(user.permissions, "admin:user:manage")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const result = await updateUserPermissions({
        targetUserId: params.userId,
        actorId: user.id,
        actorPermissions: user.permissions,
        input: { permissions: body.permissions },
      });

      if (result.kind === "cannot_modify_self") {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "Cannot modify own permissions" };
      }

      if (result.kind === "cannot_grant_admin_all") {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "Cannot grant admin:all without having it" };
      }

      if (result.kind === "invalid_permission") {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: `Invalid permission: ${result.permission}` };
      }

      return { status: "ok" };
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      body: t.Object({
        permissions: t.Array(t.String()),
      }),
    },
  );

export { adminPermissionV1 };

```

D:/1_Projects/jstonehub/apps/api/src/feature/security/security.v1.ts

```
import { Elysia } from "elysia";

import { getEventsRoute } from "./_route/get-events.route";

const securityV1 = new Elysia({ prefix: "/v1/security" }).use(getEventsRoute);

export { securityV1 };

```

D:/1_Projects/jstonehub/apps/api/src/feature/user/user.repository.ts

```
import type { SQL } from "drizzle-orm";

import { and, eq, ilike, or, sql } from "drizzle-orm";

import { authRepository } from "#api/service/auth/auth.repository";
import { db } from "#api/shared/db/instance";
import { permissionTable } from "#api/shared/db/schema/permission.table";
import { userTable } from "#api/shared/db/schema/user.table";

// ─── list users (cursor pagination) ───────────────────

type ListUsersParams = {
  query?: string;
  sort: string;
  order: "asc" | "desc";
  isBanned?: boolean;
  cursor?: { sortValue: string; id: string } | null;
  limit: number;
};

function listUsers(params: ListUsersParams) {
  const conditions = buildFilterConditions(params);
  const orderBy = buildOrderBy(params.sort, params.order);
  const cursorCondition = buildCursorCondition(params);
  const whereClause = buildWhereClause(conditions, cursorCondition);

  return db
    .select({
      id: userTable.id,
      email: userTable.email,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
      isBanned: userTable.isBanned,
      energyBalance: userTable.energyBalance,
      loginStreak: userTable.loginStreak,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(params.limit + 1);
}

// ─── get user detail ───────────────────────────────────

async function getUserDetail(userId: string) {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .then((rows) => rows[0] ?? null);

  if (!user) {
    return null;
  }

  const permissions = await db
    .select({ permission: permissionTable.permission })
    .from(permissionTable)
    .where(eq(permissionTable.userId, userId));

  const sessionCountResult =
    await authRepository.session.findActive.countByUserId(userId);

  return {
    user,
    permissions: permissions.map((p) => p.permission),
    activeSessionCount: sessionCountResult,
  };
}

// ─── ban / unban ───────────────────────────────────────

function updateBanStatus(params: { userId: string; isBanned: boolean }) {
  return db
    .update(userTable)
    .set({
      isBanned: params.isBanned,
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, params.userId));
}

function findUserById(userId: string) {
  return db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .then((rows) => rows[0] ?? null);
}

function hasAdminAllPermission(userId: string) {
  return db
    .select({ id: permissionTable.id })
    .from(permissionTable)
    .where(
      and(
        eq(permissionTable.userId, userId),
        eq(permissionTable.permission, "admin:all"),
      ),
    )
    .then((rows) => rows.length > 0);
}

// ─── query building helpers ────────────────────────────

function buildFilterConditions(params: ListUsersParams) {
  const conditions: SQL[] = [];

  if (params.query) {
    const pattern = `%${params.query}%`;
    const searchCondition = or(
      ilike(userTable.name, pattern),
      ilike(userTable.email, pattern),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (params.isBanned !== undefined) {
    conditions.push(eq(userTable.isBanned, params.isBanned));
  }

  return conditions;
}

function buildWhereClause(conditions: SQL[], cursorCondition: SQL | null) {
  if (cursorCondition && conditions.length > 0) {
    return and(...conditions, cursorCondition);
  }

  if (cursorCondition) {
    return cursorCondition;
  }

  if (conditions.length > 0) {
    return and(...conditions);
  }

  return;
}

function buildOrderBy(sort: string, order: "asc" | "desc") {
  const direction = order === "desc" ? sql`DESC` : sql`ASC`;
  const sortColumn = getSortColumn(sort);

  return [sql`${sortColumn} ${direction}`, sql`${userTable.id} ${direction}`];
}

function getSortColumn(sort: string) {
  const sortMap = {
    createdAt: userTable.createdAt,
    name: userTable.name,
    email: userTable.email,
    energyBalance: userTable.energyBalance,
    loginStreak: userTable.loginStreak,
  } as const;

  type SortKey = keyof typeof sortMap;

  if (sort in sortMap) {
    return sortMap[sort as SortKey];
  }

  return userTable.createdAt;
}

function buildCursorCondition(params: ListUsersParams) {
  if (!params.cursor) {
    return null;
  }

  const sortColumn = getSortColumn(params.sort);
  const { sortValue, id } = params.cursor;

  if (params.order === "desc") {
    return sql`(${sortColumn}, ${userTable.id}) < (${sortValue}, ${id})`;
  }

  return sql`(${sortColumn}, ${userTable.id}) > (${sortValue}, ${id})`;
}

export {
  findUserById,
  getUserDetail,
  hasAdminAllPermission,
  listUsers,
  updateBanStatus,
};

```

D:/1_Projects/jstonehub/apps/api/src/feature/user/user.service.ts

```
import type { BanUserInput } from "#api/service/user/user.type";

import { createAuditLog } from "#api/service/audit/audit.repository";
import { authRepository } from "#api/service/auth/auth.repository";
import { userRepository } from "#api/service/user/user.repository";

const userService = {
  async banUser(input: BanUserInput) {
    await userRepository.update.setBanned({
      userId: input.targetUserId,
      isBanned: true,
    });

    const revokedCount = await authRepository.session.delete.allByUserId(
      input.targetUserId,
    );

    await createAuditLog({
      actorId: input.actorId,
      action: "user.ban",
      targetType: "user",
      targetId: input.targetUserId,
      metadata: {
        reason: input.reason ?? null,
        revokedSessionsCount: revokedCount,
      },
    });

    return { revokedCount };
  },

  async unbanUser(input: { actorId: string; targetUserId: string }) {
    await userRepository.update.setBanned({
      userId: input.targetUserId,
      isBanned: false,
    });

    await createAuditLog({
      actorId: input.actorId,
      action: "user.unban",
      targetType: "user",
      targetId: input.targetUserId,
      metadata: null,
    });
  },
} as const;

export { userService };

```

D:/1_Projects/jstonehub/apps/api/src/feature/user/user.v1.ts

```
import { HTTP_STATUS } from "@packages/contract/http-status";
import { hasPermission } from "@packages/contract/permission/check";
import { Elysia, t } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";

import { banUser, getUserDetail, listUsers } from "./user.service";

const USER_LIST_DEFAULT_LIMIT = 50;
const USER_LIST_MAX_LIMIT = 100;
const DEFAULT_SORT = "createdAt";
const DEFAULT_ORDER = "desc" as const;

const adminUserV1 = new Elysia({ prefix: "/admin/users" })
  .use(withAuth)
  .get(
    "/",
    async ({ user, set, query }) => {
      if (!hasPermission(user.permissions, "admin:user:read")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const result = await listUsers({
        query: query.query,
        sort: query.sort || DEFAULT_SORT,
        order: parseOrder(query.order),
        isBanned: parseIsBannedQuery(query.isBanned),
        cursor: query.cursor,
        limit: parseLimit(query.limit),
      });

      return result;
    },
    {
      query: t.Object({
        query: t.Optional(t.String()),
        sort: t.Optional(t.String()),
        order: t.Optional(t.String()),
        isBanned: t.Optional(t.String()),
        cursor: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/:userId",
    async ({ user, set, params }) => {
      if (!hasPermission(user.permissions, "admin:user:read")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const detail = await getUserDetail(params.userId);

      if (!detail) {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "User not found" };
      }

      return detail;
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
    },
  )
  .patch(
    "/:userId/ban",
    async ({ user, set, params, body }) => {
      if (!hasPermission(user.permissions, "admin:user:ban")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const result = await banUser({
        targetUserId: params.userId,
        actorId: user.id,
        input: body,
      });

      if (result.kind === "not_found") {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "User not found" };
      }

      if (result.kind === "cannot_ban_self") {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "Cannot ban yourself" };
      }

      if (result.kind === "cannot_ban_owner") {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "Cannot ban platform owner" };
      }

      return { status: "ok" };
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      body: t.Object({
        isBanned: t.Boolean(),
        reason: t.String({ minLength: 1 }),
      }),
    },
  );

function parseOrder(value?: string): "asc" | "desc" {
  if (value === "asc" || value === "desc") {
    return value;
  }

  return DEFAULT_ORDER;
}

function parseIsBannedQuery(value?: string): string[] | "all" | undefined {
  if (!value || value === "all") {
    return "all";
  }

  if (value === "true" || value === "false") {
    return [value];
  }

  return "all";
}

function parseLimit(value?: string) {
  if (!value) {
    return USER_LIST_DEFAULT_LIMIT;
  }

  const num = Number(value);

  if (Number.isNaN(num) || num < 1) {
    return USER_LIST_DEFAULT_LIMIT;
  }

  if (num > USER_LIST_MAX_LIMIT) {
    return USER_LIST_MAX_LIMIT;
  }

  return Math.floor(num);
}

export { adminUserV1 };

```

D:/1_Projects/jstonehub/apps/api/src/service/audit/audit.repository.ts

```
import { db } from "#api/shared/db/instance";
import { auditLogTable } from "#api/shared/db/schema/audit.table";

function createAuditLog(params: {
  actorId: string;
  targetId: string | null;
  targetType: string | null;
  action: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
}) {
  return db.insert(auditLogTable).values({
    actorId: params.actorId,
    targetId: params.targetId,
    targetType: params.targetType,
    action: params.action,
    reason: params.reason,
    metadata: params.metadata,
  });
}

export { createAuditLog };

```

D:/1_Projects/jstonehub/apps/api/src/service/auth/auth-cookie.ts

```
import type { Cookie } from "elysia";

import { is } from "@packages/util/guard";

import { env } from "#api/shared/config/env";

type CookieJar = Record<string, Cookie<unknown>>;

const _IS_PRODUCTION = env.NODE_ENV === "production";

const _ACCESS_TOKEN = "access_token";
const _REFRESH_TOKEN = "refresh_token";
const _OAUTH_STATE = "oauth_state";

const _OAUTH_STATE_MAX_AGE = 600;

const _BASE_OPTIONS = {
  httpOnly: true,
  secure: _IS_PRODUCTION,
  sameSite: "lax" as const,
  path: "/",
  domain: env.COOKIE_DOMAIN,
};

const authCookie = {
  name: {
    accessToken: _ACCESS_TOKEN,
    refreshToken: _REFRESH_TOKEN,
    oauthState: _OAUTH_STATE,
  },

  setAccessToken(cookie: CookieJar, token: string) {
    cookie[_ACCESS_TOKEN]?.set({
      ..._BASE_OPTIONS,
      value: token,
      maxAge: env.ACCESS_TOKEN_EXPIRES_IN,
    });
  },

  setRefreshToken(cookie: CookieJar, token: string) {
    cookie[_REFRESH_TOKEN]?.set({
      ..._BASE_OPTIONS,
      value: token,
      maxAge: env.REFRESH_TOKEN_EXPIRES_IN,
    });
  },

  setOauthState(cookie: CookieJar, value: string) {
    cookie[_OAUTH_STATE]?.set({
      ..._BASE_OPTIONS,
      value,
      maxAge: _OAUTH_STATE_MAX_AGE,
    });
  },

  getAccessToken(cookie: CookieJar) {
    return _readCookieValue(cookie, _ACCESS_TOKEN);
  },

  getRefreshToken(cookie: CookieJar) {
    return _readCookieValue(cookie, _REFRESH_TOKEN);
  },

  getOauthState(cookie: CookieJar) {
    return cookie[_OAUTH_STATE]?.value ?? null;
  },

  clearAuth(cookie: CookieJar) {
    _clearCookie(cookie, _ACCESS_TOKEN);
    _clearCookie(cookie, _REFRESH_TOKEN);
  },

  clearOauthState(cookie: CookieJar) {
    _clearCookie(cookie, _OAUTH_STATE);
  },
};

function _readCookieValue(cookie: CookieJar, name: string) {
  const val = cookie[name]?.value;

  if (is.string(val) && val.length > 0) {
    return val;
  }

  return null;
}

function _clearCookie(cookie: CookieJar, name: string) {
  cookie[name]?.set({
    ..._BASE_OPTIONS,
    value: "",
    maxAge: 0,
  });
}

export type { CookieJar };
export { authCookie };

```

D:/1_Projects/jstonehub/apps/api/src/service/auth/auth-seed.repository.ts

```
import { sessionSeedRepository } from "./_repository/session-seed.repository";

const authSeedRepository = {
  session: { ...sessionSeedRepository },
} as const;

export { authSeedRepository };

```

D:/1_Projects/jstonehub/apps/api/src/service/auth/auth-token.ts

```
import { jwtVerify, SignJWT } from "jose";

import { env, JWT_SECRET_BYTES } from "#api/shared/config/env";

type AccessTokenPayload = {
  sub: string;
  email: string;
  isBanned: boolean;
  permissions: string[];
};

function generateAccessToken(payload: AccessTokenPayload) {
  return new SignJWT({
    email: payload.email,
    isBanned: payload.isBanned,
    permissions: payload.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.ACCESS_TOKEN_EXPIRES_IN}s`)
    .sign(JWT_SECRET_BYTES);
}

async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });

    return _toAccessTokenPayload(payload);
  } catch {
    return null;
  }
}

function _toAccessTokenPayload(
  payload: Record<string, unknown>,
): AccessTokenPayload {
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    isBanned: payload.isBanned as boolean,
    permissions: payload.permissions as string[],
  };
}

export { generateAccessToken, verifyAccessToken };

```

D:/1_Projects/jstonehub/apps/api/src/service/auth/auth.repository.ts

```
import { authAccountRepository } from "./_repository/auth-account.repository";
import { authLinkRequestRepository } from "./_repository/auth-link-request.repository";
import { sessionRepository } from "./_repository/session.repository";

const authRepository = {
  session: sessionRepository,
  account: authAccountRepository,
  linkRequest: authLinkRequestRepository,
} as const;

export { authRepository };

```

D:/1_Projects/jstonehub/apps/api/src/service/auth/with-auth.ts

```
import { HTTP_STATUS } from "@packages/contract/http-status";
import { is } from "@packages/util/guard";
import { Elysia } from "elysia";

import { verifyAccessToken } from "./auth-token";

const withAuth = new Elysia({ name: "with-auth" }).resolve(
  { as: "scoped" },
  async ({ cookie, status }) => {
    const token = readAccessToken(cookie);

    if (is.null(token)) {
      return status(HTTP_STATUS.UNAUTHORIZED, { error: "UNAUTHORIZED" });
    }

    const payload = await verifyAccessToken(token);

    if (is.null(payload)) {
      return status(HTTP_STATUS.UNAUTHORIZED, { error: "UNAUTHORIZED" });
    }

    if (payload.isBanned) {
      return status(HTTP_STATUS.FORBIDDEN, { error: "BANNED" });
    }

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        isBanned: payload.isBanned,
        permissions: payload.permissions,
      },
    };
  },
);

function readAccessToken(cookie: Record<string, { value: unknown }>) {
  const val = cookie.access_token?.value;

  if (is.string(val) && val.length > 0) {
    return val;
  }

  return null;
}

export { withAuth };

```

D:/1_Projects/jstonehub/apps/api/src/service/permission/permission.repository.ts

```
import { and, eq, like } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { permissionTable } from "#api/shared/db/schema/permission.table";

function findPermissionsByUserId(userId: string) {
  return db
    .select({
      id: permissionTable.id,
      permission: permissionTable.permission,
      grantedBy: permissionTable.grantedBy,
      grantedAt: permissionTable.grantedAt,
    })
    .from(permissionTable)
    .where(eq(permissionTable.userId, userId));
}

function insertPermission(params: {
  userId: string;
  permission: string;
  grantedBy: string | null;
}) {
  return db
    .insert(permissionTable)
    .values({
      userId: params.userId,
      permission: params.permission,
      grantedBy: params.grantedBy,
    })
    .onConflictDoNothing({
      target: [permissionTable.userId, permissionTable.permission],
    });
}

function deletePermission(params: { userId: string; permission: string }) {
  return db
    .delete(permissionTable)
    .where(
      and(
        eq(permissionTable.userId, params.userId),
        eq(permissionTable.permission, params.permission),
      ),
    );
}

function deleteAdminPermissionsByUserId(userId: string) {
  return db
    .delete(permissionTable)
    .where(
      and(
        eq(permissionTable.userId, userId),
        like(permissionTable.permission, "admin:%"),
      ),
    );
}

export {
  deleteAdminPermissionsByUserId,
  deletePermission,
  findPermissionsByUserId,
  insertPermission,
};

```

D:/1_Projects/jstonehub/apps/api/src/service/security/security.repository.ts

```
import type { RecordEventInput, SecuritySeverity } from "./security.type";

import { and, desc, eq, lt, sql } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { securityEventTable } from "#api/shared/db/schema/security-event.table";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

const SECURITY_EVENT_RETENTION_DAYS = 90;
const SECURITY_EVENT_RETENTION_MS = SECURITY_EVENT_RETENTION_DAYS * MS_PER_DAY;

const securityRepository = {
  async insert(input: RecordEventInput) {
    await db.insert(securityEventTable).values({
      userId: input.userId,
      sessionId: input.sessionId,
      eventType: input.eventType,
      severity: input.severity,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata ?? null,
    });
  },

  findByUserId(params: {
    userId: string;
    limit: number;
    beforeCreatedAt?: Date;
    severity?: SecuritySeverity;
  }) {
    const conditions = [eq(securityEventTable.userId, params.userId)];

    if (params.beforeCreatedAt) {
      conditions.push(lt(securityEventTable.createdAt, params.beforeCreatedAt));
    }

    if (params.severity) {
      conditions.push(eq(securityEventTable.severity, params.severity));
    }

    return db
      .select()
      .from(securityEventTable)
      .where(and(...conditions))
      .orderBy(desc(securityEventTable.createdAt))
      .limit(params.limit + 1);
  },

  async countByUserId(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(securityEventTable)
      .where(eq(securityEventTable.userId, userId));

    return result[0]?.count ?? 0;
  },

  async deleteOld(): Promise<number> {
    const cutoff = new Date(Date.now() - SECURITY_EVENT_RETENTION_MS);

    const deleted = await db
      .delete(securityEventTable)
      .where(lt(securityEventTable.createdAt, cutoff))
      .returning({ id: securityEventTable.id });

    return deleted.length;
  },
} as const;

export { SECURITY_EVENT_RETENTION_MS, securityRepository };

```

D:/1_Projects/jstonehub/apps/api/src/service/security/security.service.ts

```
import type { RecordEventInput } from "./security.type";

import { securityRepository } from "./security.repository";

const securityService = {
  async recordEvent(input: RecordEventInput) {
    try {
      await securityRepository.insert(input);
    } catch {
      // Security logging must never break user-facing operations
    }
  },

  async listForUser(params: {
    userId: string;
    limit: number;
    cursor?: string;
    severity?: "info" | "warning" | "critical";
  }) {
    const decodedCursor = _decodeCursor(params.cursor);

    const rows = await securityRepository.findByUserId({
      userId: params.userId,
      limit: params.limit,
      beforeCreatedAt: decodedCursor,
      severity: params.severity,
    });

    const hasMore = rows.length > params.limit;
    const items = hasMore ? rows.slice(0, params.limit) : rows;

    const lastItem = items.at(-1);
    const nextCursor =
      hasMore && lastItem ? _encodeCursor(lastItem.createdAt) : null;

    return {
      items,
      nextCursor,
    };
  },
} as const;

function _encodeCursor(createdAt: Date) {
  return btoa(createdAt.toISOString());
}

function _decodeCursor(cursor: string | undefined) {
  if (!cursor) {
    return;
  }

  try {
    const decoded = atob(cursor);
    const date = new Date(decoded);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    return date;
  } catch {
    return;
  }
}

export { securityService };

```

D:/1_Projects/jstonehub/apps/api/src/service/security/security.type.ts

```
type SecurityEventType = (typeof SECURITY_EVENT_TYPE)[number];
type SecuritySeverity = (typeof SECURITY_SEVERITY)[number];

const SECURITY_EVENT_TYPE = [
  "login_success",
  "logout",
  "session_revoked",
  "all_sessions_revoked",
  "refresh_rotated",
  "suspicious_activity",
  "token_reuse_detected",
  "session_limit_exceeded",
] as const;

const SECURITY_SEVERITY = ["info", "warning", "critical"] as const;

type RecordEventInput = {
  userId: string;
  sessionId: string | null;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown> | null;
};

export type { RecordEventInput, SecurityEventType, SecuritySeverity };
export { SECURITY_EVENT_TYPE, SECURITY_SEVERITY };

```

D:/1_Projects/jstonehub/apps/api/src/service/user/user.type.ts

```
import type { InferSelectModel } from "drizzle-orm";

import type { userTable } from "../../shared/db/schema/user.table";

type UserRow = InferSelectModel<typeof userTable>;

type AuthUser = Pick<UserRow, "id" | "email" | "isBanned"> & {
  permissions: string[];
};

type AuthContextUser = Pick<
  UserRow,
  "id" | "email" | "name" | "avatarUrl" | "isBanned"
>;

type UserListItem = Pick<
  UserRow,
  | "id"
  | "email"
  | "name"
  | "avatarUrl"
  | "isBanned"
  | "energyBalance"
  | "loginStreak"
  | "createdAt"
>;

type UserDetail = UserRow & {
  permissions: string[];
  activeSessionCount: number;
};

type CreateUserInput = Pick<UserRow, "email" | "name" | "avatarUrl">;

type UpdateUserProfileInput = Pick<UserRow, "name" | "avatarUrl">;

type BanUserInput = {
  isBanned: boolean;
  reason: string;
};

export type {
  AuthContextUser,
  AuthUser,
  BanUserInput,
  CreateUserInput,
  UpdateUserProfileInput,
  UserDetail,
  UserListItem,
  UserRow,
};

```

D:/1_Projects/jstonehub/apps/api/src/shared/config/env.ts

```
import process from "node:process";
import { Type } from "typebox";
import { Value } from "typebox/value";

const LEADING_SLASH_REGEX = /^\//;
const TRAILING_SLASH_REGEX = /\/$/;

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([
    Type.Literal("development"),
    Type.Literal("production"),
    Type.Literal("test"),
  ]),

  PORT: Type.Number({ minimum: 1, maximum: 65_535 }),
  API_URL: Type.String({ minLength: 1 }),
  CORS_ORIGINS: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),

  DATABASE_URL: Type.String({ minLength: 1 }),
  REDIS_URL: Type.String({ minLength: 1 }),
  MINIO_ENDPOINT: Type.String({ minLength: 1 }),
  MINIO_PORT: Type.Number({ minimum: 1, maximum: 65_535 }),
  MINIO_ACCESS_KEY: Type.String({ minLength: 1 }),
  MINIO_SECRET_KEY: Type.String({ minLength: 1 }),
  MINIO_USE_SSL: Type.Boolean(),
  MINIO_BUCKET: Type.String({ minLength: 1 }),

  JWT_SECRET: Type.String({ minLength: 1 }),
  JWT_ISSUER: Type.String({ minLength: 1 }),
  JWT_AUDIENCE: Type.String({ minLength: 1 }),
  INTERNAL_SECRET: Type.String({ minLength: 1 }),
  GOOGLE_CLIENT_ID: Type.String({ minLength: 1 }),
  GOOGLE_CLIENT_SECRET: Type.String({ minLength: 1 }),

  COOKIE_DOMAIN: Type.String({ minLength: 1 }),
  ACCESS_TOKEN_EXPIRES_IN: Type.Number({ minimum: 1 }),
  REFRESH_TOKEN_EXPIRES_IN: Type.Number({ minimum: 1 }),

  OWNER_EMAIL: Type.String({ minLength: 1 }),

  // When true, trust inbound x-request-id from clients (use behind trusted proxy only).
  // Defaults: dev=true (easier debugging), prod=false (prevents log poisoning, CWE-117).
  TRUST_INBOUND_REQUEST_ID: Type.Boolean(),
});

function parseEnv() {
  const raw = process.env;

  const parsed = {
    NODE_ENV: raw.NODE_ENV,

    PORT: Number(raw.PORT),
    API_URL: raw.API_URL,
    CORS_ORIGINS: parseAndNormalizeOrigins(raw.CORS_ORIGINS),

    DATABASE_URL: raw.DATABASE_URL,
    REDIS_URL: raw.REDIS_URL,
    MINIO_ENDPOINT: raw.MINIO_ENDPOINT,
    MINIO_PORT: Number(raw.MINIO_PORT),
    MINIO_ACCESS_KEY: raw.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: raw.MINIO_SECRET_KEY,
    MINIO_USE_SSL: parseBoolean(raw.MINIO_USE_SSL),
    MINIO_BUCKET: raw.MINIO_BUCKET,

    JWT_SECRET: raw.JWT_SECRET,
    JWT_ISSUER: raw.JWT_ISSUER,
    JWT_AUDIENCE: raw.JWT_AUDIENCE,
    INTERNAL_SECRET: raw.INTERNAL_SECRET,
    GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: raw.GOOGLE_CLIENT_SECRET,

    COOKIE_DOMAIN: raw.COOKIE_DOMAIN,
    ACCESS_TOKEN_EXPIRES_IN: Number(raw.ACCESS_TOKEN_EXPIRES_IN),
    REFRESH_TOKEN_EXPIRES_IN: Number(raw.REFRESH_TOKEN_EXPIRES_IN),

    OWNER_EMAIL: raw.OWNER_EMAIL,

    TRUST_INBOUND_REQUEST_ID: parseBooleanWithDefault(
      raw.TRUST_INBOUND_REQUEST_ID,
      raw.NODE_ENV !== "production",
    ),
  };

  if (!Value.Check(EnvSchema, parsed)) {
    const errors = Value.Errors(EnvSchema, parsed);

    const errorsWithValues = [...errors].map((error) => ({
      ...error,
      value: Value.Pointer.Get(parsed, error.instancePath),
    }));

    const message = errorsWithValues
      .map((e) => {
        const envName =
          e.instancePath.replace(LEADING_SLASH_REGEX, "") || "root";
        const received = JSON.stringify(e.value);
        return `  • ${envName}: ${e.message} (received: ${received})`;
      })
      .join("\n");

    throw new Error(`❌ API: Invalid environment variables:\n${message}`);
  }

  return parsed;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }
  return;
}

function parseBooleanWithDefault(
  value: string | undefined,
  fallback: boolean,
): boolean {
  const parsed = parseBoolean(value);
  if (parsed === undefined) {
    return fallback;
  }
  return parsed;
}

function parseAndNormalizeOrigins(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map(normalizeOrigin);
}

function normalizeOrigin(url: string) {
  return url.replace(TRAILING_SLASH_REGEX, "");
}

const env = parseEnv();

const JWT_SECRET_BYTES = new TextEncoder().encode(env.JWT_SECRET);

export { env, JWT_SECRET_BYTES };
```

D:/1_Projects/jstonehub/apps/api/src/shared/cron/session-cleanup.cron.ts

```
import { Elysia } from "elysia";

import { corsPlugin } from "#api/shared/plugin/cors.plugin";

const api = new Elysia()
  .use(corsPlugin)

export { api };
```

D:/1_Projects/jstonehub/apps/api/src/shared/db/instance.ts

```
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

import { env } from "#api/shared/config/env";

import { schema } from "./_all";

const client = new SQL(env.DATABASE_URL);
const db = drizzle({ client, schema });

export { db };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/migrate.ts

```
import process from "node:process";
import { migrate } from "drizzle-orm/bun-sql/migrator";

import { db } from "./instance";

// biome-ignore lint/suspicious/noConsole: Migration logging required
console.log("⏳ Running migrations...");

try {
  await migrate(db, { migrationsFolder: "drizzle" });
  // biome-ignore lint/suspicious/noConsole: Migration logging required
  console.log("✅ Migrations completed successfully");
  process.exit(0);
} catch (error) {
  // biome-ignore lint/suspicious/noConsole: Migration logging required
  console.error("❌ Migration failed:", error);
  process.exit(1);
}

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/_all.ts

```
import {
  auditLogRelations,
  authAccountRelations,
  authLinkRequestRelations,
  permissionRelations,
  securityEventRelations,
  sessionRelations,
  userRelations,
} from "./_relation";
import { auditLogTable } from "./schema/audit.table";
import { authAccountTable } from "./schema/auth-account.table";
import { authLinkRequestTable } from "./schema/auth-link-request.table";
import { permissionTable } from "./schema/permission.table";
import { securityEventTable } from "./schema/security-event.table";
import { sessionTable } from "./schema/session.table";
import { userTable } from "./schema/user.table";

const schema = {
  auditLogTable,
  authAccountTable,
  authLinkRequestTable,
  permissionTable,
  securityEventTable,
  sessionTable,
  userTable,

  auditLogRelations,
  authAccountRelations,
  authLinkRequestRelations,
  permissionRelations,
  securityEventRelations,
  sessionRelations,
  userRelations,
};

export { schema };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/_relation.ts

```
import { relations } from "drizzle-orm";

import { auditLogTable } from "./schema/audit.table";
import { authAccountTable } from "./schema/auth-account.table";
import { authLinkRequestTable } from "./schema/auth-link-request.table";
import { permissionTable } from "./schema/permission.table";
import { securityEventTable } from "./schema/security-event.table";
import { sessionTable } from "./schema/session.table";
import { userTable } from "./schema/user.table";

const userRelations = relations(userTable, ({ many }) => ({
  authAccounts: many(authAccountTable),
  authLinkRequests: many(authLinkRequestTable),
  sessions: many(sessionTable),
  permissions: many(permissionTable, { relationName: "userPermissions" }),
  auditLogsAsActor: many(auditLogTable, { relationName: "auditActor" }),
  securityEvents: many(securityEventTable),
}));

const authAccountRelations = relations(authAccountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [authAccountTable.userId],
    references: [userTable.id],
  }),
}));

const authLinkRequestRelations = relations(authLinkRequestTable, ({ one }) => ({
  targetUser: one(userTable, {
    fields: [authLinkRequestTable.targetUserId],
    references: [userTable.id],
  }),
}));

const sessionRelations = relations(sessionTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
  securityEvents: many(securityEventTable),
}));

const permissionRelations = relations(permissionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [permissionTable.userId],
    references: [userTable.id],
    relationName: "userPermissions",
  }),
  grantedByUser: one(userTable, {
    fields: [permissionTable.grantedBy],
    references: [userTable.id],
    relationName: "permissionGranter",
  }),
}));

const auditLogRelations = relations(auditLogTable, ({ one }) => ({
  actor: one(userTable, {
    fields: [auditLogTable.actorId],
    references: [userTable.id],
    relationName: "auditActor",
  }),
}));

const securityEventRelations = relations(securityEventTable, ({ one }) => ({
  user: one(userTable, {
    fields: [securityEventTable.userId],
    references: [userTable.id],
  }),
  session: one(sessionTable, {
    fields: [securityEventTable.sessionId],
    references: [sessionTable.id],
  }),
}));

export {
  auditLogRelations,
  authAccountRelations,
  authLinkRequestRelations,
  permissionRelations,
  securityEventRelations,
  sessionRelations,
  userRelations,
};

```

D:/1_Projects/jstonehub/apps/api/src/shared/helper/ip-address.ts

```
function extractIpAddress(input: {
  request: Request;
  server: { requestIP: (req: Request) => { address: string } | null } | null;
}) {
  const forwardedFor = input.request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = input.request.headers.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  const serverIp = input.server?.requestIP(input.request);

  if (serverIp) {
    return serverIp.address;
  }

  return null;
}

export { extractIpAddress };

```

D:/1_Projects/jstonehub/apps/api/src/shared/helper/user-agent.ts

```
type ParsedUserAgent = {
  deviceType: string;
  os: string;
  browser: string;
};

const RE_MOBILE_IOS = /iPhone|iPod/;
const RE_TABLET = /iPad|Tablet/;
const RE_ANDROID = /Android/;
const RE_MOBILE_SUFFIX = /Mobile/;

const RE_WINDOWS_10 = /Windows NT 10/;
const RE_WINDOWS_11 = /Windows NT 11/;
const RE_WINDOWS = /Windows/;
const RE_MAC = /Mac OS X/;
const RE_IOS = /iPhone OS|iOS/;
const RE_LINUX = /Linux/;

const RE_EDGE = /Edg\//;
const RE_CHROME = /Chrome\//;
const RE_CHROMIUM = /Chromium/;
const RE_FIREFOX = /Firefox\//;
const RE_SAFARI = /Safari\//;
const RE_CHROME_IN_UA = /Chrome/;
const RE_OPERA = /Opera|OPR\//;

function parseUserAgent(userAgent: string): ParsedUserAgent {
  if (!userAgent || userAgent === "unknown") {
    return {
      deviceType: "Unknown",
      os: "Unknown",
      browser: "Unknown",
    };
  }

  return {
    deviceType: _detectDeviceType(userAgent),
    os: _detectOs(userAgent),
    browser: _detectBrowser(userAgent),
  };
}

function _detectDeviceType(ua: string) {
  if (RE_MOBILE_IOS.test(ua)) {
    return "Mobile";
  }
  if (RE_TABLET.test(ua)) {
    return "Tablet";
  }
  if (RE_ANDROID.test(ua)) {
    return RE_MOBILE_SUFFIX.test(ua) ? "Mobile" : "Tablet";
  }
  return "Desktop";
}

function _detectOs(ua: string) {
  if (RE_WINDOWS_10.test(ua)) {
    return "Windows 10";
  }
  if (RE_WINDOWS_11.test(ua)) {
    return "Windows 11";
  }
  if (RE_WINDOWS.test(ua)) {
    return "Windows";
  }
  if (RE_MAC.test(ua)) {
    return "macOS";
  }
  if (RE_IOS.test(ua)) {
    return "iOS";
  }
  if (RE_ANDROID.test(ua)) {
    return "Android";
  }
  if (RE_LINUX.test(ua)) {
    return "Linux";
  }
  return "Unknown";
}

function _detectBrowser(ua: string) {
  if (RE_EDGE.test(ua)) {
    return "Edge";
  }
  if (RE_CHROME.test(ua) && !RE_CHROMIUM.test(ua)) {
    return "Chrome";
  }
  if (RE_FIREFOX.test(ua)) {
    return "Firefox";
  }
  if (RE_SAFARI.test(ua) && !RE_CHROME_IN_UA.test(ua)) {
    return "Safari";
  }
  if (RE_OPERA.test(ua)) {
    return "Opera";
  }
  return "Unknown";
}

export type { ParsedUserAgent };
export { parseUserAgent };

```

D:/1_Projects/jstonehub/apps/api/src/shared/plugin/request-id.plugin.ts

```
import { is } from "@packages/util/guard";
import { createId } from "@packages/util/id";
import { Elysia } from "elysia";

import { env } from "#api/shared/config/env";

type RequestIdStore = {
  requestId: string;
  startedAt: number;
  signal: AbortSignal;
};

// W3C Trace Context traceparent format: version-traceId-spanId-flags
// version: 2 hex, traceId: 32 hex, spanId: 16 hex, flags: 2 hex
// See: https://www.w3.org/TR/trace-context/#traceparent-header
const TRACEPARENT_REGEX =
  /^[0-9a-f]{2}-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}$/;

// Conservative charset: alphanumeric, dash, underscore. Blocks CRLF injection (CWE-113)
// and log poisoning (CWE-117). Length 8..64 aligns with ULID/UUID/cuid2 formats.
const REQUEST_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;

const TRACEPARENT_HEADER = "traceparent";
const REQUEST_ID_HEADER = "x-request-id";
const STORE_KEY = "requestId" as const;

const requestIdPlugin = new Elysia({ name: "core.request-id" })
  .state(STORE_KEY, null as RequestIdStore | null)
  // onRequest runs BEFORE parse/validate — guarantees requestId exists
  // in every error path, including body parse failures and validation errors.
  .onRequest(function initRequestId({ request, store }) {
    store[STORE_KEY] = {
      requestId: resolveRequestId(request),
      startedAt: performance.now(),
      signal: request.signal,
    };
  })
  // Expose fields via derive so Elysia infers them into context type
  // for all downstream plugins using .use(requestIdPlugin).
  // derive (not resolve) — to make fields available BEFORE validation too.
  .derive({ as: "global" }, function exposeRequestId({ store }) {
    const state = store[STORE_KEY];

    if (is.null(state)) {
      const fallback: RequestIdStore = {
        requestId: createId(),
        startedAt: performance.now(),
        signal: new AbortController().signal,
      };
      store[STORE_KEY] = fallback;
      return fallback;
    }

    return state;
  })
  // mapResponse runs on BOTH success and error paths (unlike afterHandle).
  // Clients always receive x-request-id to attach to support tickets.
  .mapResponse({ as: "global" }, function setRequestIdHeader({ set, store }) {
    const state = store[STORE_KEY];
    if (state) {
      set.headers[REQUEST_ID_HEADER] = state.requestId;
    }
  });

function resolveRequestId(request: Request) {
  const fromTraceparent = extractTraceparentId(
    request.headers.get(TRACEPARENT_HEADER),
  );
  if (fromTraceparent) {
    return fromTraceparent;
  }

  if (env.TRUST_INBOUND_REQUEST_ID) {
    const fromHeader = validateRequestIdHeader(
      request.headers.get(REQUEST_ID_HEADER),
    );
    if (fromHeader) {
      return fromHeader;
    }
  }

  return createId();
}

function extractTraceparentId(header: string | null) {
  if (is.null(header)) {
    return null;
  }
  const match = header.match(TRACEPARENT_REGEX);
  if (!match) {
    return null;
  }
  return match[1] ?? null;
}

function validateRequestIdHeader(header: string | null) {
  if (is.null(header)) {
    return null;
  }
  if (!REQUEST_ID_REGEX.test(header)) {
    return null;
  }
  return header;
}

export type { RequestIdStore };
export { requestIdPlugin };
```

D:/1_Projects/jstonehub/packages/contract/src/feature/_test/user.test.ts

```
import { USER_FILTERS, USER_SORT_DEFAULT, USER_SORTS } from "../user";

describe("user contract", () => {
  it("has expected sorts", () => {
    expect(USER_SORTS).toEqual([
      "createdAt",
      "name",
      "email",
      "energyBalance",
      "loginStreak",
    ]);
  });

  it("has default sort as createdAt", () => {
    expect(USER_SORT_DEFAULT).toBe("createdAt");
  });

  it("has isBanned filter with true/false values", () => {
    expect(USER_FILTERS.isBanned.values).toEqual(["true", "false"]);
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/_test/constant.test.ts

```
import {
  DEFAULT_PAGINATION_CURSOR_LIMIT,
  DEFAULT_PAGINATION_ORDER,
  PAGINATION_FILTER_ALL,
  PAGINATION_ORDERS,
  PAGINATION_QUERY_MAX_LENGTH,
} from "../constant";

describe("pagination constants", () => {
  it("has expected orders", () => {
    expect(PAGINATION_ORDERS).toEqual(["asc", "desc"]);
  });

  it("has default order as asc", () => {
    expect(DEFAULT_PAGINATION_ORDER).toBe("asc");
  });

  it("has query max length", () => {
    expect(PAGINATION_QUERY_MAX_LENGTH).toBe(200);
  });

  it("has filter all value", () => {
    expect(PAGINATION_FILTER_ALL).toBe("all");
  });

  it("has default cursor limit", () => {
    expect(DEFAULT_PAGINATION_CURSOR_LIMIT).toBe(50);
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/_test/typebox.test.ts

```
import { Value } from "typebox/value";

import { createQueryParamsSchema } from "../typebox";

describe("createQueryParamsSchema", () => {
  describe("mode: all", () => {
    it("creates empty object schema", () => {
      const schema = createQueryParamsSchema({ mode: "all" });

      expect(Value.Check(schema, {})).toBe(true);
    });
  });

  describe("mode: cursor", () => {
    const sorts = ["createdAt", "name"] as const;

    it("accepts empty object with defaults", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, {})).toBe(true);
    });

    it("accepts valid query", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { query: "search term" })).toBe(true);
    });

    it("rejects query exceeding max length", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { query: "x".repeat(201) })).toBe(false);
    });

    it("accepts valid sort", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { sort: "name" })).toBe(true);
    });

    it("rejects invalid sort", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { sort: "invalid" })).toBe(false);
    });

    it("accepts valid order", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { order: "desc" })).toBe(true);
    });

    it("rejects invalid order", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { order: "invalid" })).toBe(false);
    });

    it("accepts cursor string", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { cursor: "abc123" })).toBe(true);
    });

    it("accepts valid limit", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { limit: 10 })).toBe(true);
    });

    it("rejects limit exceeding max", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        limitDefault: 20,
        limitMax: 20,
      });

      expect(Value.Check(schema, { limit: 21 })).toBe(false);
    });

    it("rejects limit of 0", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { limit: 0 })).toBe(false);
    });

    it("uses custom limitDefault and limitMax", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        limitDefault: 10,
        limitMax: 100,
      });

      expect(Value.Check(schema, { limit: 100 })).toBe(true);
      expect(Value.Check(schema, { limit: 101 })).toBe(false);
    });

    it("accepts filter with 'all' value", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      expect(Value.Check(schema, { status: "all" })).toBe(true);
    });

    it("accepts filter with array of valid values", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      expect(Value.Check(schema, { status: ["active"] })).toBe(true);
      expect(Value.Check(schema, { status: ["active", "inactive"] })).toBe(
        true,
      );
    });

    it("rejects filter with invalid value", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      expect(Value.Check(schema, { status: ["unknown"] })).toBe(false);
    });

    it("rejects filter with empty array", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      expect(Value.Check(schema, { status: [] })).toBe(false);
    });

    it("works without filters", () => {
      const schema = createQueryParamsSchema({
        mode: "cursor",
        sorts,
      });

      expect(Value.Check(schema, { sort: "createdAt", order: "asc" })).toBe(
        true,
      );
    });
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/pagination/_test/valibot.test.ts

```
import { parse } from "valibot";

import { createValidateSearch } from "../valibot";

describe("createValidateSearch", () => {
  describe("mode: all", () => {
    const validate = createValidateSearch({
      mode: "all",
      sorts: ["createdAt", "name"],
      sortDefault: "createdAt",
    });

    it("returns defaults for empty input", () => {
      const result = parse(validate, {});

      expect(result.query).toBe("");
      expect(result.sort).toBe("createdAt");
      expect(result.order).toBe("asc");
    });

    it("accepts valid sort and order", () => {
      const result = parse(validate, { sort: "name", order: "desc" });

      expect(result.sort).toBe("name");
      expect(result.order).toBe("desc");
    });

    it("falls back to default on invalid sort", () => {
      const result = parse(validate, { sort: "invalid" });

      expect(result.sort).toBe("createdAt");
    });

    it("falls back to default on invalid order", () => {
      const result = parse(validate, { order: "invalid" });

      expect(result.order).toBe("asc");
    });

    it("truncates query exceeding max length via fallback", () => {
      const result = parse(validate, { query: "x".repeat(201) });

      expect(result.query).toBe("");
    });

    it("uses custom orderDefault", () => {
      const customValidate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        orderDefault: "desc",
      });

      const result = parse(customValidate, {});

      expect(result.order).toBe("desc");
    });

    it("uses custom queryDefault", () => {
      const customValidate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        queryDefault: "default search",
      });

      const result = parse(customValidate, {});

      expect(result.query).toBe("default search");
    });
  });

  describe("mode: cursor", () => {
    const validate = createValidateSearch({
      mode: "cursor",
      sorts: ["createdAt", "name"],
      sortDefault: "createdAt",
    });

    it("returns defaults for empty input", () => {
      const result = parse(validate, {});

      expect(result.query).toBe("");
      expect(result.sort).toBe("createdAt");
      expect(result.order).toBe("asc");
      expect(result.cursor).toBeUndefined();
      expect(result.limit).toBe(50);
    });

    it("accepts cursor value", () => {
      const result = parse(validate, { cursor: "abc123" });

      expect(result.cursor).toBe("abc123");
    });

    it("accepts valid limit", () => {
      const result = parse(validate, { limit: 10 });

      expect(result.limit).toBe(10);
    });

    it("falls back to default on invalid limit", () => {
      const result = parse(validate, { limit: "not-a-number" });

      expect(result.limit).toBe(50);
    });

    it("falls back on limit exceeding max", () => {
      const result = parse(validate, { limit: 999 });

      expect(result.limit).toBe(50);
    });

    it("falls back on limit of 0", () => {
      const result = parse(validate, { limit: 0 });

      expect(result.limit).toBe(50);
    });

    it("falls back on non-integer limit", () => {
      const result = parse(validate, { limit: 10.5 });

      expect(result.limit).toBe(50);
    });

    it("uses custom limitDefault and limitMax", () => {
      const customValidate = createValidateSearch({
        mode: "cursor",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        limitDefault: 25,
        limitMax: 100,
      });

      const result = parse(customValidate, {});

      expect(result.limit).toBe(25);

      const withLimit = parse(customValidate, { limit: 100 });

      expect(withLimit.limit).toBe(100);

      const overLimit = parse(customValidate, { limit: 101 });

      expect(overLimit.limit).toBe(25);
    });
  });

  describe("filters", () => {
    it("returns default filter value of 'all'", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, {});

      expect(result.status).toBe("all");
    });

    it("accepts 'all' filter value", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, { status: "all" });

      expect(result.status).toBe("all");
    });

    it("accepts array of valid filter values", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, { status: ["active"] });

      expect(result.status).toEqual(["active"]);
    });

    it("falls back on invalid filter value", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, { status: ["unknown"] });

      expect(result.status).toBe("all");
    });

    it("falls back on empty filter array", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: { values: ["active", "inactive"] },
        },
      });

      const result = parse(validate, { status: [] });

      expect(result.status).toBe("all");
    });

    it("uses custom default filter value", () => {
      const validate = createValidateSearch({
        mode: "all",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          status: {
            values: ["active", "inactive"],
            default: ["active"],
          },
        },
      });

      const result = parse(validate, {});

      expect(result.status).toEqual(["active"]);
    });

    it("works with cursor mode and filters", () => {
      const validate = createValidateSearch({
        mode: "cursor",
        sorts: ["createdAt"],
        sortDefault: "createdAt",
        filters: {
          isBanned: { values: ["true", "false"] },
        },
      });

      const result = parse(validate, { isBanned: ["true"] });

      expect(result.isBanned).toEqual(["true"]);
      expect(result.cursor).toBeUndefined();
      expect(result.limit).toBe(50);
    });
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/permission/_test/admin.test.ts

```
import {
  ADMIN_ENTITIES,
  ADMIN_ENTITY_REGISTRY,
  isValidAdminPermission,
} from "../admin";

describe("isValidAdminPermission", () => {
  it("accepts admin:all", () => {
    expect(isValidAdminPermission("admin:all")).toBe(true);
  });

  it("accepts admin:user:read", () => {
    expect(isValidAdminPermission("admin:user:read")).toBe(true);
  });

  it("accepts admin:user:ban", () => {
    expect(isValidAdminPermission("admin:user:ban")).toBe(true);
  });

  it("accepts admin:joke:all", () => {
    expect(isValidAdminPermission("admin:joke:all")).toBe(true);
  });

  it("accepts admin:access:read", () => {
    expect(isValidAdminPermission("admin:access:read")).toBe(true);
  });

  it("rejects unknown entity", () => {
    expect(isValidAdminPermission("admin:unknown:read")).toBe(false);
  });

  it("rejects unknown action for known entity", () => {
    expect(isValidAdminPermission("admin:joke:fly")).toBe(false);
  });

  it("rejects non-admin prefix", () => {
    expect(isValidAdminPermission("org:abc:manage")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidAdminPermission("")).toBe(false);
  });

  it("accepts all entity+action combinations from registry", () => {
    for (const entity of ADMIN_ENTITIES) {
      const actions = ADMIN_ENTITY_REGISTRY[entity];
      for (const action of actions) {
        expect(isValidAdminPermission(`admin:${entity}:${action}`)).toBe(true);
      }
    }
  });
});

describe("ADMIN_ENTITIES", () => {
  it("contains expected entities", () => {
    expect(ADMIN_ENTITIES).toContain("access");
    expect(ADMIN_ENTITIES).toContain("user");
    expect(ADMIN_ENTITIES).toContain("joke");
    expect(ADMIN_ENTITIES).toContain("language");
    expect(ADMIN_ENTITIES).toContain("pricing");
    expect(ADMIN_ENTITIES).toContain("feedback");
    expect(ADMIN_ENTITIES).toContain("audit");
  });

  it("has user-specific actions", () => {
    const userActions = ADMIN_ENTITY_REGISTRY.user;
    expect(userActions).toContain("ban");
    expect(userActions).toContain("grant_energy");
    expect(userActions).toContain("grant_subscription");
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/permission/_test/check.test.ts

```
import { hasPermission, parsePermission } from "../check";

describe("parsePermission", () => {
  it("parses admin:all", () => {
    expect(parsePermission("admin:all")).toEqual({
      scope: "admin",
      resourceId: null,
      entity: null,
      action: "all",
    });
  });

  it("parses admin:user:read", () => {
    expect(parsePermission("admin:user:read")).toEqual({
      scope: "admin",
      resourceId: null,
      entity: "user",
      action: "read",
    });
  });

  it("parses org:abc123:manage", () => {
    expect(parsePermission("org:abc123:manage")).toEqual({
      scope: "org",
      resourceId: "abc123",
      entity: null,
      action: "manage",
    });
  });

  it("parses project:xyz789:view", () => {
    expect(parsePermission("project:xyz789:view")).toEqual({
      scope: "project",
      resourceId: "xyz789",
      entity: null,
      action: "view",
    });
  });

  it("returns null for empty string", () => {
    expect(parsePermission("")).toBeNull();
  });

  it("returns null for string without colon", () => {
    expect(parsePermission("invalid")).toBeNull();
  });

  it("returns null for admin permission without action (admin:)", () => {
    expect(parsePermission("admin:")).toBeNull();
  });

  it("returns null for admin: with entity but no action (admin:user)", () => {
    expect(parsePermission("admin:user")).toBeNull();
  });

  it("returns null for admin: with entity and empty action (admin:user:)", () => {
    expect(parsePermission("admin:user:")).toBeNull();
  });

  it("returns null for admin: with empty entity (admin::read)", () => {
    expect(parsePermission("admin::read")).toBeNull();
  });

  it("returns null for scoped with no second colon (org:abc)", () => {
    expect(parsePermission("org:abc")).toBeNull();
  });

  it("returns null for scoped with empty scope (:abc:read)", () => {
    expect(parsePermission(":abc:read")).toBeNull();
  });

  it("returns null for scoped with empty resourceId (org::read)", () => {
    expect(parsePermission("org::read")).toBeNull();
  });

  it("returns null for scoped with empty action (org:abc:)", () => {
    expect(parsePermission("org:abc:")).toBeNull();
  });
});

describe("hasPermission", () => {
  it("returns false when required permission cannot be parsed", () => {
    const permissions = ["admin:user:read"];
    expect(hasPermission(permissions, "nocolon" as any)).toBe(false);
  });

  it("matches exact permission", () => {
    const permissions = ["admin:user:read"];
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
  });

  it("returns false when permission not present", () => {
    const permissions = ["admin:user:read"];
    expect(hasPermission(permissions, "admin:user:ban")).toBe(false);
  });

  it("matches via entity wildcard (admin:user:all)", () => {
    const permissions = ["admin:user:all"];
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
    expect(hasPermission(permissions, "admin:user:ban")).toBe(true);
  });

  it("does not match entity wildcard for different entity", () => {
    const permissions = ["admin:user:all"];
    expect(hasPermission(permissions, "admin:joke:read")).toBe(false);
  });

  it("matches via scope wildcard (admin:all)", () => {
    const permissions = ["admin:all"];
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
    expect(hasPermission(permissions, "admin:joke:delete")).toBe(true);
    expect(hasPermission(permissions, "admin:pricing:manage")).toBe(true);
  });

  it("admin:all matches admin:all itself", () => {
    const permissions = ["admin:all"];
    expect(hasPermission(permissions, "admin:all")).toBe(true);
  });

  it("admin:all does not match org permissions", () => {
    const permissions = ["admin:all"];
    expect(hasPermission(permissions, "org:abc:manage")).toBe(false);
  });

  it("matches exact org permission", () => {
    const permissions = ["org:abc123:fund"];
    expect(hasPermission(permissions, "org:abc123:fund")).toBe(true);
  });

  it("does not match org permission for different org", () => {
    const permissions = ["org:abc123:fund"];
    expect(hasPermission(permissions, "org:xyz789:fund")).toBe(false);
  });

  it("matches via resource wildcard (org:id:all)", () => {
    const permissions = ["org:abc123:all"];
    expect(hasPermission(permissions, "org:abc123:fund")).toBe(true);
    expect(hasPermission(permissions, "org:abc123:manage")).toBe(true);
  });

  it("matches exact project permission", () => {
    const permissions = ["project:xyz:manage"];
    expect(hasPermission(permissions, "project:xyz:manage")).toBe(true);
  });

  it("matches project via resource wildcard", () => {
    const permissions = ["project:xyz:all"];
    expect(hasPermission(permissions, "project:xyz:view")).toBe(true);
    expect(hasPermission(permissions, "project:xyz:manage")).toBe(true);
  });

  it("matches exact account permission", () => {
    const permissions = ["account:def:view"];
    expect(hasPermission(permissions, "account:def:view")).toBe(true);
  });

  it("handles empty permissions array", () => {
    expect(hasPermission([], "admin:user:read")).toBe(false);
  });

  it("entity wildcard does not match :all request itself redundantly", () => {
    const permissions = ["admin:user:read"];
    expect(hasPermission(permissions, "admin:user:all")).toBe(false);
  });

  it("priority: exact match found first in array", () => {
    const permissions = ["admin:user:read", "admin:all"];
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
  });

  it("returns false for scoped :all when only specific permission exists", () => {
    const permissions = ["org:abc:fund"];
    expect(hasPermission(permissions, "org:abc:all")).toBe(false);
  });

  it("resource wildcard does not cross resource ids", () => {
    const permissions = ["org:abc:all"];
    expect(hasPermission(permissions, "org:xyz:fund")).toBe(false);
  });

  it("checks multiple permissions efficiently", () => {
    const permissions = [
      "admin:access:read",
      "admin:user:read",
      "admin:joke:all",
      "org:abc:fund",
    ];

    expect(hasPermission(permissions, "admin:access:read")).toBe(true);
    expect(hasPermission(permissions, "admin:user:read")).toBe(true);
    expect(hasPermission(permissions, "admin:joke:read")).toBe(true);
    expect(hasPermission(permissions, "admin:joke:delete")).toBe(true);
    expect(hasPermission(permissions, "org:abc:fund")).toBe(true);
    expect(hasPermission(permissions, "admin:user:ban")).toBe(false);
    expect(hasPermission(permissions, "org:abc:manage")).toBe(false);
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/permission/_test/extract.test.ts

```
import {
  extractEntityId,
  extractScope,
  isAccountPermission,
  isAdminPermission,
  isOrgPermission,
  isProjectPermission,
} from "../extract";

describe("extractScope", () => {
  it("extracts admin scope", () => {
    expect(extractScope("admin:user:read")).toBe("admin");
  });

  it("extracts admin scope from admin:all", () => {
    expect(extractScope("admin:all")).toBe("admin");
  });

  it("extracts org scope", () => {
    expect(extractScope("org:abc123:manage")).toBe("org");
  });

  it("extracts project scope", () => {
    expect(extractScope("project:xyz789:view")).toBe("project");
  });

  it("extracts account scope", () => {
    expect(extractScope("account:def456:manage")).toBe("account");
  });

  it("returns null for unknown scope", () => {
    expect(extractScope("unknown:something:read")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractScope("")).toBeNull();
  });

  it("returns null for string without colon", () => {
    expect(extractScope("nocolon")).toBeNull();
  });
});

describe("extractEntityId", () => {
  it("returns null for admin permissions", () => {
    expect(extractEntityId("admin:user:read")).toBeNull();
  });

  it("returns null for admin:all", () => {
    expect(extractEntityId("admin:all")).toBeNull();
  });

  it("extracts org id", () => {
    expect(extractEntityId("org:abc123:manage")).toBe("abc123");
  });

  it("extracts project id", () => {
    expect(extractEntityId("project:xyz789:view")).toBe("xyz789");
  });

  it("extracts account id", () => {
    expect(extractEntityId("account:def456:manage")).toBe("def456");
  });

  it("returns null for string without second colon", () => {
    expect(extractEntityId("org:nocolon")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractEntityId("")).toBeNull();
  });

  it("returns null when entity id is empty", () => {
    expect(extractEntityId("org::manage")).toBeNull();
  });
});

describe("isAdminPermission", () => {
  it("returns true for admin:user:read", () => {
    expect(isAdminPermission("admin:user:read")).toBe(true);
  });

  it("returns true for admin:all", () => {
    expect(isAdminPermission("admin:all")).toBe(true);
  });

  it("returns false for org permission", () => {
    expect(isAdminPermission("org:abc:manage")).toBe(false);
  });
});

describe("isOrgPermission", () => {
  it("returns true for org permission", () => {
    expect(isOrgPermission("org:abc123:fund")).toBe(true);
  });

  it("returns false for admin permission", () => {
    expect(isOrgPermission("admin:user:read")).toBe(false);
  });
});

describe("isProjectPermission", () => {
  it("returns true for project permission", () => {
    expect(isProjectPermission("project:xyz:manage")).toBe(true);
  });

  it("returns false for org permission", () => {
    expect(isProjectPermission("org:abc:manage")).toBe(false);
  });
});

describe("isAccountPermission", () => {
  it("returns true for account permission", () => {
    expect(isAccountPermission("account:def:view")).toBe(true);
  });

  it("returns false for project permission", () => {
    expect(isAccountPermission("project:xyz:view")).toBe(false);
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/permission/_test/format.test.ts

```
import {
  formatAccountPermission,
  formatAdminPermission,
  formatOrgPermission,
  formatProjectPermission,
} from "../format";

describe("formatAdminPermission", () => {
  it("formats user:read", () => {
    expect(formatAdminPermission({ entity: "user", action: "read" })).toBe(
      "admin:user:read",
    );
  });

  it("formats joke:all", () => {
    expect(formatAdminPermission({ entity: "joke", action: "all" })).toBe(
      "admin:joke:all",
    );
  });

  it("formats access:manage", () => {
    expect(formatAdminPermission({ entity: "access", action: "manage" })).toBe(
      "admin:access:manage",
    );
  });

  it("formats user:ban", () => {
    expect(formatAdminPermission({ entity: "user", action: "ban" })).toBe(
      "admin:user:ban",
    );
  });
});

describe("formatOrgPermission", () => {
  it("formats org permission with id and action", () => {
    expect(formatOrgPermission({ orgId: "abc123", action: "manage" })).toBe(
      "org:abc123:manage",
    );
  });

  it("formats org permission with fund action", () => {
    expect(formatOrgPermission({ orgId: "xyz", action: "fund" })).toBe(
      "org:xyz:fund",
    );
  });
});

describe("formatProjectPermission", () => {
  it("formats project permission with manage", () => {
    expect(
      formatProjectPermission({ projectId: "proj1", action: "manage" }),
    ).toBe("project:proj1:manage");
  });

  it("formats project permission with all", () => {
    expect(formatProjectPermission({ projectId: "proj1", action: "all" })).toBe(
      "project:proj1:all",
    );
  });

  it("formats project permission with view", () => {
    expect(
      formatProjectPermission({ projectId: "proj1", action: "view" }),
    ).toBe("project:proj1:view");
  });
});

describe("formatAccountPermission", () => {
  it("formats account permission with view", () => {
    expect(formatAccountPermission({ accountId: "acc1", action: "view" })).toBe(
      "account:acc1:view",
    );
  });

  it("formats account permission with all", () => {
    expect(formatAccountPermission({ accountId: "acc1", action: "all" })).toBe(
      "account:acc1:all",
    );
  });

  it("formats account permission with manage", () => {
    expect(
      formatAccountPermission({ accountId: "acc1", action: "manage" }),
    ).toBe("account:acc1:manage");
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/permission/_test/org.test.ts

```
import { ORG_ACTION } from "../org";

describe("org constants", () => {
  it("has expected actions", () => {
    expect(ORG_ACTION).toEqual([
      "all",
      "manage",
      "fund",
      "view_logs",
      "project:create",
      "project:delete",
    ]);
  });
});

```

D:/1_Projects/jstonehub/packages/contract/src/permission/_test/resource.test.ts

```
import { RESOURCE_ACTION } from "../resource";

describe("resource constants", () => {
  it("has expected actions", () => {
    expect(RESOURCE_ACTION).toEqual(["manage", "view"]);
  });
});

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_dev/auth.seed.ts

```
import { authSeedRepository } from "#api/service/auth/auth-seed.repository";

const authSeed = {
  createSessionsForUser(params: { userId: string; count: number }) {
    return authSeedRepository.session.createBulkForUser(params);
  },
} as const;

export { authSeed };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_helper/auth-exchange.ts

```
type PendingExchange = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const EXCHANGE_CODE_MAX_AGE_SECONDS = 60;
const CLEANUP_INTERVAL_MS = 30_000;
const MS_PER_SECOND = 1000;

const CODE_BYTES = 32;
const BASE64_PLUS_REGEX = /\+/g;
const BASE64_SLASH_REGEX = /\//g;
const BASE64_PADDING_REGEX = /=+$/;

const pendingExchanges = new Map<string, PendingExchange>();

setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of pendingExchanges) {
    if (entry.expiresAt < now) {
      pendingExchanges.delete(code);
    }
  }
}, CLEANUP_INTERVAL_MS);

function createExchangeCode(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const code = generateRandomCode();

  pendingExchanges.set(code, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + EXCHANGE_CODE_MAX_AGE_SECONDS * MS_PER_SECOND,
  });

  return code;
}

function consumeExchangeCode(code: string) {
  const entry = pendingExchanges.get(code);

  if (!entry) {
    return { kind: "not_found" as const };
  }

  if (entry.expiresAt < Date.now()) {
    pendingExchanges.delete(code);
    return { kind: "expired" as const };
  }

  pendingExchanges.delete(code);

  return {
    kind: "success" as const,
    accessToken: entry.accessToken,
    refreshToken: entry.refreshToken,
  };
}

function generateRandomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_BYTES));
  return btoa(String.fromCharCode(...bytes))
    .replace(BASE64_PLUS_REGEX, "-")
    .replace(BASE64_SLASH_REGEX, "_")
    .replace(BASE64_PADDING_REGEX, "");
}

export { consumeExchangeCode, createExchangeCode };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_helper/auth-google.ts

```
import { Google } from "arctic";

import { env } from "#api/shared/config/env";

import { AUTH_PATHS } from "../_model/auth.constant";

const GOOGLE_CALLBACK_URL = `${env.API_URL}${AUTH_PATHS.prefix}${
  AUTH_PATHS.get.callbackGoogle
}`;
const GOOGLE_SCOPES = ["openid", "email", "profile"];
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
);

function createGoogleAuthUrl(params: { state: string; codeVerifier: string }) {
  return google.createAuthorizationURL(
    params.state,
    params.codeVerifier,
    GOOGLE_SCOPES,
  );
}

async function exchangeGoogleCode(params: {
  code: string;
  codeVerifier: string;
}) {
  try {
    const tokens = await google.validateAuthorizationCode(
      params.code,
      params.codeVerifier,
    );
    return { accessToken: tokens.accessToken() };
  } catch {
    return null;
  }
}

async function fetchGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
    };

    return {
      providerAccountId: data.sub,
      email: data.email,
      name: data.name,
      avatarUrl: data.picture ?? null,
    };
  } catch {
    return null;
  }
}

export { createGoogleAuthUrl, exchangeGoogleCode, fetchGoogleUserInfo };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_helper/auth-hash.ts

```
import { createHash, randomBytes } from "node:crypto";

const _REFRESH_TOKEN_BYTES = 64;
const _HASH_ALGORITHM = "sha256";
const _HASH_ENCODING = "hex" as const;

function hashToken(token: string) {
  return createHash(_HASH_ALGORITHM).update(token).digest(_HASH_ENCODING);
}

function generateRefreshToken() {
  return randomBytes(_REFRESH_TOKEN_BYTES).toString(_HASH_ENCODING);
}

export { generateRefreshToken, hashToken };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_helper/oauth-callback.ts

```
import type { GoogleUserInfo, OauthCallbackResult } from "../_model/auth.type";

import { createAuditLog } from "#api/service/audit/audit.repository";
import { insertPermission } from "#api/service/permission/permission.repository";
import { env } from "#api/shared/config/env";

import { AUTH_LINK_REQUEST_TTL_MS } from "../_model/auth.type";
import { authRepository } from "../auth.repository";
import { createSessionForUser } from "./session-create";

async function handleOauthCallback(params: {
  provider: string;
  userInfo: GoogleUserInfo;
  redirect: string;
  userAgent: string;
  ipAddress: string;
}): Promise<OauthCallbackResult> {
  const existingAccount = await authRepository.findAuthAccount({
    provider: params.provider,
    providerAccountId: params.userInfo.providerAccountId,
  });

  if (existingAccount) {
    return handleExistingAccount({
      userId: existingAccount.userId,
      userInfo: params.userInfo,
      redirect: params.redirect,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    });
  }

  const existingUser = await authRepository.findUserByEmail(
    params.userInfo.email,
  );

  if (existingUser) {
    return handleEmailConflict({
      existingUser,
      provider: params.provider,
      userInfo: params.userInfo,
      redirect: params.redirect,
    });
  }

  return handleNewUser({
    provider: params.provider,
    userInfo: params.userInfo,
    redirect: params.redirect,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });
}

async function handleExistingAccount(params: {
  userId: string;
  userInfo: GoogleUserInfo;
  redirect: string;
  userAgent: string;
  ipAddress: string;
}): Promise<OauthCallbackResult> {
  await authRepository.updateUserProfile({
    userId: params.userId,
    name: params.userInfo.name,
    avatarUrl: params.userInfo.avatarUrl,
  });

  const user = await authRepository.findUserById(params.userId);

  if (!user) {
    return { kind: "banned", redirect: params.redirect };
  }

  return finalizeLogin({
    user,
    redirect: params.redirect,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });
}

async function handleEmailConflict(params: {
  existingUser: { id: string };
  provider: string;
  userInfo: GoogleUserInfo;
  redirect: string;
}): Promise<OauthCallbackResult> {
  const expiresAt = new Date(Date.now() + AUTH_LINK_REQUEST_TTL_MS);

  await authRepository.createAuthLinkRequest({
    targetUserId: params.existingUser.id,
    provider: params.provider,
    providerAccountId: params.userInfo.providerAccountId,
    expiresAt,
  });

  return {
    kind: "link_conflict",
    email: params.userInfo.email,
    redirect: params.redirect,
  };
}

async function handleNewUser(params: {
  provider: string;
  userInfo: GoogleUserInfo;
  redirect: string;
  userAgent: string;
  ipAddress: string;
}): Promise<OauthCallbackResult> {
  const user = await authRepository.createUser({
    email: params.userInfo.email,
    name: params.userInfo.name,
    avatarUrl: params.userInfo.avatarUrl,
  });

  if (!user) {
    return { kind: "banned", redirect: params.redirect };
  }

  await authRepository.createAuthAccount({
    userId: user.id,
    provider: params.provider,
    providerAccountId: params.userInfo.providerAccountId,
  });

  if (isOwnerEmail(user.email)) {
    await insertPermission({
      userId: user.id,
      permission: "admin:all",
      grantedBy: null,
    });
  }

  await createAuditLog({
    actorId: user.id,
    targetId: user.id,
    targetType: "user",
    action: "user_created",
    reason: null,
    metadata: { provider: params.provider },
  });

  return finalizeLogin({
    user,
    redirect: params.redirect,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });
}

async function finalizeLogin(params: {
  user: { id: string; email: string; isBanned: boolean };
  redirect: string;
  userAgent: string;
  ipAddress: string;
}): Promise<OauthCallbackResult> {
  if (params.user.isBanned) {
    return { kind: "banned", redirect: params.redirect };
  }

  const { accessToken, refreshToken } = await createSessionForUser({
    userId: params.user.id,
    email: params.user.email,
    isBanned: params.user.isBanned,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
  });

  return {
    kind: "success",
    userId: params.user.id,
    redirect: params.redirect,
    accessToken,
    refreshToken,
  };
}

function isOwnerEmail(email: string) {
  return email.toLowerCase() === env.OWNER_EMAIL.toLowerCase();
}

export { handleOauthCallback };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_helper/permission.ts

```
import { findPermissionsByUserId } from "#api/service/permission/permission.repository";

async function loadPermissionStrings(userId: string) {
  const rows = await findPermissionsByUserId(userId);
  return rows.map((row) => row.permission);
}

export { loadPermissionStrings };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_helper/session-create.ts

```
import { authRepository } from "#api/service/auth/auth.repository";
import { generateAccessToken } from "#api/service/auth/auth-token";
import { securityService } from "#api/service/security/security.service";

import { generateRefreshToken, hashToken } from "./auth-hash";
import { loadPermissionStrings } from "./permission";

async function createNewSession(params: {
  userId: string;
  email: string;
  isBanned: boolean;
  permissions: string[];
  userAgent: string;
  ipAddress: string;
  eventType: "login_success" | "refresh_rotated";
}) {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  const { sessionId, removedOldestId } =
    await authRepository.session.create.one({
      userId: params.userId,
      tokenHash,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    });

  const accessToken = await generateAccessToken({
    sub: params.userId,
    email: params.email,
    isBanned: params.isBanned,
    permissions: params.permissions,
  });

  await securityService.recordEvent({
    userId: params.userId,
    sessionId,
    eventType: params.eventType,
    severity: "info",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: null,
  });

  if (removedOldestId) {
    await securityService.recordEvent({
      userId: params.userId,
      sessionId: null,
      eventType: "session_limit_exceeded",
      severity: "info",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { removedSessionId: removedOldestId },
    });
  }

  return { accessToken, refreshToken, sessionId };
}

async function createSessionForUser(params: {
  userId: string;
  email: string;
  isBanned: boolean;
  userAgent: string;
  ipAddress: string;
}) {
  const permissions = await loadPermissionStrings(params.userId);

  return createNewSession({
    userId: params.userId,
    email: params.email,
    isBanned: params.isBanned,
    permissions,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
    eventType: "login_success",
  });
}

export { createNewSession, createSessionForUser };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_model/auth.constant.ts

```
import { env } from "#api/shared/config/env";

const AUTH_PATHS = {
  prefix: "/v1/auth",
  get: {
    google: "/google",
    context: "/context",
    sessions: "/sessions",
    providers: "/providers",
    callbackGoogle: "/callback/google",
  },
  post: {
    logout: "/logout",
    refresh: "/refresh",
    exchange: "/exchange",
  },
  delete: {
    sessions: "/sessions",
    sessionById: "/sessions/:sessionId",
    providerById: "/providers/:accountId",
  },
} as const;

const DEFAULT_ERROR_PATH = "/login";

const ALLOWED_ORIGIN_PATTERN = _buildAllowedOriginPattern();

function _buildAllowedOriginPattern() {
  const escaped = env.CORS_ORIGINS.map(_escapeForRegex);
  return `^(${escaped.join("|")})`;
}

function _escapeForRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { ALLOWED_ORIGIN_PATTERN, AUTH_PATHS, DEFAULT_ERROR_PATH };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_model/auth.type.ts

```
type GoogleUserInfo = {
  email: string;
  name: string;
  avatarUrl: string | null;
  providerAccountId: string;
};

type OauthCallbackResult =
  | {
      kind: "success";
      userId: string;
      redirect: string;
      accessToken: string;
      refreshToken: string;
    }
  | { kind: "banned"; redirect: string }
  | { kind: "link_conflict"; email: string; redirect: string };

type SessionInfo = {
  id: string;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  ipAddress: string | null;
  isSuspicious: boolean;
  createdAt: Date;
  lastActiveAt: Date;
  isCurrent: boolean;
};

type ProviderInfo = {
  id: string;
  provider: string;
  createdAt: Date;
};

type AuthContextResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    isBanned: boolean;
  };
  permissions: string[];
  energyBalance: string;
  loginStreak: number;
};

const AUTH_LINK_REQUEST_TTL_MINUTES = 15;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const AUTH_LINK_REQUEST_TTL_MS =
  AUTH_LINK_REQUEST_TTL_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;

export type {
  AuthContextResponse,
  GoogleUserInfo,
  OauthCallbackResult,
  ProviderInfo,
  SessionInfo,
};
export { AUTH_LINK_REQUEST_TTL_MS };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/delete-all-sessions.route.ts

```
import { Elysia } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { authCookie } from "#api/service/auth/auth-cookie";
import { withAuth } from "#api/service/auth/with-auth";
import { securityService } from "#api/service/security/security.service";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { AUTH_PATHS } from "../_model/auth.constant";

const deleteAllSessionsRoute = new Elysia()
  .use(withAuth)
  .delete(
    AUTH_PATHS.delete.sessions,
    async ({ user, cookie, request, server }) => {
      const count = await authRepository.session.delete.allByUserId(user.id);

      await securityService.recordEvent({
        userId: user.id,
        sessionId: null,
        eventType: "all_sessions_revoked",
        severity: "info",
        ipAddress: extractIpAddress({ request, server }) ?? "unknown",
        userAgent: request.headers.get("user-agent") ?? "unknown",
        metadata: { revokedCount: count },
      });

      authCookie.clearAuth(cookie);

      return { status: "ok" };
    },
  );

export { deleteAllSessionsRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/delete-provider.route.ts

```
import { HTTP_STATUS } from "@packages/contract/http-status";
import { and, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";
import { db } from "#api/shared/db/instance";
import { authAccountTable } from "#api/shared/db/schema/auth-account.table";

import { AUTH_PATHS } from "../_model/auth.constant";

const deleteProviderRoute = new Elysia().use(withAuth).delete(
  AUTH_PATHS.delete.providerById,
  async ({ params, user, set }) => {
    const isLastProvider = await _hasOnlyOneProvider(user.id);

    if (isLastProvider) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Cannot unlink last provider" };
    }

    await _deleteAuthAccount({ id: params.accountId, userId: user.id });

    return { status: "ok" };
  },
  {
    params: t.Object({
      accountId: t.String({ minLength: 1 }),
    }),
  },
);

async function _hasOnlyOneProvider(userId: string) {
  const minProviderCount = 1;

  const count = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(authAccountTable)
    .where(eq(authAccountTable.userId, userId))
    .then((rows) => rows[0]?.count ?? 0);

  return count <= minProviderCount;
}

function _deleteAuthAccount(params: { id: string; userId: string }) {
  return db
    .delete(authAccountTable)
    .where(
      and(
        eq(authAccountTable.id, params.id),
        eq(authAccountTable.userId, params.userId),
      ),
    );
}

export { deleteProviderRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/delete-session.route.ts

```
import { Elysia, t } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { withAuth } from "#api/service/auth/with-auth";
import { securityService } from "#api/service/security/security.service";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { AUTH_PATHS } from "../_model/auth.constant";

const deleteSessionRoute = new Elysia().use(withAuth).delete(
  AUTH_PATHS.delete.sessionById,
  async ({ params, user, request, server }) => {
    const deleted = await authRepository.session.delete.byIdAndUserId({
      sessionId: params.sessionId,
      userId: user.id,
    });

    if (deleted) {
      await securityService.recordEvent({
        userId: user.id,
        sessionId: params.sessionId,
        eventType: "session_revoked",
        severity: "info",
        ipAddress: extractIpAddress({ request, server }) ?? "unknown",
        userAgent: request.headers.get("user-agent") ?? "unknown",
        metadata: null,
      });
    }

    return { status: "ok" };
  },
  {
    params: t.Object({
      sessionId: t.String({ minLength: 1 }),
    }),
  },
);

export { deleteSessionRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/get-callback-google.route.ts

```
import type { AuthError } from "@packages/contract/auth-error";

import type { OauthCallbackResult } from "../_model/auth.type";

import { is } from "@packages/util/guard";
import { safeJsonParse } from "@packages/util/json";
import { Elysia, t } from "elysia";
import { jwtVerify } from "jose";

import { authCookie } from "#api/service/auth/auth-cookie";
import { env, JWT_SECRET_BYTES } from "#api/shared/config/env";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { createExchangeCode } from "../_helper/auth-exchange";
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
} from "../_helper/auth-google";
import { handleOauthCallback } from "../_helper/oauth-callback";
import { AUTH_PATHS, DEFAULT_ERROR_PATH } from "../_model/auth.constant";

type _GoogleError =
  | "access_denied"
  | "invalid_request"
  | "unauthorized_client"
  | "unsupported_response_type"
  | "invalid_scope"
  | "server_error"
  | "temporarily_unavailable";

const getCallbackGoogleRoute = new Elysia().get(
  AUTH_PATHS.get.callbackGoogle,
  async ({ query, cookie, request, server, redirect }) => {
    if (query.error) {
      const authError = _mapGoogleError(query.error as _GoogleError);
      return redirect(_buildFallbackError(authError));
    }

    const cookieData = _extractAndClearOauthState(cookie);

    if (is.null(cookieData) || !query.code) {
      return redirect(_buildFallbackError("UNKNOWN"));
    }

    const stateData = await _verifyStateJwt(query.state);

    if (is.null(stateData) || !stateData.redirect) {
      return redirect(_buildFallbackError("SESSION_EXPIRED"));
    }

    const errorRedirectUrl =
      stateData.errorRedirect || _buildFallbackError("UNKNOWN");

    const tokens = await exchangeGoogleCode({
      code: query.code,
      codeVerifier: cookieData.codeVerifier,
    });

    if (is.null(tokens)) {
      return redirect(_appendError(errorRedirectUrl, "UNKNOWN"));
    }

    const userInfo = await fetchGoogleUserInfo(tokens.accessToken);

    if (is.null(userInfo)) {
      return redirect(_appendError(errorRedirectUrl, "UNKNOWN"));
    }

    const oauthResult = await handleOauthCallback({
      provider: "google",
      userInfo,
      redirect: stateData.redirect,
      userAgent: request.headers.get("user-agent") ?? "unknown",
      ipAddress: extractIpAddress({ request, server }) ?? "unknown",
    });

    const redirectUrl = _buildCallbackRedirectUrl({
      result: oauthResult,
      redirect: stateData.redirect,
      errorRedirectUrl,
    });

    return redirect(redirectUrl);
  },
  {
    query: t.Object({
      code: t.Optional(t.String()),
      state: t.Optional(t.String()),
      error: t.Optional(t.String()),
    }),
  },
);

function _mapGoogleError(googleError: _GoogleError): AuthError {
  if (googleError === "access_denied") {
    return "UNAUTHORIZED";
  }

  return "UNKNOWN";
}

async function _verifyStateJwt(token: string | undefined) {
  if (is.undefined(token)) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);
    return {
      redirect: payload.redirect as string,
      errorRedirect: (payload.errorRedirect as string) || null,
    };
  } catch {
    return null;
  }
}

function _parseStateCookie(raw: unknown) {
  const data = is.string(raw) ? safeJsonParse(raw) : raw;

  if (is.object(data)) {
    const { state, codeVerifier } = data;

    if (is.string(state) && is.string(codeVerifier)) {
      return { state, codeVerifier };
    }
  }

  return null;
}

function _extractAndClearOauthState(
  cookie: Parameters<typeof authCookie.getOauthState>[0],
) {
  const raw = authCookie.getOauthState(cookie);
  authCookie.clearOauthState(cookie);
  return _parseStateCookie(raw);
}

function _buildCallbackRedirectUrl(params: {
  result: OauthCallbackResult;
  redirect: string;
  errorRedirectUrl: string;
}) {
  if (params.result.kind === "banned") {
    return _appendError(params.errorRedirectUrl, "BANNED");
  }

  if (params.result.kind === "link_conflict") {
    return _appendError(params.errorRedirectUrl, "UNKNOWN");
  }

  const exchangeCode = createExchangeCode({
    accessToken: params.result.accessToken,
    refreshToken: params.result.refreshToken,
  });

  const successUrl = _isAllowedRedirectUrl(params.redirect)
    ? params.redirect
    : "/";

  const separator = successUrl.includes("?") ? "&" : "?";

  return `${successUrl}${separator}auth_code=${exchangeCode}`;
}

function _buildFallbackError(error: AuthError) {
  return `${DEFAULT_ERROR_PATH}?error=${error}`;
}

function _appendError(baseUrl: string, error: string) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}error=${error}`;
}

function _isAllowedRedirectUrl(url: string) {
  return env.CORS_ORIGINS.some((origin) => url.startsWith(origin));
}

export { getCallbackGoogleRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/get-context.route.ts

```
import { HTTP_STATUS } from "@packages/contract/http-status";
import { is } from "@packages/util/guard";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";
import { db } from "#api/shared/db/instance";
import { userTable } from "#api/shared/db/schema/user.table";

import { loadPermissionStrings } from "../_helper/permission";
import { AUTH_PATHS } from "../_model/auth.constant";

const getContextRoute = new Elysia()
  .use(withAuth)
  .get(AUTH_PATHS.get.context, async ({ user, status }) => {
    const foundUser = await _findUserById(user.id);

    if (is.undefined(foundUser) || is.null(foundUser)) {
      return status(HTTP_STATUS.UNAUTHORIZED, { error: "UNAUTHORIZED" });
    }

    const permissions = await loadPermissionStrings(foundUser.id);

    return {
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        avatarUrl: foundUser.avatarUrl,
        isBanned: foundUser.isBanned,
      },
      permissions,
      energyBalance: foundUser.energyBalance.toString(),
      loginStreak: foundUser.loginStreak,
    };
  });

function _findUserById(userId: string) {
  return db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .then((rows) => rows[0] ?? null);
}

export { getContextRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/get-google.route.ts

```
import { generateCodeVerifier } from "arctic";
import { Elysia, t } from "elysia";
import { SignJWT } from "jose";

import { authCookie } from "#api/service/auth/auth-cookie";
import { env, JWT_SECRET_BYTES } from "#api/shared/config/env";

import { createGoogleAuthUrl } from "../_helper/auth-google";
import {
  ALLOWED_ORIGIN_PATTERN,
  AUTH_PATHS,
  DEFAULT_ERROR_PATH,
} from "../_model/auth.constant";

const _STATE_MAX_AGE_SECONDS = 600;

const getGoogleRoute = new Elysia().get(
  AUTH_PATHS.get.google,
  async ({ query, cookie, redirect }) => {
    const errorRedirect =
      query.errorRedirect || _buildDefaultErrorRedirect(query.redirect);

    const state = await _signStateJwt({
      redirect: query.redirect,
      errorRedirect,
    });
    const codeVerifier = generateCodeVerifier();
    const authUrl = createGoogleAuthUrl({ state, codeVerifier });

    authCookie.setOauthState(cookie, JSON.stringify({ state, codeVerifier }));

    return redirect(authUrl.toString());
  },
  {
    query: t.Object({
      redirect: t.String({
        minLength: 1,
        pattern: ALLOWED_ORIGIN_PATTERN,
        error: "redirect must start with an allowed origin",
      }),
      errorRedirect: t.Optional(
        t.String({
          minLength: 1,
          pattern: ALLOWED_ORIGIN_PATTERN,
          error: "errorRedirect must start with an allowed origin",
        }),
      ),
    }),
  },
);

function _signStateJwt(payload: { redirect: string; errorRedirect: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${_STATE_MAX_AGE_SECONDS}s`)
    .sign(JWT_SECRET_BYTES);
}

function _buildDefaultErrorRedirect(redirect: string) {
  try {
    const parsed = new URL(redirect);
    return `${parsed.origin}${DEFAULT_ERROR_PATH}`;
  } catch {
    return `${env.CORS_ORIGINS[0] ?? ""}${DEFAULT_ERROR_PATH}`;
  }
}

export { getGoogleRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/get-providers.route.ts

```
import type { ProviderInfo } from "../_model/auth.type";

import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";
import { db } from "#api/shared/db/instance";
import { authAccountTable } from "#api/shared/db/schema/auth-account.table";

import { AUTH_PATHS } from "../_model/auth.constant";

const getProvidersRoute = new Elysia()
  .use(withAuth)
  .get(AUTH_PATHS.get.providers, async ({ user }) => {
    const providers = await _listProviders(user.id);

    return { providers };
  });

async function _listProviders(userId: string): Promise<ProviderInfo[]> {
  const accounts = await db
    .select()
    .from(authAccountTable)
    .where(eq(authAccountTable.userId, userId));

  return accounts.map((account) => ({
    id: account.id,
    provider: account.provider,
    createdAt: account.createdAt,
  }));
}

export { getProvidersRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/get-sessions.route.ts

```
import type { SessionInfo } from "../_model/auth.type";

import { Elysia } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { authCookie } from "#api/service/auth/auth-cookie";
import { withAuth } from "#api/service/auth/with-auth";
import { parseUserAgent } from "#api/shared/helper/user-agent";

import { hashToken } from "../_helper/auth-hash";
import { AUTH_PATHS } from "../_model/auth.constant";

const getSessionsRoute = new Elysia()
  .use(withAuth)
  .get(AUTH_PATHS.get.sessions, async ({ user, cookie }) => {
    const sessions = await _listSessions({
      userId: user.id,
      currentRefreshToken: authCookie.getRefreshToken(cookie),
    });

    return { sessions };
  });

async function _listSessions(params: {
  userId: string;
  currentRefreshToken: string | null;
}): Promise<SessionInfo[]> {
  const sessions =
    await authRepository.session.findActive.allByUserIdSuspiciousFirst(
      params.userId,
    );

  const currentHash = params.currentRefreshToken
    ? hashToken(params.currentRefreshToken)
    : null;

  return sessions.map((session) => {
    const device = parseUserAgent(session.userAgent);

    return {
      id: session.id,
      deviceType: device.deviceType,
      os: device.os,
      browser: device.browser,
      ipAddress: session.ipAddress,
      isSuspicious: session.isSuspicious,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      isCurrent: session.token === currentHash,
    };
  });
}

export { getSessionsRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/post-exchange.route.ts

```
import { HTTP_STATUS } from "@packages/contract/http-status";
import { Elysia, t } from "elysia";

import { authCookie } from "#api/service/auth/auth-cookie";

import { consumeExchangeCode } from "../_helper/auth-exchange";
import { AUTH_PATHS } from "../_model/auth.constant";

const postExchangeRoute = new Elysia().post(
  AUTH_PATHS.post.exchange,
  ({ body, cookie, set }) => {
    const result = consumeExchangeCode(body.code);

    if (result.kind === "not_found") {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "INVALID_CODE" };
    }

    if (result.kind === "expired") {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "CODE_EXPIRED" };
    }

    authCookie.setAccessToken(cookie, result.accessToken);
    authCookie.setRefreshToken(cookie, result.refreshToken);

    return { status: "ok" };
  },
  {
    body: t.Object({
      code: t.String({ minLength: 1 }),
    }),
  },
);

export { postExchangeRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/post-logout.route.ts

```
import { Elysia } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { authCookie } from "#api/service/auth/auth-cookie";
import { securityService } from "#api/service/security/security.service";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { hashToken } from "../_helper/auth-hash";
import { AUTH_PATHS } from "../_model/auth.constant";

const postLogoutRoute = new Elysia().post(
  AUTH_PATHS.post.logout,
  async ({ cookie, request, server }) => {
    const refreshTokenRaw = authCookie.getRefreshToken(cookie);

    if (refreshTokenRaw) {
      const tokenHash = hashToken(refreshTokenRaw);
      const session =
        await authRepository.session.findActive.byTokenHash(tokenHash);

      if (session) {
        await authRepository.session.delete.byId(session.id);

        await securityService.recordEvent({
          userId: session.userId,
          sessionId: session.id,
          eventType: "logout",
          severity: "info",
          ipAddress: extractIpAddress({ request, server }) ?? "unknown",
          userAgent: request.headers.get("user-agent") ?? "unknown",
          metadata: null,
        });
      }
    }

    authCookie.clearAuth(cookie);

    return { status: "ok" };
  },
);

export { postLogoutRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/auth/_route/post-refresh.route.ts

```
import { HTTP_STATUS } from "@packages/contract/http-status";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

import { authRepository } from "#api/service/auth/auth.repository";
import { authCookie } from "#api/service/auth/auth-cookie";
import { checkFingerprint } from "#api/service/security/_helper/fingerprint.helper";
import { securityService } from "#api/service/security/security.service";
import { db } from "#api/shared/db/instance";
import { userTable } from "#api/shared/db/schema/user.table";
import { extractIpAddress } from "#api/shared/helper/ip-address";

import { hashToken } from "../_helper/auth-hash";
import { loadPermissionStrings } from "../_helper/permission";
import { createNewSession } from "../_helper/session-create";
import { AUTH_PATHS } from "../_model/auth.constant";

const postRefreshRoute = new Elysia().post(
  AUTH_PATHS.post.refresh,
  async ({ cookie, request, server, set }) => {
    const refreshTokenRaw = authCookie.getRefreshToken(cookie);

    if (!refreshTokenRaw) {
      authCookie.clearAuth(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    const result = await _refreshSession({
      refreshToken: refreshTokenRaw,
      userAgent: request.headers.get("user-agent") ?? "unknown",
      ipAddress: extractIpAddress({ request, server }) ?? "unknown",
    });

    if (result.kind === "reuse_detected") {
      authCookie.clearAuth(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "SESSION_EXPIRED" };
    }

    if (result.kind === "invalid") {
      authCookie.clearAuth(cookie);
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "SESSION_EXPIRED" };
    }

    if (result.kind === "banned") {
      authCookie.clearAuth(cookie);
      set.status = HTTP_STATUS.FORBIDDEN;
      return { error: "BANNED" };
    }

    authCookie.setAccessToken(cookie, result.accessToken);
    authCookie.setRefreshToken(cookie, result.refreshToken);

    return { status: "ok" };
  },
);

type _RefreshResult =
  | { kind: "invalid" }
  | { kind: "banned" }
  | { kind: "reuse_detected" }
  | { kind: "success"; accessToken: string; refreshToken: string };

async function _refreshSession(params: {
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
}): Promise<_RefreshResult> {
  const tokenHash = hashToken(params.refreshToken);

  const reuseAttempt =
    await authRepository.session.detectReuse.byTokenHash(tokenHash);

  if (reuseAttempt) {
    await _handleReuseAttack({
      userId: reuseAttempt.userId,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    });

    return { kind: "reuse_detected" };
  }

  const session =
    await authRepository.session.findActive.byTokenHash(tokenHash);

  if (!session) {
    return { kind: "invalid" };
  }

  const user = await _findUserById(session.userId);

  if (!user) {
    await authRepository.session.delete.byId(session.id);
    return { kind: "invalid" };
  }

  if (user.isBanned) {
    await authRepository.session.delete.allByUserId(user.id);
    return { kind: "banned" };
  }

  const fingerprintResult = checkFingerprint({
    createdUserAgent: session.createdUserAgent,
    createdIpAddress: session.createdIpAddress,
    currentUserAgent: params.userAgent,
    currentIpAddress: params.ipAddress,
  });

  await authRepository.session.update.markRevoked(session.id);

  if (fingerprintResult.isSuspicious) {
    await securityService.recordEvent({
      userId: user.id,
      sessionId: session.id,
      eventType: "suspicious_activity",
      severity: "warning",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reasons: fingerprintResult.reasons },
    });
  }

  const permissions = await loadPermissionStrings(user.id);

  const {
    accessToken,
    refreshToken,
    sessionId: newSessionId,
  } = await createNewSession({
    userId: user.id,
    email: user.email,
    isBanned: user.isBanned,
    permissions,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
    eventType: "refresh_rotated",
  });

  if (fingerprintResult.isSuspicious && newSessionId) {
    await authRepository.session.update.markSuspicious(newSessionId);
  }

  return { kind: "success", accessToken, refreshToken };
}

async function _handleReuseAttack(params: {
  userId: string;
  userAgent: string;
  ipAddress: string;
}) {
  await authRepository.session.delete.allByUserId(params.userId);

  await securityService.recordEvent({
    userId: params.userId,
    sessionId: null,
    eventType: "token_reuse_detected",
    severity: "critical",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: null,
  });
}

function _findUserById(userId: string) {
  return db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .then((rows) => rows[0] ?? null);
}

export { postRefreshRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/security/_route/get-events.route.ts

```
import { Elysia, t } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";
import { securityService } from "#api/service/security/security.service";

const EVENTS_DEFAULT_LIMIT = 50;
const EVENTS_MAX_LIMIT = 100;

const getEventsRoute = new Elysia().use(withAuth).get(
  "/events",
  async ({ user, query }) => {
    const result = await securityService.listForUser({
      userId: user.id,
      limit: _parseLimit(query.limit),
      cursor: query.cursor,
      severity: _parseSeverity(query.severity),
    });

    return result;
  },
  {
    query: t.Object({
      limit: t.Optional(t.String()),
      cursor: t.Optional(t.String()),
      severity: t.Optional(t.String()),
    }),
  },
);

function _parseLimit(value: string | undefined) {
  if (!value) {
    return EVENTS_DEFAULT_LIMIT;
  }

  const num = Number(value);

  if (Number.isNaN(num) || num < 1) {
    return EVENTS_DEFAULT_LIMIT;
  }

  if (num > EVENTS_MAX_LIMIT) {
    return EVENTS_MAX_LIMIT;
  }

  return Math.floor(num);
}

function _parseSeverity(value: string | undefined) {
  if (value === "info" || value === "warning" || value === "critical") {
    return value;
  }

  return;
}

export { getEventsRoute };

```

D:/1_Projects/jstonehub/apps/api/src/feature/user/_dev/user.seed.ts

```
import type { InferSelectModel } from "drizzle-orm";

import { createId } from "@packages/util/id";
import { eq, like } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { auditLogTable } from "#api/shared/db/schema/audit.table";
import { authAccountTable } from "#api/shared/db/schema/auth-account.table";
import { permissionTable } from "#api/shared/db/schema/permission.table";
import { sessionTable } from "#api/shared/db/schema/session.table";
import { userTable } from "#api/shared/db/schema/user.table";

type UserRow = InferSelectModel<typeof userTable>;

const TEST_PREFIX = "__test__";
const TEST_EMAIL_DOMAIN = "@example.com";
const EMAIL_SLUG_LENGTH = 6;
const PRESET_USER_COUNT = 4;
const BAN_PROBABILITY = 0.1;
const ADMIN_ACCESS_PROBABILITY = 0.3;
const MAX_RANDOM_PERMISSIONS = 4;
const SHUFFLE_MIDPOINT = 0.5;
const MAX_LOGIN_STREAK = 30;
const ENERGY_VARIANCE_FACTOR = 0.5;
const DEFAULT_ENERGY = 0;

// biome-ignore-start lint/style/noMagicNumbers: seed data — energy balance presets for test users
const ENERGY_RANGES = [
  0, 1000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000,
] as const;
// biome-ignore-end lint/style/noMagicNumbers: seed data — energy balance presets for test users

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jack",
  "Karen",
  "Leo",
  "Mona",
  "Nick",
  "Olivia",
  "Paul",
  "Quinn",
  "Rosa",
  "Sam",
  "Tina",
  "Uma",
  "Victor",
  "Wendy",
  "Xander",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
];

const ADMIN_PERMISSIONS = [
  "admin:access:read",
  "admin:user:read",
  "admin:user:ban",
  "admin:user:manage",
  "admin:user:grant_energy",
  "admin:joke:all",
  "admin:language:read",
  "admin:pricing:read",
  "admin:feedback:read",
  "admin:audit:read",
] as const;

const MODERATOR_PERMISSIONS = [
  "admin:access:read",
  "admin:joke:read",
  "admin:joke:update",
  "admin:feedback:read",
  "admin:feedback:manage",
] as const;

// ─── seed users ────────────────────────────────────────

async function seedUsers(count: number) {
  const presetUsers = await createPresetUsers();
  const bulkCount = Math.max(0, count - PRESET_USER_COUNT);
  const bulkUsers = await createBulkUsers(bulkCount);

  return { created: presetUsers.length + bulkUsers.length };
}

async function createPresetUsers() {
  const adminUser = await createTestUser({
    name: `${TEST_PREFIX} Admin User`,
    permissions: [...ADMIN_PERMISSIONS],
    isBanned: false,
  });

  const moderatorUser = await createTestUser({
    name: `${TEST_PREFIX} Moderator`,
    permissions: [...MODERATOR_PERMISSIONS],
    isBanned: false,
  });

  const bannedUser = await createTestUser({
    name: `${TEST_PREFIX} Banned User`,
    permissions: [],
    isBanned: true,
  });

  const regularUser = await createTestUser({
    name: `${TEST_PREFIX} Regular User`,
    permissions: [],
    isBanned: false,
  });

  return [adminUser, moderatorUser, bannedUser, regularUser].filter(Boolean);
}

async function createBulkUsers(count: number) {
  const users: UserRow[] = [];

  for (let i = 0; i < count; i++) {
    const name = generateRandomName();
    const isBanned = Math.random() < BAN_PROBABILITY;
    const permissions = generateRandomPermissions();

    // biome-ignore lint/performance/noAwaitInLoops: sequential seed to avoid UNIQUE constraint race conditions
    const user = await createTestUser({ name, permissions, isBanned });

    if (user) {
      users.push(user);
    }
  }

  return users;
}

async function createTestUser(params: {
  name: string;
  permissions: string[];
  isBanned: boolean;
}) {
  const emailSlug = createId().slice(0, EMAIL_SLUG_LENGTH);
  const email = `${TEST_PREFIX}${emailSlug}${TEST_EMAIL_DOMAIN}`;
  const energy = generateRandomEnergy();
  const loginStreak = Math.floor(Math.random() * MAX_LOGIN_STREAK);

  const [user] = await db
    .insert(userTable)
    .values({
      email,
      name: params.name,
      avatarUrl: null,
      isBanned: params.isBanned,
      energyBalance: BigInt(energy),
      loginStreak,
    })
    .returning();

  if (!user) {
    return null;
  }

  await db.insert(authAccountTable).values({
    userId: user.id,
    provider: "google",
    providerAccountId: `test_${createId()}`,
  });

  if (params.permissions.length > 0) {
    const permissionValues = params.permissions.map((perm) => ({
      userId: user.id,
      permission: perm,
      grantedBy: null,
    }));

    await db.insert(permissionTable).values(permissionValues);
  }

  return user;
}

// ─── cleanup ───────────────────────────────────────────

async function cleanupTestUsers() {
  const testUsers = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(like(userTable.email, `${TEST_PREFIX}%`));

  if (testUsers.length === 0) {
    return { deleted: 0 };
  }

  const userIds = testUsers.map((u) => u.id);

  await Promise.all(userIds.map((userId) => deleteTestUserData(userId)));

  return { deleted: userIds.length };
}

async function deleteTestUserData(userId: string) {
  await db.delete(auditLogTable).where(eq(auditLogTable.actorId, userId));
  await db.delete(auditLogTable).where(eq(auditLogTable.targetId, userId));
  await db.delete(permissionTable).where(eq(permissionTable.userId, userId));
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
  await db.delete(authAccountTable).where(eq(authAccountTable.userId, userId));
  await db.delete(userTable).where(eq(userTable.id, userId));
}

// ─── random helpers ────────────────────────────────────

function generateRandomName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${TEST_PREFIX} ${first} ${last}`;
}

function generateRandomPermissions() {
  const shouldHaveAdmin = Math.random() < ADMIN_ACCESS_PROBABILITY;

  if (!shouldHaveAdmin) {
    return [];
  }

  const shuffled = [...ADMIN_PERMISSIONS].sort(
    () => Math.random() - SHUFFLE_MIDPOINT,
  );
  const count = Math.floor(Math.random() * MAX_RANDOM_PERMISSIONS) + 1;

  return shuffled.slice(0, count);
}

function generateRandomEnergy() {
  const base =
    ENERGY_RANGES[Math.floor(Math.random() * ENERGY_RANGES.length)]
    ?? DEFAULT_ENERGY;
  const variance = Math.floor(base * ENERGY_VARIANCE_FACTOR * Math.random());
  return base + variance;
}

export { cleanupTestUsers, seedUsers };

```

D:/1_Projects/jstonehub/apps/api/src/feature/user/_dev/user.seed.v1.ts

```
import { Elysia, t } from "elysia";

import { cleanupTestUsers, seedUsers } from "./user.seed";

const DEFAULT_SEED_COUNT = 20;
const MAX_SEED_COUNT = 200;

const devSeedV1 = new Elysia({ prefix: "/dev/seed" })
  .post(
    "/users",
    async ({ body }) => {
      const count = Math.min(body.count ?? DEFAULT_SEED_COUNT, MAX_SEED_COUNT);
      const result = await seedUsers(count);
      return result;
    },
    {
      body: t.Object({
        count: t.Optional(t.Number({ minimum: 1, maximum: MAX_SEED_COUNT })),
      }),
    },
  )
  .delete("/users", async () => {
    const result = await cleanupTestUsers();
    return result;
  });

export { devSeedV1 };

```

D:/1_Projects/jstonehub/apps/api/src/service/auth/_repository/session-seed.repository.ts

```
import { createId } from "@packages/util/id";

import { db } from "#api/shared/db/instance";
import { sessionTable } from "#api/shared/db/schema/session.table";

import {
  SESSION_ABSOLUTE_LIFETIME_MS,
  SESSION_IDLE_LIFETIME_MS,
} from "./session.repository";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

const CREATED_DAYS_DIVISOR = 2;
const LAST_ACTIVE_DAYS_DIVISOR = 3;
const SUSPICIOUS_EVERY_N = 4;

const sessionSeedRepository = {
  async createForUser(params: {
    userId: string;
    tokenHash: string;
    userAgent: string;
    ipAddress: string;
    isSuspicious?: boolean;
    createdDaysAgo?: number;
    lastActiveDaysAgo?: number;
  }) {
    const now = Date.now();

    const createdAt = new Date(now - (params.createdDaysAgo ?? 0) * MS_PER_DAY);
    const lastActiveAt = new Date(
      now - (params.lastActiveDaysAgo ?? 0) * MS_PER_DAY,
    );

    const absoluteExpiresAt = new Date(
      createdAt.getTime() + SESSION_ABSOLUTE_LIFETIME_MS,
    );
    const expiresAt = new Date(
      lastActiveAt.getTime() + SESSION_IDLE_LIFETIME_MS,
    );

    const [session] = await db
      .insert(sessionTable)
      .values({
        userId: params.userId,
        token: params.tokenHash,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        createdUserAgent: params.userAgent,
        createdIpAddress: params.ipAddress,
        isSuspicious: params.isSuspicious ?? false,
        lastActiveAt,
        expiresAt,
        absoluteExpiresAt,
        createdAt,
        updatedAt: createdAt,
      })
      .returning({ id: sessionTable.id });

    return session?.id ?? null;
  },

  async createBulkForUser(params: {
    userId: string;
    count: number;
  }): Promise<number> {
    const combinations = _generateDeviceCombinations(params.count);

    const results = await Promise.all(
      combinations.map((device, index) =>
        sessionSeedRepository.createForUser({
          userId: params.userId,
          tokenHash: `__seed__${createId()}`,
          userAgent: device.userAgent,
          ipAddress: device.ipAddress,
          isSuspicious: device.isSuspicious,
          createdDaysAgo: Math.floor(index / CREATED_DAYS_DIVISOR),
          lastActiveDaysAgo: Math.floor(index / LAST_ACTIVE_DAYS_DIVISOR),
        }),
      ),
    );

    return results.filter(Boolean).length;
  },
} as const;

const SEED_USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
];

const SEED_IP_ADDRESSES = [
  "192.168.1.10",
  "10.0.0.15",
  "172.16.0.20",
  "185.228.168.42",
  "203.0.113.55",
];

function _generateDeviceCombinations(count: number) {
  const combinations: Array<{
    userAgent: string;
    ipAddress: string;
    isSuspicious: boolean;
  }> = [];

  for (let i = 0; i < count; i++) {
    const uaIndex = i % SEED_USER_AGENTS.length;
    const ipIndex = i % SEED_IP_ADDRESSES.length;

    combinations.push({
      userAgent: SEED_USER_AGENTS[uaIndex] ?? SEED_USER_AGENTS[0] ?? "unknown",
      ipAddress:
        SEED_IP_ADDRESSES[ipIndex] ?? SEED_IP_ADDRESSES[0] ?? "unknown",
      isSuspicious: i % SUSPICIOUS_EVERY_N === 0,
    });
  }

  return combinations;
}

export { sessionSeedRepository };

```

D:/1_Projects/jstonehub/apps/api/src/service/auth/_repository/session.repository.ts

```
import { is } from "@packages/util/guard";
import { and, asc, eq, gt, inArray, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { sessionTable } from "#api/shared/db/schema/session.table";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

const SESSION_IDLE_LIFETIME_DAYS = 7;
const SESSION_ABSOLUTE_LIFETIME_DAYS = 14;
const SESSION_REVOKED_RETENTION_DAYS = 1;

const SESSION_IDLE_LIFETIME_MS = SESSION_IDLE_LIFETIME_DAYS * MS_PER_DAY;
const SESSION_ABSOLUTE_LIFETIME_MS =
  SESSION_ABSOLUTE_LIFETIME_DAYS * MS_PER_DAY;
const SESSION_REVOKED_RETENTION_MS =
  SESSION_REVOKED_RETENTION_DAYS * MS_PER_DAY;

const MAX_SESSIONS_PER_USER = 10;

const sessionRepository = {
  findActive: {
    allByUserId(userId: string) {
      const now = new Date();

      return db
        .select()
        .from(sessionTable)
        .where(_buildActiveCondition(userId, now));
    },

    allByUserIdSuspiciousFirst(userId: string) {
      const now = new Date();

      return db
        .select()
        .from(sessionTable)
        .where(_buildActiveCondition(userId, now))
        .orderBy(
          sql`${sessionTable.isSuspicious} DESC`,
          sql`${sessionTable.lastActiveAt} DESC`,
        );
    },

    async byTokenHash(tokenHash: string) {
      const now = new Date();

      const [session] = await db
        .select()
        .from(sessionTable)
        .where(
          and(
            eq(sessionTable.token, tokenHash),
            isNull(sessionTable.revokedAt),
            gt(sessionTable.expiresAt, now),
            gt(sessionTable.absoluteExpiresAt, now),
          ),
        );

      if (is.undefined(session)) {
        return null;
      }

      return session;
    },

    async countByUserId(userId: string): Promise<number> {
      const now = new Date();

      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sessionTable)
        .where(_buildActiveCondition(userId, now));

      return result[0]?.count ?? 0;
    },
  },

  detectReuse: {
    async byTokenHash(tokenHash: string) {
      const [session] = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.token, tokenHash));

      if (is.undefined(session)) {
        return null;
      }

      if (session.revokedAt) {
        return session;
      }

      return null;
    },
  },

  create: {
    async one(params: {
      userId: string;
      tokenHash: string;
      userAgent: string;
      ipAddress: string;
    }) {
      const removedOldestId = await _enforceSessionLimit(params.userId);

      const now = new Date();
      const idleExpiresAt = new Date(now.getTime() + SESSION_IDLE_LIFETIME_MS);
      const absoluteExpiresAt = new Date(
        now.getTime() + SESSION_ABSOLUTE_LIFETIME_MS,
      );

      const [session] = await db
        .insert(sessionTable)
        .values({
          userId: params.userId,
          token: params.tokenHash,
          userAgent: params.userAgent,
          ipAddress: params.ipAddress,
          createdUserAgent: params.userAgent,
          createdIpAddress: params.ipAddress,
          expiresAt: idleExpiresAt,
          absoluteExpiresAt,
        })
        .returning({ id: sessionTable.id });

      return { sessionId: session?.id ?? null, removedOldestId };
    },
  },

  update: {
    async markRevoked(sessionId: string) {
      const now = new Date();

      await db
        .update(sessionTable)
        .set({ revokedAt: now, updatedAt: now })
        .where(eq(sessionTable.id, sessionId));
    },

    async markSuspicious(sessionId: string) {
      const now = new Date();

      await db
        .update(sessionTable)
        .set({ isSuspicious: true, updatedAt: now })
        .where(eq(sessionTable.id, sessionId));
    },
  },

  delete: {
    async allByUserId(userId: string): Promise<number> {
      const deleted = await db
        .delete(sessionTable)
        .where(eq(sessionTable.userId, userId))
        .returning({ id: sessionTable.id });

      return deleted.length;
    },

    async byId(sessionId: string): Promise<boolean> {
      const deleted = await db
        .delete(sessionTable)
        .where(eq(sessionTable.id, sessionId))
        .returning({ id: sessionTable.id });

      return deleted.length > 0;
    },

    async byIdAndUserId(params: {
      sessionId: string;
      userId: string;
    }): Promise<boolean> {
      const deleted = await db
        .delete(sessionTable)
        .where(
          and(
            eq(sessionTable.id, params.sessionId),
            eq(sessionTable.userId, params.userId),
          ),
        )
        .returning({ id: sessionTable.id });

      return deleted.length > 0;
    },

    async byTokenHash(tokenHash: string): Promise<boolean> {
      const deleted = await db
        .delete(sessionTable)
        .where(eq(sessionTable.token, tokenHash))
        .returning({ id: sessionTable.id });

      return deleted.length > 0;
    },

    async allExpiredAndStale(): Promise<number> {
      const now = new Date();
      const revokedCutoff = new Date(
        now.getTime() - SESSION_REVOKED_RETENTION_MS,
      );

      const deleted = await db
        .delete(sessionTable)
        .where(
          or(
            lt(sessionTable.expiresAt, now),
            lt(sessionTable.absoluteExpiresAt, now),
            and(
              sql`${sessionTable.revokedAt} IS NOT NULL`,
              lt(sessionTable.revokedAt, revokedCutoff),
            ),
          ),
        )
        .returning({ id: sessionTable.id });

      return deleted.length;
    },
  },
} as const;

function _buildActiveCondition(userId: string, now: Date) {
  return and(
    eq(sessionTable.userId, userId),
    isNull(sessionTable.revokedAt),
    gt(sessionTable.expiresAt, now),
    gt(sessionTable.absoluteExpiresAt, now),
  );
}

async function _enforceSessionLimit(userId: string): Promise<string | null> {
  const activeCount = await sessionRepository.findActive.countByUserId(userId);

  if (activeCount < MAX_SESSIONS_PER_USER) {
    return null;
  }

  const sessionsToRemove = activeCount - MAX_SESSIONS_PER_USER + 1;
  const now = new Date();

  const oldestSessions = await db
    .select({ id: sessionTable.id })
    .from(sessionTable)
    .where(_buildActiveCondition(userId, now))
    .orderBy(asc(sessionTable.lastActiveAt))
    .limit(sessionsToRemove);

  const idsToDelete = oldestSessions.map((s) => s.id);

  if (idsToDelete.length === 0) {
    return null;
  }

  await db.delete(sessionTable).where(inArray(sessionTable.id, idsToDelete));

  return idsToDelete[0] ?? null;
}

export {
  MAX_SESSIONS_PER_USER,
  SESSION_ABSOLUTE_LIFETIME_MS,
  SESSION_IDLE_LIFETIME_MS,
  SESSION_REVOKED_RETENTION_MS,
  sessionRepository,
};

```

D:/1_Projects/jstonehub/apps/api/src/service/security/_helper/fingerprint.helper.ts

```
import { parseUserAgent } from "#api/shared/helper/user-agent";

type FingerprintCheckInput = {
  createdUserAgent: string;
  createdIpAddress: string;
  currentUserAgent: string;
  currentIpAddress: string;
};

type FingerprintCheckResult = {
  isSuspicious: boolean;
  reasons: string[];
};

function checkFingerprint(
  input: FingerprintCheckInput,
): FingerprintCheckResult {
  const reasons: string[] = [];

  const createdDevice = parseUserAgent(input.createdUserAgent);
  const currentDevice = parseUserAgent(input.currentUserAgent);

  if (_isOsChanged(createdDevice.os, currentDevice.os)) {
    reasons.push(`os_changed:${createdDevice.os}->${currentDevice.os}`);
  }

  if (_isBrowserChanged(createdDevice.browser, currentDevice.browser)) {
    reasons.push(
      `browser_changed:${createdDevice.browser}->${currentDevice.browser}`,
    );
  }

  if (_isNetworkChanged(input.createdIpAddress, input.currentIpAddress)) {
    reasons.push(
      `network_changed:${input.createdIpAddress}->${input.currentIpAddress}`,
    );
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

function _isOsChanged(createdOs: string, currentOs: string) {
  if (createdOs === "Unknown" || currentOs === "Unknown") {
    return false;
  }

  const createdFamily = _extractOsFamily(createdOs);
  const currentFamily = _extractOsFamily(currentOs);

  return createdFamily !== currentFamily;
}

function _extractOsFamily(os: string) {
  const spaceIndex = os.indexOf(" ");

  if (spaceIndex === -1) {
    return os;
  }

  return os.slice(0, spaceIndex);
}

function _isBrowserChanged(createdBrowser: string, currentBrowser: string) {
  if (createdBrowser === "Unknown" || currentBrowser === "Unknown") {
    return false;
  }

  const createdFamily = _extractBrowserFamily(createdBrowser);
  const currentFamily = _extractBrowserFamily(currentBrowser);

  return createdFamily !== currentFamily;
}

function _extractBrowserFamily(browser: string) {
  const spaceIndex = browser.indexOf(" ");

  if (spaceIndex === -1) {
    return browser;
  }

  return browser.slice(0, spaceIndex);
}

function _isNetworkChanged(createdIp: string, currentIp: string) {
  if (createdIp === "unknown" || currentIp === "unknown") {
    return false;
  }

  const createdPrefix = _extractIpPrefix(createdIp);
  const currentPrefix = _extractIpPrefix(currentIp);

  if (!(createdPrefix && currentPrefix)) {
    return false;
  }

  return createdPrefix !== currentPrefix;
}

function _extractIpPrefix(ip: string) {
  const parts = ip.split(".");
  const minParts = 2;

  if (parts.length < minParts) {
    return null;
  }

  return `${parts[0]}.${parts[1]}`;
}

export type { FingerprintCheckResult };
export { checkFingerprint };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/schema/audit.table.ts

```
import { createId } from "@packages/util/id";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { userTable } from "#api/shared/db/schema/user.table";

const auditLogTable = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    actorId: text("actor_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "set null" }),
    targetId: text("target_id"),
    targetType: text("target_type"),
    action: text("action").notNull(),
    reason: text("reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_log_actor_id_created_at_idx").on(
      table.actorId,
      table.createdAt,
    ),

    index("audit_log_target_id_target_type_created_at_idx").on(
      table.targetId,
      table.targetType,
      table.createdAt,
    ),

    index("audit_log_action_created_at_idx").on(table.action, table.createdAt),

    index("audit_log_created_at_idx").on(table.createdAt),
  ],
);

export { auditLogTable };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/schema/auth-account.table.ts

```
import { createId } from "@packages/util/id";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { userTable } from "./user.table";

const authAccountTable = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_account_provider_account_idx").on(
      table.provider,
      table.providerAccountId,
    ),

    uniqueIndex("auth_account_provider_user_idx").on(
      table.provider,
      table.userId,
    ),

    index("auth_account_user_id_idx").on(table.userId),
  ],
);

export { authAccountTable };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/schema/auth-link-request.table.ts

```
import { createId } from "@packages/util/id";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { userTable } from "./user.table";

const authLinkRequestTable = pgTable(
  "auth_link_request",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_link_request_provider_account_idx").on(
      table.provider,
      table.providerAccountId,
    ),

    index("auth_link_request_target_user_id_idx").on(table.targetUserId),

    index("auth_link_request_expires_at_idx").on(table.expiresAt),
  ],
);

export { authLinkRequestTable };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/schema/permission.table.ts

```
import { createId } from "@packages/util/id";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { userTable } from "#api/shared/db/schema/user.table";

const permissionTable = pgTable(
  "permission",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(),
    grantedBy: text("granted_by").references(() => userTable.id, {
      onDelete: "set null",
    }),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("permission_user_id_permission_idx").on(
      table.userId,
      table.permission,
    ),

    index("permission_user_id_idx").on(table.userId),

    index("permission_permission_idx").on(table.permission),
  ],
);

export { permissionTable };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/schema/security-event.table.ts

```
import { createId } from "@packages/util/id";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { sessionTable } from "#api/shared/db/schema/session.table";
import { userTable } from "#api/shared/db/schema/user.table";

const securityEventTable = pgTable(
  "security_event",
  {
    id: text("id").primaryKey().$defaultFn(createId),

    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    // Session that triggered the event — nullable for user-wide events (ban, etc.)
    sessionId: text("session_id").references(() => sessionTable.id, {
      onDelete: "set null",
    }),

    // Event type identifier: "login_success", "token_reuse_detected", etc.
    eventType: text("event_type").notNull(),

    // Severity for UI coloring and filtering: "info" | "warning" | "critical"
    severity: text("severity").notNull().default("info"),

    // IP address at the moment of event
    ipAddress: text("ip_address").notNull().default("unknown"),

    // User agent at the moment of event
    userAgent: text("user_agent").notNull().default("unknown"),

    // Event-specific context (old vs new IP, permission changes, etc.)
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // User's security feed sorted by recency — O(log n + k)
    // Used by: security.findByUserId (Settings → Security page)
    // Without composite: O(n) full scan + in-memory sort
    index("security_event_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),

    // Filter by severity for UI — O(log n + k)
    // Used by: security.findByUserIdAndSeverity
    // Without composite: filter k rows in app code after fetch
    index("security_event_user_id_severity_created_at_idx").on(
      table.userId,
      table.severity,
      table.createdAt,
    ),

    // Cron retention cleanup — O(log n + k)
    // Used by: security.deleteOld (cron removes events > 90 days)
    // Without index: O(n) full scan
    index("security_event_created_at_idx").on(table.createdAt),

    // Session FK lookup (used by CASCADE resolution)
    index("security_event_session_id_idx").on(table.sessionId),
  ],
);

export { securityEventTable };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/schema/session.table.ts

```
import { createId } from "@packages/util/id";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { userTable } from "#api/shared/db/schema/user.table";

const sessionTable = pgTable(
  "session",
  {
    id: text("id").primaryKey().$defaultFn(createId),

    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    // SHA-256 hash of refresh token — raw token never stored in DB
    token: text("token").notNull(),

    // User agent on last activity — updated on refresh rotation
    userAgent: text("user_agent").notNull().default("unknown"),

    // IP address on last activity — updated on refresh rotation
    ipAddress: text("ip_address").notNull().default("unknown"),

    // Original UA at session creation — baseline for fingerprint detection
    createdUserAgent: text("created_user_agent").notNull().default("unknown"),

    // Original IP at session creation — baseline for fingerprint detection
    createdIpAddress: text("created_ip_address").notNull().default("unknown"),

    // Soft security flag: raised when UA or IP changes significantly
    // Shown to user in UI (never auto-blocks)
    isSuspicious: boolean("is_suspicious").notNull().default(false),

    // Last time session was used for refresh — drives sliding idle window
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Idle timeout — extended to (lastActiveAt + 7 days) on each refresh
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    // Absolute timeout — hard limit (createdAt + 14 days), never extended
    absoluteExpiresAt: timestamp("absolute_expires_at", {
      withTimezone: true,
    }).notNull(),

    // Set when session is rotated — not physically deleted immediately
    // If refresh comes in with revoked token -> REUSE ATTACK
    // Cleaned up by cron after 24h retention window
    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Token hash lookup — O(log n)
    // Used by: findActive.byTokenHash, detectReuse.byTokenHash
    // Without index: O(n) full scan on every refresh
    uniqueIndex("session_token_idx").on(table.token),

    // User's sessions lookup — O(log n + k)
    // Used by: findActive.allByUserId, countByUserId, delete.allByUserId
    // Without index: O(n) full table scan
    index("session_user_id_idx").on(table.userId),

    // Oldest session lookup when enforcing limit — O(log n + limit)
    // Used by: _enforceSessionLimit (ORDER BY last_active_at ASC LIMIT N)
    // Without composite: O(k log k) in-memory sort
    index("session_user_id_last_active_at_idx").on(
      table.userId,
      table.lastActiveAt,
    ),

    // Suspicious-first UI ordering — O(log n + k) sorted scan
    // Used by: findActive.allByUserIdSuspiciousFirst
    // Without composite: sort in app code after fetch (O(k log k))
    index("session_user_id_suspicious_last_active_idx").on(
      table.userId,
      table.isSuspicious,
      table.lastActiveAt,
    ),

    // Expired sessions range scan — O(log n + k)
    // Used by: delete.allExpiredAndStale (cron at 03:00 UTC)
    // Without index: O(n) full scan every cron run
    index("session_expires_at_idx").on(table.expiresAt),

    // Absolute-expired range scan — O(log n + k)
    // Used by: delete.allExpiredAndStale (cron)
    // Without index: O(n) full scan
    index("session_absolute_expires_at_idx").on(table.absoluteExpiresAt),

    // Revoked-retention cleanup — O(log n + k)
    // Used by: delete.allExpiredAndStale (cron removes revoked after 24h)
    // Without index: O(n) full scan
    index("session_revoked_at_idx").on(table.revokedAt),
  ],
);

export { sessionTable };

```

D:/1_Projects/jstonehub/apps/api/src/shared/db/schema/user.table.ts

```
import { createId } from "@packages/util/id";
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const userTable = pgTable(
  "user",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    email: text("email").notNull(),
    name: text("name").notNull(),
    avatarUrl: text("avatar_url"),

    isBanned: boolean("is_banned").notNull().default(false),

    energyBalance: bigint("energy_balance", { mode: "bigint" })
      .notNull()
      .default(sql`0`),
    lastEnergyClaimAt: timestamp("last_energy_claim_at", {
      withTimezone: true,
    }),
    loginStreak: integer("login_streak").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("user_email_unique_idx").on(table.email),

    index("user_name_trgm_idx").using("gin", sql`${table.name} gin_trgm_ops`),

    index("user_email_trgm_idx").using("gin", sql`${table.email} gin_trgm_ops`),

    index("user_is_banned_created_at_id_idx").on(
      table.isBanned,
      table.createdAt,
      table.id,
    ),

    index("user_created_at_id_idx").on(table.createdAt, table.id),

    index("user_energy_balance_id_idx").on(table.energyBalance, table.id),

    index("user_login_streak_id_idx").on(table.loginStreak, table.id),

    index("user_name_id_idx").on(table.name, table.id),

    index("user_email_id_idx").on(table.email, table.id),
  ],
);

export { userTable };

```

D:/1_Projects/jstonehub/apps/api/src/shared/plugin/_test/request-id.plugin.test.ts

```

```