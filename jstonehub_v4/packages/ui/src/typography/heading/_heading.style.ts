import type { TypographyVariant } from "../_model/typography.type";

const HEADING_1 =
  "text-[24px] font-bold leading-[32px] tracking-tight text-balance";

const HEADING_2 =
  "text-[20px] font-bold leading-[28px] tracking-tight text-balance";

const HEADING_3 = "text-[16px] font-semibold leading-[24px] text-balance";

const HEADING_4 = "text-[15px] font-semibold leading-[22px] text-balance";

const HEADING_5 = "text-[14px] font-medium leading-[20px] text-balance";

const HEADING_6 = "text-[13px] font-medium leading-[18px] text-balance";

const HEADING_VARIANT: Record<TypographyVariant, string> = {
  foreground: "text-foreground",
  success: "text-success-foreground",
  error: "text-error-foreground",
  warning: "text-warning-foreground",
  info: "text-info-foreground",
};

export {
  HEADING_1,
  HEADING_2,
  HEADING_3,
  HEADING_4,
  HEADING_5,
  HEADING_6,
  HEADING_VARIANT,
};
