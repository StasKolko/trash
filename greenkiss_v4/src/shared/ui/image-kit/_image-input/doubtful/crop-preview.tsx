"use client";

import ReactCrop, { type PercentCrop, type PixelCrop } from "react-image-crop";
import { ImageProcessingOverlay } from "../../_ui/image-processing-overlay";
import { useImageInputStore } from "../model/context";
import { ImagePreviewFrame } from "../ui/preview-frame";

import "react-image-crop/dist/ReactCrop.css";

export const CropPreview = ({
  fileName,
  objectUrl,
  crop,
  onInitImage,
  onChangeCrop,
}: {
  fileName: string;
  objectUrl: string;
  // ReactCrop будет работать с PercentCrop
  crop: PercentCrop | undefined;
  onInitImage: (img: HTMLImageElement) => void;
  // коллбек принимает оба значения, как сам ReactCrop.onChange
  onChangeCrop: (pixel: PixelCrop, percent: PercentCrop) => void;
}) => {
  const aspect = useImageInputStore((state) => state.aspect);
  const isProcessing = useImageInputStore((state) => state.isProcessing);

  return (
    <ImagePreviewFrame>
      <ReactCrop
        className="max-w-full max-h-full flex items-center justify-center"
        crop={crop}
        keepSelection
        onChange={onChangeCrop}
        {...(aspect ? { aspect } : {})}
      >
        {/* biome-ignore lint/performance/noImgElement: нужно именно <img> для превью */}
        <img
          alt={fileName}
          className="max-w-full max-h-full object-contain"
          onLoad={(e) => onInitImage(e.currentTarget)}
          src={objectUrl}
        />
      </ReactCrop>

      {isProcessing && <ImageProcessingOverlay text="Обработка..." />}
    </ImagePreviewFrame>
  );
};
