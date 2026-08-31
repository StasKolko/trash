D:\1_Projects\jstonehub\apps\api\src\app\main.ts

```
import { cron, Patterns } from "@elysiajs/cron";
import { Elysia } from "elysia";
import {
  audioProcessingControllerV1,
  getCacheCleanupCron,
} from "#api/features/audio-processing";
import { browserFingerprintControllerV1 } from "#api/features/browser-fingerprint";
import {
  secretVoicerAdminControllerV1,
  secretVoicerPublicControllerV1,
  syncVoicesFromExternalApi,
} from "#api/features/secret-voicer";

const API_PORT = 3333;

const app = new Elysia()
  .use(
    cron({
      name: "voiceSync",
      pattern: Patterns.EVERY_5_HOURS,
      async run() {
        // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
        console.log("⏰ [Cron] Starting scheduled voice sync...");
        await syncVoicesFromExternalApi();
      },
    }),
  )
  .use(getCacheCleanupCron())

  .use(browserFingerprintControllerV1)

  .use(secretVoicerPublicControllerV1)
  .use(secretVoicerAdminControllerV1)
  .use(audioProcessingControllerV1)

  .onAfterHandle(({ set }) => {
    set.headers["access-control-allow-origin"] = "*";
    set.headers["access-control-allow-methods"] =
      "GET,POST,PUT,PATCH,DELETE,OPTIONS";
    set.headers["access-control-allow-headers"] = "*";
  })
  .options("*", () => null)
  .listen(API_PORT);

// biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
console.log(`🦊 API is running at ${app.server?.hostname}:${app.server?.port}`);

export type ApiApp = typeof app;

```

D:\1_Projects\jstonehub\docs\comments.md

```
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
// biome-ignore lint/correctness/noUnusedVariables: FALSE_POSITIVE <SolidJS reactivity>
let inputRef: HTMLInputElement | undefined;
```
```

D:\1_Projects\jstonehub\docs\design-tokens.md

```
# Design Tokens

## Table of Contents

- [Core Concept](#core-concept)
- [Color Tokens](#color-tokens)
  - [Foundation](#foundation)
  - [Interactive](#interactive)
  - [Semantic](#semantic)
  - [Utility](#utility)
- [Geometry Tokens](#geometry-tokens)
  - [Radius](#radius)
  - [Shadows](#shadows)

---

## Core Concept

Every color token follows the **base + foreground** pattern:

- **Base** (`--color`) — background, surface, fill
- **Foreground** (`--color-foreground`) — text, icons, borders that sit **on top** of base

This ensures proper contrast and readability in any combination.

```tsx
// ✅ Correct: base as background, foreground for content
<div class="bg-primary text-primary-foreground">
<div class="bg-card text-card-foreground">
<div class="bg-error text-error-foreground border-error-foreground">

// ❌ Wrong: opacity modifiers break the system
<div class="bg-success/15 text-success">
```

**Rule:** If you need an opacity modifier — the design system is missing a token.

---

## Color Tokens

### Foundation

Base surfaces and typography for layouts.

| Token | Purpose |
|-------|---------|
| `background` / `foreground` | Page level — main surface and primary text |
| `card` / `card-foreground` | Elevated surfaces — cards, sections |
| `popover` / `popover-foreground` | Floating elements — dropdowns, tooltips, menus |
| `muted` / `muted-foreground` | Subtle backgrounds and secondary text |

### Interactive

User actions and clickable elements.

| Token | Purpose |
|-------|---------|
| `primary` / `primary-foreground` | Main CTA — "Save", "Submit", "Confirm" |
| `secondary` / `secondary-foreground` | Supporting actions — "Cancel", "Back" |
| `accent` / `accent-foreground` | Highlights — links, hover states, focus rings |
| `active` / `active-foreground` | Pressed/active states — clicked buttons, selected items |

**Interactive State Flow:**

```
default → hover (accent) → active (active) → focus (ring)
```

```tsx
// Button interaction example
<button class="
  bg-primary text-primary-foreground
  hover:bg-accent hover:text-accent-foreground
  active:bg-active active:text-active-foreground
  focus-visible:ring-2 focus-visible:ring-ring
">
```

### Semantic

Status feedback. **Base = soft background, Foreground = readable text/borders.**

| Token | Purpose |
|-------|---------|
| `success` / `success-foreground` | Positive — completed, saved, valid |
| `error` / `error-foreground` | Negative — failed, invalid, destructive |
| `warning` / `warning-foreground` | Caution — attention needed, pending |
| `info` / `info-foreground` | Neutral — tips, notes, informational |

### Utility

| Token | Purpose |
|-------|---------|
| `border` | Default borders and dividers |
| `input` | Form input borders |
| `ring` | Focus rings (accessibility) |
| `backdrop` | Modal/dialog overlay |
| `shadow` | Shadow color (adapts to light/dark) |

---

## Geometry Tokens

### Radius

All derived from base `--radius` for consistency.

| Token | Formula |
|-------|---------|
| `radius-sm` | `--radius - 4px` |
| `radius-md` | `--radius - 2px` |
| `radius-lg` | `--radius` (base) |
| `radius-xl` | `--radius + 4px` |
| `radius-2xl` | `--radius + 8px` |

### Shadows

Use `--shadow` color which adapts to theme (lighter in dark mode).

| Token | Use case |
|-------|----------|
| `shadow-sm` | Subtle elevation |
| `shadow-md` | Medium elevation |
| `shadow-lg` | High elevation |
```

---

**Ключевые изменения:**

1. **Добавлен `active` токен** в секцию Interactive с описанием
2. **Interactive State Flow** — добавлена диаграмма показывающая последовательность состояний
3. **Пример кода** — показывает как использовать все интерактивные состояния вместе
```

D:\1_Projects\jstonehub\docs\architecture.md

```
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

```

D:\1_Projects\jstonehub\apps\api\drizzle.config.ts

```
import process from "node:process";
import { defineConfig } from "drizzle-kit";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/features/**/table.ts",
  out: "./drizzle",
  dbCredentials: { url: DATABASE_URL },
  verbose: true,
  strict: true,
});

```

D:\1_Projects\jstonehub\docs\export-types\admin\app.md

```
## routes

Routes structure (TanStack Router). All logic in features, routes only define navigation.

/                           → HomePage
/browser-fingerprints       → BrowserFingerprintsPage
/secret-voicer              → SecretVoicerLayout
  /                         → redirect to /credentials
  /credentials              → SecretVoicerCredentialsPage
  /voices                   → SecretVoicerVoicesPage
  /sync-logs                → SecretVoicerSyncLogsPage
  /settings                 → inline (WIP)

## styles

globals.css — CSS variables and base styles (colors, spacing, typography tokens)

## FILES

**main.tsx**: App entrypoint — creates TanStack Router and renders to #app DOM node
```

D:\1_Projects\jstonehub\docs\export-types\admin\shared.md

```
## api

```ts
import { getApiErrorMessage, createApiError } from "#admin/shared/api/errors";

function getApiErrorMessage(error: unknown): string;
function createApiError(error: unknown): Error;
```

```ts
import { client } from "#admin/shared/api/client";

type Client = ReturnType<typeof treaty<ApiApp>>;
```

## config

```ts
import { env } from "#admin/shared/config/env";

type Env = {
  HUB_URL: string;
  MODE: "development" | "production" | "test";
};
```

## ui

```tsx
import { PageHeader } from "#admin/shared/ui/page-header";

type PageHeader = ParentProps<{
  title: string;
  description?: string;
  class?: string;
}>;
```

```tsx
import { SectionLayout } from "#admin/shared/ui/section-layout";

type SectionLayout = ParentProps<{
  title: string;
  description?: string;
  navItems: {
    to: string;
    label: string;
    icon?: JSX.Element;
  }[];
}>;
```
```

D:\1_Projects\jstonehub\docs\export-types\admin\features\home-page.md

```
```tsx
import { HomePage } from "#admin/features/home-page";

type HomePage = Component;
```
```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\index.ts

```
export {
  processedAudioStatusEnum,
  processedAudioTable,
} from "./data/table";

export { audioProcessingControllerV1 } from "./http/controller-v1";
export {
  cleanupExpiredCache,
  getCacheCleanupCron,
} from "./services/cache";
export {
  processFromSynthesis,
  processUploadedAudio,
} from "./services/processor";

```

D:\1_Projects\jstonehub\apps\api\src\app\main.ts

```
import { cron, Patterns } from "@elysiajs/cron";
import { Elysia } from "elysia";
import {
  audioProcessingControllerV1,
  getCacheCleanupCron,
} from "#api/features/audio-processing";
import { browserFingerprintControllerV1 } from "#api/features/browser-fingerprint";
import {
  secretVoicerAdminControllerV1,
  secretVoicerPublicControllerV1,
  syncVoicesFromExternalApi,
} from "#api/features/secret-voicer";

const API_PORT = 3333;

const app = new Elysia()
  .use(
    cron({
      name: "voiceSync",
      pattern: Patterns.EVERY_5_HOURS,
      async run() {
        // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
        console.log("⏰ [Cron] Starting scheduled voice sync...");
        await syncVoicesFromExternalApi();
      },
    }),
  )
  .use(getCacheCleanupCron())

  .use(browserFingerprintControllerV1)

  .use(secretVoicerPublicControllerV1)
  .use(secretVoicerAdminControllerV1)
  .use(audioProcessingControllerV1)

  .onAfterHandle(({ set }) => {
    set.headers["access-control-allow-origin"] = "*";
    set.headers["access-control-allow-methods"] =
      "GET,POST,PUT,PATCH,DELETE,OPTIONS";
    set.headers["access-control-allow-headers"] = "*";
  })
  .options("*", () => null)
  .listen(API_PORT);

// biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
console.log(`🦊 API is running at ${app.server?.hostname}:${app.server?.port}`);

export type ApiApp = typeof app;

```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\types.ts

```
export type {
  ProcessedAudio,
  ProcessingJobResponse,
  ProcessingJobStatus,
  ProcessingSettings,
} from "./data/types";

```

D:\1_Projects\jstonehub\docs\export-types\admin\features\browser-fingerprint.md

```
```tsx
import {
  BrowserFingerprintsPage,
  browserFingerprintApi,
} from "#admin/features/browser-fingerprint";

type BrowserFingerprintsPage = Component;

const browserFingerprintApi = {
  getAll: () => Promise<BrowserFingerprint[]>;
  getById: (id: string) => Promise<BrowserFingerprint>;
  create: (data: CreateBrowserFingerprintInput) => Promise<BrowserFingerprint>;
  update: (id: string, data: UpdateBrowserFingerprintInput) => Promise<BrowserFingerprint>;
  delete: (id: string) => Promise<{ success: boolean; id: string }>;
};
```
```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\index.ts

```
export { SecretVoicerCredentialsPage } from "./credential/ui/page";
export { SecretVoicerLayout } from "./ui/secret-voicer-layout";
export { SecretVoicerSyncLogsPage, SecretVoicerVoicesPage } from "./voice";

```

D:\1_Projects\jstonehub\docs\export-types\admin\features\secret-voicer.md

```
```ts
import { SecretVoicerCredentialsPage } from "#admin/features/secret-voicer";

type SecretVoicerCredentialsPage = Component;
```
```

D:\1_Projects\jstonehub\apps\admin\src\features\root-layout\index.ts

```
export { RootLayout } from "./ui/root-layout";

```

D:\1_Projects\jstonehub\docs\export-types\api\shared.md

```
## api

```ts
import { spread } from "#api/shared/api/typebox-helpers";

type spread = <
  T extends TObject | Table,
  Mode extends "select" | "insert" | undefined,
>(schema: T, mode?: Mode) => TObject["properties"];

```

## config

```ts
import { env } from "#api/shared/config/env";

type Env = {
  DATABASE_URL: string;
  REDIS_URL: string;
  NODE_ENV: "development" | "production" | "test";
};
````

```ts
import type { HttpStatus } from "#api/shared/config/http-status";
import { HTTP_STATUS } from "#api/shared/config/http-status";

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TEAPOT: 418,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const;

type HttpStatus = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 418 | 500 | 501 | 503;
```

### db

```ts
import { db, type Database } from "#api/shared/db";

// Drizzle
type db = BunSQLDatabase<typeof dbSchema>;
```
```

D:\1_Projects\jstonehub\docs\export-types\api\app.md

```

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\index.ts

```
export { secretVoicerCredentialTable } from "./credential/table";
export { secretVoicerAdminControllerV1 } from "./http/admin-v1";
export { secretVoicerPublicControllerV1 } from "./http/public-v1";
export {
  synthesisControllerV1,
  synthesisProjectStatusEnum,
  synthesisProjectTable,
  synthesisTaskStatusEnum,
  synthesisTaskTable,
} from "./synthesis";
export {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
  syncVoicesFromExternalApi,
  voiceEmotionSupportEnum,
  voiceGenderEnum,
  voiceSyncEventTypeEnum,
  voiceSyncState,
} from "./voice";

```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\data\repository.ts

```
import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "#api/shared/db";
import { processedAudioTable } from "./table";
import type {
  NewProcessedAudio,
  ProcessedAudio,
  UpdateProcessedAudio,
} from "./types";

export async function createProcessedAudio(
  data: NewProcessedAudio,
): Promise<ProcessedAudio> {
  const [result] = await db
    .insert(processedAudioTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create processed audio record");
  }
  return result;
}

export function getProcessedAudioById(
  id: string,
): Promise<ProcessedAudio | undefined> {
  return db.query.processedAudioTable.findFirst({
    where: eq(processedAudioTable.id, id),
  });
}

export function getProcessedAudioBySourceProject(
  projectId: string,
): Promise<ProcessedAudio | undefined> {
  return db.query.processedAudioTable.findFirst({
    where: and(
      eq(processedAudioTable.sourceType, "synthesis"),
      eq(processedAudioTable.sourceProjectId, projectId),
    ),
  });
}

export function getAllCachedAudio(): Promise<ProcessedAudio[]> {
  return db
    .select()
    .from(processedAudioTable)
    .orderBy(sql`${processedAudioTable.createdAt} DESC`);
}

export function getValidCachedAudio(): Promise<ProcessedAudio[]> {
  return db
    .select()
    .from(processedAudioTable)
    .where(
      and(
        eq(processedAudioTable.status, "COMPLETED"),
        sql`${processedAudioTable.expiresAt} > NOW()`,
      ),
    )
    .orderBy(sql`${processedAudioTable.createdAt} DESC`);
}

export async function updateProcessedAudio(
  id: string,
  data: UpdateProcessedAudio,
): Promise<ProcessedAudio | undefined> {
  const [result] = await db
    .update(processedAudioTable)
    .set(data)
    .where(eq(processedAudioTable.id, id))
    .returning();
  return result;
}

export async function deleteProcessedAudio(
  id: string,
): Promise<ProcessedAudio | undefined> {
  const [result] = await db
    .delete(processedAudioTable)
    .where(eq(processedAudioTable.id, id))
    .returning();
  return result;
}

export async function deleteExpiredCache(): Promise<number> {
  const result = await db
    .delete(processedAudioTable)
    .where(lt(processedAudioTable.expiresAt, new Date()))
    .returning();
  return result.length;
}

export async function deleteAllCache(): Promise<number> {
  const result = await db.delete(processedAudioTable).returning();
  return result.length;
}

```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\data\types.ts

```
import type { processedAudioTable } from "./table";

export type ProcessedAudio = typeof processedAudioTable.$inferSelect;
export type NewProcessedAudio = typeof processedAudioTable.$inferInsert;
export type UpdateProcessedAudio = Partial<
  Omit<NewProcessedAudio, "id" | "createdAt">
>;

export type ProcessingSettings = {
  silenceThreshold: number;
  minSilenceDuration: number;
  pauseBetweenChunks: number;
  pauseBetweenFiles: number;
  pauseAtStart: number;
  pauseAtEnd: number;
  outputFormat: "mp3" | "wav";
};

export type ProcessingJobStatus = ProcessedAudio["status"];

export type ProcessingJobResponse = {
  id: string;
  status: ProcessingJobStatus;
  progress: number;
  error: string | null;
  outputPath: string | null;
  outputSize: number | null;
  outputDuration: number | null;
};

```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\data\table.ts

```
import { audioProcessingContract } from "@packages/contracts/audio-processing";
import { createId } from "@packages/utils/id";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { ProcessingSettings } from "./types";

export const processedAudioStatusEnum = pgEnum(
  "processed_audio_status",
  audioProcessingContract.status.values() as [string, ...string[]],
);

export const processedAudioTable = pgTable("processed_audio_cache", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  // Source identification
  sourceType: text("source_type").notNull(), // "synthesis" | "upload"
  sourceProjectId: text("source_project_id"),
  sourceFilesHash: text("source_files_hash"),

  // Processing settings
  settings: jsonb("settings").$type<ProcessingSettings>().notNull(),

  // Status
  status: processedAudioStatusEnum("status").default("PENDING").notNull(),
  progress: integer("progress").default(0).notNull(),
  error: text("error"),

  // Output
  outputPath: text("output_path"),
  outputSize: integer("output_size"),
  outputDuration: real("output_duration"),

  // Cache management
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

```

D:\1_Projects\jstonehub\docs\export-types\hub\app.md

```
## routes

Routes structure (TanStack Router). All logic in features, routes only define navigation.

/                           → HomePage
/jokes                      → JokesPage
/voiceover                  → VoiceoverPage


## styles

globals.css — CSS variables and base styles (colors, spacing, typography tokens)

## FILES

**main.tsx**: App entrypoint — creates TanStack Router and renders to #app DOM node
```

D:\1_Projects\jstonehub\docs\export-types\hub\shared.md

```
## api

```ts
import { client } from "#hub/shared/api/client";

type Client = ReturnType<typeof treaty<ApiApp>>;
```

## config

```ts
import { env } from "#hub/shared/config/env";

type Env = {
  ADMIN_URL: string;
  MODE: "development" | "production" | "test";
};
```
```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\services\processor.ts

```
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createProcessedAudio, updateProcessedAudio } from "../data/repository";
import type { ProcessingSettings } from "../data/types";
import { AUDIO_PROCESSING_CONSTANTS } from "../lib/constants";
import {
  concatenateAudioFiles,
  removeSilence,
  sortFilesNaturally,
} from "../lib/ffmpeg";

const SILENCE_REMOVAL_PROGRESS_WEIGHT = 40;
const CONCAT_PROGRESS_WEIGHT = 0.6;
const BYTES_PER_KB = 1024;
const FULL_PROGRESS = 100;

type ProcessFromUploadInput = {
  files: { path: string; name: string }[];
  settings: ProcessingSettings;
};

type ProcessFromSynthesisInput = {
  projectId: string;
  storagePath: string;
  settings: ProcessingSettings;
};

function generateFilesHash(filenames: string[]): string {
  const sorted = [...filenames].sort();
  return crypto.createHash("md5").update(sorted.join("|")).digest("hex");
}

function getExpirationDate(): Date {
  const date = new Date();
  date.setDate(
    date.getDate() + AUDIO_PROCESSING_CONSTANTS.CACHE_RETENTION_DAYS,
  );
  return date;
}

async function processAudioJob(
  jobId: string,
  inputFiles: string[],
  settings: ProcessingSettings,
): Promise<void> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`🎵 [AudioProcessing] Starting job ${jobId}`);

  try {
    await updateProcessedAudio(jobId, {
      status: "PROCESSING",
      progress: 0,
    });

    const sortedFiles = sortFilesNaturally(inputFiles);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`📁 [AudioProcessing] Processing ${sortedFiles.length} files`);

    for (const file of sortedFiles) {
      try {
        // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER sequential file validation needed before processing
        await fs.access(file);
      } catch {
        throw new Error(`File not found: ${file}`);
      }
    }

    const tempDir = path.join(AUDIO_PROCESSING_CONSTANTS.UPLOADS_PATH, jobId);
    await fs.mkdir(tempDir, { recursive: true });

    const processedChunks: string[] = [];
    for (let i = 0; i < sortedFiles.length; i++) {
      const inputFile = sortedFiles[i];
      if (!inputFile) {
        throw new Error(`File at index ${i} is undefined`);
      }
      const outputFile = path.join(tempDir, `chunk_${i}.wav`);

      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔇 [AudioProcessing] Removing silence from file ${i + 1}/${sortedFiles.length}`,
      );
      // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER sequential processing needed for ordered audio chunks
      await removeSilence(inputFile, outputFile, settings);
      processedChunks.push(outputFile);

      const progress = Math.round(
        ((i + 1) / sortedFiles.length) * SILENCE_REMOVAL_PROGRESS_WEIGHT,
      );
      await updateProcessedAudio(jobId, { progress });
    }

    const outputExt = settings.outputFormat;
    const outputPath = path.join(
      AUDIO_PROCESSING_CONSTANTS.PROCESSED_PATH,
      `${jobId}.${outputExt}`,
    );

    await fs.mkdir(AUDIO_PROCESSING_CONSTANTS.PROCESSED_PATH, {
      recursive: true,
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `🔗 [AudioProcessing] Concatenating ${processedChunks.length} chunks`,
    );
    const result = await concatenateAudioFiles(
      processedChunks,
      outputPath,
      settings,
      (concatProgress) => {
        const totalProgress =
          SILENCE_REMOVAL_PROGRESS_WEIGHT
          + Math.round(concatProgress * CONCAT_PROGRESS_WEIGHT);
        updateProcessedAudio(jobId, { progress: totalProgress }).catch(() => {
          // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
          console.warn(
            `[AudioProcessing] Failed to update progress for job ${jobId}`,
          );
        });
      },
    );

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("🧹 [AudioProcessing] Cleaning up temp files");
    await fs.rm(tempDir, { recursive: true, force: true });

    await updateProcessedAudio(jobId, {
      status: "COMPLETED",
      progress: FULL_PROGRESS,
      outputPath: result.outputPath,
      outputSize: result.size,
      outputDuration: result.duration,
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`✅ [AudioProcessing] Job ${jobId} completed`);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`   📁 Output: ${result.outputPath}`);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `   📊 Size: ${(result.size / BYTES_PER_KB / BYTES_PER_KB).toFixed(2)} MB`,
    );
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`   ⏱️ Duration: ${result.duration.toFixed(2)} seconds`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`❌ [AudioProcessing] Job ${jobId} failed:`, errorMsg);

    await updateProcessedAudio(jobId, {
      status: "FAILED",
      error: errorMsg,
    });

    const tempDir = path.join(AUDIO_PROCESSING_CONSTANTS.UPLOADS_PATH, jobId);
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.warn(
        `[AudioProcessing] Failed to cleanup temp dir for job ${jobId}`,
      );
    });
  }
}

export async function processUploadedAudio(
  input: ProcessFromUploadInput,
): Promise<string> {
  const { files, settings } = input;

  const filesHash = generateFilesHash(files.map((f) => f.name));
  const job = await createProcessedAudio({
    sourceType: "upload",
    sourceFilesHash: filesHash,
    settings,
    status: "PENDING",
    expiresAt: getExpirationDate(),
  });

  processAudioJob(
    job.id,
    files.map((f) => f.path),
    settings,
  ).catch((error) => {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("[AudioProcessing] Background processing failed:", error);
  });

  return job.id;
}

export async function processFromSynthesis(
  input: ProcessFromSynthesisInput,
): Promise<string> {
  const { projectId, storagePath, settings } = input;

  const job = await createProcessedAudio({
    sourceType: "synthesis",
    sourceProjectId: projectId,
    settings,
    status: "PENDING",
    expiresAt: getExpirationDate(),
  });

  const projectPath = path.join("storage/secret-voicer/projects", storagePath);
  const files = await fs.readdir(projectPath);
  const audioFiles = files
    .filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"))
    .map((f) => path.join(projectPath, f));

  processAudioJob(job.id, audioFiles, settings).catch((error) => {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("[AudioProcessing] Background processing failed:", error);
  });

  return job.id;
}

export async function reprocessAudio(
  jobId: string,
  inputFiles: string[],
  settings: ProcessingSettings,
): Promise<void> {
  await updateProcessedAudio(jobId, {
    status: "PENDING",
    progress: 0,
    error: null,
    outputPath: null,
    outputSize: null,
    outputDuration: null,
    settings,
    expiresAt: getExpirationDate(),
  });

  processAudioJob(jobId, inputFiles, settings).catch((error) => {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("[AudioProcessing] Background processing failed:", error);
  });
}

export async function deleteProcessedAudioFile(
  outputPath: string,
): Promise<void> {
  try {
    await fs.unlink(outputPath);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`🗑️ [AudioProcessing] Deleted: ${outputPath}`);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn(
      `⚠️ [AudioProcessing] Could not delete file: ${outputPath}`,
      error,
    );
  }
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\index.ts

```
export { SecretVoicerVoicesPage } from "./ui/page";
export { SecretVoicerSyncLogsPage } from "./ui/sync-logs-page";

```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\lib\constants.ts

```
export const AUDIO_PROCESSING_CONSTANTS = {
  // Storage paths
  UPLOADS_PATH: "storage/audio-processing/uploads",
  PROCESSED_PATH: "storage/audio-processing/processed",

  // Limits
  MAX_FILE_SIZE_MB: 500,
  MAX_TOTAL_SIZE_MB: 2000,
  MAX_FILES_COUNT: 100,

  // Cache
  CACHE_RETENTION_DAYS: 7,

  // Processing defaults
  DEFAULT_SILENCE_THRESHOLD: -40, // dB
  DEFAULT_MIN_SILENCE_DURATION: 0.5, // seconds
  DEFAULT_PAUSE_BETWEEN_CHUNKS: 0.3, // seconds
  DEFAULT_PAUSE_BETWEEN_FILES: 1.0, // seconds
  DEFAULT_PAUSE_AT_START: 0.5, // seconds
  DEFAULT_PAUSE_AT_END: 0.5, // seconds
  DEFAULT_OUTPUT_FORMAT: "mp3" as const,

  // Supported formats
  SUPPORTED_INPUT_FORMATS: ["mp3", "wav"] as const,
  SUPPORTED_OUTPUT_FORMATS: ["mp3", "wav"] as const,
} as const;

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\ui\secret-voicer-layout.tsx

```
import { Container } from "@packages/ui/container";
import { Outlet } from "@tanstack/solid-router";
import { FileText, Key, Mic, Settings } from "lucide-solid";
import { type NavItem, SectionLayout } from "#admin/shared/ui/section-layout";

const NAV_ITEMS: NavItem[] = [
  {
    to: "/secret-voicer/credentials",
    label: "Credentials",
    icon: <Key class="w-4 h-4" />,
  },
  {
    to: "/secret-voicer/voices",
    label: "Voices",
    icon: <Mic class="w-4 h-4" />,
  },
  {
    to: "/secret-voicer/sync-logs",
    label: "Sync Logs",
    icon: <FileText class="w-4 h-4" />,
  },
  {
    to: "/secret-voicer/settings",
    label: "Settings",
    icon: <Settings class="w-4 h-4" />,
  },
];

export function SecretVoicerLayout() {
  return (
    <Container class="py-8">
      <SectionLayout
        title="Secret Voicer"
        description="Управление голосовым синтезом"
        navItems={NAV_ITEMS}
      >
        <Outlet />
      </SectionLayout>
    </Container>
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\services\external-api.ts

```
import type {
  CreateTaskResponse,
  SynthesizePayload,
  TaskStatusResponse,
  VoiceRequestConfig,
} from "./types";

const BASE_URL = "https://secret-voicer.ru/api";

export class SecretVoicerExternalService {
  private getHeaders(config: VoiceRequestConfig) {
    // Очистка токенов от пробелов и переносов строк при копировании
    const csrf = config.csrfToken.trim();
    const session = config.sessionId.trim();

    return {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,ru;q=0.8",
      "content-type": "application/json",
      // Формируем cookie строго
      cookie: `csrftoken=${csrf}; sessionid=${session}`,
      origin: "https://secret-voicer.ru",
      referer: "https://secret-voicer.ru/app/",
      "sec-ch-ua": config.secChUa,
      "sec-ch-ua-mobile": config.secChUaMobile,
      // Убедимся, что кавычки в платформе корректны (они должны быть в базе, но на всякий случай)
      "sec-ch-ua-platform": config.secChUaPlatform,
      "user-agent": config.userAgent,
      "x-csrftoken": csrf,
    };
  }

  public async createTask(
    config: VoiceRequestConfig,
    payload: SynthesizePayload,
  ): Promise<CreateTaskResponse> {
    const body = {
      model_id: "eleven_multilingual_v2",
      provider: "default",
      rate: payload.rate ?? 1,
      similarity_boost: 0.75,
      stability: 0.5,
      style: 0,
      text: payload.text,
      voice_id: payload.voice_id,
    };

    try {
      const response = await fetch(`${BASE_URL}/synthesize/`, {
        method: "POST",
        headers: this.getHeaders(config),
        body: JSON.stringify(body),
        // ВАЖНО: Не следовать за редиректами. Если сессия мертва, сервер вернет 302, а не 404 html
        redirect: "manual",
      });

      const redirectStatus = 300;
      const maxRedirectStatus = 400;
      // Обработка потери авторизации (Редирект на логин)
      if (
        response.status >= redirectStatus
        && response.status < maxRedirectStatus
      ) {
        throw new Error(
          `Auth Failed (Redirected with status ${response.status}). Check Session ID/CSRF.`,
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        // Если вернулся HTML (например 404 страница сайта), значит мы стучимся не туда или нас отшили
        if (
          errorText.trim().startsWith("<html")
          || errorText.trim().startsWith("<!DOCTYPE")
        ) {
          throw new Error(
            `External API Error (${response.status}): Probably Invalid Credentials or Blocked Request.`,
          );
        }
      }

      return (await response.json()) as CreateTaskResponse;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Network/Fetch Error: ${e.message}`);
      }
      throw e;
    }
  }

  public async checkTaskStatus(
    config: VoiceRequestConfig,
    taskId: string,
  ): Promise<TaskStatusResponse> {
    const response = await fetch(`${BASE_URL}/task/${taskId}/`, {
      method: "GET",
      headers: this.getHeaders(config),
      redirect: "manual", // Также отключаем редиректы здесь
    });

    const maxRedirects = 300;
    const redirectCount = 400;
    if (response.status >= maxRedirects && response.status < redirectCount) {
      throw new Error(
        `Auth Failed (Redirected ${response.status}) during Status Check.`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes("<html")) {
        throw new Error(
          `Invalid Status Check Response (HTML). Status: ${response.status}`,
        );
      }
      const maxLength = 100;
      throw new Error(
        `Check Status Error (${response.status}): ${errorText.substring(0, maxLength)}`,
      );
    }

    return (await response.json()) as TaskStatusResponse;
  }

  public async downloadAudio(
    config: VoiceRequestConfig,
    audioPath: string,
  ): Promise<ArrayBuffer> {
    const url = `https://secret-voicer.ru${audioPath}`;
    const response = await fetch(url, {
      headers: this.getHeaders(config),
      redirect: "manual",
    });

    if (!response.ok) {
      throw new Error(`Download Error (${response.status})`);
    }

    return await response.arrayBuffer();
  }
}

