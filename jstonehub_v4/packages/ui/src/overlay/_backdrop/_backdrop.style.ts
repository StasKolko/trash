import { OVERLAY_OPACITY_TRANSITION } from "../../_model/style";

export const BACKDROP_ROOT_STYLE = [
  "fixed inset-0 z-backdrop",
  "bg-backdrop backdrop-blur-[2px]",
  OVERLAY_OPACITY_TRANSITION,
].join(" ");
