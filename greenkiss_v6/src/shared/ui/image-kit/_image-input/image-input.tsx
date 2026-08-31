"use client";

import { useState } from "react";
import { ImageInputDialog } from "./image-input-dialog";
import { ImageInputFooter } from "./image-input-footer";
import { ImageInputHeader } from "./image-input-header";
import { ImageInputTrigger } from "./image-input-trigger";
import type { ImageItem } from "./types";
import { PixelCrop } from "react-image-crop";
import { processImageItemToFile } from "./_lib/process-image-item-to-file";
import { ImageInputSectionItem } from "./image-input-section-item";

export const ImageInput = ({
  mode,
  width,
  height,
  onComplete,
}: {
  mode: "single" | "multiple";
  width: number;
  height: number;
  onComplete: (images: File[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invalidImageItemCount, setInvalidImageItemCount] = useState(0);

  function resetState() {
    if (isProcessing) return;

    for (const item of items) {
      URL.revokeObjectURL(item.objectUrl);
    }

    setOpen(false);
    setItems([]);
    setIsProcessing(false);
    setInvalidImageItemCount(0);
  };
  
  function handleItemsSelected(newItems: ImageItem[]) {
    setItems(newItems);
    setOpen(true);
  };

  function handleRemoveItem(index: number) {
    if (isProcessing) return;

    const isLastItem = items.length === 1;

    setItems((prevItems) => {
      const itemToRemove = prevItems[index];
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.objectUrl);
      }

      return prevItems.filter((_, i) => i !== index);
    });

    if (isLastItem) resetState();
  }

  function handleItemImageReady(index: number, img: HTMLImageElement) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, img } : item)),
    );
  }

  function handleItemCropChange(index: number, pixelCrop: PixelCrop) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, pixelCrop } : item,
      ),
    );
  }

  const handleConfirm = async () => {
    if (isProcessing || invalidImageItemCount > 0) return;
    setIsProcessing(true);

    try {
      const croppedFiles: File[] = [];

      for (const item of items) {
        const croppedFile = await processImageItemToFile(item);
        if (croppedFile) {
          croppedFiles.push(croppedFile);
        }
      }

      if (croppedFiles.length) onComplete(croppedFiles);
      resetState();
    } catch (error) {
      console.error("Error while cropping images", error);
    }
  };

  return (
    <ImageInputDialog
      open={open}
      setOpen={resetState}
      trigger={
        <ImageInputTrigger mode={mode} onItemsSelected={handleItemsSelected} />
      }
    >
      <ImageInputHeader height={height} width={width} />

      <div className="max-h-[60vh] lg:max-h-[70vh] w-full flex flex-col overflow-y-auto border-t">
        {items.map((item, index) => (
          <ImageInputSectionItem
            key={`${item.file.name}-${index}`}
            onRemoveItem={() => handleRemoveItem(index)}
            item={item}
            height={height}
            width={width}
            isProcessing={isProcessing}
            onImageReady={(img: HTMLImageElement) => handleItemImageReady(index, img)}
            onCropChange={(crop: PixelCrop) => handleItemCropChange(index, crop)}
          />
        ))}
      </div>

      <ImageInputFooter
        isConfirmDisabled={invalidImageItemCount > 0}
        isProcessing={isProcessing}
        onCancel={resetState}
        onConfirm={handleConfirm}
      />
    </ImageInputDialog>
  );
};
