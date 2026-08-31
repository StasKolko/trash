import type { ComponentSize } from "../../_model/type";
import type { ButtonVariant } from "./button.type";

import { FOCUS_RING } from "../../_model/style";

const BUTTON_BASE = [
  "inline-flex items-center justify-center",
  "select-none cursor-pointer",
  "whitespace-nowrap border",
  "hover:brightness-120 active:brightness-90",
  "active:scale-[0.97]",
  "transition-[filter,transform,background-color,border-color,opacity,box-shadow]",
  "duration-fast",
  FOCUS_RING,
].join(" ");

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground border-primary",
  secondary: "bg-secondary text-secondary-foreground border-border",
  outline: "bg-transparent text-foreground border-border hover:bg-secondary",
  ghost: "bg-transparent text-foreground border-transparent hover:bg-secondary",
  destructive: "bg-destructive text-destructive-foreground border-destructive",
};

const BUTTON_ROUNDED = "rounded-md";
const ICON_BUTTON_SIZE = "aspect-square rounded-sm";

const BUTTON_LOADER_SIZE: Record<ComponentSize, number> = {
  sm: 14,
  md: 18,
  lg: 20,
};

export {
  BUTTON_BASE,
  BUTTON_LOADER_SIZE,
  BUTTON_ROUNDED,
  BUTTON_VARIANT,
  ICON_BUTTON_SIZE,
};
