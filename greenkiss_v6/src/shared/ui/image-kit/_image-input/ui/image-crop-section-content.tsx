"use client";

import type { PixelCrop } from "react-image-crop";
import { useShallow } from "zustand/react/shallow";
import { useImageInputStore } from "../features/provider";
import { CropControls } from "./crop-controls";
import { CropPreview } from "./crop-preview";
import { useImageCrop } from "../lib/use-image-crop";
import type { ImageItem } from "../model/types";

export const ImageCropSectionContent = ({
  item,
  index,
}: {
  item: ImageItem;
  index: number;
}) => {
  const {
    width,
    height,
    isProcessing,
    handleItemImageReady,
    handleItemCropChange,
  } = useImageInputStore(
    useShallow((state) => ({
      width: state.width,
      height: state.height,
      isProcessing: state.isProcessing,
      handleItemImageReady: state.handleItemImageReady,
      handleItemCropChange: state.handleItemCropChange,
    })),
  );

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
    onImageReady: (img: HTMLImageElement) => handleItemImageReady(index, img),
    onCropChange: (crop: PixelCrop) => handleItemCropChange(index, crop),
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
