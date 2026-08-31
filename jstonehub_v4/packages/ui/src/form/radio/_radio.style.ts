import {
  DISABLED_STATE,
  FOCUS_RING,
  INVALID,
  READONLY,
} from "../../_model/style";

const RADIO_TRANSITION_STYLE = [
  "transition-[background-color,border-color,box-shadow,opacity]",
  "duration-normal",
].join(" ");

const RADIO_BASE_STYLE = [
  "shrink-0 relative before:absolute",
  "appearance-none cursor-pointer",
  "bg-control checked:bg-primary",
  "border border-control-border checked:border-primary",
  FOCUS_RING,
  INVALID,
  READONLY,
  DISABLED_STATE,
  RADIO_TRANSITION_STYLE,
].join(" ");

const RADIO_STYLE = [
  "h-[16px] w-[16px] rounded-full",
  "before:inset-0 before:opacity-0 checked:before:opacity-100",
  "before:transition-opacity before:duration-fast",
  "before:content-['']",
  "before:w-[6px] before:h-[6px] before:m-auto",
  "before:rounded-full before:bg-primary-foreground",
].join(" ");

export { RADIO_BASE_STYLE, RADIO_STYLE };
