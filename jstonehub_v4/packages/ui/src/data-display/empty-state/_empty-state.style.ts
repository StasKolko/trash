const EMPTY_STATE_ROOT = [
  "w-max flex flex-col",
  "items-center justify-center gap-[12px]",
  "text-center p-[16px]",
].join(" ");

const EMPTY_STATE_ICON = [
  "[&>svg]:h-[20px] [&>svg]:w-[20px]",
  "p-[8px] rounded-sm",
  "text-secondary-foreground bg-secondary",
].join(" ");

const EMPTY_STATE_BODY = "flex flex-col items-center gap-[4px] max-w-[384px]";

const EMPTY_STATE_FOOTER = "flex items-center gap-[8px]";

export {
  EMPTY_STATE_BODY,
  EMPTY_STATE_FOOTER,
  EMPTY_STATE_ICON,
  EMPTY_STATE_ROOT,
};