export const externalApiService = new SecretVoicerExternalService();

```

D:\1_Projects\jstonehub\apps\admin\src\features\root-layout\ui\root-layout.tsx

```
import { Main } from "@packages/ui/main";
import { TooltipProvider } from "@packages/ui/tooltip";
import { HeadContent, Outlet, Scripts } from "@tanstack/solid-router";
import { Devtools } from "./devtools";
import { RootResponsiveNavigation } from "./root-responsive-navigation";

export function RootLayout() {
  return (
    <TooltipProvider>
      <HeadContent />

      <RootResponsiveNavigation />
      <Main>
        <Outlet />
      </Main>

      <Devtools />
      <Scripts />
    </TooltipProvider>
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\http\controller-v1.ts

```
import fs from "node:fs/promises";
import path from "node:path";
import { Type as t } from "@sinclair/typebox";
import { Elysia, NotFoundError } from "elysia";
import { HTTP_STATUS } from "#api/shared/config/http-status";
import {
  deleteAllCache,
  deleteProcessedAudio,
  getProcessedAudioById,
  getValidCachedAudio,
} from "../data/repository";
import type { ProcessingSettings } from "../data/types";
import { AUDIO_PROCESSING_CONSTANTS } from "../lib/constants";
import {
  deleteProcessedAudioFile,
  processFromSynthesis,
  processUploadedAudio,
  reprocessAudio,
} from "../services/processor";

const BYTES_PER_MB = 1_048_576;

const Nullable = <T extends import("@sinclair/typebox").TSchema>(schema: T) =>
  t.Union([schema, t.Null()]);

const ProcessingSettingsDto = t.Object({
  silenceThreshold: t.Optional(t.Number({ default: -40 })),
  minSilenceDuration: t.Optional(t.Number({ default: 0.5 })),
  pauseBetweenChunks: t.Optional(t.Number({ default: 0.3 })),
  pauseBetweenFiles: t.Optional(t.Number({ default: 1.0 })),
  pauseAtStart: t.Optional(t.Number({ default: 0.5 })),
  pauseAtEnd: t.Optional(t.Number({ default: 0.5 })),
  outputFormat: t.Optional(t.Union([t.Literal("mp3"), t.Literal("wav")])),
});

const ProcessFromSynthesisDto = t.Object({
  projectId: t.String(),
  storagePath: t.String(),
  settings: t.Optional(ProcessingSettingsDto),
});

const JobStatusDto = t.Object({
  id: t.String(),
  status: t.String(),
  progress: t.Number(),
  error: Nullable(t.String()),
  outputPath: Nullable(t.String()),
  outputSize: Nullable(t.Number()),
  outputDuration: Nullable(t.Number()),
  expiresAt: t.Date(),
  createdAt: t.Date(),
});

const CachedFileDto = t.Object({
  id: t.String(),
  sourceType: t.String(),
  sourceProjectId: Nullable(t.String()),
  status: t.String(),
  outputSize: Nullable(t.Number()),
  outputDuration: Nullable(t.Number()),
  expiresAt: t.Date(),
  createdAt: t.Date(),
});

function getDefaultSettings(): ProcessingSettings {
  return {
    silenceThreshold: AUDIO_PROCESSING_CONSTANTS.DEFAULT_SILENCE_THRESHOLD,
    minSilenceDuration: AUDIO_PROCESSING_CONSTANTS.DEFAULT_MIN_SILENCE_DURATION,
    pauseBetweenChunks: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_BETWEEN_CHUNKS,
    pauseBetweenFiles: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_BETWEEN_FILES,
    pauseAtStart: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_AT_START,
    pauseAtEnd: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_AT_END,
    outputFormat: AUDIO_PROCESSING_CONSTANTS.DEFAULT_OUTPUT_FORMAT,
  };
}

function mergeSettings(
  partial: Partial<ProcessingSettings> | undefined,
): ProcessingSettings {
  const defaults = getDefaultSettings();
  if (!partial) {
    return defaults;
  }

  return {
    silenceThreshold: partial.silenceThreshold ?? defaults.silenceThreshold,
    minSilenceDuration:
      partial.minSilenceDuration ?? defaults.minSilenceDuration,
    pauseBetweenChunks:
      partial.pauseBetweenChunks ?? defaults.pauseBetweenChunks,
    pauseBetweenFiles: partial.pauseBetweenFiles ?? defaults.pauseBetweenFiles,
    pauseAtStart: partial.pauseAtStart ?? defaults.pauseAtStart,
    pauseAtEnd: partial.pauseAtEnd ?? defaults.pauseAtEnd,
    outputFormat: partial.outputFormat ?? defaults.outputFormat,
  };
}

export const audioProcessingControllerV1 = new Elysia({
  prefix: "/v1/admin/audio-processing",
})
  .post("/process", async ({ body, set }) => {
    const formData = body as {
      files: File[];
      settings?: string;
    };

    if (!formData.files || formData.files.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No files provided" };
    }

    let settings: ProcessingSettings;
    try {
      const parsed = formData.settings ? JSON.parse(formData.settings) : {};
      settings = mergeSettings(parsed);
    } catch {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid settings JSON" };
    }

    const maxFileSizeBytes =
      AUDIO_PROCESSING_CONSTANTS.MAX_FILE_SIZE_MB * BYTES_PER_MB;
    const maxTotalSizeBytes =
      AUDIO_PROCESSING_CONSTANTS.MAX_TOTAL_SIZE_MB * BYTES_PER_MB;

    let totalSize = 0;
    for (const file of formData.files) {
      if (file.size > maxFileSizeBytes) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return {
          error: `File ${file.name} exceeds max size of ${AUDIO_PROCESSING_CONSTANTS.MAX_FILE_SIZE_MB}MB`,
        };
      }
      totalSize += file.size;
    }

    if (totalSize > maxTotalSizeBytes) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: `Total size exceeds max of ${AUDIO_PROCESSING_CONSTANTS.MAX_TOTAL_SIZE_MB}MB`,
      };
    }

    const uploadDir = path.join(
      AUDIO_PROCESSING_CONSTANTS.UPLOADS_PATH,
      `upload_${Date.now()}`,
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles: { path: string; name: string }[] = [];

    try {
      for (const file of formData.files) {
        const filePath = path.join(uploadDir, file.name);
        // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER sequential file save needed for ordering
        const buffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));
        savedFiles.push({ path: filePath, name: file.name });
      }

      const jobId = await processUploadedAudio({
        files: savedFiles,
        settings,
      });

      set.status = HTTP_STATUS.CREATED;
      return { jobId, message: "Processing started" };
    } catch (error) {
      await fs
        .rm(uploadDir, { recursive: true, force: true })
        // biome-ignore lint/suspicious/noEmptyBlockStatements: REFACTOR_LATER <WAITING_FOR_LOGGER> intentional ignore on cleanup failure
        .catch(() => {});
      throw error;
    }
  })

  .post(
    "/process/from-synthesis",
    async ({ body, set }) => {
      const input = body as {
        projectId: string;
        storagePath: string;
        settings?: Partial<ProcessingSettings>;
      };

      const settings = mergeSettings(input.settings);

      const jobId = await processFromSynthesis({
        projectId: input.projectId,
        storagePath: input.storagePath,
        settings,
      });

      set.status = HTTP_STATUS.CREATED;
      return { jobId, message: "Processing started" };
    },
    {
      body: ProcessFromSynthesisDto,
    },
  )

  .get(
    "/jobs/:id",
    async ({ params: { id } }) => {
      const job = await getProcessedAudioById(id);
      if (!job) {
        throw new NotFoundError("Job not found");
      }

      return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        outputPath: job.outputPath,
        outputSize: job.outputSize,
        outputDuration: job.outputDuration,
        expiresAt: job.expiresAt,
        createdAt: job.createdAt,
      };
    },
    {
      response: JobStatusDto,
    },
  )

  .get(
    "/jobs/:id/status",
    async ({ params: { id } }) => {
      const job = await getProcessedAudioById(id);
      if (!job) {
        throw new NotFoundError("Job not found");
      }

      return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
      };
    },
    {
      response: t.Object({
        id: t.String(),
        status: t.String(),
        progress: t.Number(),
        error: Nullable(t.String()),
      }),
    },
  )

  .post(
    "/jobs/:id/reprocess",
    async ({ params: { id }, body }) => {
      const job = await getProcessedAudioById(id);
      if (!job) {
        throw new NotFoundError("Job not found");
      }

      const settings = mergeSettings(body?.settings);

      let inputFiles: string[] = [];

      if (job.sourceType === "synthesis" && job.sourceProjectId) {
        const projectPath = path.join(
          "storage/secret-voicer/projects",
          job.sourceProjectId,
        );
        try {
          const files = await fs.readdir(projectPath);
          inputFiles = files
            .filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"))
            .map((f) => path.join(projectPath, f));
        } catch {
          return { error: "Source project files not found" };
        }
      } else {
        return {
          error: "Cannot reprocess upload-based jobs (files are temporary)",
        };
      }

      if (job.outputPath) {
        await deleteProcessedAudioFile(job.outputPath);
      }

      await reprocessAudio(id, inputFiles, settings);

      return { success: true, message: "Reprocessing started" };
    },
    {
      body: t.Optional(
        t.Object({
          settings: t.Optional(ProcessingSettingsDto),
        }),
      ),
    },
  )

  .get("/jobs/:id/download", async ({ params: { id }, set }) => {
    const job = await getProcessedAudioById(id);
    if (!job) {
      throw new NotFoundError("Job not found");
    }

    if (job.status !== "COMPLETED" || !job.outputPath) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Job is not completed or has no output" };
    }

    try {
      await fs.access(job.outputPath);
    } catch {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Output file not found (may have expired)" };
    }

    const fileBuffer = await fs.readFile(job.outputPath);
    const ext = path.extname(job.outputPath);
    const contentType = ext === ".wav" ? "audio/wav" : "audio/mpeg";
    const filename = `processed_${job.id}${ext}`;

    set.headers["content-type"] = contentType;
    set.headers["content-disposition"] = `attachment; filename="${filename}"`;
    set.headers["content-length"] = String(fileBuffer.length);

    return fileBuffer;
  })

  .get(
    "/cache",
    async () => {
      const cached = await getValidCachedAudio();
      return cached.map((job) => ({
        id: job.id,
        sourceType: job.sourceType,
        sourceProjectId: job.sourceProjectId,
        status: job.status,
        outputSize: job.outputSize,
        outputDuration: job.outputDuration,
        expiresAt: job.expiresAt,
        createdAt: job.createdAt,
      }));
    },
    {
      response: t.Array(CachedFileDto),
    },
  )

  .delete("/cache/:id", async ({ params: { id } }) => {
    const job = await getProcessedAudioById(id);
    if (!job) {
      throw new NotFoundError("Cached file not found");
    }

    if (job.outputPath) {
      await deleteProcessedAudioFile(job.outputPath);
    }

    await deleteProcessedAudio(id);

    return { success: true, id };
  })

  .delete("/cache", async () => {
    const cached = await getValidCachedAudio();

    for (const job of cached) {
      if (job.outputPath) {
        // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER sequential deletion needed
        await deleteProcessedAudioFile(job.outputPath);
      }
    }

    const count = await deleteAllCache();

    return { success: true, deletedCount: count };
  });

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\ui\secret-voicer-page.tsx

```
import { Container } from "@packages/ui/container";
import { Typography } from "@packages/ui/typography";

export function SecretVoicerPage() {
  return (
    <Container class="py-8">
      <Typography type="title" level={1}>
        Secret Voicer Management
      </Typography>
      <Typography color="muted" class="mt-2">
        Управление голосовыми профилями и настройками синтеза
      </Typography>
    </Container>
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\services\cache.ts

```
import fs from "node:fs/promises";
import { cron } from "@elysiajs/cron";
import { deleteExpiredCache, getProcessedAudioById } from "../data/repository";

export async function cleanupExpiredCache(): Promise<number> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log("🧹 [AudioCache] Starting cache cleanup...");

  const deleted = await deleteExpiredCache();

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`🧹 [AudioCache] Cleaned up ${deleted} expired entries`);
  return deleted;
}

export async function isCacheValid(jobId: string): Promise<boolean> {
  const job = await getProcessedAudioById(jobId);

  if (!job) {
    return false;
  }
  if (job.status !== "COMPLETED") {
    return false;
  }
  if (!job.outputPath) {
    return false;
  }
  if (new Date() > job.expiresAt) {
    return false;
  }

  try {
    await fs.access(job.outputPath);
    return true;
  } catch {
    return false;
  }
}

export function getCacheCleanupCron() {
  return cron({
    name: "audioProcessingCacheCleanup",
    pattern: "0 3 * * *",
    async run() {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log("⏰ [Cron] Starting audio cache cleanup...");
      await cleanupExpiredCache();
    },
  });
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\root-layout\ui\root-responsive-navigation.tsx

```
import { Button } from "@packages/ui/button";
import { Logo } from "@packages/ui/logo";
import { ResponsiveNavigation } from "@packages/ui/responsive-navigation";
import { Link } from "@tanstack/solid-router";
import { env } from "#admin/shared/config/env";

export function RootResponsiveNavigation() {
  return (
    <ResponsiveNavigation>
      <div class="flex items-center gap-6">
        <Link to="/">
          <Logo appName="admin" />
        </Link>

        <nav class="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="btn-sm">
            {(classes) => (
              <Link
                class={classes}
                to="/secret-voicer"
                activeProps={{ class: "bg-accent/15 text-accent" }}
              >
                Secret Voicer
              </Link>
            )}
          </Button>
          <Button variant="ghost" size="btn-sm">
            {(classes) => (
              <Link
                class={classes}
                to="/browser-fingerprints"
                activeProps={{ class: "bg-accent/15 text-accent" }}
              >
                Fingerprints
              </Link>
            )}
          </Button>
        </nav>
      </div>

      <Button variant="secondary" size="btn-sm">
        {(classes) => (
          <a class={classes} href={env.HUB_URL}>
            to Hub
          </a>
        )}
      </Button>
    </ResponsiveNavigation>
  );
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\root-layout\ui\devtools.tsx

```
import { lazy } from "solid-js";

export const Devtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/solid-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null;

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\services\synthesis-processor.ts

```
// import fs from "node:fs/promises";
// import path from "node:path";
// import process from "node:process";
// import { write } from "bun";
// import { and, asc, eq, lt } from "drizzle-orm";
// import { browserFingerprintsTable } from "#api/features/browser-fingerprint/data/table";
// import { secretVoicerCredentialsTable } from "#api/features/secret-voicer/schemas/credentials-table";
// import {
//   secretVoicerSynthesisProjects,
//   secretVoicerSynthesisTasks,
// } from "#api/features/secret-voicer/schemas/synthesis-projects";
// import { db } from "#api/shared/db";
// import { externalApiService } from "./external-api";
// import type { VoiceRequestConfig } from "./types";

// const STORAGE_ROOT = "storage";
// const MAX_RETRIES = 3;
// const POLLING_INTERVAL = 3000;
// const MAX_WAIT_TIME = 300_000; // 5 минут

// export class SynthesisProcessor {
//   public async processProject(projectId: string, retryFailed = false) {
//     console.log(`🔄 [Processor] Starting project: ${projectId}`);

//     await this.cleanupStaleTasks(projectId);

//     const project = await db.query.secretVoicerSynthesisProjects.findFirst({
//       where: eq(secretVoicerSynthesisProjects.id, projectId),
//     });

//     if (!project?.fingerprintId) {
//       console.error(`❌ [Processor] Project ${projectId} missing fingerprint`);
//       await this.failProject(projectId, "Missing fingerprint configuration");
//       return;
//     }

//     const credential = await db.query.secretVoicerCredentialsTable.findFirst({
//       where: and(
//         eq(secretVoicerCredentialsTable.fingerprintId, project.fingerprintId),
//         eq(secretVoicerCredentialsTable.isActive, true),
//       ),
//     });

//     const fingerprint = await db.query.browserFingerprintsTable.findFirst({
//       where: eq(browserFingerprintsTable.id, project.fingerprintId),
//     });

//     if (!(credential && fingerprint)) {
//       const msg = `Missing active credentials or fingerprint for Project ${projectId}`;
//       console.error(`❌ [Processor] ${msg}`);
//       await this.failProject(projectId, msg);
//       return;
//     }

//     console.log(
//       `✅ [Processor] Using Credential: ${credential.name} | FP: ${fingerprint.name}`,
//     );

//     const config: VoiceRequestConfig = {
//       csrfToken: credential.csrfToken,
//       sessionId: credential.sessionId,
//       userAgent: fingerprint.userAgent,
//       secChUa: fingerprint.secChUa,
//       secChUaMobile: fingerprint.secChUaMobile,
//       secChUaPlatform: fingerprint.secChUaPlatform,
//     };

//     const allTasks = await db
//       .select()
//       .from(secretVoicerSynthesisTasks)
//       .where(eq(secretVoicerSynthesisTasks.projectId, projectId))
//       .orderBy(asc(secretVoicerSynthesisTasks.orderIndex));

//     const tasksToProcess = allTasks.filter((t) => {
//       if (t.status === "PENDING") {
//         return true;
//       }
//       if (retryFailed && t.status === "FAILED") {
//         return true;
//       }
//       if (t.status === "FAILED" && (t.retryCount || 0) < MAX_RETRIES) {
//         return true;
//       }
//       return false;
//     });

//     console.log(
//       `📊 [Processor] Found ${tasksToProcess.length} tasks to process`,
//     );

//     if (tasksToProcess.length === 0) {
//       await this.updateProjectStats(projectId);
//       return;
//     }

//     await Promise.allSettled(
//       tasksToProcess.map((task) =>
//         this.processSingleTask(task, config, project),
//       ),
//     );

//     await this.updateProjectStats(projectId);
//     console.log(`🏁 [Processor] Finished cycle for project: ${projectId}`);
//   }

//   private async processSingleTask(
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//     config: VoiceRequestConfig,
//     project: typeof secretVoicerSynthesisProjects.$inferSelect,
//   ) {
//     try {
//       console.log(`⏳ [Task ${task.orderIndex}] Processing...`);
//       await this.markTaskAsProcessing(task.id);

//       const metadata = task.metadata as { rate?: number } | null;
//       const rate = metadata?.rate ?? 1;

//       const { task_id } = await externalApiService.createTask(config, {
//         text: task.text,
//         voice_id: task.voiceId,
//         rate,
//       });
//       const externalTaskId = String(task_id);
//       console.log(`➡ [Task ${task.orderIndex}] External ID: ${externalTaskId}`);

//       await db
//         .update(secretVoicerSynthesisTasks)
//         .set({ externalTaskId })
//         .where(eq(secretVoicerSynthesisTasks.id, task.id));

//       const audioUrl = await this.pollForCompletion(config, externalTaskId);
//       console.log(`⬇ [Task ${task.orderIndex}] Downloading audio...`);

//       const localFilePath = await this.downloadAndSaveAudio(
//         config,
//         audioUrl,
//         project,
//         task,
//       );

//       await this.markTaskAsCompleted(task.id, audioUrl, localFilePath);
//       console.log(
//         `✅ [Task ${task.orderIndex}] Completed! Saved to: ${localFilePath}`,
//       );
//     } catch (e) {
//       console.error(`❌ [Task ${task.orderIndex}] Failed:`, e);
//       await this.handleTaskFailure(task, e);
//     }
//   }

//   private async pollForCompletion(
//     config: VoiceRequestConfig,
//     externalTaskId: string,
//   ): Promise<string> {
//     const startTime = Date.now();

//     while (Date.now() - startTime <= MAX_WAIT_TIME) {
//       // biome-ignore lint/performance/noAwaitInLoops: рефакторинг позже
//       const status = await externalApiService.checkTaskStatus(
//         config,
//         externalTaskId,
//       );

//       if (status.status_code === "COMPLETED" && status.audio_url) {
//         return status.audio_url;
//       }

//       if (status.status_code === "FAILED" || status.error) {
//         throw new Error(
//           status.error
//             || `External task failed with status: ${status.status_code}`,
//         );
//       }

//       await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
//     }

//     throw new Error("Polling timeout (5 minutes)");
//   }

//   private async downloadAndSaveAudio(
//     config: VoiceRequestConfig,
//     audioUrl: string,
//     project: typeof secretVoicerSynthesisProjects.$inferSelect,
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//   ) {
//     const buffer = await externalApiService.downloadAudio(config, audioUrl);

//     const maxPrefixLengthSafeName = 50;
//     const safeName = project.name
//       .replace(/[^a-z0-9а-яё\s_-]/gi, "")
//       .trim()
//       .replace(/\s+/g, "_")
//       .slice(0, maxPrefixLengthSafeName);

//     const maxPrefixLengthPrefixId = 5;
//     const prefixId = project.id.slice(0, maxPrefixLengthPrefixId);
//     const folderName = `${safeName}-${prefixId}`;

//     const folderPath = path.join(process.cwd(), STORAGE_ROOT, folderName);
//     const fileName = `${task.orderIndex}.mp3`;
//     const fullPath = path.join(folderPath, fileName);

//     await fs.mkdir(folderPath, { recursive: true });
//     await write(fullPath, buffer);

//     return fullPath;
//   }

//   private async cleanupStaleTasks(projectId: string) {
//     const fiveMinutesAgo = new Date(Date.now() - MAX_WAIT_TIME);
//     const staleTasks = await db
//       .select()
//       .from(secretVoicerSynthesisTasks)
//       .where(
//         and(
//           eq(secretVoicerSynthesisTasks.projectId, projectId),
//           eq(secretVoicerSynthesisTasks.status, "PROCESSING"),
//           lt(secretVoicerSynthesisTasks.startedAt, fiveMinutesAgo),
//         ),
//       );

//     if (staleTasks.length > 0) {
//       console.warn(
//         `⚠ [Processor] Found ${staleTasks.length} stale tasks. Marking as failed.`,
//       );
//     }

//     for (const task of staleTasks) {
//       // biome-ignore lint/performance/noAwaitInLoops: рефакторинг позже
//       await this.handleTaskFailure(
//         task,
//         new Error("Timeout (5 minutes stale)"),
//       );
//     }
//   }

//   private async markTaskAsProcessing(taskId: string) {
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "PROCESSING",
//         startedAt: new Date(),
//         error: null,
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, taskId));
//   }

//   private async markTaskAsCompleted(
//     taskId: string,
//     audioUrl: string,
//     localFilePath: string,
//   ) {
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "COMPLETED",
//         statusCode: "COMPLETED",
//         audioUrl,
//         localFilePath,
//         updatedAt: new Date(),
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, taskId));
//   }

//   private async handleTaskFailure(
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//     error: unknown,
//   ) {
//     const msg = error instanceof Error ? error.message : String(error);
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "FAILED",
//         error: msg,
//         retryCount: (task.retryCount || 0) + 1,
//         updatedAt: new Date(),
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, task.id));
//   }

//   private async updateProjectStats(projectId: string) {
//     const tasks = await db
//       .select({ status: secretVoicerSynthesisTasks.status })
//       .from(secretVoicerSynthesisTasks)
//       .where(eq(secretVoicerSynthesisTasks.projectId, projectId));

//     const total = tasks.length;
//     const completed = tasks.filter((t) => t.status === "COMPLETED").length;
//     const failed = tasks.filter((t) => t.status === "FAILED").length;
//     const processing = tasks.filter((t) => t.status === "PROCESSING").length;

//     let newStatus:
//       | "PENDING"
//       | "PROCESSING"
//       | "COMPLETED"
//       | "FAILED"
//       | "PARTIAL";

//     if (processing > 0) {
//       newStatus = "PROCESSING";
//     } else if (failed === total) {
//       newStatus = "FAILED";
//     } else if (completed === total) {
//       newStatus = "COMPLETED";
//     } else if (completed > 0) {
//       newStatus = "PARTIAL";
//     } else if (failed > 0) {
//       newStatus = "FAILED";
//     } else {
//       newStatus = "PENDING";
//     }

//     await db
//       .update(secretVoicerSynthesisProjects)
//       .set({
//         status: newStatus,
//         totalTasks: total,
//         completedTasks: completed,
//         failedTasks: failed,
//         completedAt: newStatus === "COMPLETED" ? new Date() : null,
//       })
//       .where(eq(secretVoicerSynthesisProjects.id, projectId));
//   }

//   private async failProject(projectId: string, error: string) {
//     await db
//       .update(secretVoicerSynthesisProjects)
//       .set({ status: "FAILED", description: error })
//       .where(eq(secretVoicerSynthesisProjects.id, projectId));
//   }
// }

// export const synthesisProcessor = new SynthesisProcessor();

```

D:\1_Projects\jstonehub\apps\hub\src\features\jokes\index.ts

```
export { JokesPage } from "./ui/jokes-page";

```

D:\1_Projects\jstonehub\apps\api\src\features\audio-processing\lib\ffmpeg.ts

```
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import type { ProcessingSettings } from "../data/types";

type FfmpegResult = {
  outputPath: string;
  duration: number;
  size: number;
};

const DEFAULT_AUDIO_BITRATE = 192_000;
const DURATION_REGEX = /Duration: (\d{2}):(\d{2}):(\d{2})/;
const TIME_PROGRESS_REGEX = /time=(\d{2}):(\d{2}):(\d{2})/;
const NUMERIC_EXTRACT_REGEX = /\d+/;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;
const PERCENT_MULTIPLIER = 100;
const MAX_PROGRESS_BEFORE_COMPLETE = 99;

function parseTimeToSeconds(
  match: RegExpMatchArray,
  startIndex: number,
): number {
  const hours = Number.parseInt(match[startIndex] ?? "0", 10);
  const minutes = Number.parseInt(match[startIndex + 1] ?? "0", 10);
  const seconds = Number.parseInt(match[startIndex + 2] ?? "0", 10);
  return hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
}

function generateSilence(outputPath: string, duration: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-f",
      "lavfi",
      "-i",
      "anullsrc=r=44100:cl=mono",
      "-t",
      String(duration),
      "-y",
      outputPath,
    ]);

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("Failed to generate silence"));
      }
    });
    proc.on("error", reject);
  });
}

