# Import Ordering Convention

## Overview

All imports in the project are organized into **two sections** separated by a blank line:

1. **Type imports** (`import type { ... }`)
2. **Value imports** (`import { ... }`)

Within each section, imports are divided into **three groups** separated by blank lines:

- **Group A — External**: npm packages, Node.js/Bun built-ins, workspace packages
- **Group B — Project aliases**: internal app modules via `#` aliases
- **Group C — Local**: relative path imports

## Principle

Reading order follows **outside → inside** direction:

```
External world (npm, node, workspaces)
  ↓
Project internals (# aliases)
  ↓
Local module files (./ ../)
```

Types come first because they define **what things are**.
Values come second because they define **what things do**.

## Sections

### Section 1 — Type Imports

All `import type` statements grouped together without blank lines within each group.

| Order | Group | Description | Examples |
|-------|-------|-------------|----------|
| 1 | External | npm, node:, bun:, workspace packages | `solid-js`, `node:path`, `@configs/env` |
| 2 | Project | `#` path aliases | `#api/client`, `#shared/ui/button` |
| 3 | Local | Relative paths | `./types`, `../layout/types` |

### Section 2 — Value Imports

All regular `import` statements grouped together without blank lines within each group.

| Order | Group | Description | Examples |
|-------|-------|-------------|----------|
| 1 | External | npm, node:, bun:, workspace packages | `solid-js`, `node:path`, `@packages/logger` |
| 2 | Project | `#` path aliases | `#features/voiceover`, `#shared/utils` |
| 3 | Local | Relative paths | `./components/header`, `./hooks` |

## Type Import Style

Type imports **must** use the `import type` syntax, never inline `type` keyword.

```typescript
// ✅ Correct
import type { JSX } from "solid-js";
import { createSignal } from "solid-js";

// ❌ Wrong — inline type
import { type JSX, createSignal } from "solid-js";

// ❌ Wrong — inline type keyword
import { type JSX } from "solid-js";
```

This is enforced by the `useImportType` linter rule with `separatedType` style.

## What Counts as "External"

The external group includes everything installed or resolved outside the current app:

| Source | Example | Why external |
|--------|---------|--------------|
| npm packages | `solid-js`, `drizzle-orm` | Third-party dependency |
| Scoped npm packages | `@solidjs/router`, `@hono/zod-openapi` | Third-party dependency |
| Node.js built-ins | `node:path`, `node:process` | Runtime built-in |
| Bun built-ins | `bun:test` | Runtime built-in |
| Workspace packages | `@configs/env`, `@packages/logger` | Monorepo shared package |

Workspace packages (`@configs/*`, `@packages/*`, `@scripts/*`, `@apps/*`) are scoped packages and are treated identically to npm packages by the formatter.

## What Counts as "Project Aliases"

Project aliases use the `#` prefix and map to internal app source directories:

| Alias | Maps to | Purpose |
|-------|---------|---------|
| `#admin/*` | `./apps/admin/src/*` | Admin app internals |
| `#api/*` | `./apps/api/src/*` | API app internals |
| `#hub/*` | `./apps/hub/src/*` | Hub app internals |
| `#worker/*` | `./apps/worker/src/*` | Worker app internals |

The `#` prefix is chosen because:

- It is the standard Node.js [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) prefix
- It does not conflict with npm scoped packages (`@scope/pkg`)
- It does not cause issues with `package.json` exports or build/dev/start modes (unlike `@` or `~`)

## What Counts as "Local"

Local imports use relative paths and refer to files within the same module or nearby directories:

```typescript
import { Header } from "./components/header";
import { usePageData } from "./hooks";
import { formatDate } from "../utils";
```

## Full Example

```typescript
// ── Section 1: Type imports ─────────────────────────

// External types (npm + node + workspaces)
import type { Component } from "solid-js";
import type { RouteDefinition } from "@solidjs/router";
import type { EnvConfig } from "@configs/env";
import type { LogLevel } from "@packages/logger";

// Project alias types
import type { ApiClient } from "#api/client";
import type { VoiceoverResult } from "#features/voiceover";
import type { ButtonProps } from "#shared/ui/button";

// Local types
import type { PageProps } from "./page.types";
import type { HeaderSlots } from "../layout/types";

// ── Section 2: Value imports ────────────────────────

// External values (npm + node + workspaces)
import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { join } from "node:path";
import { validateEnv } from "@configs/env";
import { logger } from "@packages/logger";

// Project alias values
import { fetchUser } from "#api/user";
import { createVideoContent } from "#blueprint/video";
import { useVoiceover } from "#features/voiceover";
import { useMontage } from "#features/montage";
import { Button } from "#shared/ui/button";
import { formatDuration } from "#shared/utils";

// Local values
import { Header } from "./components/header";
import { usePageData } from "./hooks";
```

> **Note:** Comments in the example above are for illustration only.
> The actual code has no comments — only blank lines separate the groups.

## Sorting Within Groups

Within each group, Biome sorts imports automatically using:

- **Distance-based order**: sources "farther" from the current module appear first
- **Natural sort order**: `A < a < B < b`, numbers handled logically (`a9 < a10`)
- **Named imports**: sorted alphabetically inside `{ ... }`

## Biome Configuration

The ordering is enforced by Biome's `organizeImports` action with the following groups configuration:

```json
{
  "groups": [
    { "type": true, "source": [":NODE:", ":BUN:", ":PACKAGE_WITH_PROTOCOL:", ":PACKAGE:"] },
    ":BLANK_LINE:",
    { "type": true, "source": ["#*", "#*/**"] },
    ":BLANK_LINE:",
    { "type": true, "source": ":PATH:" },
    ":BLANK_LINE:",
    [":NODE:", ":BUN:", ":PACKAGE_WITH_PROTOCOL:", ":PACKAGE:"],
    ":BLANK_LINE:",
    ["#*", "#*/**"],
    ":BLANK_LINE:",
    ":PATH:"
  ]
}
```

The `useImportType` linter rule with `separatedType` style ensures that type-only imports use
`import type { X }` syntax and are never mixed with value imports in the same statement.

## Quick Reference

```
import type ...  from "npm-package";         ← type external
import type ...  from "@workspace/package";  ← type external
import type ...  from "node:path";           ← type external

import type ...  from "#app/types";          ← type project

import type ...  from "./local-types";       ← type local

import ...       from "npm-package";         ← value external
import ...       from "@workspace/package";  ← value external
import ...       from "node:path";           ← value external

import ...       from "#app/module";         ← value project

import ...       from "./local-module";      ← value local
```