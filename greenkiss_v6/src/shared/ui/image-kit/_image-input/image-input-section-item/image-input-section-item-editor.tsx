"use client";

import type { ReactNode } from "react";
import type { PixelCrop, PercentCrop } from "react-image-crop";
import type { ImageItem } from "../_types";
import { useImageCrop } from "./use-image-crop";

type Props = {
  width: number;
  height: number;
  item: ImageItem;
  isProcessing: boolean;
  onImageReady: (img: HTMLImageElement) => void;
  onCropChange: (crop: PixelCrop) => void;
  children: (args: {
    crop: PixelCrop | undefined;
    aspect?: number;
    limits: {
      xMax?: number;
      yMax?: number;
      wMax?: number;
      hMax?: number;
    };
    handleReactCropChange: (next: PixelCrop, percent: PercentCrop) => void;
    initCropFromImage: (img: HTMLImageElement) => void;
  }) => ReactNode;
};

export const ImageInputSectionItemEditor = ({
  width,
  height,
  item,
  isProcessing,
  onImageReady,
  onCropChange,
  children,
}: Props) => {
  const {
    imgEl,
    crop,
    aspect,
    initCropFromImage,
    updateCrop,
    handleExternalCropChange,
    limits,
  } = useImageCrop({
    width,
    height,
    item,
    onImageReady,
    onCropChange,
  });

  const handleReactCropChange = (next: PixelCrop, percent: PercentCrop) => {
    void percent;
    handleExternalCropChange(next);
  };

  return (
    <>
      {children({
        crop,
        aspect,
        limits,
        handleReactCropChange,
        initCropFromImage,
      })}
    </>
  );
};