export function checkFfmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"]);
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

export function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";
    proc.stdout.on("data", (data) => {
      output += data;
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(Number.parseFloat(output.trim()) || 0);
      } else {
        reject(new Error("Failed to get audio duration"));
      }
    });
    proc.on("error", reject);
  });
}

export function getAudioBitrate(filePath: string): Promise<number> {
  return new Promise((resolve, _) => {
    const proc = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=bit_rate",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";
    proc.stdout.on("data", (data) => {
      output += data;
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(Number.parseInt(output.trim(), 10) || DEFAULT_AUDIO_BITRATE);
      } else {
        resolve(DEFAULT_AUDIO_BITRATE);
      }
    });
    proc.on("error", () => resolve(DEFAULT_AUDIO_BITRATE));
  });
}

export function removeSilence(
  inputPath: string,
  outputPath: string,
  settings: ProcessingSettings,
): Promise<void> {
  const silenceFilter = [
    "silenceremove=",
    "start_periods=1:",
    "start_duration=0:",
    `start_threshold=${settings.silenceThreshold}dB:`,
    "stop_periods=-1:",
    `stop_duration=${settings.minSilenceDuration}:`,
    `stop_threshold=${settings.silenceThreshold}dB`,
  ].join("");

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-i",
      inputPath,
      "-af",
      silenceFilter,
      "-y",
      outputPath,
    ]);

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg silence removal failed with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

