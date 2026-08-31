"use client";

import type { PercentCrop, PixelCrop } from "react-image-crop";

/**
 * Конвертация процентного crop (из ReactCrop) в пиксельный
 * с учётом реального отображаемого размера <img>.
 *
 * Аналог convertToPixelCrop из примера:
 * convertToPixelCrop(percentCrop, img.width, img.height)
 */
export function percentToPixelCrop(
  percentCrop: PercentCrop,
  renderedWidth: number,
  renderedHeight: number,
): PixelCrop {
  return {
    unit: "px",
    x: (percentCrop.x / 100) * renderedWidth,
    y: (percentCrop.y / 100) * renderedHeight,
    width: (percentCrop.width / 100) * renderedWidth,
    height: (percentCrop.height / 100) * renderedHeight,
  };
}

/**
 * Обратная конвертация: из пикселей в проценты (для передачи в ReactCrop).
 */
export function pixelToPercentCrop(
  pixelCrop: PixelCrop,
  renderedWidth: number,
  renderedHeight: number,
): PercentCrop {
  return {
    unit: "%",
    x: (pixelCrop.x / renderedWidth) * 100,
    y: (pixelCrop.y / renderedHeight) * 100,
    width: (pixelCrop.width / renderedWidth) * 100,
    height: (pixelCrop.height / renderedHeight) * 100,
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
    y: natural.y * scaleY,
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
