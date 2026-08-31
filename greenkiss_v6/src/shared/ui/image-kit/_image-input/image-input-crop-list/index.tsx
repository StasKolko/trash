"use client";

import React from "react";
import ReactImageCrop, { type Crop, type PixelCrop } from "react-image-crop";
import { useImageCrop } from "./use-image-crop";

interface ImageInputCropItemProps {
  file: File;
  aspectRatio: {
    width: number;
    height: number;
  };
  isProcessing: boolean;
  onPixelCropChange: (pixelCrop: PixelCrop | null) => void;
}

/**
 * One image section with crop.
 * Section is square, fills dialog width, has different background.
 * Image fits into section (contain) and is centered if smaller.
 * Crop frame starts from top-left corner with maximal size for given aspect ratio.
 */
const ImageInputCropItem: React.FC<ImageInputCropItemProps> = ({
  file,
  aspectRatio,
  isProcessing,
  onPixelCropChange,
}) => {
  const [imageUrl] = React.useState(() => URL.createObjectURL(file));

  const { crop, pixelCrop, onChange, onComplete, initCropForImage } =
    useImageCrop({ aspectRatio });

  React.useEffect(() => {
    onPixelCropChange(pixelCrop);
  }, [pixelCrop, onPixelCropChange]);

  React.useEffect(
    () => () => {
      URL.revokeObjectURL(imageUrl);
    },
    [imageUrl]
  );

  const handleImageRef = (img: HTMLImageElement | null) => {
    if (img) {
      initCropForImage(img);
    }
  };

  const aspect = aspectRatio.width / aspectRatio.height;

  return (
    <div className="relative mx-auto w-full max-w-3xl rounded-md border bg-muted/60 p-0">
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ReactImageCrop
            crop={crop as Crop}
            onChange={onChange}
            onComplete={onComplete}
            aspect={aspect}
            keepSelection
            disabled={isProcessing}
            className="h-full w-full"
          >
            <img
              ref={handleImageRef}
              src={imageUrl}
              alt={file.name}
              className="h-full w-full object-contain"
            />
          </ReactImageCrop>
        </div>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm font-medium">
          Обработка...
        </div>
      )}
    </div>
  );
};

interface ImageInputCropListProps {
  files: File[];
  aspectRatio: {
    width: number;
    height: number;
  };
  isProcessing: boolean;
  onPixelCropsChange: (pixelCrops: (PixelCrop | null)[]) => void;
}

/**
 * List of images with crop controls.
 */
export const ImageInputCropList: React.FC<ImageInputCropListProps> = ({
  files,
  aspectRatio,
  isProcessing,
  onPixelCropsChange,
}) => {
  const [pixelCrops, setPixelCrops] = React.useState<(PixelCrop | null)[]>(
    () => files.map(() => null)
  );

  React.useEffect(() => {
    setPixelCrops(files.map(() => null));
  }, [files]);

  React.useEffect(() => {
    onPixelCropsChange(pixelCrops);
  }, [pixelCrops, onPixelCropsChange]);

  const handleItemPixelCropChange = (index: number) => (crop: PixelCrop | null) => {
    setPixelCrops((prev) => {
      const next = [...prev];
      next[index] = crop;
      return next;
    });
  };

  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Изображения ещё не выбраны.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {files.map((file, index) => (
        <ImageInputCropItem
          key={file.name + index}
          file={file}
          aspectRatio={aspectRatio}
          isProcessing={isProcessing}
          onPixelCropChange={handleItemPixelCropChange(index)}
        />
      ))}
    </div>
  );
};
