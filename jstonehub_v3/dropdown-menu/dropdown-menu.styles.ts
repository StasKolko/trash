export const menuClasses = [
  "fixed z-floating",
  "bg-card border border-border rounded-lg shadow-lg",
  "overflow-y-auto scrollbar-styled",
  "p-[4px]",
].join(" ");

export const itemClasses = [
  "w-full px-[12px] py-[8px]",
  "flex items-center gap-[12px]",
  "text-[14px] text-foreground",
  "rounded-sm cursor-pointer",
  "outline-none select-none",
  "hover:bg-secondary focus:bg-secondary",
  "transition-colors duration-fast",
].join(" ");

export const itemDisabledClasses = "effect-disabled cursor-default";

export const iconClasses = "shrink-0 w-[16px] h-[16px] text-subtle";

export const shortcutClasses =
  "ml-auto text-[12px] text-subtle tracking-widest";

export const checkboxClasses =
  "shrink-0 w-[16px] h-[16px] flex items-center justify-center";

export const radioClasses =
  "shrink-0 w-[16px] h-[16px] flex items-center justify-center";

export const separatorClasses = "h-px bg-border my-[4px] -mx-[4px]";

export const groupLabelClasses = [
  "px-[12px] py-[6px]",
  "text-[12px] text-subtle font-medium uppercase tracking-wide",
].join(" ");

export const subMenuChevronClasses = "shrink-0 w-[16px] h-[16px] text-subtle";
