import {
  COMPONENT_HEIGHT,
  COMPONENT_PX,
  DISABLED_STATE,
  FOCUS_RING,
  INVALID,
  READONLY,
} from "../../_model/style";

const INPUT_ROOT_STYLE = [
  "w-full",
  COMPONENT_HEIGHT.md,
  COMPONENT_PX.md,
  "bg-control rounded-lg",
  "border border-control-border",
  "text-[14px] text-foreground placeholder:text-subtle",
  FOCUS_RING,
  INVALID,
  READONLY,
  DISABLED_STATE,
  "transition-[border-color,box-shadow,opacity] duration-normal",
].join(" ");

const INPUT_WRAPPER_STYLE = "w-full relative";

const PASSWORD_TOGGLE_STYLE = [
  "absolute right-[4px] top-1/2 -translate-y-1/2",
  "text-subtle",
].join(" ");

const NUMBER_INPUT_STYLE = [
  "[appearance:textfield]",
  "[&::-webkit-outer-spin-button]:appearance-none",
  "[&::-webkit-inner-spin-button]:appearance-none",
].join(" ");

const NUMBER_BUTTON_WRAPPER_STYLE = [
  "h-[32px] w-[28px]",
  "flex flex-col",
  "absolute right-[4px]",
  "top-1/2 -translate-y-1/2",
].join(" ");

const NUMBER_BUTTON_STYLE = [
  "flex flex-1 items-center justify-center",
  "cursor-pointer select-none",
  "text-subtle hover:text-foreground",
  "transition-colors duration-fast",
  DISABLED_STATE,
].join(" ");

const NUMBER_BUTTON_TOP_STYLE = [NUMBER_BUTTON_STYLE, "rounded-t-sm"].join(" ");

const NUMBER_BUTTON_BOTTOM_STYLE = [NUMBER_BUTTON_STYLE, "rounded-b-sm"].join(
  " ",
);

export {
  INPUT_ROOT_STYLE,
  INPUT_WRAPPER_STYLE,
  NUMBER_BUTTON_BOTTOM_STYLE,
  NUMBER_BUTTON_TOP_STYLE,
  NUMBER_BUTTON_WRAPPER_STYLE,
  NUMBER_INPUT_STYLE,
  PASSWORD_TOGGLE_STYLE,
};
