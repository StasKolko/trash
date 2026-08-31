import type { ComponentSize } from "./type";

const DISABLED = ["pointer-events-none", "opacity-50"].join(" ");

const DISABLED_STATE = [
  "disabled:pointer-events-none",
  "disabled:opacity-50",
].join(" ");

const FOCUS_RING = [
  "focus-visible:outline-none",
  "focus-visible:ring-[4px]",
  "focus-visible:ring-ring",
].join(" ");

const READONLY = [
  "aria-readonly:pointer-events-none",
  "aria-readonly:cursor-default",
].join(" ");

const INVALID = [
  "aria-[invalid=true]:border-error-foreground",
  "focus-visible:aria-[invalid=true]:ring-ring-error",
].join(" ");

const OVERLAY_OPACITY_TRANSITION = "transition-opacity duration-slow ease-out";

const OVERLAY_TRANSFORM_TRANSITION =
  "transition-transform duration-long ease-out";

const COMPONENT_HEIGHT: Record<ComponentSize, string> = {
  sm: "h-[28px]",
  md: "h-[32px]",
  lg: "h-[36px]",
};

const COMPONENT_PX: Record<ComponentSize, string> = {
  sm: "px-[14px]",
  md: "px-[16px]",
  lg: "px-[18px]",
};

const COMPONENT_GAP: Record<ComponentSize, string> = {
  sm: "gap-[8px]",
  md: "gap-[10px]",
  lg: "gap-[12px]",
};

const COMPONENT_TEXT: Record<ComponentSize, string> = {
  sm: "text-[12px] font-medium",
  md: "text-[14px] font-medium",
  lg: "text-[16px] font-bold",
};

export {
  COMPONENT_GAP,
  COMPONENT_HEIGHT,
  COMPONENT_PX,
  COMPONENT_TEXT,
  DISABLED,
  DISABLED_STATE,
  FOCUS_RING,
  INVALID,
  OVERLAY_OPACITY_TRANSITION,
  OVERLAY_TRANSFORM_TRANSITION,
  READONLY,
};
