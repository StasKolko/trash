# Comments

## TODO Comments

Used for planned improvements:

```typescript
// TODO: Description of what needs to be done
```

---

## Biome Ignore Comments

Used to suppress linter warnings with justification:

```typescript
// biome-ignore lint/ruleName: Reason for ignoring
```

> **Note:** `biome-ignore` replaces `TODO` when both address the same issue. They share the same status codes.

---

## Status Codes

Status codes are added after `TODO:` or `biome-ignore` to clarify the reason:

### REFACTOR_LATER

Code that works but needs improvement in the future (no time now):

```typescript
// TODO: REFACTOR_LATER <explanation>
```

### DEVELOP_LATER

Feature that cannot be implemented now due to missing dependencies, APIs, or infrastructure:

```typescript
// TODO: DEVELOP_LATER <explanation>
// biome-ignore lint/suspicious/noExplicitAny: DEVELOP_LATER <explanation>
// biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
```

**Explanations:**

- `<WAITING_FOR_LOGGER>` — Needs logger service for client/server error display and admin/developer error logging

### FALSE_POSITIVE

Linter warning that is incorrect for the specific context:

```typescript
// biome-ignore lint/ruleName: FALSE_POSITIVE <explanation>
```

**Explanations:**

- `<SOLIDJS_REACTIVITY>` — SolidJS reactive patterns (refs, signals, stores)
- `<INTENTIONAL_DESIGN>` — code written this way by design

**Example:**

```typescript
// biome-ignore lint/suspicious/noUnassignedVariables: FALSE_POSITIVE <SOLIDJS_REACTIVITY>
let inputRef: HTMLInputElement | undefined;
```