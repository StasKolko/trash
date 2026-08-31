import type { ComponentSize } from "../../_model/type";
import type { ButtonVariant } from "./button.type";

import { cn } from "@packages/util/css";

import { DEFAULT_COMPONENT_SIZE } from "../../_model/constant";
import {
  COMPONENT_GAP,
  COMPONENT_HEIGHT,
  COMPONENT_PX,
  COMPONENT_TEXT,
  DISABLED,
} from "../../_model/style";
import {
  BUTTON_BASE,
  BUTTON_ROUNDED,
  BUTTON_VARIANT,
  ICON_BUTTON_SIZE,
} from "./_button.style";

const DEFAULT_VARIANT: ButtonVariant = "primary";

function resolveButtonClasses({
  variant = DEFAULT_VARIANT,
  size = DEFAULT_COMPONENT_SIZE,
  icon,
  disabled,
  class: userClass,
}: {
  variant?: ButtonVariant;
  size?: ComponentSize;
  icon?: boolean;
  disabled?: boolean;
  class?: string;
} = {}) {
  return cn(
    COMPONENT_HEIGHT[size],
    BUTTON_BASE,
    BUTTON_VARIANT[variant],
    !icon && BUTTON_ROUNDED,
    !icon && COMPONENT_GAP[size],
    !icon && COMPONENT_PX[size],
    !icon && COMPONENT_TEXT[size],
    icon && ICON_BUTTON_SIZE,
    disabled && DISABLED,
    userClass,
  );
}

export { DEFAULT_VARIANT, resolveButtonClasses };
