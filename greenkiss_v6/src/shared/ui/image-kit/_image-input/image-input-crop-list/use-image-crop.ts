"use client";

import { useCallback, useMemo, useState } from "react";
import type { Crop, PixelCrop } from "react-image-crop";

export interface UseImageCropParams {
  aspectRatio: {
    width: number;
    height: number;
  };
}

export interface UseImageCropResult {
  crop: Crop;
  pixelCrop: PixelCrop | null;
  onChange: (crop: Crop) => void;
  onComplete: (c: PixelCrop) => void;
  initCropForImage: (img: HTMLImageElement) => void;
}

/**
 * Manages react-image-crop state and initializes crop to maximum possible area
 * starting from top-left corner, with required aspect ratio.
 */
export function useImageCrop({
  aspectRatio,
}: UseImageCropParams): UseImageCropResult {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);

  const targetAspect = useMemo(
    () => aspectRatio.width / aspectRatio.height,
    [aspectRatio.width, aspectRatio.height]
  );

  const initCropForImage = useCallback(
    (img: HTMLImageElement) => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      if (!naturalWidth || !naturalHeight) return;

      const imageAspect = naturalWidth / naturalHeight;

      let cropWidth: number;
      let cropHeight: number;

      // Maximal crop starting from (0,0) with given aspect ratio
      if (imageAspect >= targetAspect) {
        // image is wider than target aspect => limited by height
        cropHeight = naturalHeight;
        cropWidth = cropHeight * targetAspect;
      } else {
        // image is taller than target aspect => limited by width
        cropWidth = naturalWidth;
        cropHeight = cropWidth / targetAspect;
      }

      const widthPercent = (cropWidth / naturalWidth) * 100;
      const heightPercent = (cropHeight / naturalHeight) * 100;

      const nextCrop: Crop = {
        unit: "%",
        x: 0,
        y: 0,
        width: widthPercent,
        height: heightPercent,
      };

      setCrop(nextCrop);
      setPixelCrop({
        x: 0,
        y: 0,
        width: Math.round(cropWidth),
        height: Math.round(cropHeight),
      });
    },
    [targetAspect]
  );

  const handleChange = useCallback((nextCrop: Crop) => {
    setCrop(nextCrop);
  }, []);

  const handleComplete = useCallback((c: PixelCrop) => {
    setPixelCrop(c);
  }, []);

  return {
    crop,
    pixelCrop,
    onChange: handleChange,
    onComplete: handleComplete,
    initCropForImage,
  };
}
