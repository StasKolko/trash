"use client";

import type { PercentCrop, PixelCrop } from "react-image-crop";

/**
 * Конвертация процентного crop (из ReactCrop) в пиксельный в системе
 * NATURAL (naturalWidth / naturalHeight).
 */
export function percentToPixelCrop(
  percentCrop: PercentCrop,
  naturalWidth: number,
  naturalHeight: number,
): PixelCrop {
  return {
    unit: "px",
    x: (percentCrop.x / 100) * naturalWidth,
    y: (percentCrop.y / 100) * naturalHeight,
    width: (percentCrop.width / 100) * naturalWidth,
    height: (percentCrop.height / 100) * naturalHeight,
  };
}

/**
 * Обратная конвертация: из NATURAL пикселей в проценты (для ReactCrop).
 */
export function pixelToPercentCrop(
  pixelCrop: PixelCrop,
  naturalWidth: number,
  naturalHeight: number,
): PercentCrop {
  return {
    unit: "%",
    x: (pixelCrop.x / naturalWidth) * 100,
    y: (pixelCrop.y / naturalHeight) * 100,
    width: (pixelCrop.width / naturalWidth) * 100,
    height: (pixelCrop.height / naturalHeight) * 100,
  };
}

/**
 * NATURAL (naturalWidth/naturalHeight) -> RENDERED (width/height в контейнере)
 */
export function naturalToRenderedCrop(
  natural: PixelCrop,
  img: HTMLImageElement,
): PixelCrop {
  const scaleX = img.width / img.naturalWidth;
  const scaleY = img.height / img.naturalHeight;

  return {
    unit: "px",
    x: natural.x * scaleX,
    y: natural.y * scaleX, // если хочешь учитывать неравномерный scaleY — замени на * scaleY
    width: natural.width * scaleX,
    height: natural.height * scaleY,
  };
}

/**
 * RENDERED (width/height в контейнере) -> NATURAL (naturalWidth/naturalHeight)
 */
export function renderedToNaturalCrop(
  rendered: PixelCrop,
  img: HTMLImageElement,
): PixelCrop {
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;

  return {
    unit: "px",
    x: rendered.x * scaleX,
    y: rendered.y * scaleY,
    width: rendered.width * scaleX,
    height: rendered.height * scaleY,
  };
}
