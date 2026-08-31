import {
  COMPONENT_HEIGHT,
  DISABLED_STATE,
  FOCUS_RING,
} from "../../_model/style";

export const SEARCH_INPUT_ROOT_STYLE = "w-full relative";

export const SEARCH_INPUT_STYLE = [
  "w-full",
  COMPONENT_HEIGHT.md,
  "pl-[36px] pr-[36px]",
  "bg-control rounded-lg",
  "border border-control-border",
  "text-[14px] text-foreground placeholder:text-subtle",
  "[&::-webkit-search-cancel-button]:appearance-none",
  "[&::-webkit-search-decoration]:appearance-none",
  FOCUS_RING,
  DISABLED_STATE,
  "transition-[border-color,box-shadow,opacity] duration-normal",
].join(" ");

export const SEARCH_ICON_STYLE = [
  "absolute left-[10px] top-1/2 -translate-y-1/2",
  "text-subtle pointer-events-none",
].join(" ");

export const SEARCH_CLEAR_STYLE = [
  "absolute right-[4px] top-1/2 -translate-y-1/2",
  "text-subtle",
].join(" ");

export const SEARCH_ICON_SIZE = 16;
