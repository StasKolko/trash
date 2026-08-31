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