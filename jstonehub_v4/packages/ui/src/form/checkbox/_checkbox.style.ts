import {
  DISABLED_STATE,
  FOCUS_RING,
  INVALID,
  READONLY,
} from "../../_model/style";

const CHECKBOX_TRANSITION_STYLE = [
  "transition-[background-color,border-color,box-shadow,opacity]",
  "duration-normal",
].join(" ");

const CHECKBOX_BASE_STYLE = [
  "shrink-0 relative before:absolute",
  "appearance-none cursor-pointer",
  "bg-control checked:bg-primary",
  "border border-control-border",
  FOCUS_RING,
  INVALID,
  READONLY,
  DISABLED_STATE,
  CHECKBOX_TRANSITION_STYLE,
].join(" ");

const CHECKBOX_CHECKMARK_STYLE = [
  "before:inset-0 before:opacity-0 checked:before:opacity-100",
  "before:transition-opacity before:duration-fast",
  "before:bg-center before:bg-no-repeat",
  "before:[filter:brightness(0)_invert(1)]",
  "before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCA2IDkgMTdsLTUtNSIvPjwvc3ZnPg==')]",
].join(" ");

const CHECKBOX_STYLE = [
  "h-[16px] w-[16px] rounded-xs",
  CHECKBOX_CHECKMARK_STYLE,
].join(" ");

const CHECKBOX_INDETERMINATE_STYLE = [
  "h-[16px] w-[16px] rounded-xs",
  CHECKBOX_CHECKMARK_STYLE,
  "[&:indeterminate]:bg-primary",
  "[&:indeterminate]:before:opacity-100",
  "[&:indeterminate]:before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjxwYXRoIGQ9Ik01IDEyaDE0Ii8+PC9zdmc+')]",
].join(" ");

const SWITCH_STYLE = [
  "h-[20px] w-[36px] rounded-full",
  "before:h-[14px] before:aspect-square before:block",
  "before:left-[2px] before:top-[2px]",
  "before:pointer-events-none before:rounded-full",
  "before:bg-foreground checked:before:bg-primary-foreground",
  "checked:before:translate-x-[16px]",
  "before:transition-(--transition-switch)",
].join(" ");

export {
  CHECKBOX_BASE_STYLE,
  CHECKBOX_INDETERMINATE_STYLE,
  CHECKBOX_STYLE,
  SWITCH_STYLE,
};
