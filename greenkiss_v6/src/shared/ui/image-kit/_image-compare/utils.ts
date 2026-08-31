import type { ImageLike } from "./types";

export function getDialogMaxWidth({
  leftImageWidth,
  rightImageWidth,
  maxWidthPx,
}: {
  leftImageWidth: number | undefined;
  rightImageWidth: number | undefined;
  maxWidthPx: number;
}) {
  if (!leftImageWidth || !rightImageWidth) return `${maxWidthPx}px`;

  const minImageWidth = Math.min(leftImageWidth, rightImageWidth);
  const maxWidth = Math.min(maxWidthPx, minImageWidth);

  return `${maxWidth}px`;
}

export async function convertToUrl(image: ImageLike) {
  const isString = typeof image === "string";

  if (typeof image === "string") {
    return { src: image, isObjectUrl: false };
  }
  return { src: URL.createObjectURL(image), isObjectUrl: true };
}
