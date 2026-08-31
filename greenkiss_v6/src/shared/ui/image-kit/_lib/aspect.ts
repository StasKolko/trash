import { ASPECT_TOLERANCE } from "./constants";

export const toRatio = (w: number, h: number) => (h === 0 ? 0 : w / h);
export const nearlyEqual = (a: number, b: number, eps = ASPECT_TOLERANCE) =>
  Math.abs(a - b) <= eps;

export const inferAspect = (w: number, h: number) => toRatio(w, h);

export const sizeFromRatioAndWidth = (ratio: number, width: number) => ({
  width,
  height: Math.round(width / ratio),
});

export const sizeFromRatioAndHeight = (ratio: number, height: number) => ({
  width: Math.round(height * ratio),
  height,
});
