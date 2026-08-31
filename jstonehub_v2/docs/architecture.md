# Architecture & Naming Conventions

## Table of Contents

- [Core Philosophy](#core-philosophy)
- [Evolution Design](#evolution-design)
  - [Stage 1: Single File Module](#stage-1-single-file-module)
  - [Stage 2: Multi-File Module](#stage-2-multi-file-module)
  - [Stage 3: Nested Modules](#stage-3-nested-modules)
- [Module Structure](#module-structure)
  - [Frontend Module](#frontend-module)
  - [API Module](#api-module)
- [File Naming](#file-naming)
  - [General Rules](#general-rules)
  - [Frontend Files](#frontend-files)
  - [API Files](#api-files)
- [Export Naming](#export-naming)
  - [Types](#types)
  - [Variables & Functions](#variables--functions)
  - [Components](#components)
  - [Hooks](#hooks)
  - [Validation Schemas](#validation-schemas)
  - [API Client](#api-client)
  - [API DTOs](#api-dtos)
  - [Database](#database)
  - [Controllers](#controllers)
  - [Services](#services)
  - [Repositories](#repositories)
- [Routes](#routes)
  - [API Routes](#api-routes)
  - [Frontend Routes](#frontend-routes)
- [Imports & Exports](#imports--exports)
- [Shared & App Structure](#shared--app-structure)

---

## Core Philosophy

**Folder name = full context. File name = short & clear. Export name = full & unambiguous.**

```
browser-fingerprint/          ← Full name (context)
├── model/
│   ├── api.ts                ← Short file name
│   └── types.ts
└── index.ts

// But exports use full names:
export const browserFingerprintApi = { ... }
export type BrowserFingerprint = { ... }
```

---

## Evolution Design

Architecture follows **progressive extraction** principle — start simple, extract when needed.

### Stage 1: Single File Module

When module is small — everything in one file:

```
{module}/
├── index.ts          ← All code + internal types
└── types.ts          ← Public types (used by other modules)
```

**Rules:**
- `index.ts` — all code, internal types, public exports
- `types.ts` — only types needed by other modules (public API)
- Internal types stay in `index.ts` (not exposed)
- All imports from module: `import { X } from "#app/features/{module}"`
- All type imports: `import type { Y } from "#app/features/{module}/types"`

**Example:**

```typescript
// index.ts — internal types stay here
type InternalState = { ... }  // Not exported, used only inside

export function useModule() {
  const [state, setState] = createSignal<InternalState>(...);
  // ...
}

// types.ts — only public types
export type ModuleItem = { ... }      // Used by other modules
export type ModuleConfig = { ... }    // Passed from outside
```

### Stage 2: Multi-File Module

When code grows — split into purpose-based files and folders:

```
{module}/
├── lib/              ← Pure utilities (no side effects)
│   ├── constants.ts
│   ├── helpers.ts
│   └── validation.ts
├── model/            ← Data, state, business logic
│   ├── api.ts
│   ├── hooks.ts
│   └── types.ts
├── ui/               ← Components (frontend only)
│   ├── page.tsx
│   ├── table.tsx
│   └── row.tsx
├── index.ts          ← Public API
└── types.ts          ← Public types (re-exports from model/types.ts)
```

**Rules:**
- Group by purpose when **3+ files** of similar type
- `index.ts` — only public exports
- `types.ts` at root — re-exports public types from `model/types.ts`
- Internal imports within module — direct paths allowed
- External imports — only from `index.ts` and `types.ts`

### Stage 3: Nested Modules

When module has distinct sub-domains — create nested modules:

```
secret-voicer/
├── credential/                 ← Nested module
│   ├── lib/
│   ├── model/
│   ├── ui/
│   ├── index.ts
│   └── types.ts
├── voice/                      ← Nested module
│   ├── lib/
│   ├── model/
│   ├── ui/
│   ├── index.ts
│   └── types.ts
├── model/                      ← Parent shared logic
│   └── types.ts
├── ui/                         ← Parent shared UI
│   └── layout.tsx
├── index.ts                    ← Re-exports from nested + parent
└── types.ts                    ← Public types (parent + nested, for external use)
```

**Rules:**
- Nested modules follow same Evolution Design
- Nested can import from parent's `types.ts`
- Parent re-exports nested public APIs
- Each nested module is self-contained

---

## Module Structure

### Frontend Module

| Folder | Purpose | Files |
|--------|---------|-------|
| `lib/` | Pure utilities, no side effects | `constants.ts`, `helpers.ts`, `validation.ts` |
| `model/` | Data layer, state, business logic | `api.ts`, `hooks.ts`, `types.ts` |
| `ui/` | React/Solid components | `page.tsx`, `table.tsx`, `*-dialog.tsx` |

```
{feature}/
├── lib/
│   ├── constants.ts        ← Static values, options
│   ├── helpers.ts          ← Pure functions (format, filter, transform)
│   └── validation.ts       ← Form schemas (Valibot/Zod)
├── model/
│   ├── api.ts              ← API client calls
│   ├── hooks.ts            ← Custom hooks, state management
│   └── types.ts            ← All types for this module
├── ui/
│   ├── page.tsx            ← Main page component
│   ├── table.tsx           ← Table component
│   ├── row.tsx             ← Row component
│   ├── toolbar.tsx         ← Toolbar/filters
│   ├── create-dialog.tsx   ← Create dialog
│   ├── update-dialog.tsx   ← Update dialog
│   ├── delete-dialog.tsx   ← Delete dialog
│   └── view-dialog.tsx     ← View dialog
├── index.ts
└── types.ts
```

### API Module

### API Module

| Folder | Purpose | Files |
|--------|---------|-------|
| `data/` | Data layer (DB schema, queries) | `table.ts`, `repository.ts`, `types.ts` |
| `lib/` | Pure utilities | `constants.ts`, `helpers.ts` |
| `services/` | Business logic | `service.ts`, `*-service.ts` |
| `http/` | HTTP layer (endpoints) | `controller-v{N}.ts`, `middleware.ts` |


```
{feature}/
├── data/                       ← Data layer (like model/ on frontend)
│   ├── repository.ts           ← Database queries
│   ├── table.ts                ← Drizzle schema
│   └── types.ts                ← Internal types
├── lib/                        ← Pure utilities
│   ├── constants.ts
│   └── helpers.ts
├── services/                   ← Business logic
│   ├── service.ts              ← Main service (or multiple)
│   ├── processor-service.ts    ← When 3+ services
│   └── queue-service.ts
├── http/                       ← HTTP layer (like ui/ on frontend)
│   ├── controller-v{N}.ts           ← Endpoints
│   └── middleware.ts           ← Route-specific middleware
├── index.ts                    ← Public exports
└── types.ts                    ← Public types
```

---

## File Naming

### General Rules

| Principle | Example |
|-----------|---------|
| Folder = full context | `browser-fingerprint/` |
| File = short, clear purpose | `api.ts`, `hooks.ts`, `page.tsx` |
| kebab-case for files | `create-dialog.tsx` |
| No feature prefix in file names | ✅ `table.tsx` not ❌ `browser-fingerprint-table.tsx` |

### Required Naming Patterns

**API module:**

| File | Naming Rule | Example |
|------|-------------|---------|
| Controller | `controller-v{N}.ts` | `controller-v1.ts` |
| DB schema | `table.ts` | `table.ts` |
| Repository | `repository.ts` | `repository.ts` |
| Service | `service.ts` or `{name}-service.ts` | `service.ts`, `queue-service.ts` |
| Types | `types.ts` | `types.ts` |
| Helpers | `helpers.ts` (not `utils.ts`, `lib.ts`) | `helpers.ts` |
| Constants | `constants.ts` | `constants.ts` |
| Public exports | `index.ts` | `index.ts` |

**Frontend module:**

| File | Naming Rule | Example |
|------|-------------|---------|
| API client | `api.ts` | `api.ts` |
| Hooks | `hooks.ts` | `hooks.ts` |
| Validation | `validation.ts` | `validation.ts` |
| Types | `types.ts` | `types.ts` |
| Helpers | `helpers.ts` (not `utils.ts`, `lib.ts`) | `helpers.ts` |
| Constants | `constants.ts` | `constants.ts` |
| Public exports | `index.ts` | `index.ts` |

**UI components — flexible naming by purpose:**

| Pattern | Examples |
|---------|----------|
| `{purpose}.tsx` | `page.tsx`, `table.tsx`, `row.tsx`, `toolbar.tsx` |
| `{action}-dialog.tsx` | `create-dialog.tsx`, `update-dialog.tsx`, `delete-dialog.tsx` |
| `{purpose}-{detail}.tsx` | `row-actions.tsx`, `filter-panel.tsx` |

---

## Export Naming

> **Rule:** Export names always use full feature name to avoid collisions.

### Types

| Context | Format | Example |
|---------|--------|---------|
| Entity type | `PascalCase` | `BrowserFingerprint` |
| Create input | `Create` + Entity + `Input` | `CreateBrowserFingerprintInput` |
| Update input | `Update` + Entity + `Input` | `UpdateBrowserFingerprintInput` |
| State type | Entity + `State` | `BrowserFingerprintsState` |
| Filter type | Entity + `{Name}Filter` | `BrowserFingerprintStatusFilter` |
| Dialog type | Entity + `DialogType` | `BrowserFingerprintDialog` |

### Variables & Functions

| Context | Format | Example |
|---------|--------|---------|
| Array | camelCase plural | `browserFingerprints` |
| Single item | camelCase singular | `browserFingerprint` |
| Map | camelCase + `Map` | `browserFingerprintsMap` |
| Set | camelCase + `Set` | `browserFingerprintsSet` |
| Boolean | `is`/`has`/`should` prefix | `isActive`, `hasError` |
| Handler | `handle` + Action | `handleSubmit` |
| Callback prop | `on` + Action | `onSubmit`, `onClose` |
| Helper function | `{action}{Entity}` | `filterBrowserFingerprints` |

### Components

| Context | Format | Example |
|---------|--------|---------|
| Page | Entity + `Page` | `BrowserFingerprintsPage` |
| Layout | Entity + `Layout` | `SecretVoicerLayout` |
| Table | Entity + `Table` | `BrowserFingerprintsTable` |
| Row | Entity + `Row` | `BrowserFingerprintRow` |
| Dialog | `{Action}` + Entity + `Dialog` | `CreateBrowserFingerprintDialog` |
| List | Entity + `List` | `BrowserFingerprintsList` |
| Card | Entity + `Card` | `BrowserFingerprintCard` |

### Hooks

| Context | Format | Example |
|---------|--------|---------|
| List/collection hook | `use` + Entities | `useBrowserFingerprints` |
| Single item hook | `use` + Entity | `useBrowserFingerprint` |
| Action hook | `use` + Action + Entity | `useCreateBrowserFingerprint` |

### Validation Schemas

| Context | Format | Example |
|---------|--------|---------|
| Create schema | `create` + Entity + `Schema` | `createBrowserFingerprintSchema` |
| Update schema | `update` + Entity + `Schema` | `updateBrowserFingerprintSchema` |
| Delete schema | `delete` + Entity + `Schema` | `deleteBrowserFingerprintSchema` |
| Get/read schema | `get` + Entity + `Schema` | `getBrowserFingerprintSchema` |

### API Client

| Context | Format | Example |
|---------|--------|---------|
| API object | entity + `Api` | `browserFingerprintApi` |

```typescript
// model/api.ts
export const browserFingerprintApi = {
  getAll: async () => { ... },
  getById: async (id: string) => { ... },
  create: async (data) => { ... },
  update: async (id, data) => { ... },
  delete: async (id) => { ... },
}
```

### API DTOs

| Context | Format | Example |
|---------|--------|---------|
| Select DTO | Entity + `Dto` | `BrowserFingerprintDto` |
| Create DTO | `Create` + Entity + `Dto` | `CreateBrowserFingerprintDto` |
| Update DTO | `Update` + Entity + `Dto` | `UpdateBrowserFingerprintDto` |

### Database

| Context | Format | Example |
|---------|--------|---------|
| Table variable | entity + `Table` | `browserFingerprintTable` |
| SQL table name | snake_case plural | `browser_fingerprints` |
| SQL column | snake_case | `created_at` |
| Enum variable | field + `Enum` | `secChUaMobileEnum` |
| SQL enum name | snake_case | `sec_ch_ua_mobile` |

### Controllers

| Context | Format | Example |
|---------|--------|---------|
| Controller variable | entity + `Controller` + `V{N}` | `browserFingerprintControllerV1` |

### Services

| Context | Format | Example |
|---------|--------|---------|
| Service class | `PascalCase` + `Service` | `SynthesisProcessorService` |
| Service instance | `camelCase` + `Service` | `synthesisProcessorService` |

### Repositories

| Action | Format | Example |
|--------|--------|---------|
| Get one | `get` + Entity + `By{Field}` | `getBrowserFingerprintById` |
| Get all | `getAll` + Entities | `getAllBrowserFingerprints` |
| Get filtered | `get` + Entities + `By{Field}` | `getCredentialsByFingerprintId` |
| Create | `create` + Entity | `createBrowserFingerprint` |
| Update | `update` + Entity | `updateBrowserFingerprint` |
| Delete | `delete` + Entity | `deleteBrowserFingerprint` |

---

## Routes

### API Routes

**Structure:** `/v{N}/{scope}/{resource}`

| Scope | Access | Example |
|-------|--------|---------|
| `public` | No auth | `/v1/public/voices` |
| `private` | Authenticated | `/v1/private/profile` |
| `admin` | Admin only | `/v1/admin/browser-fingerprints` |

**Patterns:**

| Context | Pattern | Example |
|---------|---------|---------|
| Collection | `/{resources}` | `/v1/admin/browser-fingerprints` |
| Single item | `/{resources}/:id` | `/v1/admin/browser-fingerprints/:id` |
| Singleton | `/{resource}` | `/v1/private/profile` |
| Nested | `/{parent}/{resources}` | `/v1/admin/secret-voicer/credentials` |
| Action | `/{resources}/:id/{action}` | `/v1/admin/synthesis/:id/restart` |

### Frontend Routes

| Context | Pattern | Example |
|---------|---------|---------|
| Collection | `/{resources}` | `/browser-fingerprints` |
| Detail | `/{resources}/:id` | `/browser-fingerprints/:id` |
| Singleton | `/{resource}` | `/settings` |
| Nested | `/{parent}/{resources}` | `/secret-voicer/credentials` |

---

## Imports & Exports

### Rules

1. Each module **MUST** have `index.ts` and `types.ts`
2. External imports — only from `index.ts` or `types.ts`
3. Internal imports — direct paths allowed
4. Prefer named exports over default

### External Imports

```typescript
// ✅ Correct — from public API
import { BrowserFingerprintsPage } from "#app/features/browser-fingerprint";
import type { BrowserFingerprint } from "#app/features/browser-fingerprint/types";

// ❌ Wrong — from internal file
import { BrowserFingerprintsPage } from "#app/features/browser-fingerprint/ui/page";
```

### Internal Imports (within module)

```typescript
// ✅ Direct paths allowed inside module
import { browserFingerprintApi } from "../model/api";
import type { BrowserFingerprint } from "../model/types";
import { filterBrowserFingerprints } from "../lib/helpers";
```

### index.ts Example

```typescript
// Frontend module
export { BrowserFingerprintsPage } from "./ui/page";

// API module
export { browserFingerprintControllerV1 } from "./controller-v1";
export { browserFingerprintTable, secChUaMobileEnum, secChUaPlatformEnum } from "./table";
```

### types.ts Example

```typescript
// Re-export from internal types
export type {
  BrowserFingerprint,
  BrowserFingerprintsState,
  BrowserFingerprintStatusFilter,
  CreateBrowserFingerprintInput,
  UpdateBrowserFingerprintInput,
} from "./model/types";

// Re-export from contracts
export {
  browserFingerprintContract,
  BROWSER_FINGERPRINT_DEFAULTS,
} from "@packages/contracts/browser-fingerprint";

export type {
  SecChUaMobile,
  SecChUaPlatform,
} from "@packages/contracts/browser-fingerprint";
```

---

## Shared & App Structure

### Shared Folder

Location: `apps/{app}/src/shared/`

```
shared/
├── api/
│   ├── client.ts           ← API client instance
│   └── error.ts            ← Error handling utilities
├── config/
│   └── env.ts              ← Environment variables
├── lib/
│   └── utils.ts            ← General utilities
└── ui/
    ├── button.tsx          ← Shared UI components
    └── dialog.tsx
```

### App Folder

Location: `apps/{app}/src/app/`

```
app/
├── routes/
│   ├── __root.tsx          ← Root layout
│   ├── index.tsx           ← Home page
│   └── browser-fingerprints.tsx
├── styles/
│   └── globals.css
└── main.tsx                ← Entry point
```
```
