"use client";

import { useCallback, useEffect, useState } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { createObjectUrl, revokeObjectUrl } from "./image-input.utils";

interface UseImageCropStateParams {
  files: File[];
}

export interface ImageCropItem {
  id: string;
  file: File;
  url: string;
  crop: Crop;
  completedCrop: PixelCrop | null;
}

export interface UseImageCropStateResult {
  items: ImageCropItem[];
  setCropForId: (id: string, crop: Crop) => void;
  setCompletedCropForId: (id: string, completed: PixelCrop) => void;
  reset: () => void;
}

/**
 * Manages crop state for each image and lifetime of Object URLs.
 */
export const useImageCropState = ({
  files,
}: UseImageCropStateParams): UseImageCropStateResult => {
  const [items, setItems] = useState<ImageCropItem[]>([]);

  useEffect(() => {
    if (files.length === 0) {
      setItems((prev) => {
        prev.forEach((item) => revokeObjectUrl(item.url));
        return [];
      });
      return;
    }

    setItems((prev) => {
      // cleanup previous urls
      prev.forEach((item) => revokeObjectUrl(item.url));

      return files.map((file, index) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
        file,
        url: createObjectUrl(file),
        crop: {
          unit: "px",
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        },
        completedCrop: null,
      }));
    });

    // cleanup on unmount
    return () => {
      setItems((prev) => {
        prev.forEach((item) => revokeObjectUrl(item.url));
        return [];
      });
    };
  }, [files]);

  const setCropForId = useCallback((id: string, crop: Crop) => {
    setItems((items) =>
      items.map((item) => (item.id === id ? { ...item, crop } : item))
    );
  }, []);

  const setCompletedCropForId = useCallback(
    (id: string, completed: PixelCrop) => {
      setItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, completedCrop: completed } : item
        )
      );
    },
    []
  );

  const reset = useCallback(() => {
    setItems((prev) => {
      prev.forEach((item) => revokeObjectUrl(item.url));
      return [];
    });
  }, []);

  return { items, setCropForId, setCompletedCropForId, reset };
};
