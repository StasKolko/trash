import { OVERLAY_TRANSFORM_TRANSITION } from "../../_model/style";

export const SHEET_PANEL_ROOT_STYLE = [
  "w-[85vw] max-w-[384px] h-full",
  "fixed left-0 top-0 z-sheet",
  "p-[8px]",
  "bg-sheet border-r border-border",
  OVERLAY_TRANSFORM_TRANSITION,
].join(" ");

export const SHEET_HEADER_STYLE = "flex items-center justify-between px-[16px]";
export const SHEET_SEPARATOR_STYLE = "my-[8px]";

export const SHEET_PANEL_TRANSFORM_HIDDEN = "translateX(-100%)";
export const SHEET_PANEL_TRANSFORM_VISIBLE = "translateX(0)";
