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