import type { SemanticVariant } from "../../_model/type";

export const PROGRESS_ROOT_STYLE = "w-full h-[24px] relative";

export const PROGRESS_TRACK_STYLE =
  "h-[4px] w-full rounded-full border overflow-hidden";

export const PROGRESS_INDICATOR_STYLE =
  "h-full transition-[width,background-color] duration-300 ease-out";

export const PROGRESS_BADGE_STYLE = "absolute bottom-0 right-0";

export const PROGRESS_TRACK_VARIANT_STYLE: Record<SemanticVariant, string> = {
  info: "bg-info border-info-foreground/30",
  success: "bg-success border-success-foreground/30",
  warning: "bg-warning border-warning-foreground/30",
  error: "bg-error border-error-foreground/30",
};

export const PROGRESS_INDICATOR_VARIANT_STYLE: Record<SemanticVariant, string> =
  {
    info: "bg-info-foreground",
    success: "bg-success-foreground",
    warning: "bg-warning-foreground",
    error: "bg-error-foreground",
  };
