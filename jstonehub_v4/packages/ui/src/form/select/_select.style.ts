import {
  COMPONENT_HEIGHT,
  COMPONENT_PX,
  DISABLED_STATE,
  FOCUS_RING,
  INVALID,
} from "../../_model/style";

// --- Trigger ---

export const SELECT_TRIGGER_STYLE = [
  "w-full flex items-center justify-between",
  COMPONENT_HEIGHT.md,
  COMPONENT_PX.md,
  "bg-control rounded-lg",
  "border border-control-border",
  "text-[14px] text-foreground",
  "cursor-pointer select-none",
  FOCUS_RING,
  INVALID,
  "data-[readonly]:pointer-events-none data-[readonly]:cursor-default",
  DISABLED_STATE,
  "transition-[border-color,box-shadow,opacity] duration-normal",
].join(" ");

export const SELECT_TRIGGER_PLACEHOLDER_STYLE = "text-subtle truncate";
export const SELECT_TRIGGER_VALUE_STYLE = "truncate";
export const SELECT_TRIGGER_ICON_STYLE =
  "shrink-0 text-subtle ml-auto transition-transform duration-fast";
export const SELECT_TRIGGER_ICON_OPEN_STYLE = "rotate-180";
export const SELECT_TRIGGER_ICON_SIZE = 16;

// --- Option ---

export const SELECT_OPTION_STYLE = [
  "w-full flex items-center gap-[8px]",
  "px-[12px] py-[6px]",
  "text-[14px] text-foreground",
  "cursor-pointer select-none",
  "transition-colors duration-fast",
  "hover:bg-secondary",
  "outline-none focus-visible:bg-secondary",
].join(" ");

export const SELECT_OPTION_ACTIVE_STYLE = "bg-active text-active-foreground";
export const SELECT_OPTION_DISABLED_STYLE =
  "pointer-events-none opacity-50 cursor-default";
export const SELECT_OPTION_CHECK_SIZE = 16;

// --- Multi option ---

export const MULTI_SELECT_OPTION_STYLE = [
  "w-full flex items-center gap-[8px]",
  "px-[12px] py-[6px]",
  "text-[14px] text-foreground",
  "cursor-pointer select-none",
  "transition-colors duration-fast",
  "hover:bg-secondary",
].join(" ");

export const MULTI_SELECT_OPTION_LABEL_STYLE =
  "leading-none select-none cursor-pointer";

export const MULTI_SELECT_OPTION_DISABLED_STYLE =
  "pointer-events-none opacity-50";

// --- Header ---

export const MULTI_SELECT_HEADER_STYLE = [
  "w-full flex items-center gap-[8px]",
  "px-[12px] py-[6px]",
  "border-b border-border",
  "cursor-pointer select-none",
].join(" ");

export const MULTI_SELECT_HEADER_LABEL_STYLE =
  "text-[13px] font-medium text-foreground leading-none select-none cursor-pointer";

// --- Search ---

export const SELECT_SEARCH_WRAPPER_STYLE =
  "px-[8px] py-[4px] border-b border-border";

export const SELECT_SEARCH_INPUT_STYLE = [
  "w-full h-[28px]",
  "px-[8px]",
  "bg-transparent",
  "text-[13px] text-foreground placeholder:text-subtle",
  "outline-none border-none",
].join(" ");

// --- Empty ---

export const SELECT_EMPTY_STYLE =
  "px-[12px] py-[8px] text-[13px] text-subtle text-center select-none";

// --- Popover class ---

export const SELECT_POPOVER_CLASS = "!p-0";