export async function concatenateAudioFiles(
  inputFiles: string[],
  outputPath: string,
  settings: ProcessingSettings,
  onProgress?: (progress: number) => void,
): Promise<FfmpegResult> {
  const listPath = `${outputPath}.txt`;
  const silencePath = `${outputPath}.silence.wav`;

  await generateSilence(
    silencePath,
    Math.max(
      settings.pauseBetweenFiles,
      settings.pauseAtStart,
      settings.pauseAtEnd,
    ),
  );

  const listContent: string[] = [];

  if (settings.pauseAtStart > 0) {
    listContent.push(`file '${silencePath}'`);
    listContent.push("inpoint 0");
    listContent.push(`outpoint ${settings.pauseAtStart}`);
  }

  for (let i = 0; i < inputFiles.length; i++) {
    listContent.push(`file '${inputFiles[i]}'`);

    if (i < inputFiles.length - 1 && settings.pauseBetweenFiles > 0) {
      listContent.push(`file '${silencePath}'`);
      listContent.push("inpoint 0");
      listContent.push(`outpoint ${settings.pauseBetweenFiles}`);
    }
  }

  if (settings.pauseAtEnd > 0) {
    listContent.push(`file '${silencePath}'`);
    listContent.push("inpoint 0");
    listContent.push(`outpoint ${settings.pauseAtEnd}`);
  }

  await fs.writeFile(listPath, listContent.join("\n"));

  const outputFormat = settings.outputFormat;
  const codecArgs =
    outputFormat === "mp3"
      ? ["-c:a", "libmp3lame", "-q:a", "2"]
      : ["-c:a", "pcm_s16le"];

  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      ...codecArgs,
      "-y",
      outputPath,
    ]);

    let totalDuration = 0;
    let currentTime = 0;

    proc.stderr.on("data", (data: Buffer) => {
      const output = data.toString();

      const durationMatch = output.match(DURATION_REGEX);
      if (durationMatch) {
        totalDuration = parseTimeToSeconds(durationMatch, 1);
      }

      const timeMatch = output.match(TIME_PROGRESS_REGEX);
      if (timeMatch && totalDuration > 0) {
        currentTime = parseTimeToSeconds(timeMatch, 1);
        const progress = Math.round(
          (currentTime / totalDuration) * PERCENT_MULTIPLIER,
        );
        onProgress?.(Math.min(progress, MAX_PROGRESS_BEFORE_COMPLETE));
      }
    });

    proc.on("close", async (code) => {
      // biome-ignore lint/suspicious/noEmptyBlockStatements: REFACTOR_LATER <WAITING_FOR_LOGGER> intentional ignore on temp file cleanup
      await fs.unlink(listPath).catch(() => {});
      // biome-ignore lint/suspicious/noEmptyBlockStatements: REFACTOR_LATER <WAITING_FOR_LOGGER> intentional ignore on temp file cleanup
      await fs.unlink(silencePath).catch(() => {});

      if (code === 0) {
        const stats = await fs.stat(outputPath);
        const duration = await getAudioDuration(outputPath);
        resolve({
          outputPath,
          duration,
          size: stats.size,
        });
      } else {
        reject(new Error(`FFmpeg concat failed with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

export function sortFilesNaturally(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const aNum = Number.parseInt(
      path.basename(a).match(NUMERIC_EXTRACT_REGEX)?.[0] ?? "0",
      10,
    );
    const bNum = Number.parseInt(
      path.basename(b).match(NUMERIC_EXTRACT_REGEX)?.[0] ?? "0",
      10,
    );
    return aNum - bNum;
  });
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\index.ts

```
export {
  synthesisProjectStatusEnum,
  synthesisProjectTable,
  synthesisTaskStatusEnum,
  synthesisTaskTable,
} from "./data/table";

export { synthesisControllerV1 } from "./http/controller-v1";

export { startProjectProcessing } from "./services/processor";

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\index.ts

```
export {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
  voiceEmotionSupportEnum,
  voiceGenderEnum,
  voiceSyncEventTypeEnum,
} from "./data/table";
export { secretVoicerVoiceAdminControllerV1 } from "./http/controller-admin-v1";
export { secretVoicerVoicePublicControllerV1 } from "./http/controller-public-v1";

export { syncVoicesFromExternalApi } from "./services/sync-service";
export { voiceSyncState } from "./services/sync-state";

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\types.ts

```
export type {
  CreateProjectInput,
  CreateProjectTaskInput,
  ProjectStatus,
  ProjectStatusResponse,
  ProjectWithTasks,
  SynthesisProject,
  SynthesisTask,
  TaskStatus,
} from "./data/types";

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\services\types.ts

```
export type VoiceRequestConfig = {
  csrfToken: string;
  sessionId: string;
  userAgent: string;
  secChUa: string;
  secChUaMobile: string;
  secChUaPlatform: string;
};

export type SynthesizePayload = {
  voice_id: string;
  text: string;
  rate?: number; // 0.5 - 2.0, default 1
};

export type TaskStatusResponse = {
  status: string;
  status_code: "LOCAL_PROCESSING" | "COMPLETED" | "FAILED";
  audio_url: string | null;
  error: string | null;
  chunks_completed?: number;
  chunks_total?: number;
};

export type CreateTaskResponse = {
  task_id: number;
  status: string;
  is_reused: boolean;
};

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\index.ts

```
export { VoiceoverPage } from "./ui/voiceover-page";

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\types.ts

```
export type {
  ExternalVoice,
  ExternalVoicesResponse,
  NewSecretVoicerVoice,
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
  UpdateSecretVoicerVoice,
} from "./data/types";

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\http\public-v1.ts

```
import { Elysia } from "elysia";
import { secretVoicerVoicePublicControllerV1 } from "../voice";

export const secretVoicerPublicControllerV1 = new Elysia({
  prefix: "/v1/public/secret-voicer",
}).use(secretVoicerVoicePublicControllerV1);

```

D:\1_Projects\jstonehub\docs\export-types\hub\features\home-page.md

```
```tsx
import { HomePage } from "#hub/features/home-page";

type HomePage = Component;
```
```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\http\admin-v1.ts

```
import { Elysia } from "elysia";
import { secretVoicerCredentialControllerV1 } from "../credential/controller-v1";
import { synthesisControllerV1 } from "../synthesis";
import { secretVoicerVoiceAdminControllerV1 } from "../voice";

export const secretVoicerAdminControllerV1 = new Elysia({
  prefix: "/v1/admin/secret-voicer",
})
  .use(secretVoicerCredentialControllerV1)
  .use(secretVoicerVoiceAdminControllerV1)
  .use(synthesisControllerV1);

```

D:\1_Projects\jstonehub\apps\hub\src\features\root-layout\index.ts

```
export { RootLayout } from "./ui/root-layout";

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\model\hooks.ts

```
import { createSignal, onMount } from "solid-js";
import { secretVoicerVoiceApi } from "./api";
import type {
  SecretVoicerVoiceDialogType,
  SecretVoicerVoicesState,
  UpdateSecretVoicerVoiceInput,
} from "./types";

export type VoiceGenderFilter = "all" | "MALE" | "FEMALE";

export function useSecretVoicerVoices() {
  const [state, setState] = createSignal<SecretVoicerVoicesState>({
    voices: [],
    syncEvents: [],
    syncState: null,
    isLoading: true,
    error: null,
    searchQuery: "",
    showHidden: false,
    activeDialog: null,
    selectedId: null,
  });

  const [genderFilter, setGenderFilter] =
    createSignal<VoiceGenderFilter>("all");

  // === Computed ===
  const filteredVoices = () => {
    let result = state().voices;

    if (!state().showHidden) {
      result = result.filter((v) => !v.isHidden);
    }

    const gender = genderFilter();
    if (gender !== "all") {
      result = result.filter((v) => v.externalGender === gender);
    }

    if (state().searchQuery) {
      const query = state().searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.externalName.toLowerCase().includes(query)
          || v.externalVoiceId.toLowerCase().includes(query),
      );
    }

    return result;
  };

  const selectedVoice = () =>
    state().voices.find((v) => v.id === state().selectedId) ?? null;

  const criticalEvents = () => state().syncEvents.filter((e) => e.isCritical);

  const nonCriticalEvents = () =>
    state().syncEvents.filter((e) => !e.isCritical);

  const isBlocked = () => state().syncState?.isBlocked ?? false;

  // === Actions ===
  const setSearchQuery = (query: string) =>
    setState((s) => ({ ...s, searchQuery: query }));

  const setShowHidden = (show: boolean) =>
    setState((s) => ({ ...s, showHidden: show }));

  const openDialog = (
    type: SecretVoicerVoiceDialogType,
    id: string | null = null,
  ) => setState((s) => ({ ...s, activeDialog: type, selectedId: id }));

  const closeDialog = () =>
    setState((s) => ({ ...s, activeDialog: null, selectedId: null }));

  // === API Actions ===
  const fetchData = async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const [voices, syncEvents, syncState] = await Promise.all([
        secretVoicerVoiceApi.getAll(),
        secretVoicerVoiceApi.getSyncEvents(),
        secretVoicerVoiceApi.getSyncState(),
      ]);
      setState((s) => ({
        ...s,
        voices,
        syncEvents,
        syncState,
        isLoading: false,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      setState((s) => ({ ...s, error: msg, isLoading: false }));
    }
  };

  const updateVoice = async (
    id: string,
    input: UpdateSecretVoicerVoiceInput,
  ) => {
    const updated = await secretVoicerVoiceApi.update(id, input);
    setState((s) => ({
      ...s,
      voices: s.voices.map((v) => (v.id === id ? updated : v)),
    }));
    closeDialog();
  };

  const deleteSyncEvent = async (id: string) => {
    await secretVoicerVoiceApi.deleteSyncEvent(id);
    setState((s) => ({
      ...s,
      syncEvents: s.syncEvents.filter((e) => e.id !== id),
    }));
  };

  const deleteAllSyncEvents = async () => {
    await secretVoicerVoiceApi.deleteAllSyncEvents();
    setState((s) => ({ ...s, syncEvents: [] }));
  };

  const unblock = async () => {
    await secretVoicerVoiceApi.unblock();
    setState((s) => ({
      ...s,
      syncState: s.syncState
        ? { ...s.syncState, isBlocked: false, blockReason: null }
        : null,
    }));
  };

  const triggerSync = async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      await secretVoicerVoiceApi.triggerSync();
      await fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sync failed";
      setState((s) => ({ ...s, error: msg, isLoading: false }));
    }
  };

  // === Init ===
  onMount(fetchData);

  return {
    state,
    genderFilter,
    setGenderFilter,
    filteredVoices,
    selectedVoice,
    criticalEvents,
    nonCriticalEvents,
    isBlocked,
    setSearchQuery,
    setShowHidden,
    openDialog,
    closeDialog,
    updateVoice,
    deleteSyncEvent,
    deleteAllSyncEvents,
    unblock,
    triggerSync,
    refetch: fetchData,
  };
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\ui\page.tsx

```
import { Alert } from "@packages/ui/alert";
import { Button } from "@packages/ui/button";
import { Show } from "solid-js";
import { PageHeader } from "#admin/shared/ui/page-header";
import { useSecretVoicerVoices } from "../model/hooks";
import { SyncEventsPanel } from "./sync-events-panel";
import { SecretVoicerVoicesTable } from "./table";
import { SecretVoicerVoicesToolbar } from "./toolbar";
import { UpdateSecretVoicerVoiceDialog } from "./update-dialog";
import { ViewSecretVoicerVoiceDialog } from "./view-dialog";

export function SecretVoicerVoicesPage() {
  const {
    state,
    genderFilter,
    setGenderFilter,
    filteredVoices,
    selectedVoice,
    criticalEvents,
    nonCriticalEvents,
    isBlocked,
    setSearchQuery,
    setShowHidden,
    openDialog,
    closeDialog,
    updateVoice,
    deleteSyncEvent,
    deleteAllSyncEvents,
    unblock,
    triggerSync,
  } = useSecretVoicerVoices();

  return (
    <div class="space-y-6">
      <PageHeader
        title="Voices"
        description="Управление голосами Secret Voicer"
      >
        <Button
          variant="outline"
          onClick={triggerSync}
          disabled={state().isLoading}
        >
          {state().isLoading ? "Синхронизация..." : "Синхронизировать"}
        </Button>
      </PageHeader>

      {/* Error Alert */}
      <Show when={state().error}>
        {(error) => (
          <Alert
            variant="error"
            title="Ошибка загрузки"
            description={error()}
          />
        )}
      </Show>

      {/* Critical Alert */}
      <Show when={isBlocked()}>
        <Alert
          variant="error"
          title="Синтез заблокирован!"
          description={
            state().syncState?.blockReason ?? "Обнаружены критические изменения"
          }
          onClose={unblock}
        />
      </Show>

      {/* Sync Events */}
      <SyncEventsPanel
        criticalEvents={criticalEvents()}
        nonCriticalEvents={nonCriticalEvents()}
        onDeleteEvent={deleteSyncEvent}
        onDeleteAll={deleteAllSyncEvents}
      />

      {/* Toolbar */}
      <SecretVoicerVoicesToolbar
        searchQuery={state().searchQuery}
        showHidden={state().showHidden}
        genderFilter={genderFilter()}
        onSearchChange={setSearchQuery}
        onShowHiddenChange={setShowHidden}
        onGenderFilterChange={setGenderFilter}
      />

      {/* Table */}
      <SecretVoicerVoicesTable
        voices={filteredVoices()}
        totalCount={state().voices.length}
        isLoading={state().isLoading}
        error={state().error}
        onView={(id) => openDialog("view", id)}
        onUpdate={(id) => openDialog("update", id)}
      />

      {/* Dialogs */}
      <Show when={selectedVoice()}>
        {(voice) => (
          <>
            <ViewSecretVoicerVoiceDialog
              open={state().activeDialog === "view"}
              voice={voice()}
              onClose={closeDialog}
              onUpdate={() => openDialog("update", voice().id)}
            />

            <UpdateSecretVoicerVoiceDialog
              open={state().activeDialog === "update"}
              voice={voice()}
              onClose={closeDialog}
              onSubmit={(data) => updateVoice(voice().id, data)}
            />
          </>
        )}
      </Show>
    </div>
  );
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\model\types.ts

```
import type { InferInput } from "valibot";
import type {
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
} from "#api/features/secret-voicer/voice/types";
import type { updateSecretVoicerVoiceSchema } from "../lib/validation";

export type {
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
} from "#api/features/secret-voicer/voice/types";

export type SecretVoicerVoiceDialogType = "view" | "update" | null;

export type SecretVoicerVoicesState = {
  voices: SecretVoicerVoice[];
  syncEvents: SecretVoicerVoiceSyncEvent[];
  syncState: SecretVoicerVoiceSyncState | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  showHidden: boolean;
  activeDialog: SecretVoicerVoiceDialogType;
  selectedId: string | null;
};

export type UpdateSecretVoicerVoiceInput = InferInput<
  typeof updateSecretVoicerVoiceSchema
>;

```

D:\1_Projects\jstonehub\docs\export-types\api\features\secret-voicer.md

```
## credential

> Credentials (csrf + session) for secret-voicer authorization, linked to browser fingerprint

### Internal API

```ts
import { secretVoicerCredentialTable } from "../credential/table";
import { secretVoicerCredentialControllerV1 } from "../credential/controller-v1";
import {
  getAllSecretVoicerCredentials,
  getSecretVoicerCredentialById,
  createSecretVoicerCredential,
  updateSecretVoicerCredential,
  deleteSecretVoicerCredential,
} from "../credential/repository";

type secretVoicerCredentialTable = PgTable<{
  id: text;                    // primaryKey, default: createId()
  fingerprintId: text;         // FK → browserFingerprintTable.id
  name: text;
  csrfToken: text;
  sessionId: text;
  isActive: boolean;           // default: true
  createdAt: timestamp;        // default: now()
  updatedAt: timestamp;        // default: now(), onUpdate
}>;

// Elysia controller, prefix: "/credentials"
//
// GET    /                → SecretVoicerCredential[]
// GET    /:id             → SecretVoicerCredential
// POST   /                → SecretVoicerCredential (201)
//          body: { name, fingerprintId, csrfToken, sessionId, isActive? }
// PUT    /:id             → SecretVoicerCredential
//          body: Partial<{ name, fingerprintId, csrfToken, sessionId, isActive }>
// DELETE /:id             → { success: boolean; id: string }

function getAllSecretVoicerCredentials(): Promise<SecretVoicerCredential[]>;
function getSecretVoicerCredentialById(id: string): Promise<SecretVoicerCredential | undefined>;
function createSecretVoicerCredential(data: NewSecretVoicerCredential): Promise<SecretVoicerCredential | undefined>;
function updateSecretVoicerCredential(id: string, data: UpdateSecretVoicerCredential): Promise<SecretVoicerCredential | undefined>;
function deleteSecretVoicerCredential(id: string): Promise<SecretVoicerCredential | undefined>;
```

### Public API

```ts
import {
  secretVoicerCredentialTable,
} from "#api/features/secret-voicer";
```

```ts
import type {
  SecretVoicerCredential,
  NewSecretVoicerCredential,
  UpdateSecretVoicerCredential,
} from "#api/features/secret-voicer/types";

type SecretVoicerCredential = {
  id: string;
  fingerprintId: string;
  name: string;
  csrfToken: string;
  sessionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type NewSecretVoicerCredential = {
  id?: string;
  fingerprintId: string;
  name: string;
  csrfToken: string;
  sessionId: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type UpdateSecretVoicerCredential = Partial<
  Omit<NewSecretVoicerCredential, "id" | "createdAt" | "updatedAt">
>;
```
```

D:\1_Projects\jstonehub\docs\export-types\api\features\browser-fingerprint.md

```
```ts
import {
  browserFingerprintTable,
  secChUaMobileEnum,
  secChUaPlatformEnum,
  browserFingerprintControllerV1,
} from "#api/features/browser-fingerprint";

type browserFingerprintTable = PgTable<{
  id: text;                    // primaryKey, default: createId()
  name: text;
  description: text | null;
  userAgent: text;
  secChUa: text;
  secChUaMobile: enum("?0" | "?1");
  secChUaPlatform: enum("Windows" | "macOS" | "Linux" | ...);
  acceptLanguage: text;        // default: "en-US,en;q=0.9"
  isActive: boolean;           // default: false
  createdAt: timestamp;        // default: now()
  updatedAt: timestamp;        // default: now(), onUpdate
}>;

type secChUaMobileEnum = PgEnum<[string, ...string[]]>;
type secChUaPlatformEnum = PgEnum<[string, ...string[]]>;

// Elysia controller, prefix: "/v1/admin/browser-fingerprints"
//
// GET    /                → BrowserFingerprint[]
// GET    /:id             → BrowserFingerprint
// POST   /                → BrowserFingerprint (201)
//          body: NewBrowserFingerprint
// PUT    /:id             → BrowserFingerprint
//          body: UpdateBrowserFingerprint
// DELETE /:id             → { success: boolean; id: string }

```

```ts
import type {
  BrowserFingerprint,
  NewBrowserFingerprint,
  UpdateBrowserFingerprint,
} from "#api/features/browser-fingerprint/types";

type BrowserFingerprint = {
  id: string;
  name: string;
  description: string | null;
  userAgent: string;
  secChUa: string;
  secChUaMobile: string;
  secChUaPlatform: string;
  acceptLanguage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type NewBrowserFingerprint = {
  id?: string;
  name: string;
  description?: string | null;
  userAgent: string;
  secChUa: string;
  secChUaMobile: string;
  secChUaPlatform: string;
  acceptLanguage?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type UpdateBrowserFingerprint = Partial<
  Omit<NewBrowserFingerprint, "id" | "createdAt" | "updatedAt">
>;
```
```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\ui\table.tsx

```
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Tooltip } from "@packages/ui/tooltip";
import { Typography } from "@packages/ui/typography";
import { Edit, Eye, EyeOff, Mic, Star } from "lucide-solid";
import { For, Show } from "solid-js";
import type { SecretVoicerVoice } from "../model/types";

function getEmotionBadgeVariant(
  emotionSupport: string,
): "success" | "warning" | "muted" {
  if (emotionSupport === "advanced") {
    return "success";
  }
  if (emotionSupport === "basic") {
    return "warning";
  }
  return "muted";
}

export function SecretVoicerVoicesTable(props: {
  voices: SecretVoicerVoice[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  onView: (id: string) => void;
  onUpdate: (id: string) => void;
}) {
  return (
    <Card
      padding="none"
      content={
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-muted border-b border-border">
              <tr>
                <th class="h-10 px-4 font-medium text-muted-foreground">
                  Голос
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground">Пол</th>
                <th class="h-10 px-4 font-medium text-muted-foreground hidden md:table-cell">
                  Эмоции
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                  Рейтинг
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground">
                  Статус
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground text-right">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <Show
                when={!(props.isLoading || props.error)}
                fallback={
                  <tr>
                    <td colSpan={6} class="p-8 text-center">
                      <Typography color="muted">
                        {props.isLoading
                          ? "Загрузка..."
                          : (props.error ?? "Ошибка")}
                      </Typography>
                    </td>
                  </tr>
                }
              >
                <Show
                  when={props.voices.length > 0}
                  fallback={
                    <tr>
                      <td colSpan={6} class="p-8 text-center">
                        <Typography color="muted">Голоса не найдены</Typography>
                      </td>
                    </tr>
                  }
                >
                  <For each={props.voices}>
                    {(voice) => (
                      <tr class="hover:bg-muted/50 transition-colors group">
                        <td class="p-4">
                          <div class="flex items-center gap-2">
                            <Mic class="w-4 h-4 text-muted-foreground" />
                            <div>
                              <Typography level={4} class="font-medium">
                                {voice.externalName}
                              </Typography>
                              <Typography level={6} color="muted">
                                {voice.externalVoiceId}
                              </Typography>
                            </div>
                          </div>
                        </td>

                        <td class="p-4">
                          <Badge
                            variant={
                              voice.externalGender === "MALE"
                                ? "info"
                                : "warning"
                            }
                            size="sm"
                          >
                            {voice.externalGender === "MALE" ? "М" : "Ж"}
                          </Badge>
                        </td>

                        <td class="p-4 hidden md:table-cell">
                          <Badge
                            variant={getEmotionBadgeVariant(
                              voice.emotionSupport,
                            )}
                            size="sm"
                          >
                            {voice.emotionSupport}
                          </Badge>
                        </td>

                        <td class="p-4 hidden lg:table-cell">
                          <div class="flex items-center gap-1">
                            <Star class="w-4 h-4 text-warning-foreground" />
                            <span>{voice.rating}/10</span>
                          </div>
                        </td>

                        <td class="p-4">
                          <Show
                            when={!voice.isHidden}
                            fallback={
                              <Badge variant="muted" size="sm">
                                <EyeOff class="w-3 h-3" />
                                Скрыт
                              </Badge>
                            }
                          >
                            <Badge variant="success" size="sm">
                              <Eye class="w-3 h-3" />
                              Видим
                            </Badge>
                          </Show>
                        </td>

                        <td class="p-4 text-right">
                          <div class="flex items-center justify-end gap-1">
                            <Tooltip label="Просмотр">
                              {(triggerProps) => (
                                <Button
                                  ref={triggerProps.ref}
                                  onMouseEnter={triggerProps.onMouseEnter}
                                  onMouseLeave={triggerProps.onMouseLeave}
                                  onFocus={triggerProps.onFocus}
                                  onBlur={triggerProps.onBlur}
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => props.onView(voice.id)}
                                >
                                  <Eye class="w-4 h-4" />
                                </Button>
                              )}
                            </Tooltip>
                            <Tooltip label="Редактировать">
                              {(triggerProps) => (
                                <Button
                                  ref={triggerProps.ref}
                                  onMouseEnter={triggerProps.onMouseEnter}
                                  onMouseLeave={triggerProps.onMouseLeave}
                                  onFocus={triggerProps.onFocus}
                                  onBlur={triggerProps.onBlur}
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => props.onUpdate(voice.id)}
                                >
                                  <Edit class="w-4 h-4" />
                                </Button>
                              )}
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </Show>
            </tbody>
          </table>
        </div>
      }
      footer={
        <div class="flex justify-between items-center w-full border-t border-border bg-muted px-4 py-3 -mx-6 -mb-6 mt-0 rounded-b-[12px]">
          <Typography level={5} color="muted">
            Показано {props.voices.length} из {props.totalCount} голосов
          </Typography>
        </div>
      }
    />
  );
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\model\api.ts

```
import { client } from "#admin/shared/api/client";
import { createApiError } from "#admin/shared/api/error";
import type {
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
  UpdateSecretVoicerVoiceInput,
} from "./types";

export const secretVoicerVoiceApi = {
  getAll: async (): Promise<SecretVoicerVoice[]> => {
    const response = await client.v1.admin["secret-voicer"].voices.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data ?? []) as SecretVoicerVoice[];
  },

  update: async (
    id: string,
    payload: UpdateSecretVoicerVoiceInput,
  ): Promise<SecretVoicerVoice> => {
    const response = await client.v1.admin["secret-voicer"]
      .voices({ id })
      .put(payload);
    if (response.error) {
      throw createApiError(response.error);
    }
    if (!response.data) {
      throw new Error("No data returned");
    }
    return response.data as SecretVoicerVoice;
  },

  // === Sync Events ===
  getSyncEvents: async (): Promise<SecretVoicerVoiceSyncEvent[]> => {
    const response =
      await client.v1.admin["secret-voicer"].voices["sync-events"].get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data ?? []) as SecretVoicerVoiceSyncEvent[];
  },

  deleteSyncEvent: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].voices[
      "sync-events"
    ]({ id }).delete();
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  deleteAllSyncEvents: async (): Promise<number> => {
    const response =
      await client.v1.admin["secret-voicer"].voices["sync-events"].delete();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data as { deletedCount: number })?.deletedCount ?? 0;
  },

  // === Sync State ===
  getSyncState: async (): Promise<SecretVoicerVoiceSyncState> => {
    const response =
      await client.v1.admin["secret-voicer"].voices["sync-state"].get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as SecretVoicerVoiceSyncState;
  },

  unblock: async (): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].voices[
      "sync-state"
    ].unblock.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  // === Manual Sync ===
  triggerSync: async () => {
    const response = await client.v1.admin["secret-voicer"].voices.sync.post(
      {},
    );
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data;
  },
};

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\ui\language-selector.tsx

```
import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { Button } from "@packages/ui/button";
import { Checkbox } from "@packages/ui/checkbox";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { Typography } from "@packages/ui/typography";
import { cn } from "@packages/utils/css";
import { ChevronDown, Search, X } from "lucide-solid";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

const DROPDOWN_OFFSET = 4;

type LanguageSelectorProps = {
  value: string[];
  onChange: (languages: string[]) => void;
  disabled?: boolean;
  /** Use modal mode for proper stacking in dialogs */
  modal?: boolean;
  id?: string;
};

export function LanguageSelector(props: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [triggerRect, setTriggerRect] = createSignal<DOMRect | null>(null);

  // biome-ignore lint/suspicious/noUnassignedVariables: ref assignment
  let triggerRef: HTMLButtonElement | undefined;
  // biome-ignore lint/suspicious/noUnassignedVariables: ref assignment
  let dropdownRef: HTMLDivElement | undefined;

  const allLanguages = secretVoicerContract.supportedLanguage.options;

  const filteredLanguages = createMemo(() => {
    const query = searchQuery().toLowerCase();
    if (!query) {
      return [...allLanguages];
    }
    return allLanguages.filter(
      (lang) =>
        lang.label.toLowerCase().includes(query)
        || lang.value.toLowerCase().includes(query),
    );
  });

  const selectedCount = () => props.value.length;

  const isSelected = (langValue: string) => props.value.includes(langValue);

  const toggleLanguage = (langValue: string) => {
    if (isSelected(langValue)) {
      props.onChange(props.value.filter((v) => v !== langValue));
    } else {
      props.onChange([...props.value, langValue]);
    }
  };

  const clearAll = () => {
    props.onChange([]);
  };

  const getSelectedLabels = () => {
    if (props.value.length === 0) {
      return "Выберите языки...";
    }
    if (props.value.length <= 2) {
      return props.value
        .map((v) => allLanguages.find((l) => l.value === v)?.label ?? v)
        .join(", ");
    }
    return `${props.value.length} языков выбрано`;
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery("");

    if (props.modal && dropdownRef && "hidePopover" in dropdownRef) {
      try {
        dropdownRef.hidePopover();
      } catch {
        // Already hidden
      }
    }
  };

  const openDropdown = () => {
    if (triggerRef) {
      setTriggerRect(triggerRef.getBoundingClientRect());
    }
    setIsOpen(true);
  };

  const handleTriggerClick = () => {
    if (props.disabled) {
      return;
    }

    if (isOpen()) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  // Show native popover when opening in modal mode
  createEffect(() => {
    if (!(props.modal && dropdownRef && "showPopover" in dropdownRef)) {
      return;
    }

    if (isOpen()) {
      try {
        dropdownRef.showPopover();
      } catch {
        // Already showing
      }
    }
  });

  // Update position on scroll/resize
  createEffect(() => {
    if (!isOpen()) {
      return;
    }

    const updatePosition = () => {
      if (triggerRef) {
        setTriggerRect(triggerRef.getBoundingClientRect());
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    onCleanup(() => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    });
  });

  // Click outside handler
  onMount(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef
        && !triggerRef.contains(target)
        && dropdownRef
        && !dropdownRef.contains(target)
      ) {
        closeDropdown();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        e.stopPropagation();
        closeDropdown();
        triggerRef?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    onCleanup(() => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    });
  });

  const dropdownContent = (
    <div
      ref={dropdownRef}
      popover={props.modal ? "manual" : undefined}
      class={cn(
        "fixed w-[320px] overflow-hidden",
        "border border-border bg-popover text-popover-foreground",
        "rounded-[8px] shadow-[var(--shadow-lg)]",
        "animate-in fade-in zoom-in-95 duration-150",
        props.modal ? "z-[9999]" : "z-50",
      )}
      style={{
        top: `${(triggerRect()?.bottom ?? 0) + DROPDOWN_OFFSET}px`,
        left: `${triggerRect()?.left ?? 0}px`,
        ...(props.modal
          ? {
              margin: "0",
              padding: "0",
              background: "transparent",
              border: "none",
            }
          : {}),
      }}
    >
      <div
        class={cn(
          props.modal
            && "border border-border bg-popover rounded-[8px] shadow-[var(--shadow-lg)]",
        )}
      >
        <div class="p-3 space-y-3">
          {/* Search */}
          <Input
            placeholder="Поиск языка..."
            prefix={<Search class="w-4 h-4" />}
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            autofocus={true}
          />

          {/* Header with clear button */}
          <div class="flex items-center justify-between">
            <Typography level={5} color="muted">
              {selectedCount()} выбрано
            </Typography>
            <Show when={selectedCount() > 0}>
              <Button variant="ghost" size="btn-xs" onClick={clearAll}>
                <X class="w-3 h-3" />
                Очистить
              </Button>
            </Show>
          </div>

          {/* Language list with scroll */}
          <div class="max-h-[240px] overflow-y-auto space-y-1 -mx-1 px-1">
            <Show
              when={filteredLanguages().length > 0}
              fallback={
                <Typography level={5} color="muted" class="text-center py-4">
                  Языки не найдены
                </Typography>
              }
            >
              <For each={filteredLanguages()}>
                {(lang) => {
                  const checkboxId = `lang-checkbox-${lang.value}`;
                  return (
                    <div class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <Checkbox
                        id={checkboxId}
                        checked={isSelected(lang.value)}
                        onChange={() => toggleLanguage(lang.value)}
                      />
                      <Label
                        for={checkboxId}
                        class="flex-1 cursor-pointer text-sm font-normal"
                      >
                        {lang.label}
                      </Label>
                      <span class="text-xs text-muted-foreground">
                        {lang.value}
                      </span>
                    </div>
                  );
                }}
              </For>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div class="relative">
      <Button
        id={props.id}
        ref={triggerRef}
        variant="outline"
        class="w-full justify-between font-normal"
        disabled={props.disabled}
        onClick={handleTriggerClick}
      >
        <span class="truncate text-left">{getSelectedLabels()}</span>
        <ChevronDown
          class={cn(
            "w-4 h-4 shrink-0 opacity-50 transition-transform duration-200",
            isOpen() && "rotate-180",
          )}
        />
      </Button>

      <Show when={isOpen() && triggerRect()}>
        <Show when={!props.modal} fallback={dropdownContent}>
          <Portal>{dropdownContent}</Portal>
        </Show>
      </Show>
    </div>
  );
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\ui\view-dialog.tsx

```
import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Typography } from "@packages/ui/typography";
import { Edit, Eye, EyeOff, Star } from "lucide-solid";
import { For, Show } from "solid-js";
import type { SecretVoicerVoice } from "../model/types";

type EmotionSupportValue = "none" | "basic" | "advanced";
type SupportedLanguageValue =
  (typeof secretVoicerContract.supportedLanguage.options)[number]["value"];

function getEmotionSupportVariant(
  emotionSupport: string,
): "success" | "warning" | "muted" {
  if (emotionSupport === "advanced") {
    return "success";
  }
  if (emotionSupport === "basic") {
    return "warning";
  }
  return "muted";
}

function getEmotionSupportLabel(emotionSupport: string): string {
  const values = secretVoicerContract.voiceEmotionSupport.values();
  if (values.includes(emotionSupport as EmotionSupportValue)) {
    return secretVoicerContract.voiceEmotionSupport.getLabel(
      emotionSupport as EmotionSupportValue,
    );
  }
  return emotionSupport;
}

function getLanguageLabel(langCode: string): string {
  const values = secretVoicerContract.supportedLanguage.values();
  if (values.includes(langCode as SupportedLanguageValue)) {
    return secretVoicerContract.supportedLanguage.getLabel(
      langCode as SupportedLanguageValue,
    );
  }
  return langCode;
}

export function ViewSecretVoicerVoiceDialog(props: {
  open: boolean;
  voice: SecretVoicerVoice;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const voice = () => props.voice;

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
      title={voice().externalName}
      description={`ID: ${voice().externalVoiceId}`}
      class="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={props.onClose}>
            Закрыть
          </Button>
          <Button onClick={props.onUpdate}>
            <Edit class="w-4 h-4" />
            Редактировать
          </Button>
        </>
      }
    >
      <div class="space-y-6">
        {/* Status badges */}
        <div class="flex flex-wrap items-center gap-2">
          <Badge
            variant={voice().externalGender === "MALE" ? "info" : "warning"}
          >
            {voice().externalGender === "MALE" ? "Мужской" : "Женский"}
          </Badge>
          <Badge variant={getEmotionSupportVariant(voice().emotionSupport)}>
            Эмоции: {getEmotionSupportLabel(voice().emotionSupport)}
          </Badge>
          <Show
            when={!voice().isHidden}
            fallback={
              <Badge variant="muted">
                <EyeOff class="w-3 h-3" />
                Скрыт
              </Badge>
            }
          >
            <Badge variant="success">
              <Eye class="w-3 h-3" />
              Видимый
            </Badge>
          </Show>
        </div>

        {/* Rating */}
        <div class="flex items-center gap-2">
          <Star class="w-5 h-5 text-warning-foreground" />
          <Typography type="title" level={4}>
            {voice().rating}/10
          </Typography>
        </div>

        {/* External info */}
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Typography level={5} color="muted">
              Локаль
            </Typography>
            <Typography level={4}>{voice().externalLocale ?? "—"}</Typography>
          </div>
          <div>
            <Typography level={5} color="muted">
              Акцент
            </Typography>
            <Typography level={4}>{voice().externalAccent ?? "—"}</Typography>
          </div>
          <div>
            <Typography level={5} color="muted">
              Возраст
            </Typography>
            <Typography level={4}>{voice().externalAgeGroup ?? "—"}</Typography>
          </div>
          <div>
            <Typography level={5} color="muted">
              Мультиязычный
            </Typography>
            <Typography level={4}>
              {voice().externalIsMultilingual ? "Да" : "Нет"}
            </Typography>
          </div>
        </div>

        {/* Tested languages */}
        <Show
          when={
            voice().testedLanguages
            && (voice().testedLanguages?.length ?? 0) > 0
          }
        >
          <div>
            <Typography level={5} color="muted" class="mb-2">
              Проверенные языки
            </Typography>
            <div class="flex flex-wrap gap-1">
              <For each={voice().testedLanguages}>
                {(lang) => (
                  <Badge variant="secondary" size="sm">
                    {getLanguageLabel(lang)}
                  </Badge>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Notes */}
        <Show when={voice().notes}>
          <div>
            <Typography level={5} color="muted" class="mb-1">
              Заметки
            </Typography>
            <Typography level={4}>{voice().notes}</Typography>
          </div>
        </Show>

        {/* Description */}
        <Show when={voice().externalDescription}>
          <div>
            <Typography level={5} color="muted" class="mb-1">
              Описание (внешнее)
            </Typography>
            <Typography level={4} color="muted">
              {voice().externalDescription}
            </Typography>
          </div>
        </Show>
      </div>
    </Dialog>
  );
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\lib\validation.ts

```
import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import {
  array,
  boolean,
  maxValue,
  minValue,
  nullable,
  number,
  object,
  partial,
  picklist,
  pipe,
  string,
} from "valibot";

const VOICE_RATING_MIN = 1;
const VOICE_RATING_MAX = 10;

export const updateSecretVoicerVoiceSchema = partial(
  object({
    emotionSupport: picklist(
      secretVoicerContract.voiceEmotionSupport.values() as unknown as [
        string,
        ...string[],
      ],
    ),
    testedLanguages: array(string()),
    rating: pipe(
      number(),
      minValue(VOICE_RATING_MIN),
      maxValue(VOICE_RATING_MAX),
    ),
    notes: nullable(string()),
    isHidden: boolean(),
  }),
);

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\ui\sync-events-panel.tsx

```
import { Accordion, type AccordionItem } from "@packages/ui/accordion";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Typography } from "@packages/ui/typography";
import { AlertTriangle, Clock, Trash2 } from "lucide-solid";
import { For, Show } from "solid-js";
import {
  formatChangedFields,
  formatSyncEventDate,
  getSyncEventTypeLabel,
} from "../lib/helpers";
import type { SecretVoicerVoiceSyncEvent } from "../model/types";

function SyncEventItem(props: {
  event: SecretVoicerVoiceSyncEvent;
  onDelete: (id: string) => void;
}) {
  return (
    <div class="flex items-start justify-between p-3 rounded-lg bg-muted/50 border border-border">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <Badge variant={props.event.isCritical ? "error" : "info"} size="sm">
            {getSyncEventTypeLabel(props.event.eventType)}
          </Badge>
          <Typography level={6} color="muted">
            {formatSyncEventDate(props.event.createdAt)}
          </Typography>
        </div>
        <Typography level={4} class="font-medium">
          {props.event.voiceName ?? props.event.externalVoiceId ?? "Unknown"}
        </Typography>
        <Show
          when={
            props.event.changedFields && props.event.changedFields.length > 0
          }
        >
          <Typography level={5} color="muted">
            Изменены: {formatChangedFields(props.event.changedFields)}
          </Typography>
        </Show>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => props.onDelete(props.event.id)}
      >
        <Trash2 class="w-3 h-3" />
      </Button>
    </div>
  );
}

export function SyncEventsPanel(props: {
  criticalEvents: SecretVoicerVoiceSyncEvent[];
  nonCriticalEvents: SecretVoicerVoiceSyncEvent[];
  onDeleteEvent: (id: string) => void;
  onDeleteAll: () => void;
}) {
  const hasEvents = () =>
    props.criticalEvents.length > 0 || props.nonCriticalEvents.length > 0;

  const accordionItems = (): AccordionItem[] => {
    const items: AccordionItem[] = [];

    if (props.criticalEvents.length > 0) {
      items.push({
        value: "critical",
        title: (
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-error-foreground" />
            <span>Критические изменения</span>
            <Badge variant="error" size="sm">
              {props.criticalEvents.length}
            </Badge>
          </div>
        ),
        content: (
          <div class="space-y-2">
            <For each={props.criticalEvents}>
              {(event) => (
                <SyncEventItem event={event} onDelete={props.onDeleteEvent} />
              )}
            </For>
          </div>
        ),
      });
    }

    if (props.nonCriticalEvents.length > 0) {
      items.push({
        value: "changelog",
        title: (
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-muted-foreground" />
            <span>Журнал изменений</span>
            <Badge variant="muted" size="sm">
              {props.nonCriticalEvents.length}
            </Badge>
          </div>
        ),
        content: (
          <div class="space-y-2">
            <For each={props.nonCriticalEvents}>
              {(event) => (
                <SyncEventItem event={event} onDelete={props.onDeleteEvent} />
              )}
            </For>
          </div>
        ),
      });
    }

    return items;
  };

  return (
    <Show when={hasEvents()}>
      <Card
        padding="none"
        content={
          <div>
            <div class="flex items-center justify-between px-4 py-3 border-b border-border">
              <Typography type="title" level={5}>
                События синхронизации
              </Typography>
              <Button variant="ghost" size="btn-xs" onClick={props.onDeleteAll}>
                <Trash2 class="w-3 h-3" />
                Очистить всё
              </Button>
            </div>
            <Accordion
              items={accordionItems()}
              type="multiple"
              defaultValue={props.criticalEvents.length > 0 ? ["critical"] : []}
            />
          </div>
        }
      />
    </Show>
  );
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\ui\update-dialog.tsx

```
import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { Select } from "@packages/ui/select";
import { Switch } from "@packages/ui/switch";
import { Textarea } from "@packages/ui/textarea";
import { createEffect, createSignal } from "solid-js";
import { safeParse } from "valibot";
import { updateSecretVoicerVoiceSchema } from "../lib/validation";
import type {
  SecretVoicerVoice,
  UpdateSecretVoicerVoiceInput,
} from "../model/types";
import { LanguageSelector } from "./language-selector";

type EmotionSupportValue = "none" | "basic" | "advanced";

export function UpdateSecretVoicerVoiceDialog(props: {
  open: boolean;
  voice: SecretVoicerVoice;
  onClose: () => void;
  onSubmit: (data: UpdateSecretVoicerVoiceInput) => Promise<void>;
}) {
  const [form, setForm] = createSignal<UpdateSecretVoicerVoiceInput>({
    emotionSupport: "none",
    testedLanguages: [],
    rating: 5,
    notes: null,
    isHidden: false,
  });
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const emotionOptions = secretVoicerContract.voiceEmotionSupport.options.map(
    (o) => ({
      value: o.value,
      label: o.label,
    }),
  );

  createEffect(() => {
    if (props.open) {
      const v = props.voice;
      setForm({
        emotionSupport: v.emotionSupport as EmotionSupportValue,
        testedLanguages: v.testedLanguages ?? [],
        rating: v.rating,
        notes: v.notes,
        isHidden: v.isHidden,
      });
      setErrors({});
    }
  });

  const updateField = <K extends keyof UpdateSecretVoicerVoiceInput>(
    field: K,
    value: UpdateSecretVoicerVoiceInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors()[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = safeParse(updateSecretVoicerVoiceSchema, form());

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.issues) {
        const key = issue.path?.[0]?.key as string;
        if (key) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await props.onSubmit(result.output);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
      title={`Редактировать: ${props.voice.externalName}`}
      description="Изменение кастомных полей голоса"
      class="max-w-xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={props.onClose}
            disabled={isSubmitting()}
          >
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting()}>
            {isSubmitting() ? "Сохранение..." : "Сохранить"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} class="space-y-5">
        {/* Emotion Support */}
        <div class="space-y-2">
          <Label for="emotion-support">Поддержка эмоций</Label>
          <Select
            id="emotion-support"
            value={form().emotionSupport}
            onChange={(v) =>
              updateField("emotionSupport", v as EmotionSupportValue)
            }
            options={emotionOptions}
            placeholder="Выберите уровень эмоций..."
            disabled={isSubmitting()}
            modal={true}
          />
        </div>

        {/* Rating */}
        <div class="space-y-2">
          <Label for="rating" error={Boolean(errors().rating)}>
            Рейтинг (1-10)
          </Label>
          <Input
            id="rating"
            type="number"
            min={1}
            max={10}
            value={form().rating}
            onInput={(e) =>
              updateField("rating", Number(e.currentTarget.value))
            }
            disabled={isSubmitting()}
            error={Boolean(errors().rating)}
            errorMessage={errors().rating}
          />
        </div>

        {/* Tested Languages */}
        <div class="space-y-2">
          <Label for="tested-languages">Проверенные языки</Label>
          <LanguageSelector
            id="tested-languages"
            value={form().testedLanguages ?? []}
            onChange={(langs) => updateField("testedLanguages", langs)}
            disabled={isSubmitting()}
            modal={true}
          />
        </div>

        {/* Notes */}
        <div class="space-y-2">
          <Label for="notes">Заметки</Label>
          <Textarea
            id="notes"
            placeholder="Заметки для себя или ИИ..."
            value={form().notes ?? ""}
            onInput={(e) => updateField("notes", e.currentTarget.value || null)}
            disabled={isSubmitting()}
            rows={3}
          />
        </div>

        {/* Hidden */}
        <div class="flex items-center justify-between py-2">
          <Label for="is-hidden">Скрыть голос</Label>
          <Switch
            id="is-hidden"
            checked={form().isHidden}
            onChange={(checked) => updateField("isHidden", checked)}
            disabled={isSubmitting()}
          />
        </div>
      </form>
    </Dialog>
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\lib\constants.ts

```
export const SYNTHESIS_CONSTANTS = {
  // Timeouts
  TASK_TIMEOUT_MS: 180_000, // 3 minutes per task
  POLLING_INTERVAL_MS: 3000, // 3 seconds

  // Retries
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000, // 5 seconds between retries

  // Rate limiting (for future)
  MAX_REQUESTS_PER_MINUTE: 1000, // Very high, effectively unlimited
  MAX_REQUESTS_PER_DAY: 100_000,
  REQUEST_DELAY_MS: 0, // No delay by default

  // Storage
  PROJECT_NAME_MAX_LENGTH: 40,
  PROJECT_ID_PREFIX_LENGTH: 8,
  STORAGE_BASE_PATH: "storage/secret-voicer/projects",

  // File naming
  FILE_EXTENSION: ".mp3",

  // Validation
  MIN_RATE: 0.5,
  MAX_RATE: 2.0,
  DEFAULT_RATE: 1.0,
  MIN_TEXT_LENGTH: 1,
  MAX_TEXT_LENGTH: 5000,
} as const;

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\data\table.ts

```
import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { createId } from "@packages/utils/id";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { VOICE_RATING_DEFAULT } from "../lib/constants";

export const voiceGenderEnum = pgEnum(
  "voice_gender",
  secretVoicerContract.voiceGender.values() as [string, ...string[]],
);

export const voiceEmotionSupportEnum = pgEnum(
  "voice_emotion_support",
  secretVoicerContract.voiceEmotionSupport.values() as [string, ...string[]],
);

export const voiceSyncEventTypeEnum = pgEnum(
  "voice_sync_event_type",
  secretVoicerContract.voiceSyncEventType.values() as [string, ...string[]],
);

export const secretVoicerVoiceTable = pgTable("secret_voicer_voices", {
  // === Internal ===
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  // === External fields (from API, read-only) ===
  externalId: integer("external_id").notNull(),
  externalVoiceId: text("external_voice_id").notNull().unique(),
  externalName: text("external_name").notNull(),
  externalDescription: text("external_description"),
  externalGender: voiceGenderEnum("external_gender").notNull(),
  externalLocale: text("external_locale"),
  externalPreviewUrl: text("external_preview_url"),
  externalPreviewUrlEmotional: text("external_preview_url_emotional"),
  externalAvatarUrl: text("external_avatar_url"),
  externalAccent: text("external_accent"),
  externalAgeGroup: text("external_age_group"),
  externalIsMultilingual: boolean("external_is_multilingual").default(false),
  externalStyleTags: jsonb("external_style_tags").$type<string[]>().default([]),
  externalUseCases: jsonb("external_use_cases").$type<string[]>().default([]),

  // === Custom fields (editable) ===
  emotionSupport: voiceEmotionSupportEnum("emotion_support")
    .default("none")
    .notNull(),
  testedLanguages: jsonb("tested_languages").$type<string[]>().default([]),
  rating: integer("rating").default(VOICE_RATING_DEFAULT).notNull(),
  notes: text("notes"),
  isHidden: boolean("is_hidden").default(false).notNull(),

  // === Timestamps ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// === Sync Events Table (changelog) ===

export const secretVoicerVoiceSyncEventTable = pgTable(
  "secret_voicer_voice_sync_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    eventType: voiceSyncEventTypeEnum("event_type").notNull(),
    isCritical: boolean("is_critical").default(false).notNull(),

    // Voice reference (may be null if voice was deleted)
    voiceId: text("voice_id"),
    externalVoiceId: text("external_voice_id"),
    voiceName: text("voice_name"),

    // Change details
    changedFields: jsonb("changed_fields").$type<string[]>(),
    oldValues: jsonb("old_values").$type<Record<string, unknown>>(),
    newValues: jsonb("new_values").$type<Record<string, unknown>>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

// === Sync State Table (singleton) ===

export const secretVoicerVoiceSyncStateTable = pgTable(
  "secret_voicer_voice_sync_state",
  {
    id: text("id").primaryKey().default("main").notNull(),

    isBlocked: boolean("is_blocked").default(false).notNull(),
    blockReason: text("block_reason"),
    blockedAt: timestamp("blocked_at"),

    lastSyncAt: timestamp("last_sync_at"),
    lastSyncSuccess: boolean("last_sync_success"),
    lastSyncError: text("last_sync_error"),

    // Stats from last sync
    lastSyncStats: jsonb("last_sync_stats").$type<{
      totalVoices: number;
      added: number;
      removed: number;
      updated: number;
      unchanged: number;
    }>(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\lib\helpers.ts

```
import type { SecretVoicerVoiceSyncEvent } from "../model/types";

export function formatSyncEventDate(date: Date | string | null): string {
  if (!date) {
    return "—";
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getSyncEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    VOICE_ADDED: "Добавлен голос",
    VOICE_REMOVED: "Удалён голос",
    VOICE_UPDATED: "Обновлён голос",
  };
  return labels[type] ?? type;
}

export function formatChangedFields(fields: string[] | null): string {
  if (!fields || fields.length === 0) {
    return "—";
  }
  return fields.join(", ");
}

export function groupSyncEventsByDate(
  events: SecretVoicerVoiceSyncEvent[],
): Map<string, SecretVoicerVoiceSyncEvent[]> {
  const grouped = new Map<string, SecretVoicerVoiceSyncEvent[]>();

  for (const event of events) {
    const dateKey = new Date(event.createdAt).toLocaleDateString("ru-RU");
    const existing = grouped.get(dateKey) ?? [];
    existing.push(event);
    grouped.set(dateKey, existing);
  }

  return grouped;
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\data\repository.ts

```
import { eq, inArray, lt, notInArray } from "drizzle-orm";
import { db } from "#api/shared/db";
import {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
} from "./table";
import type {
  NewSecretVoicerVoice,
  NewSecretVoicerVoiceSyncEvent,
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
  UpdateSecretVoicerVoice,
} from "./types";

// === Constants ===

const SYNC_STATE_ID = "main";

// === Voice Repository ===

export function getAllSecretVoicerVoices(): Promise<SecretVoicerVoice[]> {
  return db.select().from(secretVoicerVoiceTable);
}

export function getPublicSecretVoicerVoices(): Promise<SecretVoicerVoice[]> {
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(eq(secretVoicerVoiceTable.isHidden, false));
}

export function getSecretVoicerVoiceById(
  id: string,
): Promise<SecretVoicerVoice | undefined> {
  return db.query.secretVoicerVoiceTable.findFirst({
    where: eq(secretVoicerVoiceTable.id, id),
  });
}

export function getSecretVoicerVoiceByExternalVoiceId(
  externalVoiceId: string,
): Promise<SecretVoicerVoice | undefined> {
  return db.query.secretVoicerVoiceTable.findFirst({
    where: eq(secretVoicerVoiceTable.externalVoiceId, externalVoiceId),
  });
}

export function getSecretVoicerVoicesByExternalVoiceIds(
  externalVoiceIds: string[],
): Promise<SecretVoicerVoice[]> {
  if (externalVoiceIds.length === 0) {
    return Promise.resolve([]);
  }
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(inArray(secretVoicerVoiceTable.externalVoiceId, externalVoiceIds));
}

export function getSecretVoicerVoicesNotInExternalIds(
  externalVoiceIds: string[],
): Promise<SecretVoicerVoice[]> {
  if (externalVoiceIds.length === 0) {
    return db.select().from(secretVoicerVoiceTable);
  }
  return db
    .select()
    .from(secretVoicerVoiceTable)
    .where(
      notInArray(secretVoicerVoiceTable.externalVoiceId, externalVoiceIds),
    );
}

export async function createSecretVoicerVoice(
  data: NewSecretVoicerVoice,
): Promise<SecretVoicerVoice> {
  const [result] = await db
    .insert(secretVoicerVoiceTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create voice");
  }
  return result;
}

export function createSecretVoicerVoices(
  data: NewSecretVoicerVoice[],
): Promise<SecretVoicerVoice[]> {
  if (data.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(secretVoicerVoiceTable).values(data).returning();
}

export async function updateSecretVoicerVoice(
  id: string,
  data: UpdateSecretVoicerVoice,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .update(secretVoicerVoiceTable)
    .set(data)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

export async function updateSecretVoicerVoiceExternalFields(
  id: string,
  data: Partial<NewSecretVoicerVoice>,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .update(secretVoicerVoiceTable)
    .set(data)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

export async function deleteSecretVoicerVoice(
  id: string,
): Promise<SecretVoicerVoice | undefined> {
  const [result] = await db
    .delete(secretVoicerVoiceTable)
    .where(eq(secretVoicerVoiceTable.id, id))
    .returning();
  return result;
}

// === Sync Event Repository ===

export function getAllSecretVoicerVoiceSyncEvents(): Promise<
  SecretVoicerVoiceSyncEvent[]
> {
  return db.select().from(secretVoicerVoiceSyncEventTable);
}

export async function createSecretVoicerVoiceSyncEvent(
  data: NewSecretVoicerVoiceSyncEvent,
): Promise<SecretVoicerVoiceSyncEvent> {
  const [result] = await db
    .insert(secretVoicerVoiceSyncEventTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create sync event");
  }
  return result;
}

export function createSecretVoicerVoiceSyncEvents(
  data: NewSecretVoicerVoiceSyncEvent[],
): Promise<SecretVoicerVoiceSyncEvent[]> {
  if (data.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(secretVoicerVoiceSyncEventTable).values(data).returning();
}

export async function deleteSecretVoicerVoiceSyncEvent(
  id: string,
): Promise<SecretVoicerVoiceSyncEvent | undefined> {
  const [result] = await db
    .delete(secretVoicerVoiceSyncEventTable)
    .where(eq(secretVoicerVoiceSyncEventTable.id, id))
    .returning();
  return result;
}

export async function deleteAllSecretVoicerVoiceSyncEvents(): Promise<number> {
  const result = await db.delete(secretVoicerVoiceSyncEventTable).returning();
  return result.length;
}

export async function deleteOldSecretVoicerVoiceSyncEvents(
  olderThan: Date,
): Promise<number> {
  const result = await db
    .delete(secretVoicerVoiceSyncEventTable)
    .where(lt(secretVoicerVoiceSyncEventTable.createdAt, olderThan))
    .returning();
  return result.length;
}

// === Sync State Repository ===

export async function getSecretVoicerVoiceSyncState(): Promise<SecretVoicerVoiceSyncState | null> {
  const result = await db.query.secretVoicerVoiceSyncStateTable.findFirst({
    where: eq(secretVoicerVoiceSyncStateTable.id, SYNC_STATE_ID),
  });
  return result ?? null;
}

export async function upsertSecretVoicerVoiceSyncState(
  data: Partial<SecretVoicerVoiceSyncState>,
): Promise<SecretVoicerVoiceSyncState> {
  const existing = await getSecretVoicerVoiceSyncState();

  if (existing) {
    const [result] = await db
      .update(secretVoicerVoiceSyncStateTable)
      .set(data)
      .where(eq(secretVoicerVoiceSyncStateTable.id, SYNC_STATE_ID))
      .returning();
    if (!result) {
      throw new Error("Failed to update sync state");
    }
    return result;
  }

  const [result] = await db
    .insert(secretVoicerVoiceSyncStateTable)
    .values({ id: SYNC_STATE_ID, ...data })
    .returning();
  if (!result) {
    throw new Error("Failed to create sync state");
  }
  return result;
}

export async function setSecretVoicerVoiceSyncBlocked(
  blocked: boolean,
  reason?: string,
): Promise<void> {
  await upsertSecretVoicerVoiceSyncState({
    isBlocked: blocked,
    blockReason: blocked ? reason : null,
    blockedAt: blocked ? new Date() : null,
  });
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\services\processor.ts

```
import { and, eq } from "drizzle-orm";
import { browserFingerprintTable } from "#api/features/browser-fingerprint";
import { db } from "#api/shared/db";
import { secretVoicerCredentialTable } from "../../credential/table";
import { externalApiService } from "../../services/external-api";
import type { VoiceRequestConfig } from "../../services/types";
import {
  getSynthesisProjectById,
  getSynthesisTasksByProjectId,
  incrementTaskRetryCount,
  updateProjectStats,
  updateSynthesisProject,
  updateSynthesisTask,
  updateTaskStatus,
} from "../data/repository";
import type { SynthesisProject, SynthesisTask } from "../data/types";
import { SYNTHESIS_CONSTANTS } from "../lib/constants";
import { createProjectFolder, saveTaskAudio } from "./storage";

type ProcessingState = {
  isRunning: boolean;
  activeProjects: Set<string>;
};

const state: ProcessingState = {
  isRunning: false,
  activeProjects: new Set(),
};

async function getActiveCredential(): Promise<VoiceRequestConfig | null> {
  const result = await db
    .select({
      csrfToken: secretVoicerCredentialTable.csrfToken,
      sessionId: secretVoicerCredentialTable.sessionId,
      userAgent: browserFingerprintTable.userAgent,
      secChUa: browserFingerprintTable.secChUa,
      secChUaMobile: browserFingerprintTable.secChUaMobile,
      secChUaPlatform: browserFingerprintTable.secChUaPlatform,
    })
    .from(secretVoicerCredentialTable)
    .innerJoin(
      browserFingerprintTable,
      eq(secretVoicerCredentialTable.fingerprintId, browserFingerprintTable.id),
    )
    .where(
      and(
        eq(secretVoicerCredentialTable.isActive, true),
        eq(browserFingerprintTable.isActive, true),
      ),
    )
    .limit(1);

  const cred = result[0];
  if (!cred) {
    return null;
  }

  return {
    csrfToken: cred.csrfToken.trim(),
    sessionId: cred.sessionId.trim(),
    userAgent: cred.userAgent,
    secChUa: cred.secChUa,
    secChUaMobile: cred.secChUaMobile,
    secChUaPlatform: cred.secChUaPlatform,
  };
}

async function pollForCompletion(
  config: VoiceRequestConfig,
  externalTaskId: string,
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < SYNTHESIS_CONSTANTS.TASK_TIMEOUT_MS) {
    // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER polling requires sequential checks
    const status = await externalApiService.checkTaskStatus(
      config,
      externalTaskId,
    );

    if (status.status_code === "COMPLETED" && status.audio_url) {
      return status.audio_url;
    }

    if (status.status_code === "FAILED" || status.error) {
      throw new Error(
        status.error ?? `External task failed: ${status.status_code}`,
      );
    }

    await new Promise((resolve) =>
      setTimeout(resolve, SYNTHESIS_CONSTANTS.POLLING_INTERVAL_MS),
    );
  }

  throw new Error("Task timeout (3 minutes)");
}

async function processTask(
  task: SynthesisTask,
  project: SynthesisProject,
  config: VoiceRequestConfig,
  totalTasks: number,
): Promise<void> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `⏳ [Synthesis] Processing task ${task.orderIndex}/${totalTasks}`,
  );

  try {
    await updateTaskStatus(task.id, "PROCESSING");

    const { task_id } = await externalApiService.createTask(config, {
      text: task.text,
      voice_id: task.voiceId,
      rate: task.rate,
    });

    const externalTaskId = String(task_id);

    await updateSynthesisTask(task.id, { externalTaskId });

    const audioUrl = await pollForCompletion(config, externalTaskId);

    const audioBuffer = await externalApiService.downloadAudio(
      config,
      audioUrl,
    );

    const filename = await saveTaskAudio(
      project.storagePath ?? "",
      task.orderIndex,
      totalTasks,
      audioBuffer,
    );

    await updateSynthesisTask(task.id, {
      status: "COMPLETED",
      audioUrl,
      localFilePath: filename,
      completedAt: new Date(),
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `✅ [Synthesis] Task ${task.orderIndex} completed: ${filename}`,
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`❌ [Synthesis] Task ${task.orderIndex} failed:`, errorMsg);

    const retryCount = await incrementTaskRetryCount(task.id);

    if (retryCount < SYNTHESIS_CONSTANTS.MAX_RETRIES) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔄 [Synthesis] Task ${task.orderIndex} will retry (${retryCount}/${SYNTHESIS_CONSTANTS.MAX_RETRIES})`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, SYNTHESIS_CONSTANTS.RETRY_DELAY_MS),
      );

      await processTask(task, project, config, totalTasks);
    } else {
      await updateTaskStatus(task.id, "FAILED", errorMsg);
    }
  }
}

export async function startProjectProcessing(projectId: string): Promise<void> {
  if (state.activeProjects.has(projectId)) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`⚠️ [Synthesis] Project ${projectId} is already processing`);
    return;
  }

  const project = await getSynthesisProjectById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.status === "CANCELLED" || project.status === "PAUSED") {
    throw new Error(`Project is ${project.status.toLowerCase()}`);
  }

  const config = await getActiveCredential();
  if (!config) {
    throw new Error("No active credentials available");
  }

  state.activeProjects.add(projectId);

  try {
    if (!project.storagePath) {
      const folderName = await createProjectFolder(project.name, project.id);
      await updateSynthesisProject(project.id, { storagePath: folderName });
      project.storagePath = folderName;
    }

    await updateSynthesisProject(project.id, {
      status: "PROCESSING",
      startedAt: new Date(),
    });

    const tasks = await getSynthesisTasksByProjectId(projectId);
    const pendingTasks = tasks.filter(
      (t) => t.status === "PENDING" || t.status === "FAILED",
    );

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `🚀 [Synthesis] Starting project "${project.name}" with ${pendingTasks.length} tasks`,
    );

    await Promise.all(
      pendingTasks.map((task) =>
        processTask(task, project, config, tasks.length),
      ),
    );

    await updateProjectStats(projectId);

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`🏁 [Synthesis] Project "${project.name}" processing complete`);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`❌ [Synthesis] Project ${projectId} failed:`, error);
    await updateProjectStats(projectId);
  } finally {
    state.activeProjects.delete(projectId);
  }
}

export async function pauseProject(projectId: string): Promise<void> {
  await updateSynthesisProject(projectId, { status: "PAUSED" });
}

export async function cancelProject(projectId: string): Promise<void> {
  await updateSynthesisProject(projectId, { status: "CANCELLED" });
  state.activeProjects.delete(projectId);
}

export function isProjectProcessing(projectId: string): boolean {
  return state.activeProjects.has(projectId);
}

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\ui\sync-logs-page.tsx

```
import { Alert } from "@packages/ui/alert";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Typography } from "@packages/ui/typography";
import { RefreshCw, Trash2 } from "lucide-solid";
import { createSignal, For, onMount, Show } from "solid-js";
import { PageHeader } from "#admin/shared/ui/page-header";
import {
  formatChangedFields,
  formatSyncEventDate,
  getSyncEventTypeLabel,
} from "../lib/helpers";
import { secretVoicerVoiceApi } from "../model/api";
import type {
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
} from "../model/types";

export function SecretVoicerSyncLogsPage() {
  const [events, setEvents] = createSignal<SecretVoicerVoiceSyncEvent[]>([]);
  const [syncState, setSyncState] =
    createSignal<SecretVoicerVoiceSyncState | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsData, stateData] = await Promise.all([
        secretVoicerVoiceApi.getSyncEvents(),
        secretVoicerVoiceApi.getSyncState(),
      ]);
      setEvents(eventsData);
      setSyncState(stateData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    await secretVoicerVoiceApi.deleteSyncEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteAllEvents = async () => {
    await secretVoicerVoiceApi.deleteAllSyncEvents();
    setEvents([]);
  };

  onMount(fetchData);

  return (
    <div class="space-y-6">
      <PageHeader title="Sync Logs" description="История синхронизации голосов">
        <Button variant="outline" onClick={fetchData} disabled={isLoading()}>
          <RefreshCw class="w-4 h-4" />
          Обновить
        </Button>
        <Show when={events().length > 0}>
          <Button variant="outline" onClick={deleteAllEvents}>
            <Trash2 class="w-4 h-4" />
            Очистить всё
          </Button>
        </Show>
      </PageHeader>

      <Show when={error()}>
        {(err) => <Alert variant="error" title="Ошибка" description={err()} />}
      </Show>

      {/* Sync State Card */}
      <Card
        title="Состояние синхронизации"
        content={
          <Show
            when={syncState()}
            fallback={<Typography color="muted">Загрузка...</Typography>}
          >
            {(state) => (
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Typography level={5} color="muted">
                    Последняя синхронизация
                  </Typography>
                  <Typography level={4}>
                    {state().lastSyncAt
                      ? formatSyncEventDate(state().lastSyncAt)
                      : "Никогда"}
                  </Typography>
                </div>
                <div>
                  <Typography level={5} color="muted">
                    Статус
                  </Typography>
                  <Badge
                    variant={state().lastSyncSuccess ? "success" : "error"}
                  >
                    {state().lastSyncSuccess ? "Успешно" : "Ошибка"}
                  </Badge>
                </div>
                <div>
                  <Typography level={5} color="muted">
                    Блокировка
                  </Typography>
                  <Badge variant={state().isBlocked ? "error" : "muted"}>
                    {state().isBlocked ? "Заблокирован" : "Нет"}
                  </Badge>
                </div>
                <Show when={state().lastSyncStats}>
                  {(stats) => (
                    <div>
                      <Typography level={5} color="muted">
                        Статистика
                      </Typography>
                      <Typography level={4}>
                        +{stats().added} / ~{stats().updated} / -
                        {stats().removed}
                      </Typography>
                    </div>
                  )}
                </Show>
              </div>
            )}
          </Show>
        }
      />

      {/* Events List */}
      <Card
        title={`События (${events().length})`}
        padding="none"
        content={
          <Show
            when={!isLoading()}
            fallback={
              <div class="p-8 text-center">
                <Typography color="muted">Загрузка...</Typography>
              </div>
            }
          >
            <Show
              when={events().length > 0}
              fallback={
                <div class="p-8 text-center">
                  <Typography color="muted">Нет событий</Typography>
                </div>
              }
            >
              <div class="divide-y divide-border">
                <For each={events()}>
                  {(event) => (
                    <div class="flex items-start justify-between p-4 hover:bg-muted/50">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <Badge
                            variant={event.isCritical ? "error" : "info"}
                            size="sm"
                          >
                            {getSyncEventTypeLabel(event.eventType)}
                          </Badge>
                          <Typography level={6} color="muted">
                            {formatSyncEventDate(event.createdAt)}
                          </Typography>
                        </div>
                        <Typography level={4} class="font-medium">
                          {event.voiceName
                            ?? event.externalVoiceId
                            ?? "Unknown"}
                        </Typography>
                        <Show
                          when={
                            event.changedFields
                            && event.changedFields.length > 0
                          }
                        >
                          <Typography level={5} color="muted">
                            Изменены: {formatChangedFields(event.changedFields)}
                          </Typography>
                        </Show>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        }
      />
    </div>
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\root-layout\ui\devtools.tsx

```
import { lazy } from "solid-js";

export const Devtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/solid-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null;

```

D:\1_Projects\jstonehub\apps\admin\src\features\secret-voicer\voice\ui\toolbar.tsx

```
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Checkbox } from "@packages/ui/checkbox";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { cn } from "@packages/utils/css";
import { Search } from "lucide-solid";
import { For } from "solid-js";
import type { VoiceGenderFilter } from "../model/hooks";

const genderTabs: { value: VoiceGenderFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "MALE", label: "Мужские" },
  { value: "FEMALE", label: "Женские" },
];

export function SecretVoicerVoicesToolbar(props: {
  searchQuery: string;
  showHidden: boolean;
  genderFilter: VoiceGenderFilter;
  onSearchChange: (query: string) => void;
  onShowHiddenChange: (show: boolean) => void;
  onGenderFilterChange: (filter: VoiceGenderFilter) => void;
}) {
  return (
    <Card
      padding="sm"
      content={
        <div class="flex flex-col gap-4">
          {/* Top row: Search + Gender Filter */}
          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Input
              placeholder="Поиск по имени или ID..."
              prefix={<Search class="w-4 h-4" />}
              wrapperClass="w-full sm:w-64"
              value={props.searchQuery}
              onInput={(e) => props.onSearchChange(e.currentTarget.value)}
            />

            <div class="inline-flex rounded-lg border border-border p-1 bg-muted/50">
              <For each={genderTabs}>
                {(tab) => (
                  <Button
                    variant="ghost"
                    size="btn-xs"
                    class={cn(
                      props.genderFilter === tab.value
                        && "bg-card shadow-sm border border-border",
                    )}
                    onClick={() => props.onGenderFilterChange(tab.value)}
                  >
                    {tab.label}
                  </Button>
                )}
              </For>
            </div>
          </div>

          {/* Bottom row: Checkbox */}
          <div class="flex items-center gap-2">
            <Checkbox
              id="show-hidden"
              checked={props.showHidden}
              onChange={props.onShowHiddenChange}
            />
            <Label for="show-hidden">Показать скрытые</Label>
          </div>
        </div>
      }
    />
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\lib\helpers.ts

```
import path from "node:path";
import { SYNTHESIS_CONSTANTS } from "./constants";

export function generateStorageFolderName(
  projectName: string,
  projectId: string,
): string {
  const safeName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, SYNTHESIS_CONSTANTS.PROJECT_NAME_MAX_LENGTH);

  const idPrefix = projectId.slice(
    0,
    SYNTHESIS_CONSTANTS.PROJECT_ID_PREFIX_LENGTH,
  );

  return `${safeName}_${idPrefix}`;
}

export function getProjectStoragePath(folderName: string): string {
  return path.join(SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH, folderName);
}

export function generateTaskFilename(
  orderIndex: number,
  totalTasks: number,
): string {
  const digits = String(totalTasks).length;
  const paddedIndex = String(orderIndex).padStart(digits, "0");
  return `${paddedIndex}${SYNTHESIS_CONSTANTS.FILE_EXTENSION}`;
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  const maxProgress = 100;
  return Math.round((completed / total) * maxProgress);
}

export function validateRate(rate: number | undefined): number {
  if (rate === undefined) {
    return SYNTHESIS_CONSTANTS.DEFAULT_RATE;
  }
  return Math.max(
    SYNTHESIS_CONSTANTS.MIN_RATE,
    Math.min(SYNTHESIS_CONSTANTS.MAX_RATE, rate),
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\root-layout\ui\root-layout.tsx

```
import { Main } from "@packages/ui/main";
import { TooltipProvider } from "@packages/ui/tooltip";
import { HeadContent, Outlet, Scripts } from "@tanstack/solid-router";
import { Devtools } from "./devtools";
import { RootResponsiveNavigation } from "./root-responsive-navigation";

export function RootLayout() {
  return (
    <TooltipProvider>
      <HeadContent />

      <RootResponsiveNavigation />
      <Main>
        <Outlet />
      </Main>

      <Devtools />
      <Scripts />
    </TooltipProvider>
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\data\types.ts

```
import type {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
} from "./table";

// === Voice ===

export type SecretVoicerVoice = typeof secretVoicerVoiceTable.$inferSelect;
export type NewSecretVoicerVoice = typeof secretVoicerVoiceTable.$inferInsert;
export type UpdateSecretVoicerVoice = Partial<
  Pick<
    NewSecretVoicerVoice,
    "emotionSupport" | "testedLanguages" | "rating" | "notes" | "isHidden"
  >
>;

// === Sync Event ===

export type SecretVoicerVoiceSyncEvent =
  typeof secretVoicerVoiceSyncEventTable.$inferSelect;
export type NewSecretVoicerVoiceSyncEvent =
  typeof secretVoicerVoiceSyncEventTable.$inferInsert;

// === Sync State ===

export type SecretVoicerVoiceSyncState =
  typeof secretVoicerVoiceSyncStateTable.$inferSelect;

// === External API Response ===

export type ExternalVoice = {
  id: number;
  voice_id: string;
  name: string;
  gender: "MALE" | "FEMALE";
  locale: string | null;
  is_multilingual: boolean;
  preview_url: string | null;
  preview_url_emotional: string | null;
  usage_count: number;
  avatar_url: string | null;
  description: string | null;
  accent: string | null;
  age_group: string | null;
  voice_style_tags: string[];
  use_cases: string[];
};

export type ExternalVoicesResponse = {
  grouped_voices: {
    category: string;
    voices: ExternalVoice[];
  }[];
};

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\services\storage.ts

```
import fs from "node:fs/promises";
import path from "node:path";
import { SYNTHESIS_CONSTANTS } from "../lib/constants";
import {
  generateStorageFolderName,
  generateTaskFilename,
  getProjectStoragePath,
} from "../lib/helpers";

export async function createProjectFolder(
  projectName: string,
  projectId: string,
): Promise<string> {
  const folderName = generateStorageFolderName(projectName, projectId);
  const folderPath = getProjectStoragePath(folderName);

  await fs.mkdir(folderPath, { recursive: true });

  return folderName;
}

export async function saveTaskAudio(
  storagePath: string,
  orderIndex: number,
  totalTasks: number,
  audioBuffer: ArrayBuffer,
): Promise<string> {
  const filename = generateTaskFilename(orderIndex, totalTasks);
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
    filename,
  );

  await fs.writeFile(fullPath, Buffer.from(audioBuffer));

  return filename;
}

export async function deleteProjectFolder(storagePath: string): Promise<void> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    await fs.rm(fullPath, { recursive: true, force: true });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn(`[Storage] Could not delete folder: ${fullPath}`, error);
  }
}

export async function getProjectFiles(storagePath: string): Promise<string[]> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    const files = await fs.readdir(fullPath);
    return files.filter((f) => f.endsWith(SYNTHESIS_CONSTANTS.FILE_EXTENSION));
  } catch {
    return [];
  }
}

export function readProjectFile(
  storagePath: string,
  filename: string,
): Promise<Buffer> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
    filename,
  );
  return fs.readFile(fullPath);
}

export async function projectFolderExists(
  storagePath: string,
): Promise<boolean> {
  const fullPath = path.join(
    SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
    storagePath,
  );

  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\lib\constants.ts

```
// apps/api/src/features/secret-voicer/voice/lib/constants.ts

export const VOICE_SYNC_INTERVAL_HOURS = 5;
export const VOICE_SYNC_CRON = `0 */${VOICE_SYNC_INTERVAL_HOURS} * * *`;

export const VOICE_SYNC_LOG_RETENTION_DAYS = 7;

export const EXTERNAL_VOICES_API_URL = "https://secret-voicer.ru/api/voices/";

// Fields that should NOT trigger changelog (too noisy)
export const IGNORED_EXTERNAL_FIELDS = ["usage_count"] as const;

// Fields that are critical - if changed/removed, block synthesis
export const CRITICAL_EXTERNAL_FIELDS = ["voice_id"] as const;

export const VOICE_RATING_MIN = 1;
export const VOICE_RATING_MAX = 10;
export const VOICE_RATING_DEFAULT = 5;

// Development mode - use mock data if external API fails or no credentials
export const USE_MOCK_DATA_ON_ERROR = true;

```

D:\1_Projects\jstonehub\apps\hub\src\features\root-layout\ui\root-responsive-navigation.tsx

```
import { Button } from "@packages/ui/button";
import { Logo } from "@packages/ui/logo";
import { ResponsiveNavigation } from "@packages/ui/responsive-navigation";
import { Link } from "@tanstack/solid-router";
import { env } from "#hub/shared/config/env";

export function RootResponsiveNavigation() {
  return (
    <ResponsiveNavigation>
      <div class="flex items-center gap-6">
        <Link to="/">
          <Logo appName="hub" />
        </Link>

        <nav class="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="btn-sm">
            {(classes) => (
              <Link
                class={classes}
                to="/voiceover"
                activeProps={{ class: "bg-accent/15 text-accent" }}
              >
                Voiceover
              </Link>
            )}
          </Button>
          <Button variant="ghost" size="btn-sm">
            {(classes) => (
              <Link
                class={classes}
                to="/jokes"
                activeProps={{ class: "bg-accent/15 text-accent" }}
              >
                Anecdotes
              </Link>
            )}
          </Button>
        </nav>
      </div>

      <Button variant="secondary" size="btn-sm">
        {(classes) => (
          <a class={classes} href={env.ADMIN_URL}>
            to Admin
          </a>
        )}
      </Button>
    </ResponsiveNavigation>
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\services\sync-state.ts

```
import {
  getSecretVoicerVoiceSyncState,
  setSecretVoicerVoiceSyncBlocked,
} from "../data/repository";

export const voiceSyncState = {
  async isBlocked(): Promise<boolean> {
    const state = await getSecretVoicerVoiceSyncState();
    return state?.isBlocked ?? false;
  },

  async getBlockReason(): Promise<string | null> {
    const state = await getSecretVoicerVoiceSyncState();
    if (!state?.isBlocked) {
      return null;
    }
    return state.blockReason;
  },

  async block(reason: string): Promise<void> {
    await setSecretVoicerVoiceSyncBlocked(true, reason);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`🚨 [VoiceSync] BLOCKED: ${reason}`);
  },

  async unblock(): Promise<void> {
    await setSecretVoicerVoiceSyncBlocked(false);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("✅ [VoiceSync] Unblocked");
  },

  getState() {
    return getSecretVoicerVoiceSyncState();
  },
};

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\data\table.ts

```
import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { createId } from "@packages/utils/id";
import {
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// === Enums (из контракта) ===

export const synthesisProjectStatusEnum = pgEnum(
  "synthesis_project_status",
  secretVoicerContract.synthesisProjectStatus.values() as [string, ...string[]],
);

export const synthesisTaskStatusEnum = pgEnum(
  "synthesis_task_status",
  secretVoicerContract.synthesisTaskStatus.values() as [string, ...string[]],
);

// === Projects Table ===

export const synthesisProjectTable = pgTable("synthesis_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  name: text("name").notNull(),
  status: synthesisProjectStatusEnum("status").default("PENDING").notNull(),

  // Stats
  totalTasks: integer("total_tasks").default(0).notNull(),
  completedTasks: integer("completed_tasks").default(0).notNull(),
  failedTasks: integer("failed_tasks").default(0).notNull(),

  // Storage
  storagePath: text("storage_path"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// === Tasks Table ===

export const synthesisTaskTable = pgTable("synthesis_tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  projectId: text("project_id")
    .references(() => synthesisProjectTable.id, { onDelete: "cascade" })
    .notNull(),

  orderIndex: integer("order_index").notNull(),

  // Input
  text: text("text").notNull(),
  voiceId: text("voice_id").notNull(),
  rate: real("rate").default(1).notNull(),

  // Status
  status: synthesisTaskStatusEnum("status").default("PENDING").notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  error: text("error"),

  // External API
  externalTaskId: text("external_task_id"),
  externalStatus: text("external_status"),

  // Output
  audioUrl: text("audio_url"),
  localFilePath: text("local_file_path"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\lib\helpers.ts

```
import type {
  ExternalVoice,
  NewSecretVoicerVoice,
  SecretVoicerVoice,
} from "../data/types";
import { IGNORED_EXTERNAL_FIELDS } from "./constants";

// === Private Helpers ===

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (a === null && b === null) {
    return true;
  }
  if (a === undefined && b === undefined) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  if (a === undefined || b === undefined) {
    return false;
  }
  return String(a) === String(b);
}

function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => String(val) === String(sortedB[i]));
}

function fieldToExternalName(field: string): string | null {
  const mapping: Record<string, string> = {
    externalId: "id",
    externalVoiceId: "voice_id",
    externalName: "name",
    externalDescription: "description",
    externalGender: "gender",
    externalLocale: "locale",
    externalPreviewUrl: "preview_url",
    externalPreviewUrlEmotional: "preview_url_emotional",
    externalAvatarUrl: "avatar_url",
    externalAccent: "accent",
    externalAgeGroup: "age_group",
    externalIsMultilingual: "is_multilingual",
    externalStyleTags: "voice_style_tags",
    externalUseCases: "use_cases",
  };
  return mapping[field] ?? null;
}

// === Public Exports ===

/**
 * Maps external API voice to our database format
 */
export function mapExternalVoiceToDb(
  voice: ExternalVoice,
): Omit<NewSecretVoicerVoice, "id"> {
  return {
    externalId: voice.id,
    externalVoiceId: voice.voice_id,
    externalName: voice.name,
    externalDescription: voice.description,
    externalGender: voice.gender,
    externalLocale: voice.locale,
    externalPreviewUrl: voice.preview_url,
    externalPreviewUrlEmotional: voice.preview_url_emotional,
    externalAvatarUrl: voice.avatar_url,
    externalAccent: voice.accent,
    externalAgeGroup: voice.age_group,
    externalIsMultilingual: voice.is_multilingual,
    externalStyleTags: voice.voice_style_tags ?? [],
    externalUseCases: voice.use_cases ?? [],
  };
}

/**
 * Compares external fields and returns changed field names
 */
export function getChangedExternalFields(
  existing: SecretVoicerVoice,
  incoming: ExternalVoice,
): string[] {
  const changes: string[] = [];

  const comparisons: [string, unknown, unknown][] = [
    ["externalId", existing.externalId, incoming.id],
    ["externalName", existing.externalName, incoming.name],
    ["externalDescription", existing.externalDescription, incoming.description],
    ["externalGender", existing.externalGender, incoming.gender],
    ["externalLocale", existing.externalLocale, incoming.locale],
    ["externalPreviewUrl", existing.externalPreviewUrl, incoming.preview_url],
    [
      "externalPreviewUrlEmotional",
      existing.externalPreviewUrlEmotional,
      incoming.preview_url_emotional,
    ],
    ["externalAvatarUrl", existing.externalAvatarUrl, incoming.avatar_url],
    ["externalAccent", existing.externalAccent, incoming.accent],
    ["externalAgeGroup", existing.externalAgeGroup, incoming.age_group],
    [
      "externalIsMultilingual",
      existing.externalIsMultilingual,
      incoming.is_multilingual,
    ],
  ];

  for (const [field, oldVal, newVal] of comparisons) {
    // Skip ignored fields
    const externalFieldName = fieldToExternalName(field);
    if (
      externalFieldName
      && IGNORED_EXTERNAL_FIELDS.includes(
        externalFieldName as (typeof IGNORED_EXTERNAL_FIELDS)[number],
      )
    ) {
      continue;
    }

    if (!isEqual(oldVal, newVal)) {
      changes.push(field);
    }
  }

  // Compare arrays
  if (
    !arraysEqual(
      existing.externalStyleTags ?? [],
      incoming.voice_style_tags ?? [],
    )
  ) {
    changes.push("externalStyleTags");
  }

  if (!arraysEqual(existing.externalUseCases ?? [], incoming.use_cases ?? [])) {
    changes.push("externalUseCases");
  }

  return changes;
}

/**
 * Extract old values for changed fields
 */
export function extractOldValues(
  voice: SecretVoicerVoice,
  fields: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field] = voice[field as keyof SecretVoicerVoice];
  }
  return result;
}

/**
 * Extract new values for changed fields from external voice
 */
export function extractNewValuesFromExternal(
  voice: ExternalVoice,
  fields: string[],
): Record<string, unknown> {
  const mapped = mapExternalVoiceToDb(voice);
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field] = mapped[field as keyof typeof mapped];
  }
  return result;
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\data\types.ts

```
import type { synthesisProjectTable, synthesisTaskTable } from "./table";

// === Database Types ===

export type SynthesisProject = typeof synthesisProjectTable.$inferSelect;
export type NewSynthesisProject = typeof synthesisProjectTable.$inferInsert;
export type UpdateSynthesisProject = Partial<
  Omit<NewSynthesisProject, "id" | "createdAt">
>;

export type SynthesisTask = typeof synthesisTaskTable.$inferSelect;
export type NewSynthesisTask = typeof synthesisTaskTable.$inferInsert;
export type UpdateSynthesisTask = Partial<
  Omit<NewSynthesisTask, "id" | "projectId" | "createdAt">
>;

// === API Input Types ===

export type CreateProjectTaskInput = {
  text: string;
  voiceId: string;
  rate?: number;
};

export type CreateProjectInput = {
  name: string;
  tasks: CreateProjectTaskInput[];
};

// === Status Types ===

export type ProjectStatus = SynthesisProject["status"];
export type TaskStatus = SynthesisTask["status"];

// === Response Types ===

export type ProjectWithTasks = SynthesisProject & {
  tasks: SynthesisTask[];
};

export type ProjectStatusResponse = {
  id: string;
  status: ProjectStatus;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  progress: number; // 0-100
};

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\data\repository.ts

```
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "#api/shared/db";
import { synthesisProjectTable, synthesisTaskTable } from "./table";
import type {
  NewSynthesisProject,
  NewSynthesisTask,
  ProjectStatus,
  SynthesisProject,
  SynthesisTask,
  TaskStatus,
  UpdateSynthesisProject,
  UpdateSynthesisTask,
} from "./types";

// === Projects ===

export async function createSynthesisProject(
  data: NewSynthesisProject,
): Promise<SynthesisProject> {
  const [result] = await db
    .insert(synthesisProjectTable)
    .values(data)
    .returning();
  if (!result) {
    throw new Error("Failed to create project");
  }
  return result;
}

export function getAllSynthesisProjects(): Promise<SynthesisProject[]> {
  return db
    .select()
    .from(synthesisProjectTable)
    .orderBy(sql`${synthesisProjectTable.createdAt} DESC`);
}

export function getSynthesisProjectById(
  id: string,
): Promise<SynthesisProject | undefined> {
  return db.query.synthesisProjectTable.findFirst({
    where: eq(synthesisProjectTable.id, id),
  });
}

export async function updateSynthesisProject(
  id: string,
  data: UpdateSynthesisProject,
): Promise<SynthesisProject | undefined> {
  const [result] = await db
    .update(synthesisProjectTable)
    .set(data)
    .where(eq(synthesisProjectTable.id, id))
    .returning();
  return result;
}

export async function deleteSynthesisProject(
  id: string,
): Promise<SynthesisProject | undefined> {
  const [result] = await db
    .delete(synthesisProjectTable)
    .where(eq(synthesisProjectTable.id, id))
    .returning();
  return result;
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<void> {
  const updates: UpdateSynthesisProject = { status };

  if (status === "PROCESSING") {
    updates.startedAt = new Date();
  } else if (
    status === "COMPLETED"
    || status === "FAILED"
    || status === "PARTIAL"
  ) {
    updates.completedAt = new Date();
  }

  await db
    .update(synthesisProjectTable)
    .set(updates)
    .where(eq(synthesisProjectTable.id, id));
}

export async function updateProjectStats(id: string): Promise<void> {
  const tasks = await db
    .select({ status: synthesisTaskTable.status })
    .from(synthesisTaskTable)
    .where(eq(synthesisTaskTable.projectId, id));

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const failed = tasks.filter((t) => t.status === "FAILED").length;

  let status: ProjectStatus;
  if (completed === total) {
    status = "COMPLETED";
  } else if (failed === total) {
    status = "FAILED";
  } else if (completed > 0 || failed > 0) {
    status = tasks.some((t) => t.status === "PROCESSING")
      ? "PROCESSING"
      : "PARTIAL";
  } else if (tasks.some((t) => t.status === "PROCESSING")) {
    status = "PROCESSING";
  } else {
    status = "PENDING";
  }

  await db
    .update(synthesisProjectTable)
    .set({
      totalTasks: total,
      completedTasks: completed,
      failedTasks: failed,
      status,
      completedAt:
        status === "COMPLETED" || status === "FAILED" || status === "PARTIAL"
          ? new Date()
          : null,
    })
    .where(eq(synthesisProjectTable.id, id));
}

// === Tasks ===

export function createSynthesisTasks(
  tasks: NewSynthesisTask[],
): Promise<SynthesisTask[]> {
  if (tasks.length === 0) {
    return Promise.resolve([]);
  }
  return db.insert(synthesisTaskTable).values(tasks).returning();
}

export function getSynthesisTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(eq(synthesisTaskTable.projectId, projectId))
    .orderBy(synthesisTaskTable.orderIndex);
}

export function getSynthesisTaskById(
  id: string,
): Promise<SynthesisTask | undefined> {
  return db.query.synthesisTaskTable.findFirst({
    where: eq(synthesisTaskTable.id, id),
  });
}

export async function updateSynthesisTask(
  id: string,
  data: UpdateSynthesisTask,
): Promise<SynthesisTask | undefined> {
  const [result] = await db
    .update(synthesisTaskTable)
    .set(data)
    .where(eq(synthesisTaskTable.id, id))
    .returning();
  return result;
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  error?: string,
): Promise<void> {
  const updates: UpdateSynthesisTask = { status, error: error ?? null };

  if (status === "PROCESSING") {
    updates.startedAt = new Date();
  } else if (status === "COMPLETED" || status === "FAILED") {
    updates.completedAt = new Date();
  }

  await db
    .update(synthesisTaskTable)
    .set(updates)
    .where(eq(synthesisTaskTable.id, id));
}

export async function incrementTaskRetryCount(id: string): Promise<number> {
  const [result] = await db
    .update(synthesisTaskTable)
    .set({
      retryCount: sql`${synthesisTaskTable.retryCount} + 1`,
    })
    .where(eq(synthesisTaskTable.id, id))
    .returning({ retryCount: synthesisTaskTable.retryCount });
  return result?.retryCount ?? 0;
}

export function getFailedTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        eq(synthesisTaskTable.status, "FAILED"),
      ),
    );
}

export function getPendingTasksByProjectId(
  projectId: string,
): Promise<SynthesisTask[]> {
  return db
    .select()
    .from(synthesisTaskTable)
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        inArray(synthesisTaskTable.status, ["PENDING", "FAILED"]),
      ),
    );
}

export async function resetTasksForRetry(taskIds: string[]): Promise<void> {
  if (taskIds.length === 0) {
    return;
  }

  await db
    .update(synthesisTaskTable)
    .set({
      status: "PENDING",
      error: null,
      startedAt: null,
      completedAt: null,
    })
    .where(inArray(synthesisTaskTable.id, taskIds));
}

export async function resetAllProjectTasks(projectId: string): Promise<void> {
  await db
    .update(synthesisTaskTable)
    .set({
      status: "PENDING",
      error: null,
      retryCount: 0,
      externalTaskId: null,
      externalStatus: null,
      audioUrl: null,
      localFilePath: null,
      startedAt: null,
      completedAt: null,
    })
    .where(eq(synthesisTaskTable.projectId, projectId));
}

export async function cancelPendingTasks(projectId: string): Promise<void> {
  await db
    .update(synthesisTaskTable)
    .set({ status: "CANCELLED" })
    .where(
      and(
        eq(synthesisTaskTable.projectId, projectId),
        inArray(synthesisTaskTable.status, ["PENDING"]),
      ),
    );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\synthesis\http\controller-v1.ts

```
import { Type as t } from "@sinclair/typebox";
import { Elysia, NotFoundError } from "elysia";
import { zipSync } from "fflate";
import { HTTP_STATUS } from "#api/shared/config/http-status";
import { getSecretVoicerVoiceByExternalVoiceId } from "../../voice/data/repository";
import {
  cancelPendingTasks,
  createSynthesisProject,
  createSynthesisTasks,
  deleteSynthesisProject,
  getAllSynthesisProjects,
  getFailedTasksByProjectId,
  getSynthesisProjectById,
  getSynthesisTaskById,
  getSynthesisTasksByProjectId,
  resetAllProjectTasks,
  resetTasksForRetry,
  updateSynthesisProject,
} from "../data/repository";
import type { CreateProjectInput, NewSynthesisTask } from "../data/types";
import { calculateProgress, validateRate } from "../lib/helpers";
import {
  cancelProject,
  isProjectProcessing,
  pauseProject,
  startProjectProcessing,
} from "../services/processor";
import {
  deleteProjectFolder,
  getProjectFiles,
  readProjectFile,
} from "../services/storage";

const Nullable = <T extends import("@sinclair/typebox").TSchema>(schema: T) =>
  t.Union([schema, t.Null()]);

const TaskInputDto = t.Object({
  text: t.String({ minLength: 1, maxLength: 5000 }),
  voiceId: t.String({ minLength: 1 }),
  rate: t.Optional(t.Number({ minimum: 0.5, maximum: 2.0 })),
});

const CreateProjectDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  tasks: t.Array(TaskInputDto, { minItems: 1 }),
});

const ProjectDto = t.Object({
  id: t.String(),
  name: t.String(),
  status: t.String(),
  totalTasks: t.Number(),
  completedTasks: t.Number(),
  failedTasks: t.Number(),
  storagePath: Nullable(t.String()),
  createdAt: t.Date(),
  startedAt: Nullable(t.Date()),
  completedAt: Nullable(t.Date()),
  updatedAt: t.Date(),
});

const TaskDto = t.Object({
  id: t.String(),
  projectId: t.String(),
  orderIndex: t.Number(),
  text: t.String(),
  voiceId: t.String(),
  rate: t.Number(),
  status: t.String(),
  retryCount: t.Number(),
  error: Nullable(t.String()),
  externalTaskId: Nullable(t.String()),
  audioUrl: Nullable(t.String()),
  localFilePath: Nullable(t.String()),
  createdAt: t.Date(),
  startedAt: Nullable(t.Date()),
  completedAt: Nullable(t.Date()),
  updatedAt: t.Date(),
});

const ProjectStatusDto = t.Object({
  id: t.String(),
  status: t.String(),
  totalTasks: t.Number(),
  completedTasks: t.Number(),
  failedTasks: t.Number(),
  progress: t.Number(),
  isProcessing: t.Boolean(),
});

function handleBackgroundError(error: unknown): void {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.error("[Synthesis] Background processing failed:", error);
}

export const synthesisControllerV1 = new Elysia({ prefix: "/synthesis" })
  .post(
    "/projects",
    async ({ body, set }) => {
      const input = body as CreateProjectInput;

      const voiceIds = [...new Set(input.tasks.map((t) => t.voiceId))];

      const voiceValidationResults = await Promise.all(
        voiceIds.map(async (voiceId) => ({
          voiceId,
          exists: Boolean(await getSecretVoicerVoiceByExternalVoiceId(voiceId)),
        })),
      );

      const invalidVoices = voiceValidationResults
        .filter((result) => !result.exists)
        .map((result) => result.voiceId);

      if (invalidVoices.length > 0) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return {
          error: "Invalid voice IDs",
          invalidVoices,
        };
      }

      const project = await createSynthesisProject({
        name: input.name,
        status: "PENDING",
        totalTasks: input.tasks.length,
      });

      const tasksToCreate: NewSynthesisTask[] = input.tasks.map(
        (task, index) => ({
          projectId: project.id,
          orderIndex: index + 1,
          text: task.text,
          voiceId: task.voiceId,
          rate: validateRate(task.rate),
          status: "PENDING",
        }),
      );

      const tasks = await createSynthesisTasks(tasksToCreate);

      set.status = HTTP_STATUS.CREATED;
      return { project, tasks };
    },
    {
      body: CreateProjectDto,
    },
  )

  .get(
    "/projects",
    () => {
      return getAllSynthesisProjects();
    },
    {
      response: t.Array(ProjectDto),
    },
  )

  .get("/projects/:id", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const tasks = await getSynthesisTasksByProjectId(id);
    return { ...project, tasks };
  })

  .delete("/projects/:id", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.storagePath) {
      await deleteProjectFolder(project.storagePath);
    }

    await deleteSynthesisProject(id);

    return { success: true, id };
  })

  .get(
    "/projects/:id/status",
    async ({ params: { id } }) => {
      const project = await getSynthesisProjectById(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      return {
        id: project.id,
        status: project.status,
        totalTasks: project.totalTasks,
        completedTasks: project.completedTasks,
        failedTasks: project.failedTasks,
        progress: calculateProgress(project.completedTasks, project.totalTasks),
        isProcessing: isProjectProcessing(id),
      };
    },
    {
      response: ProjectStatusDto,
    },
  )

  .post("/projects/:id/start", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    startProjectProcessing(id).catch(handleBackgroundError);

    return { success: true, message: "Processing started" };
  })

  .post("/projects/:id/pause", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    await pauseProject(id);
    return { success: true, message: "Project paused" };
  })

  .post("/projects/:id/cancel", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    await cancelProject(id);
    await cancelPendingTasks(id);
    return { success: true, message: "Project cancelled" };
  })

  .post("/projects/:id/retryFailed", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const failedTasks = await getFailedTasksByProjectId(id);
    if (failedTasks.length === 0) {
      return { success: true, message: "No failed tasks to retry", count: 0 };
    }

    await resetTasksForRetry(failedTasks.map((t) => t.id));
    await updateSynthesisProject(id, { status: "PENDING" });

    startProjectProcessing(id).catch(handleBackgroundError);

    return {
      success: true,
      message: `Retrying ${failedTasks.length} failed tasks`,
      count: failedTasks.length,
    };
  })

  .post("/projects/:id/restart", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.storagePath) {
      await deleteProjectFolder(project.storagePath);
    }

    await resetAllProjectTasks(id);
    await updateSynthesisProject(id, {
      status: "PENDING",
      storagePath: null,
      completedTasks: 0,
      failedTasks: 0,
      startedAt: null,
      completedAt: null,
    });

    startProjectProcessing(id).catch(handleBackgroundError);

    return { success: true, message: "Project restarted" };
  })

  .get(
    "/projects/:id/tasks",
    async ({ params: { id } }) => {
      const project = await getSynthesisProjectById(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      return getSynthesisTasksByProjectId(id);
    },
    {
      response: t.Array(TaskDto),
    },
  )

  .post("/tasks/:taskId/retry", async ({ params: { taskId } }) => {
    const task = await getSynthesisTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    await resetTasksForRetry([taskId]);
    startProjectProcessing(task.projectId).catch(handleBackgroundError);

    return { success: true, message: "Task retry started" };
  })

  .get("/projects/:id/download", async ({ params: { id }, set }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (!project.storagePath) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No files to download" };
    }

    const files = await getProjectFiles(project.storagePath);
    if (files.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No files to download" };
    }

    const fileEntries = await Promise.all(
      files.map(async (filename) => {
        const fileBuffer = await readProjectFile(
          project.storagePath ?? "",
          filename,
        );
        return [filename, new Uint8Array(fileBuffer)] as const;
      }),
    );

    const zipData: Record<string, Uint8Array> = Object.fromEntries(fileEntries);

    const ZipCompressionLevel = 9;
    const zipped = zipSync(zipData, { level: ZipCompressionLevel });
    const zipBuffer = Buffer.from(zipped);

    set.headers["content-type"] = "application/zip";
    set.headers["content-disposition"] =
      `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, "_")}.zip"`;

    return zipBuffer;
  });

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\ui\preview-panel.tsx

```
// apps/hub/src/features/voiceover/ui/preview-panel.tsx
import { Alert } from "@packages/ui/alert";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { CheckCircle, Play, XCircle } from "lucide-solid";
import { For, Show } from "solid-js";
import type { ProjectPreview } from "../model/types";
import { TaskPreviewCard } from "./task-preview-card";

type PreviewPanelProps = {
  preview: ProjectPreview;
  isCreating: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function PreviewPanel(props: PreviewPanelProps) {
  const validCount = () => props.preview.tasks.filter((t) => t.isValid).length;
  const invalidCount = () =>
    props.preview.tasks.filter((t) => !t.isValid).length;

  return (
    <Card
      title={props.preview.name || "Без названия"}
      description={`${props.preview.tasks.length} задач для озвучки`}
      content={
        <div class="space-y-4">
          {/* Summary */}
          <div class="flex items-center gap-3 flex-wrap">
            <Badge variant="success">
              <CheckCircle class="w-3 h-3" />
              {validCount()} валидных
            </Badge>
            <Show when={invalidCount() > 0}>
              <Badge variant="error">
                <XCircle class="w-3 h-3" />
                {invalidCount()} с ошибками
              </Badge>
            </Show>
          </div>

          {/* Errors */}
          <Show when={props.preview.errors.length > 0}>
            <Alert
              variant="error"
              title="Ошибки валидации"
              description={props.preview.errors.join("; ")}
            />
          </Show>

          {/* Tasks */}
          <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <For each={props.preview.tasks}>
              {(task) => <TaskPreviewCard task={task} />}
            </For>
          </div>
        </div>
      }
      footer={
        <div class="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={props.onCancel}
            disabled={props.isCreating}
          >
            Назад
          </Button>
          <Button
            onClick={props.onSubmit}
            disabled={!props.preview.isValid || props.isCreating}
          >
            <Play class="w-4 h-4" />
            {props.isCreating ? "Создание..." : "Создать и запустить"}
          </Button>
        </div>
      }
    />
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\ui\project-card.tsx

```
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Progress } from "@packages/ui/progress";
import { Typography } from "@packages/ui/typography";
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  Pause,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-solid";
import { createMemo, Show } from "solid-js";
import { synthesisApi } from "../model/api";
import type { ProjectStatus, SynthesisProject } from "../model/types";

const PERCENT_MULTIPLIER = 100;

type ProjectCardProps = {
  project: SynthesisProject;
  onView: () => void;
  onDelete: () => void;
  onRetry: () => void;
};

type StatusConfig = {
  label: string;
  variant: "success" | "error" | "warning" | "info" | "muted";
  icon: typeof Clock;
};

const STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  PENDING: { label: "Ожидает", variant: "muted", icon: Clock },
  PROCESSING: { label: "Обработка", variant: "info", icon: Loader2 },
  COMPLETED: { label: "Завершён", variant: "success", icon: CheckCircle },
  PARTIAL: { label: "Частично", variant: "warning", icon: XCircle },
  FAILED: { label: "Ошибка", variant: "error", icon: XCircle },
  PAUSED: { label: "Пауза", variant: "muted", icon: Pause },
  CANCELLED: { label: "Отменён", variant: "muted", icon: XCircle },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: "Неизвестно",
  variant: "muted",
  icon: Clock,
};

function StatusIcon(props: { status: ProjectStatus; icon: typeof Clock }) {
  const Icon = props.icon;
  return (
    <Icon
      class="w-4 h-4"
      classList={{ "animate-spin": props.status === "PROCESSING" }}
    />
  );
}

export function ProjectCard(props: ProjectCardProps) {
  const config = createMemo(
    () => STATUS_CONFIG[props.project.status] ?? DEFAULT_CONFIG,
  );
  const progress = createMemo(() => {
    const total = props.project.totalTasks;
    if (total === 0) {
      return 0;
    }
    return Math.round(
      (props.project.completedTasks / total) * PERCENT_MULTIPLIER,
    );
  });

  const canDownload = () =>
    props.project.status === "COMPLETED" || props.project.status === "PARTIAL";

  const canRetry = () =>
    props.project.failedTasks > 0 && props.project.status !== "PROCESSING";

  return (
    <Card
      padding="sm"
      content={
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <Typography level={4} class="font-medium truncate">
                {props.project.name}
              </Typography>
              <Typography level={6} color="muted">
                {new Date(props.project.createdAt).toLocaleString("ru-RU")}
              </Typography>
            </div>
            <Badge variant={config().variant}>
              <StatusIcon status={props.project.status} icon={config().icon} />
              {config().label}
            </Badge>
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Прогресс</span>
              <span>
                {props.project.completedTasks} / {props.project.totalTasks}
              </span>
            </div>
            <Progress value={progress()} />
          </div>

          <Show when={props.project.failedTasks > 0}>
            <Typography level={6} class="text-error-foreground">
              {props.project.failedTasks} задач с ошибками
            </Typography>
          </Show>

          <div class="flex items-center gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="btn-xs" onClick={props.onView}>
              <Eye class="w-3 h-3" />
              Детали
            </Button>

            <Show when={canDownload()}>
              <Button variant="outline" size="btn-xs">
                {(buttonClass) => (
                  <a
                    class={buttonClass}
                    href={synthesisApi.downloadZipUrl(props.project.id)}
                    download=""
                  >
                    <Download class="w-3 h-3" />
                    ZIP
                  </a>
                )}
              </Button>
            </Show>

            <Show when={canRetry()}>
              <Button variant="outline" size="btn-xs" onClick={props.onRetry}>
                <RotateCcw class="w-3 h-3" />
                Повторить
              </Button>
            </Show>

            <div class="flex-1" />

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={props.onDelete}
              class="text-error-foreground hover:bg-error/10"
            >
              <Trash2 class="w-3 h-3" />
            </Button>
          </div>
        </div>
      }
    />
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\ui\json-editor.tsx

```
// apps/hub/src/features/voiceover/ui/json-editor.tsx
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Textarea } from "@packages/ui/textarea";
import { Eye } from "lucide-solid";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onPreview: () => void;
  disabled?: boolean;
};

export function JsonEditor(props: JsonEditorProps) {
  const exampleJson = JSON.stringify(
    {
      name: "Мой проект озвучки",
      tasks: [
        { text: "Привет, мир!", voiceId: "voice-id-1", rate: 1.0 },
        { text: "Это тестовый текст.", voiceId: "voice-id-2", rate: 1.2 },
      ],
    },
    null,
    2,
  );

  const insertExample = () => {
    props.onChange(exampleJson);
  };

  return (
    <Card
      title="JSON ввод"
      description="Вставьте JSON с задачами для озвучки"
      content={
        <div class="space-y-4">
          <Textarea
            placeholder={exampleJson}
            value={props.value}
            onInput={(e) => props.onChange(e.currentTarget.value)}
            disabled={props.disabled}
            rows={12}
            class="font-mono text-sm"
          />
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="btn-sm"
              onClick={insertExample}
              disabled={props.disabled}
            >
              Вставить пример
            </Button>
            <Button
              onClick={props.onPreview}
              disabled={props.disabled || !props.value.trim()}
            >
              <Eye class="w-4 h-4" />
              Предпросмотр
            </Button>
          </div>
        </div>
      }
    />
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\lib\mock-data.ts

```
// apps/api/src/features/secret-voicer/voice/lib/mock-data.ts

import type { ExternalVoice } from "../data/types";

export const MOCK_VOICES: ExternalVoice[] = [
  {
    id: 1,
    voice_id: "mock-voice-adam",
    name: "Adam (Mock)",
    gender: "MALE",
    locale: "en-US",
    is_multilingual: true,
    preview_url: null,
    preview_url_emotional: null,
    usage_count: 1000,
    avatar_url: null,
    description: "A warm and friendly male voice",
    accent: "American",
    age_group: "young-adult",
    voice_style_tags: ["friendly", "warm", "conversational"],
    use_cases: ["narration", "podcasts", "audiobooks"],
  },
  {
    id: 2,
    voice_id: "mock-voice-bella",
    name: "Bella (Mock)",
    gender: "FEMALE",
    locale: "en-US",
    is_multilingual: true,
    preview_url: null,
    preview_url_emotional: null,
    usage_count: 800,
    avatar_url: null,
    description: "A bright and energetic female voice",
    accent: "American",
    age_group: "young-adult",
    voice_style_tags: ["energetic", "bright", "upbeat"],
    use_cases: ["commercials", "explainers", "social-media"],
  },
  {
    id: 3,
    voice_id: "mock-voice-charlie",
    name: "Charlie (Mock)",
    gender: "MALE",
    locale: "en-GB",
    is_multilingual: false,
    preview_url: null,
    preview_url_emotional: null,
    usage_count: 500,
    avatar_url: null,
    description: "A deep and authoritative British voice",
    accent: "British",
    age_group: "middle-aged",
    voice_style_tags: ["authoritative", "deep", "professional"],
    use_cases: ["documentaries", "corporate", "training"],
  },
];

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\services\sync-service.ts

```
import { and, eq } from "drizzle-orm";
import { browserFingerprintTable } from "#api/features/browser-fingerprint";
import { db } from "#api/shared/db";
import { secretVoicerCredentialTable } from "../../credential/table";
import {
  createSecretVoicerVoiceSyncEvents,
  createSecretVoicerVoices,
  deleteOldSecretVoicerVoiceSyncEvents,
  getSecretVoicerVoicesByExternalVoiceIds,
  getSecretVoicerVoicesNotInExternalIds,
  updateSecretVoicerVoiceExternalFields,
  upsertSecretVoicerVoiceSyncState,
} from "../data/repository";
import type {
  ExternalVoice,
  ExternalVoicesResponse,
  NewSecretVoicerVoiceSyncEvent,
} from "../data/types";
import {
  EXTERNAL_VOICES_API_URL,
  USE_MOCK_DATA_ON_ERROR,
  VOICE_SYNC_LOG_RETENTION_DAYS,
} from "../lib/constants";
import {
  extractNewValuesFromExternal,
  extractOldValues,
  getChangedExternalFields,
  mapExternalVoiceToDb,
} from "../lib/helpers";
import { MOCK_VOICES } from "../lib/mock-data";
import { voiceSyncState } from "./sync-state";

const REDIRECT_STATUS_MIN = 300;
const REDIRECT_STATUS_MAX = 400;

type SyncStats = {
  totalVoices: number;
  added: number;
  removed: number;
  updated: number;
  unchanged: number;
};

type SyncResult = {
  success: boolean;
  stats: SyncStats;
  error?: string;
  hasCriticalChanges: boolean;
  usedMockData?: boolean;
};

type VoiceUpdate = {
  id: string;
  data: ReturnType<typeof mapExternalVoiceToDb>;
};

type AuthHeaders = {
  cookie: string;
  "x-csrftoken": string;
  "user-agent": string;
  "sec-ch-ua": string;
  "sec-ch-ua-mobile": string;
  "sec-ch-ua-platform": string;
};

async function getActiveCredentialWithFingerprint(): Promise<AuthHeaders | null> {
  const result = await db
    .select({
      csrfToken: secretVoicerCredentialTable.csrfToken,
      sessionId: secretVoicerCredentialTable.sessionId,
      userAgent: browserFingerprintTable.userAgent,
      secChUa: browserFingerprintTable.secChUa,
      secChUaMobile: browserFingerprintTable.secChUaMobile,
      secChUaPlatform: browserFingerprintTable.secChUaPlatform,
    })
    .from(secretVoicerCredentialTable)
    .innerJoin(
      browserFingerprintTable,
      eq(secretVoicerCredentialTable.fingerprintId, browserFingerprintTable.id),
    )
    .where(
      and(
        eq(secretVoicerCredentialTable.isActive, true),
        eq(browserFingerprintTable.isActive, true),
      ),
    )
    .limit(1);

  const cred = result[0];

  if (!cred) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] No active credentials found");
    return null;
  }

  const csrf = cred.csrfToken.trim();
  const session = cred.sessionId.trim();

  return {
    cookie: `csrftoken=${csrf}; sessionid=${session}`,
    "x-csrftoken": csrf,
    "user-agent": cred.userAgent,
    "sec-ch-ua": cred.secChUa,
    "sec-ch-ua-mobile": cred.secChUaMobile,
    "sec-ch-ua-platform": cred.secChUaPlatform,
  };
}

async function fetchExternalVoices(): Promise<{
  voices: ExternalVoice[];
  isMock: boolean;
}> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`📡 [VoiceSync] Fetching from: ${EXTERNAL_VOICES_API_URL}`);

  const authHeaders = await getActiveCredentialWithFingerprint();

  if (!authHeaders) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] No credentials available");
    if (USE_MOCK_DATA_ON_ERROR) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔧 [VoiceSync] Using mock data (${MOCK_VOICES.length} voices)`,
      );
      return { voices: MOCK_VOICES, isMock: true };
    }
    throw new Error(
      "No active credentials configured. Please add credentials first.",
    );
  }

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9",
      origin: "https://secret-voicer.ru",
      referer: "https://secret-voicer.ru/app/",
      ...authHeaders,
    };

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("🔐 [VoiceSync] Using authenticated request");

    const response = await fetch(EXTERNAL_VOICES_API_URL, {
      method: "GET",
      headers,
      redirect: "manual",
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`📡 [VoiceSync] Response status: ${response.status}`);

    if (
      response.status >= REDIRECT_STATUS_MIN
      && response.status < REDIRECT_STATUS_MAX
    ) {
      throw new Error(
        `Auth failed (redirect ${response.status}). Session may be expired. Update credentials.`,
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes("<html") || errorText.includes("<!DOCTYPE")) {
        throw new Error(
          "Auth failed - received login page. Session expired. Update credentials.",
        );
      }
      throw new Error(`External API error: ${response.status}`);
    }

    const data = (await response.json()) as ExternalVoicesResponse;
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `📡 [VoiceSync] Received ${data.grouped_voices?.length ?? 0} groups`,
    );

    const voices = data.grouped_voices.flatMap((group) => group.voices);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`📡 [VoiceSync] Total voices extracted: ${voices.length}`);

    return { voices, isMock: false };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn("⚠️ [VoiceSync] External API failed:", error);

    if (USE_MOCK_DATA_ON_ERROR) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔧 [VoiceSync] Using mock data (${MOCK_VOICES.length} voices)`,
      );
      return { voices: MOCK_VOICES, isMock: true };
    }

    throw error;
  }
}

async function processRemovedVoices(
  externalVoiceIds: string[],
  syncEvents: NewSecretVoicerVoiceSyncEvent[],
  stats: SyncStats,
): Promise<boolean> {
  const removedVoices =
    await getSecretVoicerVoicesNotInExternalIds(externalVoiceIds);

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `🔍 [VoiceSync] Checking for removed voices. Found: ${removedVoices.length}`,
  );

  if (removedVoices.length === 0) {
    return false;
  }

  stats.removed = removedVoices.length;

  for (const voice of removedVoices) {
    syncEvents.push({
      eventType: "VOICE_REMOVED",
      isCritical: true,
      voiceId: voice.id,
      externalVoiceId: voice.externalVoiceId,
      voiceName: voice.externalName,
      oldValues: { externalVoiceId: voice.externalVoiceId },
    });
  }

  const removedNames = removedVoices.map((v) => v.externalName).join(", ");
  await voiceSyncState.block(
    `${removedVoices.length} voice(s) removed from external API: ${removedNames}`,
  );

  return true;
}

async function processExternalVoices(
  externalVoices: ExternalVoice[],
  syncEvents: NewSecretVoicerVoiceSyncEvent[],
  stats: SyncStats,
): Promise<void> {
  const externalVoiceIds = externalVoices.map((v) => v.voice_id);
  const existingVoices =
    await getSecretVoicerVoicesByExternalVoiceIds(externalVoiceIds);

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`🔍 [VoiceSync] Existing voices in DB: ${existingVoices.length}`);

  const existingMap = new Map(
    existingVoices.map((v) => [v.externalVoiceId, v]),
  );

  const voicesToInsert: ReturnType<typeof mapExternalVoiceToDb>[] = [];
  const voicesToUpdate: VoiceUpdate[] = [];

  for (const extVoice of externalVoices) {
    const existing = existingMap.get(extVoice.voice_id);

    if (existing) {
      const changedFields = getChangedExternalFields(existing, extVoice);

      if (changedFields.length > 0) {
        const updateData = mapExternalVoiceToDb(extVoice);
        voicesToUpdate.push({ id: existing.id, data: updateData });
        stats.updated++;

        syncEvents.push({
          eventType: "VOICE_UPDATED",
          isCritical: false,
          voiceId: existing.id,
          externalVoiceId: extVoice.voice_id,
          voiceName: extVoice.name,
          changedFields,
          oldValues: extractOldValues(existing, changedFields),
          newValues: extractNewValuesFromExternal(extVoice, changedFields),
        });
      } else {
        stats.unchanged++;
      }
    } else {
      voicesToInsert.push(mapExternalVoiceToDb(extVoice));
      stats.added++;

      syncEvents.push({
        eventType: "VOICE_ADDED",
        isCritical: false,
        externalVoiceId: extVoice.voice_id,
        voiceName: extVoice.name,
        newValues: { name: extVoice.name, gender: extVoice.gender },
      });
    }
  }

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `📊 [VoiceSync] To insert: ${voicesToInsert.length}, To update: ${voicesToUpdate.length}`,
  );

  if (voicesToInsert.length > 0) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `➕ [VoiceSync] Inserting ${voicesToInsert.length} new voices...`,
    );
    const inserted = await createSecretVoicerVoices(voicesToInsert);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`✅ [VoiceSync] Inserted ${inserted.length} voices`);
  }

  if (voicesToUpdate.length > 0) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`🔄 [VoiceSync] Updating ${voicesToUpdate.length} voices...`);
    await Promise.all(
      voicesToUpdate.map(({ id, data }) =>
        updateSecretVoicerVoiceExternalFields(id, data),
      ),
    );
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("✅ [VoiceSync] Updated voices");
  }
}

function cleanupOldEvents(): Promise<number> {
  const retentionDate = new Date();
  retentionDate.setDate(
    retentionDate.getDate() - VOICE_SYNC_LOG_RETENTION_DAYS,
  );
  return deleteOldSecretVoicerVoiceSyncEvents(retentionDate);
}

export async function syncVoicesFromExternalApi(): Promise<SyncResult> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log("🚀 [VoiceSync] Starting sync...");

  const stats: SyncStats = {
    totalVoices: 0,
    added: 0,
    removed: 0,
    updated: 0,
    unchanged: 0,
  };

  let hasCriticalChanges = false;
  let usedMockData = false;

  try {
    const { voices: externalVoices, isMock } = await fetchExternalVoices();
    usedMockData = isMock;
    stats.totalVoices = externalVoices.length;

    if (externalVoices.length === 0) {
      throw new Error("External API returned 0 voices - possible API error");
    }

    const externalVoiceIds = externalVoices.map((v) => v.voice_id);
    const syncEvents: NewSecretVoicerVoiceSyncEvent[] = [];

    if (!usedMockData) {
      hasCriticalChanges = await processRemovedVoices(
        externalVoiceIds,
        syncEvents,
        stats,
      );
    }

    await processExternalVoices(externalVoices, syncEvents, stats);

    if (syncEvents.length > 0) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `📝 [VoiceSync] Creating ${syncEvents.length} sync events...`,
      );
      await createSecretVoicerVoiceSyncEvents(syncEvents);
    }

    const deletedOld = await cleanupOldEvents();
    if (deletedOld > 0) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(`🗑️ [VoiceSync] Cleaned up ${deletedOld} old events`);
    }

    await upsertSecretVoicerVoiceSyncState({
      lastSyncAt: new Date(),
      lastSyncSuccess: true,
      lastSyncError: usedMockData
        ? "Used mock data (external API unavailable)"
        : null,
      lastSyncStats: stats,
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      "✅ [VoiceSync] Completed! Stats:",
      stats,
      usedMockData ? "(mock data)" : "",
    );

    return { success: true, stats, hasCriticalChanges, usedMockData };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("❌ [VoiceSync] Failed:", errorMsg);

    await upsertSecretVoicerVoiceSyncState({
      lastSyncAt: new Date(),
      lastSyncSuccess: false,
      lastSyncError: errorMsg,
    });

    return {
      success: false,
      stats,
      error: errorMsg,
      hasCriticalChanges,
    };
  }
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\ui\voiceover-page.tsx

```
// apps/hub/src/features/voiceover/ui/voiceover-page.tsx
import { Container } from "@packages/ui/container";
import { Typography } from "@packages/ui/typography";
import { Show } from "solid-js";
import { useVoiceover } from "../model/hooks";
import { JsonEditor } from "./json-editor";
import { PreviewPanel } from "./preview-panel";
import { ProjectDetailsDialog } from "./project-details-dialog";
import { ProjectsList } from "./projects-list";
import { VoiceReplacer } from "./voice-replacer";

