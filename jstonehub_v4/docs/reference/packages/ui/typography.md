# @packages/ui/typography

```ts
import { H1, H2, H3, H4, H5, H6, P } from "@packages/ui/typography";
```

---

## H1 — H6

```ts
{
  variant?: TypographyVariant;   // default: "foreground"
  id?: string;
  class?: string;
  "data-testid"?: string;
  children: JSX.Element;
}
```

Renders the corresponding `<h1>` — `<h6>` element.

| Component | Size | Weight |
|-----------|------|--------|
| `H1` | 24px / 32px | bold |
| `H2` | 20px / 28px | bold |
| `H3` | 16px / 24px | semibold |
| `H4` | 15px / 22px | semibold |
| `H5` | 14px / 20px | medium |
| `H6` | 13px / 18px | medium |

---

## P

```ts
{
  level: TypographyLevel;        // required
  variant?: TypographyVariant;   // default: "foreground"
  id?: string;
  class?: string;
  "data-testid"?: string;
  children: JSX.Element;
}
```

Renders a `<p>` element.

| Level | Size |
|-------|------|
| `1` | 20px / 30px |
| `2` | 18px / 28px |
| `3` | 14px / 22px |
| `4` | 13px / 20px |
| `5` | 12px / 18px |
| `6` | 11px / 16px |

---

## TypographyVariant

`"foreground" | "success" | "error" | "warning" | "info"`

- **Headings:** maps to `text-foreground`, `text-success-foreground`, etc.
- **Text (P):** maps to `text-subtle`, `text-success-foreground/80`, etc.