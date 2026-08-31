"use client";

import type { PixelCrop } from "react-image-crop";
import type { ImageItem } from "../_types";
import { CropControls } from "./crop-controls";
import { CropPreview } from "./crop-preview";
import { useImageCrop } from "./use-image-crop";

export const ImageCropSectionContent = ({
  width,
  height,
  isProcessing,
  item,
  onImageReady,
  onCropChange,
}: {
  width: number;
  height: number;
  isProcessing: boolean;
  item: ImageItem;
  onImageReady: (img: HTMLImageElement) => void;
  onCropChange: (crop: PixelCrop) => void;
}) => {
  const {
    crop, // PixelCrop | undefined
    percentCrop, // PercentCrop | undefined
    aspect,
    initCropFromImage,
    updateCropFromControls,
    handleReactCropChange,
    limits,
  } = useImageCrop({
    width,
    height,
    item,
    onImageReady,
    onCropChange,
  });

  return (
    <>
      <CropControls
        crop={crop}
        limits={limits}
        onChange={updateCropFromControls}
      />

      <CropPreview
        aspect={aspect}
        crop={percentCrop}
        fileName={item.file.name}
        isProcessing={isProcessing}
        objectUrl={item.objectUrl}
        onChangeCrop={handleReactCropChange}
        onInitImage={initCropFromImage}
      />
    </>
  );
};
