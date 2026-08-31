"use client";

import { useCallback, useEffect, useState } from "react";
import {
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
} from "react-image-crop";

type ImgSize = { width: number; height: number } | null;

export function useImageCrops({
  aspectRatio,
  filesLength,
  setExternalPixelCrops,
  setExternalImgElements,
}: {
  aspectRatio?: number;
  filesLength: number;
  setExternalPixelCrops?: React.Dispatch<
    React.SetStateAction<(PixelCrop | undefined)[]>
  >;
  setExternalImgElements?: React.Dispatch<
    React.SetStateAction<(HTMLImageElement | null)[]>
  >;
}) {
  const [percentCrops, setPercentCrops] = useState<(PercentCrop | undefined)[]>(
    [],
  );
  const [pixelCrops, setPixelCropsLocal] = useState<(PixelCrop | undefined)[]>(
    [],
  );
  const [imgSizes, setImgSizes] = useState<ImgSize[]>([]);

  useEffect(() => {
    if (!filesLength) {
      setPercentCrops([]);
      setPixelCropsLocal([]);
      setImgSizes([]);
      return;
    }

    setPercentCrops(new Array(filesLength).fill(undefined));
    setPixelCropsLocal(new Array(filesLength).fill(undefined));
    setImgSizes(new Array(filesLength).fill(null));
  }, [filesLength]);

  const handleImageLoaded = useCallback(
    (index: number) => (img: HTMLImageElement) => {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      // сохранить img в родителя
      if (setExternalImgElements) {
        setExternalImgElements((prev) => {
          const next = [...prev];
          next[index] = img;
          return next;
        });
      }

      // сохранить размеры
      setImgSizes((prev) => {
        const next = [...prev];
        next[index] = { width: imgWidth, height: imgHeight };
        return next;
      });

      if (!aspectRatio) return;

      const fullPercentCrop: PercentCrop = {
        unit: "%",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };

      const aspectCrop = makeAspectCrop(
        fullPercentCrop,
        aspectRatio,
        imgWidth,
        imgHeight,
      );

      // percent crop
      setPercentCrops((prev) => {
        const next = [...prev];
        next[index] = aspectCrop;
        return next;
      });

      // pixel crop на основе percentCrop
      const pixelCrop: PixelCrop = {
        unit: "px",
        x: (aspectCrop.x / 100) * imgWidth,
        y: (aspectCrop.y / 100) * imgHeight,
        width: (aspectCrop.width / 100) * imgWidth,
        height: (aspectCrop.height / 100) * imgHeight,
      };

      setPixelCropsLocal((prev) => {
        const next = [...prev];
        next[index] = pixelCrop;
        return next;
      });

      if (setExternalPixelCrops) {
        setExternalPixelCrops((prev) => {
          const next = [...prev];
          next[index] = pixelCrop;
          return next;
        });
      }
    },
    [aspectRatio, setExternalImgElements, setExternalPixelCrops],
  );

  /**
   * ReactCrop сообщает нам актуальный crop при любом изменении (drag/resize).
   */
  const handleCropChange = useCallback(
    (index: number) => (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      setPercentCrops((prev) => {
        const next = [...prev];
        next[index] = percentCrop;
        return next;
      });

      setPixelCropsLocal((prev) => {
        const next = [...prev];
        next[index] = pixelCrop;
        return next;
      });

      if (setExternalPixelCrops) {
        setExternalPixelCrops((prev) => {
          const next = [...prev];
          next[index] = pixelCrop;
          return next;
        });
      }
    },
    [setExternalPixelCrops],
  );

  /**
   * Конвертация пиксельного crop-а в процентный по размерам конкретного изображения.
   */
  const pixelToPercent = useCallback(
    (index: number, pixelCrop: PixelCrop): PercentCrop | undefined => {
      const size = imgSizes[index];
      if (!size) return undefined;

      const { width, height } = size;

      return {
        unit: "%",
        x: (pixelCrop.x / width) * 100,
        y: (pixelCrop.y / height) * 100,
        width: (pixelCrop.width / width) * 100,
        height: (pixelCrop.height / height) * 100,
      };
    },
    [imgSizes],
  );

  /** Хелпер: получить функцию pixelToPercent, уже привязанную к конкретному index */
  const makePixelToPercentForIndex = useCallback(
    (index: number) =>
      (pixelCrop: PixelCrop): PercentCrop | undefined =>
        pixelToPercent(index, pixelCrop),
    [pixelToPercent],
  );

  return {
    percentCrops,
    pixelCrops,
    imgSizes,
    handleImageLoaded,
    handleCropChange,
    makePixelToPercentForIndex,
  };
}
