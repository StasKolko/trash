"use client";

import type { PercentCrop, PixelCrop } from "react-image-crop";
import {
  naturalToRenderedCrop,
  percentToPixelCrop,
  pixelToPercentCrop,
  renderedToNaturalCrop,
} from "./crop-utils";

export type CropLimits = {
  xMax?: number;
  yMax?: number;
  wMax?: number;
  hMax?: number;
};

export function buildInitialNaturalCrop(
  img: HTMLImageElement,
  aspect: number | undefined,
  existingNaturalCrop?: PixelCrop,
): PixelCrop {
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  // Уже есть готовый NATURAL crop — просто возвращаем его (как есть)
  if (existingNaturalCrop) {
    return {
      x: existingNaturalCrop.x,
      y: existingNaturalCrop.y,
      width: existingNaturalCrop.width,
      height: existingNaturalCrop.height,
      unit: "px",
    };
  }

  // Нет фиксированного аспекта — берём всё изображение
  if (!aspect) {
    return {
      x: 0,
      y: 0,
      width: natW,
      height: natH,
      unit: "px",
    };
  }

  // Есть аспект — максимальный возможный кроп внутри NATURAL img по центру
  const imgRatio = natW / natH;
  let cropW: number;
  let cropH: number;

  if (imgRatio > aspect) {
    cropH = natH;
    cropW = cropH * aspect;
  } else {
    cropW = natW;
    cropH = cropW / aspect;
  }

  return {
    x: (natW - cropW) / 2,
    y: (natH - cropH) / 2,
    width: cropW,
    height: cropH,
    unit: "px",
  };
}

/**
 * Кламп в NATURAL системе координат (naturalWidth / naturalHeight) с учётом aspect.
 * Чистая функция: зависит только от аргументов.
 */
export function clampNaturalCropToImage(
  crop: PixelCrop,
  img: HTMLImageElement,
  aspect?: number,
): PixelCrop {
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  let { x, y, width, height } = crop;

  // Ограничиваем размеры
  width = Math.min(width, natW);
  height = Math.min(height, natH);

  // Ограничиваем позицию
  const maxX = natW - width;
  const maxY = natH - height;

  x = Math.max(0, Math.min(x, Math.max(0, maxX)));
  y = Math.max(0, Math.min(y, Math.max(0, maxY)));

  if (aspect) {
    const currentAspect = width / height;
    if (Math.abs(currentAspect - aspect) > 0.01) {
      if (currentAspect > aspect) {
        width = height * aspect;
      } else {
        height = width / aspect;
      }

      const maxX2 = natW - width;
      const maxY2 = natH - height;
      x = Math.max(0, Math.min(x, Math.max(0, maxX2)));
      y = Math.max(0, Math.min(y, Math.max(0, maxY2)));
    }
  }

  return {
    x,
    y,
    width,
    height,
    unit: "px",
  };
}

/**
 * Считает процентный crop для ReactCrop по NATURAL‑crop’у и img.
 */
export function naturalCropToPercentCrop(
  naturalCrop: PixelCrop,
  img: HTMLImageElement,
): PercentCrop {
  const rendered = naturalToRenderedCrop(naturalCrop, img);
  return pixelToPercentCrop(rendered, img.width, img.height);
}

/**
 * Обновление crop из числовых инпутов (NATURAL -> clamp -> PERCENT).
 * Возвращает новый naturalCrop и percentCrop.
 */
export function updateCropFromControlsLogic(params: {
  nextNaturalRaw: PixelCrop;
  img: HTMLImageElement;
  aspect?: number;
}): { natural: PixelCrop; percent: PercentCrop } {
  const { nextNaturalRaw, img, aspect } = params;

  // Инпуты оперируют целыми значениями — нормализуем сразу
  const normalizedRaw: PixelCrop = {
    ...nextNaturalRaw,
    x: Math.round(nextNaturalRaw.x),
    y: Math.round(nextNaturalRaw.y),
    width: Math.round(nextNaturalRaw.width),
    height: Math.round(nextNaturalRaw.height),
  };

  const naturalClamped = clampNaturalCropToImage(normalizedRaw, img, aspect);
  const renderedClamped = naturalToRenderedCrop(naturalClamped, img);
  const percent = pixelToPercentCrop(renderedClamped, img.width, img.height);

  return {
    natural: naturalClamped,
    percent,
  };
}

/**
 * Обработка изменений от ReactCrop (PERCENT -> RENDERED -> NATURAL -> clamp).
 */
export function handleReactCropChangeLogic(params: {
  percent: PercentCrop;
  img: HTMLImageElement;
  aspect?: number;
}): {
  natural: PixelCrop;
  rendered: PixelCrop;
} {
  const { percent, img, aspect } = params;

  const rendered = percentToPixelCrop(percent, img.width, img.height);
  const naturalUnclamped = renderedToNaturalCrop(rendered, img);
  const natural = clampNaturalCropToImage(naturalUnclamped, img, aspect);

  return {
    natural,
    rendered,
  };
}

/**
 * Лимиты для инпутов в NATURAL координатах.
 */
export function getCropLimits(
  img: HTMLImageElement | null,
  aspect: number,
  naturalCrop?: PixelCrop,
): CropLimits {
  if (!img) {
    return {
      xMax: undefined,
      yMax: undefined,
      wMax: undefined,
      hMax: undefined,
    };
  }

  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  if (!naturalCrop) {
    return {
      xMax: undefined,
      yMax: undefined,
      wMax: natW,
      hMax: natH,
    };
  }

  const availableWidth = natW - naturalCrop.x;
  const availableHeight = natH - naturalCrop.y;

  let wMax = availableWidth;
  let hMax = availableHeight;

  const maxWByHeight = availableHeight * aspect;
  const maxHByWidth = availableWidth / aspect;

  wMax = Math.min(availableWidth, maxWByHeight);
  hMax = Math.min(availableHeight, maxHByWidth);

  return {
    xMax: natW - naturalCrop.width,
    yMax: natH - naturalCrop.height,
    wMax,
    hMax,
  };
}
