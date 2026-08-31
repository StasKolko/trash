"use client";

import { useCallback, useMemo, useState } from "react";
import type { PercentCrop, PixelCrop } from "react-image-crop";
import type { ImageItem } from "../_types";
import { percentToPixelCrop, pixelToPercentCrop } from "./crop-utils";

type UseImageCropParams = {
  width: number;
  height: number;
  item: ImageItem;
  onImageReady: (img: HTMLImageElement) => void;
  /**
   * ВАЖНО: наружу отдаём NATURAL crop (в системе naturalWidth/naturalHeight)
   */
  onCropChange: (crop: PixelCrop) => void;
};

export const useImageCrop = ({
  width,
  height,
  item,
  onImageReady,
  onCropChange,
}: UseImageCropParams) => {
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(item.img);

  /**
   * ВНУТРИ храним NATURAL crop (в координатах naturalWidth / naturalHeight)
   */
  const [naturalCrop, setNaturalCrop] = useState<PixelCrop | undefined>(
    item.pixelCrop
      ? {
          x: item.pixelCrop.x,
          y: item.pixelCrop.y,
          width: item.pixelCrop.width,
          height: item.pixelCrop.height,
          unit: "px",
        }
      : undefined,
  );

  /**
   * Для ReactCrop — процентный crop, считаемый от NATURAL размеров
   */
  const [percentCrop, setPercentCrop] = useState<PercentCrop | undefined>(
    undefined,
  );

  const aspect = useMemo(
    () => (width && height ? width / height : undefined),
    [width, height],
  );

  /**
   * Инициализация кропа при загрузке изображения.
   * Здесь работаем только в NATURAL (naturalWidth/naturalHeight) и процентах.
   */
  const initCropFromImage = useCallback(
    (img: HTMLImageElement) => {
      setImgEl(img);
      onImageReady(img);

      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      // Уже есть NATURAL crop — просто сконвертим в проценты
      if (naturalCrop) {
        const percent = pixelToPercentCrop(naturalCrop, natW, natH);
        setPercentCrop(percent);
        return;
      }

      // Нет фиксированного аспекта — занимаем всё изображение (в NATURAL координатах)
      if (!aspect) {
        const initialNatural: PixelCrop = {
          x: 0,
          y: 0,
          width: natW,
          height: natH,
          unit: "px",
        };

        const initialPercent = pixelToPercentCrop(initialNatural, natW, natH);

        setNaturalCrop(initialNatural);
        setPercentCrop(initialPercent);
        onCropChange(initialNatural);
        return;
      }

      // Есть аспект — максимальный возможный кроп внутри NATURAL img
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

      const initialNatural: PixelCrop = {
        x: (natW - cropW) / 2,
        y: (natH - cropH) / 2,
        width: cropW,
        height: cropH,
        unit: "px",
      };

      const initialPercent = pixelToPercentCrop(initialNatural, natW, natH);

      setNaturalCrop(initialNatural);
      setPercentCrop(initialPercent);
      onCropChange(initialNatural);
    },
    [aspect, naturalCrop, onCropChange, onImageReady],
  );

  /**
   * Кламп в NATURAL системе координат (naturalWidth / naturalHeight).
   */
  const clampNaturalCropToImage = useCallback(
    (c: PixelCrop): PixelCrop => {
      if (!imgEl) return c;

      const natW = imgEl.naturalWidth;
      const natH = imgEl.naturalHeight;

      let { x, y, width, height } = c;

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
    },
    [imgEl, aspect],
  );

  /**
   * Обновление кропа из числовых инпутов.
   * Инпуты работают в NATURAL координатах.
   */
  const updateCropFromControls = useCallback(
    (naturalNextRaw: PixelCrop) => {
      if (!imgEl) return;

      const natW = imgEl.naturalWidth;
      const natH = imgEl.naturalHeight;

      // 1) клампим в NATURAL
      const naturalNext = clampNaturalCropToImage(naturalNextRaw);

      // 2) пересчитываем в проценты от NATURAL
      const nextPercent = pixelToPercentCrop(naturalNext, natW, natH);

      setNaturalCrop(naturalNext);
      setPercentCrop(nextPercent);
      onCropChange(naturalNext); // наружу — NATURAL
    },
    [clampNaturalCropToImage, imgEl, onCropChange],
  );

  /**
   * Обработка изменений от ReactCrop (в процентах).
   */
  const handleReactCropChange = useCallback(
    (_pixel: PixelCrop, percent: PercentCrop) => {
      if (!imgEl) return;

      setPercentCrop(percent);

      const natW = imgEl.naturalWidth;
      const natH = imgEl.naturalHeight;

      // проценты -> NATURAL -> clamp
      const naturalUnclamped = percentToPixelCrop(percent, natW, natH);
      const naturalNext = clampNaturalCropToImage(naturalUnclamped);

      setNaturalCrop(naturalNext);
      onCropChange(naturalNext); // наружу — NATURAL
    },
    [imgEl, clampNaturalCropToImage, onCropChange],
  );

  /**
   * Лимиты для инпутов: NATURAL координаты.
   */
  const limits = useMemo(() => {
    if (!imgEl) {
      return {
        xMax: undefined,
        yMax: undefined,
        wMax: undefined,
        hMax: undefined,
      } as const;
    }

    const natW = imgEl.naturalWidth;
    const natH = imgEl.naturalHeight;

    if (!naturalCrop) {
      return {
        xMax: undefined,
        yMax: undefined,
        wMax: natW,
        hMax: natH,
      } as const;
    }

    return {
      xMax: natW - naturalCrop.width,
      yMax: natH - naturalCrop.height,
      wMax: natW,
      hMax: natH,
    } as const;
  }, [imgEl, naturalCrop]);

  return {
    imgEl,
    // наружу в UI-контролы — NATURAL crop
    crop: naturalCrop,
    // для ReactCrop — проценты
    percentCrop,
    aspect,
    initCropFromImage,
    updateCropFromControls,
    handleReactCropChange,
    limits,
  };
};
