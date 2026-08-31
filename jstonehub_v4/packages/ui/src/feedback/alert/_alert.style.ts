import type { SemanticVariant } from "../../_model/type";

export const ALERT_ROOT_STYLE =
  "w-full flex gap-[8px] px-[12px] py-[8px] rounded-md border relative";

export const ALERT_ICON_STYLE =
  "shrink-0 mt-[4px] [&>svg]:h-[16px] [&>svg]:w-[16px]";

export const ALERT_CONTENT_STYLE = "flex-1";

export const ALERT_CLOSE_BUTTON_STYLE = [
  "absolute top-0 right-0",
  "text-current hover:bg-current/10",
].join(" ");

export const ALERT_CLOSE_ICON_STYLE = "h-[16px] w-[16px]";

export const ALERT_VARIANT_STYLE: Record<SemanticVariant, string> = {
  success: "bg-success border-success-foreground/30 text-success-foreground",
  error: "bg-error border-error-foreground/30 text-error-foreground",
  warning: "bg-warning border-warning-foreground/30 text-warning-foreground",
  info: "bg-info border-info-foreground/30 text-info-foreground",
};
