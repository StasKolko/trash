"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import type { ImageInputProps } from "./image-input.types";
import { useImageCropState } from "./use-image-crop-state";
import {
  ASPECT_PREVIEW_MAX_SIZE,
  blobToFile,
  calculateAspectPreviewSize,
  fileToCanvasCroppedBlob,
} from "./image-input.utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { Button } from "@/shared/ui/kit/button";

interface ImageInputDialogProps extends ImageInputProps {
  open: boolean;
  files: File[];
  onOpenChange: (open: boolean) => void;
}

/**
 * Internal dialog that holds crop logic and UI.
 */
export const ImageInputDialog: React.FC<ImageInputDialogProps> = ({
  open,
  onOpenChange,
  aspectRatio,
  files,
  onComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, setCropForId, setCompletedCropForId, reset } =
    useImageCropState({ files });

  const imagesRef = useRef<Record<string, HTMLImageElement | null>>({});

  const aspect = useMemo(
    () => aspectRatio.width / aspectRatio.height,
    [aspectRatio.height, aspectRatio.width]
  );

  const aspectPreviewSize = useMemo(
    () => calculateAspectPreviewSize(aspectRatio),
    [aspectRatio]
  );

  // Initialize crop to maximal inside image once image is loaded
  const handleImageLoad = useCallback(
    (id: string, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      imagesRef.current[id] = img;

      const width = img.width;
      const height = img.height;
      if (!width || !height) return;

      const imageAspect = width / height;

      let cropWidth = width;
      let cropHeight = width / aspect;

      if (cropHeight > height) {
        cropHeight = height;
        cropWidth = height * aspect;
      }

      const crop: Crop = {
        unit: "px",
        x: 0,
        y: 0,
        width: cropWidth,
        height: cropHeight,
      };

      setCropForId(id, crop);

      const pixelCrop: PixelCrop = {
        x: crop.x ?? 0,
        y: crop.y ?? 0,
        width: crop.width ?? 0,
        height: crop.height ?? 0,
        unit: "px",
      };
      setCompletedCropForId(id, pixelCrop);
    },
    [aspect, setCompletedCropForId, setCropForId]
  );

  const handleCancel = useCallback(() => {
    if (isProcessing) return;
    reset();
    onOpenChange(false);
  }, [isProcessing, onOpenChange, reset]);

  const handleDone = useCallback(async () => {
    if (isProcessing || items.length === 0) return;

    setIsProcessing(true);
    try {
      const resultFiles: File[] = [];

      for (const item of items) {
        const img = imagesRef.current[item.id];
        const completedCrop = item.completedCrop;

        if (!img || !completedCrop || !completedCrop.width || !completedCrop.height) {
          // Skip items without completed crop; in production you may want to throw.
          continue;
        }

        const blob = await fileToCanvasCroppedBlob(img, {
          x: completedCrop.x,
          y: completedCrop.y,
          width: completedCrop.width,
          height: completedCrop.height,
        });

        const file = blobToFile(blob, item.file);
        resultFiles.push(file);
      }

      onComplete(resultFiles);
      reset();
      onOpenChange(false);
    } catch (error) {
      // For developers: log the error, but keep UX simple
      console.error("Image cropping failed", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, items, onComplete, onOpenChange, reset]);

  // Close dialog if there are no files
  useEffect(() => {
    if (open && files.length === 0) {
      onOpenChange(false);
    }
  }, [files.length, onOpenChange, open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[1024px] w-[90vw] p-0">
        <div className="flex flex-col max-h-[90vh]">
          <AlertDialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <AlertDialogTitle>Загрузка изображений</AlertDialogTitle>
                <AlertDialogDescription>
                  Выберите область изображения для обрезки под нужные пропорции.
                </AlertDialogDescription>
              </div>

              <div className="flex items-center justify-center">
                <div
                  className="border border-primary flex items-center justify-center text-xs text-primary rounded-md"
                  style={{
                    width: aspectPreviewSize.width,
                    height: aspectPreviewSize.height,
                  }}
                >
                  {aspectRatio.width}x{aspectRatio.height}
                </div>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="flex-1 overflow-auto px-6 py-4 space-y-4 bg-background">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative w-full aspect-square bg-muted border rounded-md overflow-hidden flex items-center justify-center"
              >
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-20">
                    <span className="text-sm font-medium">Обработка...</span>
                  </div>
                )}

                <ReactCrop
                  crop={item.crop}
                  onChange={(crop) => !isProcessing && setCropForId(item.id, crop)}
                  onComplete={(completed) =>
                    !isProcessing &&
                    completed.width &&
                    completed.height &&
                    setCompletedCropForId(item.id, completed as PixelCrop)
                  }
                  aspect={aspect}
                  keepSelection
                  locked={isProcessing}
                  ruleOfThirds
                  className="w-full h-full flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.file.name}
                    className="max-w-full max-h-full object-contain"
                    onLoad={(e) => handleImageLoad(item.id, e)}
                  />
                </ReactCrop>
              </div>
            ))}

            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Изображения не выбраны.
              </p>
            )}
          </div>

          <AlertDialogFooter className="px-6 py-4 border-t flex items-center justify-end gap-2">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isProcessing}
              className="inline-flex items-center gap-2"
            >
              {isProcessing && (
                <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              )}
              <span>Отмена</span>
            </Button>

            <Button
              variant="default"
              onClick={handleDone}
              disabled={isProcessing || items.length === 0}
              className="inline-flex items-center gap-2"
            >
              {isProcessing && (
                <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              )}
              <span>Готово</span>
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
