import type { Side } from "./type";

export const VIEWPORT_PADDING = 8;
export const OFFSCREEN_PX = -9999;
export const OPPOSITE_SIDE: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};
