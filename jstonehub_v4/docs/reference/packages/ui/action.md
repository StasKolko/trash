# @packages/ui/action

```ts
import {
  Button,
  IconButton,
  LoadingButton,
  ButtonGroup,
  CopyButton,
  resolveButtonClasses,
  icon,
} from "@packages/ui/action";
```

---

## Button

```ts
{
  type?: "button" | "submit" | "reset";       // default: "button"
  variant?: ButtonVariant;                      // default: "primary"
  size?: "sm" | "md" | "lg";                   // default: "md"
  class?: string;
  style?: JSX.CSSProperties;
  disabled?: boolean;
  form?: string;
  "data-testid"?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  children: JSX.Element;
}
```

`ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive"`

---

## IconButton

Same as `Button`, but `aria-label` is **required**. Renders as square with `rounded-sm`.

---

## LoadingButton

Same as `Button`, plus:

```ts
{
  loading?: boolean;
  "data-loader-testid"?: string;
}
```

When `loading=true` → sets `disabled`, shows `Loader`, sets `aria-busy="true"`.

---

## ButtonGroup

```ts
{
  orientation?: "horizontal" | "vertical";     // default: "horizontal"
  class?: string;
  "data-testid"?: string;
  children: JSX.Element;
}
```

Renders `div[role="group"]`. Strips inner border-radius between children.

---

## CopyButton

```ts
{
  content: string | (() => string);
  onCopied?: () => void;
  onError?: () => void;
  // + all IconButton props except children
}
```

Copies `content` to clipboard on click. Shows success/error icon for 2 s, then resets.

---

## resolveButtonClasses

```ts
resolveButtonClasses(options?: {
  variant?: ButtonVariant;   // default: "primary"
  size?: "sm" | "md" | "lg"; // default: "md"
  icon?: boolean;
  disabled?: boolean;
  class?: string;
}): string
```

Returns merged Tailwind class string for button styling. Used internally, exported for custom compositions.

---

## icon

```ts
icon(options: {
  name: IconName;
  size?: "sm" | "md" | "lg";   // default: "md"
  class?: string;
}): JSX.Element
```

Returns an `aria-hidden` SVG icon element.

**Icon sizes:** `sm=16px`, `md=18px`, `lg=20px` (except `close`: `14/16/18`).

**IconName:**

| Category | Names |
|----------|-------|
| Action | `close`, `check`, `copy`, `edit`, `delete`, `save`, `add`, `remove`, `search`, `filter`, `sort`, `refresh` |
| Navigation | `chevronDown`, `chevronUp`, `chevronLeft`, `chevronRight`, `home`, `externalLink` |
| User | `user`, `settings`, `logout` |
| Media | `eye`, `eyeOff`, `download`, `upload` |
| Math | `plus`, `minus` |
| Menu | `moreHorizontal`, `moreVertical` |
| Semantic | `success`, `error`, `warning`, `info` |