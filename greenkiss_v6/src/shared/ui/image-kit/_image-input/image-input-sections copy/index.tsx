"use client";

import type { PercentCrop, PixelCrop } from "react-image-crop";

import { Separator } from "@/shared/ui/kit/separator";
import { ImageInputSectionItem } from "./image-input-section-item";

import "react-image-crop/dist/ReactCrop.css";
import { useCallback, useEffect, useState } from "react";
import { ImageItem } from "../types";

type ImgSize = { width: number; height: number } | null;

export const ImageInputSections = ({
  items,
  isProcessing,
  width,
  height,
  onItemsChange,
  onRemoveItem,
}: {
  items: ImageItem[];
  isProcessing: boolean;
  width: number;
  height: number;
  onItemsChange: (updater: (prev: ImageItem[]) => ImageItem[]) => void;
  onRemoveItem: (index: number) => void;
}) => {
  const filesLength = items.length;

  const files = items.map((item) => item.file);
  const ratio = width / height;

  const [percentCrops, setPercentCrops] = useState<(PercentCrop | undefined)[]>(
    [],
  );
  const [imgSizes, setImgSizes] = useState<ImgSize[]>([]);

  // ресет массивов при изменении количества файлов
  useEffect(() => {
    if (!filesLength) {
      setPercentCrops([]);
      setImgSizes([]);
      return;
    }

    setPercentCrops(new Array(filesLength).fill(undefined));
    setImgSizes(new Array(filesLength).fill(null));
  }, [filesLength]);

  const handleImageLoaded = useCallback(
    (index: number) => (img: HTMLImageElement) => {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      setImgSizes((prev) => {
        const next = [...prev];
        next[index] = { width: imgWidth, height: imgHeight };
        return next;
      });

      // сохраним img в items
      onItemsChange((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, img };
        return next;
      });

      if (!ratio) return;

      const fullPercentCrop: PercentCrop = {
        unit: "%",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };

      const aspectWidth = ratio;
      const aspectHeight = 1;
      const imgAspect = imgWidth / imgHeight;

      let cropWidthPercent = 100;
      let cropHeightPercent = 100;
      let cropXPercent = 0;
      let cropYPercent = 0;

      // Эмуляция makeAspectCrop поверх fullPercentCrop
      if (imgAspect > aspectWidth / aspectHeight) {
        // изображение шире требуемого аспекта — ограничиваем по высоте
        cropHeightPercent = fullPercentCrop.height;
        const targetWidth =
          (cropHeightPercent * aspectWidth * imgHeight) /
          (aspectHeight * imgWidth);
        cropWidthPercent = targetWidth;
        cropXPercent = (fullPercentCrop.width - targetWidth) / 2;
      } else {
        // изображение выше/уже — ограничиваем по ширине
        cropWidthPercent = fullPercentCrop.width;
        const targetHeight =
          (cropWidthPercent * aspectHeight * imgWidth) /
          (aspectWidth * imgHeight);
        cropHeightPercent = targetHeight;
        cropYPercent = (fullPercentCrop.height - targetHeight) / 2;
      }

      const aspectCrop: PercentCrop = {
        unit: "%",
        x: cropXPercent,
        y: cropYPercent,
        width: cropWidthPercent,
        height: cropHeightPercent,
      };

      setPercentCrops((prev) => {
        const next = [...prev];
        next[index] = aspectCrop;
        return next;
      });

      const pixelCrop: PixelCrop = {
        unit: "px",
        x: (aspectCrop.x / 100) * imgWidth,
        y: (aspectCrop.y / 100) * imgHeight,
        width: (aspectCrop.width / 100) * imgWidth,
        height: (aspectCrop.height / 100) * imgHeight,
      };

      onItemsChange((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, pixelCrop };
        return next;
      });
    },
    [onItemsChange, ratio],
  );

  const pixelToPercent = useCallback(
    (index: number, pixelCrop: PixelCrop): PercentCrop | undefined => {
      const size = imgSizes[index];
      if (!size) return undefined;

      const { width: imgWidth, height: imgHeight } = size;

      return {
        unit: "%",
        x: (pixelCrop.x / imgWidth) * 100,
        y: (pixelCrop.y / imgHeight) * 100,
        width: (pixelCrop.width / imgWidth) * 100,
        height: (pixelCrop.height / imgHeight) * 100,
      };
    },
    [imgSizes],
  );

  const handleCropChange = useCallback(
    (index: number) => (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      setPercentCrops((prev) => {
        const next = [...prev];
        next[index] = percentCrop;
        return next;
      });

      onItemsChange((prev) => {
        const next = [...prev];
        const current = next[index];
        if (!current) return prev;
        next[index] = { ...current, pixelCrop };
        return next;
      });
    },
    [onItemsChange],
  );

  // вычисление валидности и запись isInvalid в items
  useEffect(() => {
    if (!filesLength) {
      onItemsChange(() => []);
      return;
    }

    const timeoutId = setTimeout(() => {
      onItemsChange((prev) => {
        const next = [...prev];

        for (let i = 0; i < filesLength; i++) {
          const item = next[i];
          const crop = item?.pixelCrop;
          const size = imgSizes[i];

          if (!item) continue;

          if (!crop || !size) {
            next[i] = { ...item, isInvalid: true };
            continue;
          }

          if (crop.width < width || crop.height < height) {
            next[i] = { ...item, isInvalid: true };
          } else {
            next[i] = { ...item, isInvalid: false };
          }
        }

        return next;
      });
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [filesLength, imgSizes, width, height, onItemsChange]);

  if (!filesLength) return null;

  return (
    <div className="max-h-[60vh] lg:max-h-[70vh] w-full flex flex-col overflow-y-auto">
      {items.map((item, index) => (
        <div className="flex flex-col" key={`${item.file.name}-${index}`}>
          <ImageInputSectionItem
            aspect={ratio}
            crop={percentCrops[index]}
            imgSize={imgSizes[index] ?? undefined}
            isProcessing={isProcessing}
            item={item}
            objectUrl={item.objectUrl}
            onCropChange={handleCropChange(index)}
            onImageLoaded={handleImageLoaded(index)}
            onRemove={() => onRemoveItem(index)}
            pixelToPercent={(pixelCrop) => pixelToPercent(index, pixelCrop)}
          />

          {index !== filesLength - 1 && <Separator className="mb-3" />}
        </div>
      ))}
    </div>
  );
};
