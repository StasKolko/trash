"use client";

import { ImageItem } from "../types";
import { ImageInputSectionItem } from "./image-input-section-item";
import type { PixelCrop } from "react-image-crop";

export const ImageInputSections = ({
  height,
  width,
  isProcessing,
  items,
  onRemoveItem,
  onItemImageReady,
  onItemCropChange,
}: {
  height: number;
  width: number;
  isProcessing: boolean;
  items: ImageItem[];
  onRemoveItem: (index: number) => void;
  onItemImageReady: (index: number, img: HTMLImageElement) => void;
  onItemCropChange: (index: number, crop: PixelCrop) => void;
}) => {
  return (
    <div className="max-h-[60vh] lg:max-h-[70vh] w-full flex flex-col overflow-y-auto border-t">
      {items.map((item, index) => (
        <ImageInputSectionItem
          key={`${item.file.name}-${index}`}
          onRemoveItem={() => onRemoveItem(index)}
          item={item}
          height={height}
          width={width}
          isProcessing={isProcessing}
          onImageReady={(img) => onItemImageReady(index, img)}
          onCropChange={(crop) => onItemCropChange(index, crop)}
        />
      ))}
    </div>
  );
};
