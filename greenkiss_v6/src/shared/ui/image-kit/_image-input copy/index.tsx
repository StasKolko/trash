"use client";

import { useState } from "react";
import type { PixelCrop } from "react-image-crop";
import { ImageInputFooter } from "./_features/image-input-footer";
import { ImageInputHeader } from "./_features/image-input-header";
import { ImageInputTrigger } from "./_features/image-input-trigger";
import { processImageItemToFile } from "./_lib/process-image-item-to-file";
import type { ImageItem } from "./_types";
import { ImageInputDialog } from "./_ui/image-input-dialog";
import { ImageInputSection } from "./_ui/image-input-section";
import { ImageCropSectionContent } from "./image-input-section-item";

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

  function resetState() {
    if (isProcessing) return;

    for (const item of items) {
      URL.revokeObjectURL(item.objectUrl);
    }

    setOpen(false);
    setItems([]);
    setIsProcessing(false);
  }

  function handleItemsSelected(newItems: ImageItem[]) {
    setItems(newItems);
    setOpen(true);
  }

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

  function handleItemCropChange(index: number, naturalCrop: PixelCrop) {
    setItems((prev) => {
      return prev.map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          pixelCrop: naturalCrop,
          isInvalid: isCropInvalid(naturalCrop, item.img),
        };
      });
    });
  }

  async function handleConfirm() {
    if (isProcessing || items.some((item) => item.isInvalid)) return;
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
  }

  function isCropInvalid(
    crop: PixelCrop | undefined,
    img: HTMLImageElement | null,
  ) {
    if (!crop || !img) return false;

    // crop здесь в NATURAL координатах
    return crop.width < width || crop.height < height;
  }

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
          <ImageInputSection
            key={item.file.name}
            onRemoveItem={() => handleRemoveItem(index)}
            title={item.file.name}
            isInvalid={item.isInvalid}
          >
            <ImageCropSectionContent
              item={item}
              isProcessing={isProcessing}
              height={height}
              width={width}
              onCropChange={(crop: PixelCrop) =>
                handleItemCropChange(index, crop)
              }
              onImageReady={(img: HTMLImageElement) =>
                handleItemImageReady(index, img)
              }
            />
          </ImageInputSection>
        ))}
      </div>

      <ImageInputFooter
        isConfirmDisabled={items.some((item) => item.isInvalid)}
        isProcessing={isProcessing}
        onCancel={resetState}
        onConfirm={handleConfirm}
      />
    </ImageInputDialog>
  );
};
