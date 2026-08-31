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