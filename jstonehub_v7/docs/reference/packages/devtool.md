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