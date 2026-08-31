import type {
  TypographyLevel,
  TypographyVariant,
} from "../_model/typography.type";

const TEXT_LEVEL: Record<TypographyLevel, string> = {
  1: "text-[20px] leading-[30px]",
  2: "text-[18px] leading-[28px]",
  3: "text-[14px] leading-[22px]",
  4: "text-[13px] leading-[20px]",
  5: "text-[12px] leading-[18px]",
  6: "text-[11px] leading-[16px]",
};

const TEXT_VARIANT: Record<TypographyVariant, string> = {
  foreground: "text-subtle",
  success: "text-success-foreground/80",
  error: "text-error-foreground/80",
  warning: "text-warning-foreground/80",
  info: "text-info-foreground/80",
};

export { TEXT_LEVEL, TEXT_VARIANT };
