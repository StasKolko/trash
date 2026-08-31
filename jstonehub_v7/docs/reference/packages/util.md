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