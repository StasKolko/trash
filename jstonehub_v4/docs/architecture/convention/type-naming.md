### Type Naming

| Category | Pattern | Example |
|----------|---------|---------|
| Base entity | `PascalCase` | `User`, `UserInsert`, `DragState` |
| Frontend → Backend | `{Entity}{Action}Params` | `GetUsersParams`, `CreateProjectParams` |
| Backend → Frontend | `{Entity}{Action}Response` | `GetUsersResponse`, `PaginatedResponse<T>` |
| Transformed for UI | `{Entity}{Context}Data` | `UserTableData`, `OrdersChartData` |
| Union from const | `PascalCase`, singular of const name | `SortOrder`, `GlobalRole`, `TaskStatus` |

**How to pick the right category:**

```
Sent from frontend to backend?
  → Yes → Params

Returned from backend to frontend?
  → Yes → Response

Reshaped for a specific UI component?
  → Yes → Data

Describes allowed values for a single field (derived from `as const`)?
  → Yes → Union from const

Describes a standalone data structure?
  → Yes → Base entity
```

**Type derivation from constants:**

```typescript
export type ContentType = (typeof CONTENT_TYPES)[number];
export type Orientation = (typeof ORIENTATIONS)[number];
export type PresenterFormat = (typeof PRESENTER_FORMATS)[number];

export const CONTENT_TYPES = ["video", "post", "audio"] as const;
export const ORIENTATIONS = ["vertical", "horizontal"] as const;
export const PRESENTER_FORMATS = [
  "cropped",
  "background_removed",
  "original",
] as const;

```

**Type placement rules:**

| Situation | Rule |
|-----------|------|
| Used in one place (one function) | **Inline only** — extracting is forbidden |
| Used in multiple places within one file, guaranteed file-only | Extract to top of file (after imports) |
| Used across multiple files | Extract to `.type.ts` file |
| Trivial types (`string`, `boolean`, `string \| undefined`) | Always inline, never extract |