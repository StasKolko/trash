### Variable and Function Naming

**Format:** `camelCase`

#### Naming prefixes

| Category | Prefix | Examples |
|----------|--------|---------|
| Data fetching / reading | `get`, `fetch`, `find` | `getUsers`, `fetchProjects`, `findById` |
| Creation | `create`, `build` | `createUser`, `buildQuery` |
| Transformation | `format`, `normalize`, `parse` | `formatDate`, `normalizeEmail`, `parseInput` |
| Validation | `validate`, `check` | `validateInput`, `checkPermissions` |
| Resolution / selection | `resolve` | `resolveVariantStyle`, `resolveLocale` |
| Boolean variables | `is`, `has`, `can`, `should` | `isActive`, `hasAccess`, `canEdit`, `shouldRefetch` |
| Boolean in props | No prefix | `open`, `disabled`, `loading` |
| Event handlers (props) | `on` | `onClick`, `onSubmit`, `onOpenChange` |
| Internal handlers | `handle` | `handleClick`, `handleFormSubmit` |
| SolidJS accessors | Noun, no prefix | `variant()`, `size()`, `disabled()` |

#### Event handler conventions

**Props — two patterns:**

| Pattern | When | Example |
|---------|------|---------|
| `on{State}Change` | Bidirectional state control | `onOpenChange`, `onValueChange`, `onSelectedChange` |
| `on{Action}` | One-way action | `onClose`, `onSubmit`, `onDelete` |

**Internal — mirrors prop name with `handle`:**

```ts
// prop: onClose → internal: handleClose
// prop: onSubmit → internal: handleFormSubmit (element added when ambiguous)
```

#### Arrays, counts, indexes

| Category | Pattern | Example |
|----------|---------|---------|
| Array | Plural noun | `users`, `items`, `selectedIds` |
| Count | `{noun}Count` | `itemCount`, `pageCount` |
| Index | `{noun}Index` | `currentIndex`, `activeIndex` |

#### SolidJS accessors

Inline `??` for defaults. Extract utility only when logic is non-trivial:

```ts
// ✅ Inline — trivial default
const variant = () => props.variant ?? BUTTON_VARIANT_DEFAULT;
const size = () => props.size ?? BUTTON_SIZE_DEFAULT;

// ✅ Utility — multiple conditions
const currentStyle = () => resolveVariantStyle(variant(), disabled());
```

#### Function body — declarative at the top

Main function reads as a plan. Implementation details live in called functions:

```ts
function createUser(input: CreateUserInput) {
  const validated = validateInput(input);
  const normalized = normalizeEmail(validated.email);
  const user = buildUserEntity(validated, normalized);
  return saveUser(user);
}
```

If function exceeds ~20 lines — extract sub-functions.