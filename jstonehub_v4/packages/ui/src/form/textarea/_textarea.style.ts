import {
  DISABLED_STATE,
  FOCUS_RING,
  INVALID,
  READONLY,
} from "../../_model/style";

export const TEXTAREA_HEIGHT_MAX_DEFAULT = 300;
export const TEXTAREA_HEIGHT_MIN = 80;

export const TEXTAREA_PLACEHOLDER_LENGTH_MAX = 30;

export const TEXTAREA_CHAR_LIMIT_ERROR_THRESHOLD = 1;
export const TEXTAREA_CHAR_LIMIT_WARNING_THRESHOLD = 0.9;

export const TEXTAREA_WRAPPER_STYLE = "w-full relative";

export const TEXTAREA_ROOT_STYLE = [
  "w-full min-h-[80px] block",
  "px-[12px] pt-[10px] pb-[16px]",
  "bg-control rounded-md",
  "border border-control-border",
  "text-[14px] text-foreground placeholder:text-subtle",
  FOCUS_RING,
  INVALID,
  READONLY,
  DISABLED_STATE,
  "overflow-y-auto resize-none overflow-x-hidden",
  "transition-[border-color,box-shadow,opacity] duration-normal",
].join(" ");

export const TEXTAREA_RESIZE_STYLE = [
  "w-[16px] h-[16px]",
  "absolute right-0 bottom-0",
  "cursor-ns-resize touch-none select-none",
  "before:w-[18px] before:right-0 before:bottom-[8px]",
  "after:w-[12px] after:right-0 after:bottom-[6px]",
  "before:h-[1px] after:h-[1px] before:absolute after:absolute",
  "before:rotate-[-45deg] after:rotate-[-45deg]",
  "before:bg-foreground after:bg-foreground",
  "before:rounded-full after:rounded-full",
  "hover:before:bg-hover-foreground hover:after:bg-hover-foreground",
].join(" ");

export const TEXTAREA_COUNTER_STYLE = "absolute right-[16px] bottom-[1px]";
