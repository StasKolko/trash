"use client";

import { useEffect } from "react";
import type { PixelCrop } from "react-image-crop";

export function useInitCropArrays(
  filesLength: number,
  setImgElements: React.Dispatch<
    React.SetStateAction<(HTMLImageElement | null)[]>
  >,
  setPixelCrops: React.Dispatch<
    React.SetStateAction<(PixelCrop | undefined)[]>
  >,
) {
  useEffect(() => {
    if (!filesLength) {
      setImgElements([]);
      setPixelCrops([]);
      return;
    }

    setImgElements(new Array(filesLength).fill(null));
    setPixelCrops(new Array(filesLength).fill(undefined));
  }, [filesLength, setImgElements, setPixelCrops]);
}