export function VoiceoverPage() {
  const {
    state,
    voices,
    selectedProject,
    jsonInput,
    setJsonInput,
    preview,
    isCreating,
    openDialog,
    closeDialog,
    updatePreview,
    replaceVoice,
    createProject,
    deleteProject,
    retryFailedTasks,
    restartProject,
    fetchProjectDetails,
    refetch,
  } = useVoiceover();

  const handleViewProject = async (id: string) => {
    await fetchProjectDetails(id);
    openDialog("details", id);
  };

  return (
    <Container class="py-8 space-y-8">
      {/* Header */}
      <div>
        <Typography type="title" level={1}>
          Озвучка
        </Typography>
        <Typography color="muted" class="mt-2">
          Создавайте проекты озвучки текстов с помощью Secret Voicer
        </Typography>
      </div>

      {/* Create Section */}
      <div class="space-y-4">
        <Show
          when={preview()}
          fallback={
            <JsonEditor
              value={jsonInput()}
              onChange={setJsonInput}
              onPreview={updatePreview}
              disabled={isCreating()}
            />
          }
        >
          {(p) => (
            <>
              <VoiceReplacer
                preview={p()}
                voices={voices()}
                onReplace={replaceVoice}
              />
              <PreviewPanel
                preview={p()}
                isCreating={isCreating()}
                onSubmit={createProject}
                onCancel={() => {
                  setJsonInput("");
                  updatePreview();
                }}
              />
            </>
          )}
        </Show>
      </div>

      {/* Projects List */}
      <ProjectsList
        projects={state().projects}
        isLoading={state().isLoading}
        error={state().error}
        onRefresh={refetch}
        onView={handleViewProject}
        onDelete={deleteProject}
        onRetry={retryFailedTasks}
      />

      {/* Details Dialog */}
      <Show when={selectedProject()}>
        {(project) => (
          <ProjectDetailsDialog
            open={state().activeDialog === "details"}
            project={project()}
            onClose={closeDialog}
            onRetryFailed={() => retryFailedTasks(project().id)}
            onRestart={() => restartProject(project().id)}
            onDelete={() => deleteProject(project().id)}
          />
        )}
      </Show>
    </Container>
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\ui\task-preview-card.tsx

```
// apps/hub/src/features/voiceover/ui/task-preview-card.tsx
import { Badge } from "@packages/ui/badge";
import { Typography } from "@packages/ui/typography";
import { AlertCircle, CheckCircle, Mic } from "lucide-solid";
import { Show } from "solid-js";
import type { TaskPreview } from "../model/types";

type TaskPreviewCardProps = {
  task: TaskPreview;
};

export function TaskPreviewCard(props: TaskPreviewCardProps) {
  return (
    <div
      class="p-4 rounded-lg border transition-colors"
      classList={{
        "border-border bg-card": props.task.isValid,
        "border-error bg-error/5": !props.task.isValid,
      }}
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0 space-y-2">
          {/* Index & Status */}
          <div class="flex items-center gap-2">
            <Badge variant={props.task.isValid ? "secondary" : "error"}>
              #{props.task.index}
            </Badge>
            <Show
              when={props.task.isValid}
              fallback={<AlertCircle class="w-4 h-4 text-error-foreground" />}
            >
              <CheckCircle class="w-4 h-4 text-success-foreground" />
            </Show>
          </div>

          {/* Text preview */}
          <Typography level={4} class="line-clamp-2">
            {props.task.text || (
              <span class="text-muted-foreground italic">Пустой текст</span>
            )}
          </Typography>

          {/* Voice info */}
          <div class="flex items-center gap-2 text-sm">
            <Mic class="w-3 h-3 text-muted-foreground" />
            <Show
              when={props.task.voiceName}
              fallback={
                <span class="text-error-foreground">
                  {props.task.voiceId || "Не указан"}
                </span>
              }
            >
              <span class="text-foreground">{props.task.voiceName}</span>
              <span class="text-muted-foreground">({props.task.voiceId})</span>
            </Show>
          </div>

          {/* Rate */}
          <Typography level={6} color="muted">
            Скорость: {props.task.rate}x
          </Typography>

          {/* Error */}
          <Show when={props.task.error}>
            <Typography level={6} class="text-error-foreground">
              {props.task.error}
            </Typography>
          </Show>
        </div>
      </div>
    </div>
  );
}

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\http\controller-admin-v1.ts

```
import { type TSchema, Type as t } from "@sinclair/typebox";
import { Elysia, NotFoundError } from "elysia";
import {
  deleteAllSecretVoicerVoiceSyncEvents,
  deleteSecretVoicerVoiceSyncEvent,
  getAllSecretVoicerVoiceSyncEvents,
  getAllSecretVoicerVoices,
  getSecretVoicerVoiceById,
  updateSecretVoicerVoice,
} from "../data/repository";
import { VOICE_RATING_MAX, VOICE_RATING_MIN } from "../lib/constants";
import { syncVoicesFromExternalApi } from "../services/sync-service";
import { voiceSyncState } from "../services/sync-state";

const Nullable = <T extends TSchema>(schema: T) => t.Union([schema, t.Null()]);

const VoiceDto = t.Object({
  id: t.String(),
  externalId: t.Number(),
  externalVoiceId: t.String(),
  externalName: t.String(),
  externalDescription: Nullable(t.String()),
  externalGender: t.String(),
  externalLocale: Nullable(t.String()),
  externalPreviewUrl: Nullable(t.String()),
  externalPreviewUrlEmotional: Nullable(t.String()),
  externalAvatarUrl: Nullable(t.String()),
  externalAccent: Nullable(t.String()),
  externalAgeGroup: Nullable(t.String()),
  externalIsMultilingual: Nullable(t.Boolean()),
  externalStyleTags: Nullable(t.Array(t.String())),
  externalUseCases: Nullable(t.Array(t.String())),
  emotionSupport: t.String(),
  testedLanguages: Nullable(t.Array(t.String())),
  rating: t.Number(),
  notes: Nullable(t.String()),
  isHidden: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

const UpdateVoiceDto = t.Object({
  emotionSupport: t.Optional(t.String()),
  testedLanguages: t.Optional(t.Array(t.String())),
  rating: t.Optional(
    t.Number({ minimum: VOICE_RATING_MIN, maximum: VOICE_RATING_MAX }),
  ),
  notes: t.Optional(Nullable(t.String())),
  isHidden: t.Optional(t.Boolean()),
});

const SyncEventDto = t.Object({
  id: t.String(),
  eventType: t.String(),
  isCritical: t.Boolean(),
  voiceId: Nullable(t.String()),
  externalVoiceId: Nullable(t.String()),
  voiceName: Nullable(t.String()),
  changedFields: Nullable(t.Array(t.String())),
  oldValues: Nullable(t.Record(t.String(), t.Unknown())),
  newValues: Nullable(t.Record(t.String(), t.Unknown())),
  createdAt: t.Date(),
});

const SyncStateDto = t.Object({
  isBlocked: t.Boolean(),
  blockReason: Nullable(t.String()),
  blockedAt: Nullable(t.Date()),
  lastSyncAt: Nullable(t.Date()),
  lastSyncSuccess: Nullable(t.Boolean()),
  lastSyncError: Nullable(t.String()),
  lastSyncStats: Nullable(
    t.Object({
      totalVoices: t.Number(),
      added: t.Number(),
      removed: t.Number(),
      updated: t.Number(),
      unchanged: t.Number(),
    }),
  ),
});

export const secretVoicerVoiceAdminControllerV1 = new Elysia({
  prefix: "/voices",
})
  .get("/", () => getAllSecretVoicerVoices(), {
    response: t.Array(VoiceDto),
  })

  .get(
    "/:id",
    async ({ params: { id } }) => {
      const voice = await getSecretVoicerVoiceById(id);
      if (!voice) {
        throw new NotFoundError("Voice not found");
      }
      return voice;
    },
    { response: VoiceDto },
  )

  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const voice = await updateSecretVoicerVoice(id, body);
      if (!voice) {
        throw new NotFoundError("Voice not found");
      }
      return voice;
    },
    {
      body: UpdateVoiceDto,
      response: VoiceDto,
    },
  )

  .get("/sync-events", () => getAllSecretVoicerVoiceSyncEvents(), {
    response: t.Array(SyncEventDto),
  })

  .delete(
    "/sync-events/:id",
    async ({ params: { id } }) => {
      const event = await deleteSecretVoicerVoiceSyncEvent(id);
      if (!event) {
        throw new NotFoundError("Sync event not found");
      }
      return { success: true, id };
    },
    {
      response: t.Object({ success: t.Boolean(), id: t.String() }),
    },
  )

  .delete(
    "/sync-events",
    async () => {
      const count = await deleteAllSecretVoicerVoiceSyncEvents();
      return { success: true, deletedCount: count };
    },
    {
      response: t.Object({ success: t.Boolean(), deletedCount: t.Number() }),
    },
  )

  .get(
    "/sync-state",
    async () => {
      const state = await voiceSyncState.getState();
      return (
        state ?? {
          isBlocked: false,
          blockReason: null,
          blockedAt: null,
          lastSyncAt: null,
          lastSyncSuccess: null,
          lastSyncError: null,
          lastSyncStats: null,
        }
      );
    },
    {
      response: SyncStateDto,
    },
  )

  .post(
    "/sync-state/unblock",
    async () => {
      await voiceSyncState.unblock();
      return { success: true };
    },
    {
      response: t.Object({ success: t.Boolean() }),
    },
  )

  // === Manual Sync Trigger ===
  .post("/sync", () => syncVoicesFromExternalApi(), {
    response: t.Object({
      success: t.Boolean(),
      stats: t.Object({
        totalVoices: t.Number(),
        added: t.Number(),
        removed: t.Number(),
        updated: t.Number(),
        unchanged: t.Number(),
      }),
      error: t.Optional(t.String()),
      hasCriticalChanges: t.Boolean(),
    }),
  });

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\ui\voice-replacer.tsx

```
// apps/hub/src/features/voiceover/ui/voice-replacer.tsx
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Select } from "@packages/ui/select";
import { Typography } from "@packages/ui/typography";
import { ArrowRight, RefreshCw } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import type { ProjectPreview, PublicVoice } from "../model/types";

type VoiceReplacerProps = {
  preview: ProjectPreview;
  voices: PublicVoice[];
  onReplace: (oldId: string, newId: string) => void;
};

export function VoiceReplacer(props: VoiceReplacerProps) {
  const [fromVoice, setFromVoice] = createSignal("");
  const [toVoice, setToVoice] = createSignal("");

  // Get unique voices used in project
  const usedVoiceIds = createMemo(() => {
    const ids = new Set<string>();
    for (const task of props.preview.tasks) {
      if (task.voiceId) {
        ids.add(task.voiceId);
      }
    }
    return [...ids];
  });

  const voiceOptions = createMemo(() =>
    props.voices.map((v) => ({
      value: v.externalVoiceId,
      label: `${v.name} (${v.externalVoiceId})`,
    })),
  );

  const handleReplace = () => {
    const from = fromVoice();
    const to = toVoice();
    if (from && to && from !== to) {
      props.onReplace(from, to);
      setFromVoice("");
      setToVoice("");
    }
  };

  return (
    <Show when={usedVoiceIds().length > 0}>
      <Card
        title="Замена голосов"
        description="Массовая замена голоса во всех задачах"
        content={
          <div class="space-y-4">
            {/* Used voices */}
            <div>
              <Typography level={5} color="muted" class="mb-2">
                Используемые голоса:
              </Typography>
              <div class="flex flex-wrap gap-2">
                <For each={usedVoiceIds()}>
                  {(voiceId) => {
                    const voice = props.voices.find(
                      (v) => v.externalVoiceId === voiceId,
                    );
                    const count = props.preview.tasks.filter(
                      (t) => t.voiceId === voiceId,
                    ).length;
                    return (
                      <div class="px-2 py-1 rounded bg-muted text-sm">
                        {voice?.name ?? voiceId}{" "}
                        <span class="text-muted-foreground">({count})</span>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>

            {/* Replace controls */}
            <div class="flex items-end gap-2 flex-wrap">
              <div class="flex-1 min-w-[150px]">
                <Typography level={6} color="muted" class="mb-1">
                  Заменить
                </Typography>
                <Select
                  value={fromVoice()}
                  onChange={setFromVoice}
                  options={voiceOptions()}
                  placeholder="Выберите голос..."
                />
              </div>

              <ArrowRight class="w-5 h-5 text-muted-foreground mb-2" />

              <div class="flex-1 min-w-[150px]">
                <Typography level={6} color="muted" class="mb-1">
                  На
                </Typography>
                <Select
                  value={toVoice()}
                  onChange={setToVoice}
                  options={voiceOptions()}
                  placeholder="Выберите голос..."
                />
              </div>

              <Button
                onClick={handleReplace}
                disabled={
                  !(fromVoice() && toVoice()) || fromVoice() === toVoice()
                }
              >
                <RefreshCw class="w-4 h-4" />
                Заменить
              </Button>
            </div>
          </div>
        }
      />
    </Show>
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\model\types.ts

```
import type {
  SynthesisProject,
  SynthesisTask,
} from "#api/features/secret-voicer/synthesis/types";

export type {
  ProjectStatus,
  SynthesisProject,
  SynthesisTask,
  TaskStatus,
} from "#api/features/secret-voicer/synthesis/types";

export type CreateProjectInput = {
  name: string;
  tasks: {
    text: string;
    voiceId: string;
    rate?: number;
  }[];
};

export type VoiceoverDialogType = "create" | "details" | null;

export type VoiceoverState = {
  projects: SynthesisProject[];
  isLoading: boolean;
  error: string | null;
  activeDialog: VoiceoverDialogType;
  selectedProjectId: string | null;
};

export type ProjectWithTasks = SynthesisProject & {
  tasks: SynthesisTask[];
};

export type TaskPreview = {
  index: number;
  text: string;
  voiceId: string;
  voiceName: string | null;
  rate: number;
  isValid: boolean;
  error?: string;
};

export type ProjectPreview = {
  name: string;
  tasks: TaskPreview[];
  isValid: boolean;
  errors: string[];
};

export type PublicVoice = {
  id: string;
  externalVoiceId: string;
  name: string;
  gender: string;
};

```

D:\1_Projects\jstonehub\apps\hub\src\features\jokes\ui\jokes-page.tsx

```
import { Container } from "@packages/ui/container";
import { Typography } from "@packages/ui/typography";

export function JokesPage() {
  return (
    <Container class="py-8">
      <Typography type="title" level={1}>
        Анекдоты
      </Typography>
      <Typography color="muted" class="mt-2">
        Коллекция лучших анекдотов для озвучки
      </Typography>
    </Container>
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\ui\projects-list.tsx

```
// apps/hub/src/features/voiceover/ui/projects-list.tsx
import { Alert } from "@packages/ui/alert";
import { Button } from "@packages/ui/button";
import { Typography } from "@packages/ui/typography";
import { RefreshCw } from "lucide-solid";
import { For, Show } from "solid-js";
import type { SynthesisProject } from "../model/types";
import { ProjectCard } from "./project-card";

type ProjectsListProps = {
  projects: SynthesisProject[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
};

export function ProjectsList(props: ProjectsListProps) {
  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <Typography type="title" level={4}>
          Мои проекты ({props.projects.length})
        </Typography>
        <Button
          variant="outline"
          size="btn-sm"
          onClick={props.onRefresh}
          disabled={props.isLoading}
        >
          <RefreshCw
            class="w-4 h-4"
            classList={{ "animate-spin": props.isLoading }}
          />
          Обновить
        </Button>
      </div>

      {/* Error */}
      <Show when={props.error}>
        {(err) => <Alert variant="error" title="Ошибка" description={err()} />}
      </Show>

      {/* Projects */}
      <Show
        when={!props.isLoading || props.projects.length > 0}
        fallback={
          <div class="text-center py-8">
            <Typography color="muted">Загрузка...</Typography>
          </div>
        }
      >
        <Show
          when={props.projects.length > 0}
          fallback={
            <div class="text-center py-8 border border-dashed border-border rounded-lg">
              <Typography color="muted">
                Нет проектов. Создайте первый!
              </Typography>
            </div>
          }
        >
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <For each={props.projects}>
              {(project) => (
                <ProjectCard
                  project={project}
                  onView={() => props.onView(project.id)}
                  onDelete={() => props.onDelete(project.id)}
                  onRetry={() => props.onRetry(project.id)}
                />
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\model\hooks.ts

```
import { createMemo, createSignal, onMount } from "solid-js";
import { synthesisApi, voicesApi } from "./api";
import type {
  CreateProjectInput,
  ProjectPreview,
  ProjectWithTasks,
  PublicVoice,
  TaskPreview,
  VoiceoverDialogType,
  VoiceoverState,
} from "./types";

const RATE_MIN = 0.5;
const RATE_MAX = 2.0;
const DEFAULT_RATE = 1;

export function useVoiceover() {
  const [state, setState] = createSignal<VoiceoverState>({
    projects: [],
    isLoading: true,
    error: null,
    activeDialog: null,
    selectedProjectId: null,
  });

  const [voices, setVoices] = createSignal<PublicVoice[]>([]);
  const [selectedProject, setSelectedProject] =
    createSignal<ProjectWithTasks | null>(null);

  const [jsonInput, setJsonInput] = createSignal("");
  const [preview, setPreview] = createSignal<ProjectPreview | null>(null);
  const [isCreating, setIsCreating] = createSignal(false);

  const voiceMap = createMemo(() => {
    const map = new Map<string, PublicVoice>();
    for (const voice of voices()) {
      map.set(voice.externalVoiceId, voice);
    }
    return map;
  });

  const openDialog = (type: VoiceoverDialogType, projectId?: string) => {
    setState((s) => ({
      ...s,
      activeDialog: type,
      selectedProjectId: projectId ?? null,
    }));
  };

  const closeDialog = () => {
    setState((s) => ({
      ...s,
      activeDialog: null,
      selectedProjectId: null,
    }));
    setSelectedProject(null);
  };

  const fetchProjects = async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const projects = await synthesisApi.getAll();
      setState((s) => ({ ...s, projects, isLoading: false }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load projects";
      setState((s) => ({ ...s, error: msg, isLoading: false }));
    }
  };

  const fetchVoices = async () => {
    try {
      const data = await voicesApi.getAll();
      setVoices(data as PublicVoice[]);
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to fetch voices:", e);
    }
  };

  const fetchProjectDetails = async (id: string) => {
    try {
      const project = await synthesisApi.getById(id);
      setSelectedProject(project);
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to fetch project details:", e);
    }
  };

  const validateTask = (
    t: Record<string, unknown>,
    voiceMapRef: Map<string, PublicVoice>,
  ): { errors: string[]; voiceName: string | null } => {
    const taskErrors: string[] = [];

    if (!t.text || typeof t.text !== "string") {
      taskErrors.push("text обязателен");
    }

    if (!t.voiceId || typeof t.voiceId !== "string") {
      taskErrors.push("voiceId обязателен");
    }

    const rate = typeof t.rate === "number" ? t.rate : DEFAULT_RATE;
    if (rate < RATE_MIN || rate > RATE_MAX) {
      taskErrors.push(`rate должен быть от ${RATE_MIN} до ${RATE_MAX}`);
    }

    const voiceId = String(t.voiceId || "");
    const voice = voiceMapRef.get(voiceId);

    if (voiceId && !voice) {
      taskErrors.push(`Голос "${voiceId}" не найден`);
    }

    return { errors: taskErrors, voiceName: voice?.name ?? null };
  };

  const parseJsonInput = (json: string): ProjectPreview | null => {
    if (!json.trim()) {
      return null;
    }

    try {
      const parsed = JSON.parse(json);
      const errors: string[] = [];

      if (!parsed.name || typeof parsed.name !== "string") {
        errors.push("Поле 'name' обязательно");
      }

      if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
        errors.push("Массив 'tasks' должен содержать хотя бы одну задачу");
      }

      const voiceMapRef = voiceMap();

      const tasks: TaskPreview[] = (parsed.tasks || []).map(
        (task: unknown, index: number) => {
          const t = task as Record<string, unknown>;
          const { errors: taskErrors, voiceName } = validateTask(
            t,
            voiceMapRef,
          );

          const rate = typeof t.rate === "number" ? t.rate : DEFAULT_RATE;
          const voiceId = String(t.voiceId || "");

          return {
            index: index + 1,
            text: String(t.text || ""),
            voiceId,
            voiceName,
            rate,
            isValid: taskErrors.length === 0,
            error: taskErrors.join("; "),
          };
        },
      );

      const invalidTasks = tasks.filter((t) => !t.isValid);
      if (invalidTasks.length > 0) {
        errors.push(`${invalidTasks.length} задач с ошибками`);
      }

      return {
        name: String(parsed.name || ""),
        tasks,
        isValid: errors.length === 0 && tasks.every((t) => t.isValid),
        errors,
      };
    } catch {
      return {
        name: "",
        tasks: [],
        isValid: false,
        errors: ["Невалидный JSON"],
      };
    }
  };

  const updatePreview = () => {
    const result = parseJsonInput(jsonInput());
    setPreview(result);
  };

  const replaceVoice = (oldVoiceId: string, newVoiceId: string) => {
    try {
      const parsed = JSON.parse(jsonInput());
      parsed.tasks = parsed.tasks.map((task: Record<string, unknown>) => {
        if (task.voiceId === oldVoiceId) {
          return { ...task, voiceId: newVoiceId };
        }
        return task;
      });
      setJsonInput(JSON.stringify(parsed, null, 2));
      updatePreview();
    } catch {
      // Invalid JSON, ignore
    }
  };

  const createProject = async () => {
    const p = preview();
    if (!p?.isValid) {
      return;
    }

    setIsCreating(true);
    try {
      const input: CreateProjectInput = {
        name: p.name,
        tasks: p.tasks.map((t) => ({
          text: t.text,
          voiceId: t.voiceId,
          rate: t.rate,
        })),
      };

      const { project } = await synthesisApi.create(input);

      await synthesisApi.start(project.id);

      await fetchProjects();

      setJsonInput("");
      setPreview(null);

      openDialog("details", project.id);
      await fetchProjectDetails(project.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create project";
      setState((s) => ({ ...s, error: msg }));
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await synthesisApi.delete(id);
      await fetchProjects();
      closeDialog();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to delete project:", e);
    }
  };

  const retryFailedTasks = async (id: string) => {
    try {
      await synthesisApi.retryFailed(id);
      await fetchProjectDetails(id);
      await fetchProjects();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to retry:", e);
    }
  };

  const restartProject = async (id: string) => {
    try {
      await synthesisApi.restart(id);
      await fetchProjectDetails(id);
      await fetchProjects();
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to restart:", e);
    }
  };

  onMount(async () => {
    await Promise.all([fetchProjects(), fetchVoices()]);
  });

  return {
    state,
    voices,
    voiceMap,
    selectedProject,
    jsonInput,
    setJsonInput,
    preview,
    isCreating,
    openDialog,
    closeDialog,
    updatePreview,
    replaceVoice,
    createProject,
    deleteProject,
    retryFailedTasks,
    restartProject,
    fetchProjectDetails,
    refetch: fetchProjects,
  };
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\ui\project-details-dialog.tsx

```
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Progress } from "@packages/ui/progress";
import { Typography } from "@packages/ui/typography";
import {
  CheckCircle,
  Clock,
  Download,
  Loader2,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-solid";
import { createMemo, For, Show } from "solid-js";
import { synthesisApi } from "../model/api";
import type { ProjectWithTasks, TaskStatus } from "../model/types";

const PERCENT_MULTIPLIER = 100;

type ProjectDetailsDialogProps = {
  open: boolean;
  project: ProjectWithTasks;
  onClose: () => void;
  onRetryFailed: () => void;
  onRestart: () => void;
  onDelete: () => void;
};

type TaskStatusConfig = {
  label: string;
  variant: "success" | "error" | "warning" | "info" | "muted";
};

const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusConfig> = {
  PENDING: { label: "Ожидает", variant: "muted" },
  PROCESSING: { label: "Обработка", variant: "info" },
  COMPLETED: { label: "Готово", variant: "success" },
  FAILED: { label: "Ошибка", variant: "error" },
  CANCELLED: { label: "Отменено", variant: "muted" },
};

const DEFAULT_TASK_CONFIG: TaskStatusConfig = {
  label: "Неизвестно",
  variant: "muted",
};

export function ProjectDetailsDialog(props: ProjectDetailsDialogProps) {
  const progress = createMemo(() => {
    const total = props.project.totalTasks;
    if (total === 0) {
      return 0;
    }
    return Math.round(
      (props.project.completedTasks / total) * PERCENT_MULTIPLIER,
    );
  });

  const canDownload = () =>
    props.project.status === "COMPLETED" || props.project.status === "PARTIAL";

  const hasFailedTasks = () => props.project.failedTasks > 0;

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
      title={props.project.name}
      description={`Создан: ${new Date(props.project.createdAt).toLocaleString("ru-RU")}`}
      class="max-w-2xl"
      footer={
        <div class="flex items-center gap-2 flex-wrap">
          <Show when={hasFailedTasks()}>
            <Button variant="outline" onClick={props.onRetryFailed}>
              <RotateCcw class="w-4 h-4" />
              Повторить ошибки
            </Button>
          </Show>
          <Button variant="outline" onClick={props.onRestart}>
            <RotateCcw class="w-4 h-4" />
            Перезапустить всё
          </Button>
          <Show when={canDownload()}>
            <Button variant="outline">
              {(buttonClass) => (
                <a
                  class={buttonClass}
                  href={synthesisApi.downloadZipUrl(props.project.id)}
                  download=""
                >
                  <Download class="w-4 h-4" />
                  Скачать ZIP
                </a>
              )}
            </Button>
          </Show>
          <div class="flex-1" />
          <Button
            variant="ghost"
            onClick={props.onDelete}
            class="text-error-foreground"
          >
            <Trash2 class="w-4 h-4" />
            Удалить
          </Button>
        </div>
      }
    >
      <div class="space-y-6">
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Общий прогресс</span>
            <span>
              {props.project.completedTasks} / {props.project.totalTasks} задач
            </span>
          </div>
          <Progress value={progress()} />
          <Show when={props.project.failedTasks > 0}>
            <Typography level={6} class="text-error-foreground">
              {props.project.failedTasks} задач с ошибками
            </Typography>
          </Show>
        </div>

        <div class="space-y-2">
          <Typography level={5} color="muted">
            Задачи
          </Typography>
          <div class="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            <For each={props.project.tasks}>
              {(task) => {
                const config =
                  TASK_STATUS_CONFIG[task.status] ?? DEFAULT_TASK_CONFIG;
                return (
                  <div class="p-3 rounded-lg border border-border bg-card">
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" size="sm">
                            #{task.orderIndex}
                          </Badge>
                          <Badge variant={config.variant} size="sm">
                            {task.status === "PROCESSING" && (
                              <Loader2 class="w-3 h-3 animate-spin" />
                            )}
                            {task.status === "COMPLETED" && (
                              <CheckCircle class="w-3 h-3" />
                            )}
                            {task.status === "FAILED" && (
                              <XCircle class="w-3 h-3" />
                            )}
                            {task.status === "PENDING" && (
                              <Clock class="w-3 h-3" />
                            )}
                            {config.label}
                          </Badge>
                        </div>
                        <Typography level={5} class="line-clamp-2">
                          {task.text}
                        </Typography>
                        <Typography level={6} color="muted">
                          {task.voiceId} • {task.rate}x
                        </Typography>
                        <Show when={task.error}>
                          <Typography
                            level={6}
                            class="text-error-foreground mt-1"
                          >
                            {task.error}
                          </Typography>
                        </Show>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

```

D:\1_Projects\jstonehub\apps\hub\src\features\voiceover\model\api.ts

```
// apps/hub/src/features/voiceover/model/api.ts
import { client } from "#hub/shared/api/client";
import type {
  CreateProjectInput,
  ProjectWithTasks,
  SynthesisProject,
} from "./types";

function createApiError(error: unknown): Error {
  if (error && typeof error === "object" && "value" in error) {
    const value = error.value as Record<string, unknown>;
    if (typeof value.message === "string") {
      return new Error(value.message);
    }
    if (typeof value.error === "string") {
      return new Error(value.error);
    }
  }
  return new Error("Request failed");
}

export const synthesisApi = {
  getAll: async (): Promise<SynthesisProject[]> => {
    const response =
      await client.v1.admin["secret-voicer"].synthesis.projects.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data ?? []) as SynthesisProject[];
  },

  getById: async (id: string): Promise<ProjectWithTasks> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .get();
    // const response = await client.v1.admin["secret-voicer"].synthesis.projects[
    //   ":id"
    // ]({ id }).get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as ProjectWithTasks;
  },

  create: async (
    input: CreateProjectInput,
  ): Promise<{ project: SynthesisProject }> => {
    const response =
      await client.v1.admin["secret-voicer"].synthesis.projects.post(input);
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as { project: SynthesisProject };
  },

  delete: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .delete();
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  start: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .start.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  pause: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .pause.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  cancel: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .cancel.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  retryFailed: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .retryFailed.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  restart: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .restart.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  getStatus: async (id: string) => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .status.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data;
  },

  getTasks: async (id: string) => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .tasks.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data;
  },

  retryTask: async (taskId: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .tasks({ taskId })
      .retry.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  downloadZipUrl: (id: string) =>
    `/api/v1/admin/secret-voicer/synthesis/projects/${id}/download`,
};

// Voices API (public)
export const voicesApi = {
  getAll: async () => {
    const response = await client.v1.public["secret-voicer"].voices.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data ?? [];
  },
};

```

D:\1_Projects\jstonehub\apps\api\src\features\secret-voicer\voice\http\controller-public-v1.ts

```
import { Type as t } from "@sinclair/typebox";
import { Elysia } from "elysia";
import { getPublicSecretVoicerVoices } from "../data/repository";

const Nullable = <T extends import("@sinclair/typebox").TSchema>(schema: T) =>
  t.Union([schema, t.Null()]);

const PublicVoiceDto = t.Object({
  id: t.String(),
  externalVoiceId: t.String(),
  name: t.String(),
  gender: t.String(),
  locale: Nullable(t.String()),
  accent: Nullable(t.String()),
  ageGroup: Nullable(t.String()),
  isMultilingual: t.Boolean(),
  styleTags: t.Array(t.String()),
  useCases: t.Array(t.String()),
  previewUrl: Nullable(t.String()),
  // Custom fields
  emotionSupport: t.String(),
  testedLanguages: t.Array(t.String()),
  rating: t.Number(),
});

export const secretVoicerVoicePublicControllerV1 = new Elysia({
  prefix: "/voices",
}).get(
  "/",
  async () => {
    const voices = await getPublicSecretVoicerVoices();

    return voices.map((v) => ({
      id: v.id,
      externalVoiceId: v.externalVoiceId,
      name: v.externalName,
      gender: v.externalGender,
      locale: v.externalLocale,
      accent: v.externalAccent,
      ageGroup: v.externalAgeGroup,
      isMultilingual: v.externalIsMultilingual ?? false,
      styleTags: v.externalStyleTags ?? [],
      useCases: v.externalUseCases ?? [],
      previewUrl: v.externalPreviewUrl,
      emotionSupport: v.emotionSupport,
      testedLanguages: v.testedLanguages ?? [],
      rating: v.rating,
    }));
  },
  {
    response: t.Array(PublicVoiceDto),
  },
);

```

А вот такой был промт:
# Профессиональный промт для реализации системы синтеза и обработки аудио

## Контекст проекта

**Проект:** JStoneHub — монорепозиторий с тремя приложениями:
- `apps/api` — Elysia + Bun + PostgreSQL + Drizzle ORM
- `apps/admin` — SolidJS админ-панель
- `apps/hub` — SolidJS пользовательский интерфейс

**Существующая инфраструктура:**
- Docker Compose с PostgreSQL
- Интеграция с внешним API Secret Voicer (синтез речи)
- Система credentials и browser fingerprints для авторизации
- Архитектура feature-based модулей согласно `docs/architecture.md`

---

## Задача 1: Система синтеза аудио (Secret Voicer Synthesis)

### 1.1 Общее описание

Создать полноценную систему для массового синтеза аудио через Secret Voicer API с возможностью:
- Создания проектов с множеством задач синтеза
- Параллельной обработки всех задач
- Отслеживания прогресса в реальном времени
- Скачивания результатов (отдельные файлы, ZIP-архив, объединённый файл)
- Интеграции с другими фичами через событийную систему

### 1.2 Входные данные проекта

**Формат ввода (JSON через textarea):**
```json
{
  "name": "Название проекта",
  "tasks": [
    { "text": "Текст для озвучки", "voiceId": "voice-id-123", "rate": 1.0 },
    { "text": "Другой текст", "voiceId": "voice-id-456", "rate": 1.2 }
  ]
}
```

**UX-флоу на Hub:**
1. Пользователь вставляет JSON в textarea
2. Нажимает кнопку "Предпросмотр"
3. Появляется визуальный редактор:
   - Каждая задача в отдельной карточке с информацией о голосе
   - Текст визуально выделен
   - Возможность массовой замены голоса (voice-123 → voice-999 во всех задачах)
   - Возможность выбора из голосов, уже используемых в проекте
4. После подтверждения — отправка на сервер

**Валидация (обязательно на клиенте И сервере):**
- Все `voiceId` должны существовать в базе голосов
- `rate` обязателен (0.5 - 2.0)
- `text` не пустой
- При ошибке валидации — показать конкретную ошибку с указанием проблемной задачи

**Лимиты:** Нет ограничений на количество задач в проекте

### 1.3 Параллелизм и обработка

- **Все задачи обрабатываются параллельно** без очереди
- **Все проекты независимы** и обрабатываются параллельно
- Порядок синтеза/скачивания не важен — важен только правильный нейминг файлов по индексу
- Файлы именуются по индексу в массиве: `1.mp3`, `2.mp3`, ... (без leading zeros)
- Таймаут на ожидание синтеза одной задачи: **3 минуты**
- Автоматический retry при ошибке: **3 попытки** с экспоненциальной задержкой

### 1.4 Credentials

- Использовать **первый активный credential** из базы
- Один credential на все проекты
- Без ротации credentials при ошибках (пока)

### 1.5 Storage

**Структура:**
```
storage/
└── secret-voicer/
    └── {safe-project-name}_{id-prefix}/
        ├── 1.mp3
        ├── 2.mp3
        └── ...
```

**Правила именования папок:**
- Имя проекта: убрать спецсимволы, заменить пробелы на `_`, обрезать до 40 символов
- ID prefix: первые 5-8 символов ID проекта
- Итого: максимум ~50 символов для безопасности ОС

**Метаданные:** Не хранить в файловой системе — всё в базе данных

### 1.6 Жизненный цикл проекта

**Статусы проекта:**
| Статус | Описание |
|--------|----------|
| `PENDING` | Создан, ожидает обработки |
| `PROCESSING` | Задачи в работе |
| `COMPLETED` | Все задачи успешны |
| `PARTIAL` | Часть успешна, часть failed |
| `FAILED` | Все задачи failed |
| `PAUSED` | Приостановлен вручную |
| `CANCELLED` | Отменён до завершения |

**Статусы задачи:**
| Статус | Описание |
|--------|----------|
| `PENDING` | Ожидает обработки |
| `PROCESSING` | В процессе синтеза |
| `COMPLETED` | Успешно, файл скачан |
| `FAILED` | Ошибка после 3 попыток |

**Действия с проектом:**
- Удалить (+ удалить все файлы из storage)
- Перезапустить failed задачи
- Перезапустить ВСЕ задачи (переозвучка с нуля)
- Приостановить/возобновить
- Отменить

**При удалении проекта:** Обязательно удалять папку из storage

### 1.7 API Rate Limiting (подготовка)

- Сделать настраиваемый параметр: максимум запросов в минуту/день
- Сделать настраиваемую задержку между запросами (по умолчанию 0)
- Пока использовать очень высокие значения (фактически без ограничений)

### 1.8 События для интеграции

Реализовать простую событийную систему (EventEmitter или подобное) для оповещения других фичей:
- `synthesis.project.created` — проект создан
- `synthesis.project.completed` — все задачи завершены успешно
- `synthesis.project.partial` — завершён с ошибками
- `synthesis.project.failed` — все задачи failed
- `synthesis.task.completed` — отдельная задача завершена
- `synthesis.task.failed` — отдельная задача failed

---

## Задача 2: Обработка аудио (Audio Processing)

### 2.1 Общее описание

Отдельная фича для обработки аудио файлов:
- Удаление/нормализация пауз
- Склейка нескольких файлов
- Настраиваемые паузы между частями

### 2.2 Входные данные

**На Hub (страница `/audio-processing`):**
- File picker для выбора файлов (MP3, WAV)
- Максимальный размер: ~2 ГБ суммарно (настраиваемо)
- При нескольких файлах — сортировка в natural order (`1, 2, 10, 20` а не `1, 10, 2, 20`)

### 2.3 Настройки обработки

| Параметр | Описание | Диапазон | По умолчанию |
|----------|----------|----------|--------------|
| `silenceThreshold` | Порог тишины (dB) | -60 to -20 | -40 |
| `minSilenceDuration` | Мин. длина паузы для обрезки (сек) | 0.1 - 2.0 | 0.5 |
| `pauseBetweenChunks` | Пауза внутри файла после обрезки (сек) | 0 - 3.0 | 0.3 |
| `pauseBetweenFiles` | Пауза между разными файлами (сек) | 0 - 5.0 | 1.0 |
| `pauseAtStart` | Пауза в начале итогового файла (сек) | 0 - 5.0 | 0 |
| `pauseAtEnd` | Пауза в конце итогового файла (сек) | 0 - 5.0 | 0 |

### 2.4 Выходной формат

- Выбор формата: MP3 или WAV
- Битрейт: автоматически брать максимальный из входных файлов
- Громкость: не нормализовать (оставить как есть)

### 2.5 Интеграция с синтезом

Для проектов Secret Voicer добавить:
1. **"Скачать ZIP"** — все raw файлы без обработки
2. **"Скачать объединённый"** — применить настройки обработки и склеить

**Кэширование обработанных файлов:**
- Кэшировать на диске после первой обработки
- Срок хранения кэша: 7 дней
- Кнопка "Обработать заново" появляется после первой обработки
- При удалении проекта — удалять и кэш

### 2.6 Страница "Мои обработанные файлы"

На Hub создать страницу со списком:
- Файлы из кэша (которые ещё не истекли)
- Возможность скачать
- Возможность удалить конкретный файл
- Возможность очистить весь кэш

---

## Задача 3: Инфраструктура

### 3.1 Docker Compose

Добавить Redis для очередей:
```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: jstonehub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
```

### 3.2 Background Workers

Использовать Redis + BullMQ для:
- Очереди задач синтеза
- Очереди обработки аудио
- Управление retry/delays

### 3.3 FFmpeg

- Использовать FFmpeg через child process (Bun.spawn)
- Основные команды: обрезка тишины, склейка, конвертация
- Обработка ошибок FFmpeg

### 3.4 Real-time обновления

Выбрать **Server-Sent Events (SSE)** как самый простой вариант:
- Elysia поддерживает SSE из коробки
- Клиент подписывается на события проекта
- Сервер пушит обновления статусов

---

## Задача 4: Структура файлов

### API (apps/api/src/features/)

```
secret-voicer/
├── credential/           # Существующий модуль
├── voice/               # Существующий модуль
├── synthesis/           # НОВЫЙ модуль
│   ├── data/
│   │   ├── table.ts          # Drizzle схема (projects, tasks)
│   │   ├── repository.ts     # CRUD операции
│   │   └── types.ts
│   ├── lib/
│   │   ├── constants.ts      # Таймауты, лимиты
│   │   ├── helpers.ts        # Утилиты (safe folder name, etc)
│   │   └── validation.ts     # Valibot схемы
│   ├── services/
│   │   ├── processor.ts      # Основная логика синтеза
│   │   ├── storage.ts        # Работа с файлами
│   │   └── events.ts         # EventEmitter
│   ├── http/
│   │   ├── controller-v1.ts  # REST endpoints
│   │   └── sse.ts            # SSE endpoints
│   ├── index.ts
│   └── types.ts

audio-processing/         # НОВАЯ фича
├── data/
│   ├── table.ts              # Кэш обработанных файлов
│   ├── repository.ts
│   └── types.ts
├── lib/
│   ├── constants.ts
│   ├── helpers.ts
│   ├── ffmpeg.ts             # FFmpeg wrapper
│   └── validation.ts
├── services/
│   └── processor.ts          # Логика обработки
├── http/
│   └── controller-v1.ts
├── index.ts
└── types.ts
```

### Admin (apps/admin/src/features/)

```
secret-voicer/
├── credential/          # Существующий
├── voice/              # Существующий
├── synthesis/          # НОВЫЙ модуль
│   ├── lib/
│   ├── model/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── ui/
│   │   ├── page.tsx
│   │   ├── table.tsx
│   │   ├── project-row.tsx
│   │   ├── task-list.tsx
│   │   ├── create-dialog.tsx
│   │   └── ...
│   ├── index.ts
│   └── types.ts
```

### Hub (apps/hub/src/features/)

```
voiceover/               # Существующий → расширить
├── lib/
├── model/
├── ui/
│   ├── page.tsx              # JSON input + preview + projects list
│   ├── json-editor.tsx
│   ├── task-preview.tsx
│   ├── voice-replacer.tsx
│   ├── projects-list.tsx
│   └── project-card.tsx
├── index.ts
└── types.ts

audio-processing/        # НОВАЯ фича
├── lib/
├── model/
├── ui/
│   ├── page.tsx              # File upload + settings + result
│   ├── file-picker.tsx
│   ├── settings-panel.tsx
│   ├── processed-files-page.tsx
│   └── ...
├── index.ts
└── types.ts
```

---

## Задача 5: База данных

### Новые таблицы

**synthesis_projects:**
```sql
- id (text, PK)
- name (text, NOT NULL)
- status (enum: PENDING, PROCESSING, COMPLETED, PARTIAL, FAILED, PAUSED, CANCELLED)
- total_tasks (integer)
- completed_tasks (integer)
- failed_tasks (integer)
- storage_path (text) -- путь к папке
- created_at (timestamp)
- updated_at (timestamp)
- completed_at (timestamp, nullable)
```

**synthesis_tasks:**
```sql
- id (text, PK)
- project_id (text, FK)
- order_index (integer, NOT NULL) -- позиция в массиве
- text (text, NOT NULL)
- voice_id (text, NOT NULL)
- rate (decimal, NOT NULL)
- status (enum: PENDING, PROCESSING, COMPLETED, FAILED)
- external_task_id (text, nullable) -- ID от Secret Voicer
- audio_url (text, nullable) -- URL от Secret Voicer
- local_file_path (text, nullable) -- путь к скачанному файлу
- error (text, nullable)
- retry_count (integer, default 0)
- started_at (timestamp, nullable)
- completed_at (timestamp, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

**processed_audio_cache:**
```sql
- id (text, PK)
- source_type (enum: SYNTHESIS_PROJECT, UPLOADED_FILES)
- source_id (text, nullable) -- project_id если от синтеза
- file_hash (text) -- для идентификации уникальности
- settings_hash (text) -- хэш настроек обработки
- output_format (enum: MP3, WAV)
- file_path (text)
- file_size (integer)
- expires_at (timestamp)
- created_at (timestamp)
```

---

## Задача 6: API Endpoints

### Synthesis

```
POST   /v1/admin/secret-voicer/synthesis/projects      # Создать проект
GET    /v1/admin/secret-voicer/synthesis/projects      # Список проектов
GET    /v1/admin/secret-voicer/synthesis/projects/:id  # Детали проекта + задачи
DELETE /v1/admin/secret-voicer/synthesis/projects/:id  # Удалить (+ файлы)
POST   /v1/admin/secret-voicer/synthesis/projects/:id/retry-failed   # Перезапустить failed
POST   /v1/admin/secret-voicer/synthesis/projects/:id/retry-all      # Перезапустить всё
POST   /v1/admin/secret-voicer/synthesis/projects/:id/pause          # Приостановить
POST   /v1/admin/secret-voicer/synthesis/projects/:id/resume         # Возобновить
POST   /v1/admin/secret-voicer/synthesis/projects/:id/cancel         # Отменить

POST   /v1/admin/secret-voicer/synthesis/tasks/:id/retry  # Перезапустить одну задачу

GET    /v1/admin/secret-voicer/synthesis/projects/:id/download/zip      # Скачать ZIP
GET    /v1/admin/secret-voicer/synthesis/projects/:id/download/merged   # Скачать объединённый
POST   /v1/admin/secret-voicer/synthesis/projects/:id/process           # Запустить обработку

GET    /v1/admin/secret-voicer/synthesis/events/:projectId  # SSE endpoint
```

### Audio Processing

```
POST   /v1/admin/audio-processing/process    # Загрузить файлы + настройки → получить job ID
GET    /v1/admin/audio-processing/jobs/:id   # Статус обработки
GET    /v1/admin/audio-processing/jobs/:id/download  # Скачать результат
GET    /v1/admin/audio-processing/cache      # Список кэшированных файлов
DELETE /v1/admin/audio-processing/cache/:id  # Удалить из кэша
DELETE /v1/admin/audio-processing/cache      # Очистить весь кэш
```

---

## Задача 7: UI требования

### Hub - Страница озвучки (/voiceover)

**Секция 1: Создание проекта**
- Textarea для JSON
- Кнопка "Предпросмотр"
- Visual preview с карточками задач
- Панель замены голосов
- Кнопка "Создать проект"

**Секция 2: Список проектов**
- Таблица/карточки проектов
- Статус с визуальным индикатором (цвет, иконка)
- Прогресс (X из Y задач)
- Действия: открыть, скачать, удалить

**Детали проекта (раскрывающаяся секция или модал):**
- Список задач с их статусами
- Возможность перезапустить failed задачи
- Кнопки скачивания (ZIP, merged)
- Настройки обработки (для merged)

### Hub - Страница обработки аудио (/audio-processing)

- File picker (множественный выбор)
- Список выбранных файлов с сортировкой
- Панель настроек (sliders/inputs)
- Выбор выходного формата
- Кнопка "Обработать"
- Индикатор прогресса
- Кнопка скачивания результата

### Hub - Страница кэша (/audio-processing/cache)

- Список обработанных файлов
- Дата создания, размер, формат
- Кнопки: скачать, удалить
- Кнопка "Очистить всё"

### Admin - Страница синтеза (/secret-voicer/synthesis)

Аналогично Hub, но с возможностью видеть ВСЕ проекты и расширенными действиями.

---

## Дополнительные требования

1. **Логирование:** Все операции с файлами и внешним API логировать
2. **Graceful shutdown:** При остановке сервера корректно завершать активные задачи
3. **Cleanup job:** Cron задача для удаления истёкшего кэша
4. **Error handling:** Детальные сообщения об ошибках для отладки
5. **Типизация:** Полная TypeScript типизация согласно architecture.md

---

## Приоритеты реализации

**Фаза 1 (Core):**
1. DB схема и миграции
2. Repository layer
3. Basic CRUD API
4. Processor service (синтез + скачивание)
5. Storage service
6. Базовый UI на Hub (JSON input → проект)

**Фаза 2 (UX):**
1. Visual preview редактор
2. SSE для real-time обновлений
3. Скачивание ZIP
4. Список проектов с фильтрами

**Фаза 3 (Audio Processing):**
1. FFmpeg интеграция
2. Обработка аудио
3. Merged download
4. Кэширование
5. Страница обработки аудио

**Фаза 4 (Polish):**
1. Event system
2. Admin расширения
3. Cleanup jobs
4. Оптимизации

По итогу вот пробелмы и задачи:

1) Сделай нормальну юнавигацию на HUB (для простоты сделай попвер с ссылками в респонсив нав (пока так по колхозному ну ничего))
2) Нет страницы с обработкой ауидо на хабе (где можно грузить на отпарвку и настраивать обработку) А также качать из кеша (удаленные не показываются)
3) В озвучке сверху показываются все голоса (у них указать пол обязательно). Также при смене голоса нужно в первом чтоыб выводились не все голоса а только голоса актеров проекта (также сверху добавь поиск на клиенет по голосам актеров если их много)
А на какой поменять (сделай удобный поповер с поиском (фильтрацией по полу))

4) ПРогресс не обновляется автоматически (до пустим 3 задачи из 5 есть, но прогресс будет 0)

5) При скачивания зип не предлаегтся сделать настройку при первой обработке и нет кнопки переделать обработку
(также у проектов добавь возможно прослушать искачать задачу (напротив каждой задачи))

6) зип архив скачивается сос траным названием в виде нижних почеркиваний
7) в актерах если войс id не валидный нужно красным таково актера выделять (а не толко аму задачу)

что еще я упустил или может упустил ИИ который реализовывал?