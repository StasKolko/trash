import type { SemanticVariant } from "../../_model/type";

export const TOASTER_ROOT_STYLE = [
  "fixed top-0 left-1/2 -translate-x-1/2 z-toast",
  "flex flex-col items-center gap-[8px]",
  "pt-[16px] px-[8px]",
  "pointer-events-none",
].join(" ");

export const TOAST_ROOT_STYLE = [
  "pointer-events-auto",
  "max-w-[min(90vw,420px)] w-[min(90vw,420px)]",
  "flex items-start gap-[8px]",
  "pl-[12px] pr-[8px] py-[8px]",
  "rounded-md border",
  "shadow-lg",
  "relative overflow-hidden",
  "select-none",
  "will-change-[transform,opacity]",
].join(" ");

export const TOAST_VARIANT_STYLE: Record<SemanticVariant, string> = {
  success: "bg-success border-success-border text-success-foreground",
  error: "bg-error border-error-border text-error-foreground",
  warning: "bg-warning border-warning-border text-warning-foreground",
  info: "bg-info border-info-border text-info-foreground",
};

export const TOAST_ICON_STYLE =
  "shrink-0 mt-[2px] [&>svg]:h-[16px] [&>svg]:w-[16px]";

export const TOAST_TITLE_STYLE =
  "flex-1 min-w-0 text-[14px] font-medium leading-[20px] break-words";

export const TOAST_CLOSE_BUTTON_STYLE = [
  "shrink-0",
  "w-[24px] h-[24px]",
  "flex items-center justify-center",
  "rounded-xs cursor-pointer",
  "text-current/70 hover:text-current",
  "transition-colors duration-fast",
].join(" ");

export const TOAST_PROGRESS_TRACK_STYLE =
  "absolute bottom-0 left-0 right-0 h-[3px]";

export const TOAST_PROGRESS_BAR_STYLE = "h-full";

export const TOAST_PROGRESS_VARIANT_STYLE: Record<SemanticVariant, string> = {
  success: "bg-success-foreground/40",
  error: "bg-error-foreground/40",
  warning: "bg-warning-foreground/40",
  info: "bg-info-foreground/40",
};
