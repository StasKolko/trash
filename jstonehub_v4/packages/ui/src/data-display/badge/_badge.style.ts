import type { ComponentSize, SemanticVariant } from "../../_model/type";

export const BADGE_BASE =
  "inline-flex items-center justify-center gap-[4px] rounded-full border font-semibold select-none whitespace-nowrap";

export const BADGE_VARIANT: Record<SemanticVariant, string> = {
  success: "bg-success text-success-foreground border-success-border",
  error: "bg-error text-error-foreground border-error-border",
  warning: "bg-warning text-warning-foreground border-warning-border",
  info: "bg-info text-info-foreground border-info-border",
};

export const BADGE_SIZE: Record<ComponentSize, string> = {
  sm: "h-[16px] px-[8px] text-[12px]",
  md: "h-[18px] px-[10px] text-[13px]",
  lg: "h-[20px] px-[12px] text-[14px]",
};
