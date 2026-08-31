import type { TypographyLevel } from "../../typography/types";

export const baseClasses = [
  "flex flex-col",
  "bg-card border border-border rounded-lg",
  "shadow-sm",
].join(" ");

export const levelPadding: Record<TypographyLevel, string> = {
  1: "p-[20px]",
  2: "p-[16px]",
  3: "p-[14px]",
  4: "p-[12px]",
  5: "p-[10px]",
  6: "p-[8px]",
};

export const levelGap: Record<TypographyLevel, string> = {
  1: "gap-[16px]",
  2: "gap-[14px]",
  3: "gap-[12px]",
  4: "gap-[10px]",
  5: "gap-[8px]",
  6: "gap-[6px]",
};

export const levelInnerGap: Record<TypographyLevel, string> = {
  1: "gap-[6px]",
  2: "gap-[5px]",
  3: "gap-[4px]",
  4: "gap-[4px]",
  5: "gap-[3px]",
  6: "gap-[2px]",
};

export const headerClasses = "flex flex-col";
export const contentClasses = "flex flex-col";
export const footerClasses = "flex items-center justify-end";
