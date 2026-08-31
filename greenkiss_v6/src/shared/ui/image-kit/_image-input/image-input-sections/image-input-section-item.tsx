"use client";

import { Trash2Icon } from "lucide-react";
import ReactCrop, { type PercentCrop, type PixelCrop } from "react-image-crop";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { ImageProcessingOverlay } from "../../_ui/image-processing-overlay";
import { ImageFileName } from "./image-file-name";
import { ImagePreviewFrame } from "./image-preview-frame";
import { ImageItem } from "../types";

type ImgSize = { width: number; height: number } | null;

export const ImageInputSectionItem = ({
  item,
  objectUrl,
  crop,
  aspect,
  isProcessing,
  onImageLoaded,
  onCropChange,
  imgSize,
  pixelToPercent,
  onRemove,
}: {
  item: ImageItem;
  objectUrl?: string;
  crop?: PercentCrop;
  aspect?: number;
  isProcessing: boolean;
  onImageLoaded: (img: HTMLImageElement) => void;
  onCropChange: (pixelCrop: PixelCrop, percentCrop: PercentCrop) => void;
  imgSize?: ImgSize;
  pixelToPercent?: (pixelCrop: PixelCrop) => PercentCrop | undefined;
  onRemove: () => void;
}) => {
  const { file, pixelCrop, isInvalid } = item;

  const handleNumericChange =
    (field: "x" | "y" | "width" | "height") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!imgSize || !pixelCrop || !pixelToPercent) return;

      const raw = Number(e.target.value.replace(",", "."));
      if (Number.isNaN(raw)) return;

      const { width: imgW, height: imgH } = imgSize;
      let { x, y, width, height } = pixelCrop;

      const ratio =
        aspect && aspect > 0 ? aspect : width && height ? width / height : 1;

      if (field === "x") {
        x = Math.max(0, Math.min(raw, imgW - width));
      } else if (field === "y") {
        y = Math.max(0, Math.min(raw, imgH - height));
      } else if (field === "width") {
        width = Math.max(1, raw);
        height = width / ratio;
      } else if (field === "height") {
        height = Math.max(1, raw);
        width = height * ratio;
      }

      if (x + width > imgW) {
        const overflowX = x + width - imgW;
        if (field === "x") {
          x = Math.max(0, x - overflowX);
        } else {
          width -= overflowX;
          height = width / ratio;
        }
      }

      if (y + height > imgH) {
        const overflowY = y + height - imgH;
        if (field === "y") {
          y = Math.max(0, y - overflowY);
        } else {
          height -= overflowY;
          width = height * ratio;
        }
      }

      width = Math.max(1, Math.min(width, imgW));
      height = Math.max(1, Math.min(height, imgH));
      x = Math.max(0, Math.min(x, imgW - width));
      y = Math.max(0, Math.min(y, imgH - height));

      const nextPixel: PixelCrop = {
        unit: "px",
        x,
        y,
        width,
        height,
      };

      const nextPercent = pixelToPercent(nextPixel);
      if (!nextPercent) return;

      onCropChange(nextPixel, nextPercent);
    };

  const invalid = isInvalid === true;

  return (
    <section
      className={`relative mx-auto w-full ${
        invalid ? "border border-red-500 rounded-md" : ""
      }`}
    >
      <Button
        aria-label="Удалить картинку"
        className="absolute right-2 top-2 z-20"
        onClick={onRemove}
        size="icon"
        type="button"
        variant="destructive"
      >
        <Trash2Icon aria-hidden="true" className="size-4" />
      </Button>

      <div className="mt-3 mb-2 flex justify-center">
        <ImageFileName name={file.name} />
      </div>

      {imgSize && pixelCrop && (
        <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm px-4">
          <div className="flex flex-col">
            <label className="mb-1">X</label>
            <Input
              max={imgSize.width}
              min={0}
              onChange={handleNumericChange("x")}
              type="number"
              value={Math.round(pixelCrop.x)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">Y</label>
            <Input
              max={imgSize.height}
              min={0}
              onChange={handleNumericChange("y")}
              type="number"
              value={Math.round(pixelCrop.y)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">Width</label>
            <Input
              max={imgSize.width}
              min={1}
              onChange={handleNumericChange("width")}
              type="number"
              value={Math.round(pixelCrop.width)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1">Height</label>
            <Input
              max={imgSize.height}
              min={1}
              onChange={handleNumericChange("height")}
              type="number"
              value={Math.round(pixelCrop.height)}
            />
          </div>
        </div>
      )}

      <ImagePreviewFrame isInvalid={invalid}>
        {objectUrl && (
          <ReactCrop
            aspect={aspect}
            className="max-w-full max-h-full flex items-center justify-center"
            crop={crop}
            keepSelection
            onChange={onCropChange}
          >
            {/* biome-ignore lint/performance/noImgElement: нужно именно <img> для превью */}
            <img
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              onLoad={(event) => onImageLoaded(event.currentTarget)}
              src={objectUrl}
            />
          </ReactCrop>
        )}

        <ImageProcessingOverlay isProcessing={isProcessing} />
      </ImagePreviewFrame>

      {invalid && (
        <p className="mt-2 px-4 text-sm text-red-500">
          Выбранная область слишком маленькая для заданных пропорций. Увеличьте
          область кадрирования.
        </p>
      )}
    </section>
  );
};
