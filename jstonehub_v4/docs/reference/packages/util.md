# @packages/util

```ts
import { assertNever, devFrontendAssert } from "@packages/util/assert";
import { cn } from "@packages/util/css";
import { focusFirstElement, getElementByIdOrThrow } from "@packages/util/dom";
import { is } from "@packages/util/guard";
import { createId } from "@packages/util/id";
import { debounce, throttle } from "@packages/util/timing";
```

---

## assert

### `assertNever(value: never, message?: string): never`

Exhaustive check for switch/if-else. Throws if reached.

### `devFrontendAssert(condition: boolean, component: string, message: string): void`

Throws `[{component}] {message}` when `import.meta.env.DEV === true` and `condition === true`. No-op in production.

---

## css

### `cn(...inputs: ClassArguments[]): string`

Merges class names with `tailwind-merge`. Accepts strings, arrays, objects with boolean values, `null`, `undefined`.

---

## dom

### `getElementByIdOrThrow(id: string): HTMLElement`

Returns element by ID or throws.

### `focusFirstElement(container: HTMLElement | null | undefined): boolean`

Focuses first focusable element inside container. Returns `true` if focused, `false` if no focusable element found or container is nullish.

---

## guard

### `is`

Type guard object. Every method is a type guard (`(value: unknown) => value is T`).

| Guard | Checks |
|-------|--------|
| `is.string(v)` | `typeof v === "string"` |
| `is.number(v)` | `typeof v === "number"` and not `NaN` |
| `is.boolean(v)` | `typeof v === "boolean"` |
| `is.undefined(v)` | `v === undefined` |
| `is.null(v)` | `v === null` |
| `is.nullish(v)` | `v === null \|\| v === undefined` |
| `is.object(v)` | Non-null, non-array object |
| `is.array(v)` | `Array.isArray(v)` |
| `is.function(v)` | `typeof v === "function"` |
| `is.error(v)` | `v instanceof Error` |
| `is.truthy(v)` | `Boolean(v)` |
| `is.falsy(v)` | `!v` |

All guards (except `truthy`/`falsy`) have negated versions via `is.not.*`.

---

## id

### `createId(): string`

Returns a cuid2 ID (24 chars, lowercase alphanumeric, URL-friendly).

---

## timing

### `debounce<Func>(func: Func, delay: number)`

Returns debounced function. Calls `func` with latest args after `delay` ms of inactivity.

- Returns `undefined` before first execution, then last result.
- `.cancel()` — cancels pending call.

### `throttle<Func>(func: Func, limit: number)`

Returns throttled function. Calls `func` immediately on first call, then at most once per `limit` ms. Trailing call fires with latest args.

- Returns last result.
- `.cancel()` — cancels pending trailing call, resets state.