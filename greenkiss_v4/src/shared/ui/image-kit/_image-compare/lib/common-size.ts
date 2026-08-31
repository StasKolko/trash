import type { CommonImageSize, LoadedImage } from "../model/types";

export function getCommonImageSize(
  leftImg: LoadedImage | null,
  rightImg: LoadedImage | null,
): CommonImageSize | null {
  if (!leftImg || !rightImg) return null;

  return {
    width: Math.min(leftImg.width, rightImg.width),
    height: Math.min(leftImg.height, rightImg.height),
    aspect: leftImg.aspect,
  };
}
