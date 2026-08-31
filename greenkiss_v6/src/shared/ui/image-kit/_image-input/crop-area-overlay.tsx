"use client";

import type React from "react";
import { useCallback, useRef, useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import type { CropRect, ImageInputAspectRatio } from "./types";

interface CropAreaOverlayProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  cropRect: CropRect;
  aspectRatio: ImageInputAspectRatio;
  disabled?: boolean;
  onCropChange: (rect: CropRect) => void;
}

/**
 * Convert crop in pixels (relative to natural image size) to percent crop for ReactCrop.
 */
function pxToPercentCrop(
  crop: CropRect,
  naturalWidth: number,
  naturalHeight: number,
): Crop {
  return {
    unit: "%",
    x: (crop.x / naturalWidth) * 100,
    y: (crop.y / naturalHeight) * 100,
    width: (crop.width / naturalWidth) * 100,
    height: (crop.height / naturalHeight) * 100,
  };
}

/**
 * Convert crop in percent (ReactCrop output) to pixels relative to natural image size.
 */
function percentToPxCrop(
  crop: Crop,
  naturalWidth: number,
  naturalHeight: number,
): CropRect {
  const xPercent = crop.x ?? 0;
  const yPercent = crop.y ?? 0;
  const widthPercent = crop.width ?? 0;
  const heightPercent = crop.height ?? 0;

  return {
    unit: "px",
    x: (xPercent / 100) * naturalWidth,
    y: (yPercent / 100) * naturalHeight,
    width: (widthPercent / 100) * naturalWidth,
    height: (heightPercent / 100) * naturalHeight,
  };
}

export const CropAreaOverlay: React.FC<CropAreaOverlayProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  cropRect,
  aspectRatio,
  disabled = false,
  onCropChange,
}) => {
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (!node) return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setContainerWidth(rect.width);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleChange = useCallback(
    (c: Crop) => {
      if (disabled) return;

      // ReactCrop works in percents by default. We convert to px in natural image space.
      const next = percentToPxCrop(c, imageWidth, imageHeight);
      onCropChange(next);
    },
    [disabled, imageWidth, imageHeight, onCropChange],
  );

  const aspect = aspectRatio.width / aspectRatio.height;

  // Pass crop to ReactCrop as percentages
  const reactCrop: Crop = pxToPercentCrop(cropRect, imageWidth, imageHeight);

  return (
    <div
      ref={handleContainerRef}
      className="relative w-full aspect-square overflow-hidden rounded-md bg-muted border border-border"
    >
      {containerWidth !== null && (
        <ReactCrop
          aspect={aspect}
          crop={reactCrop}
          disabled={disabled}
          keepSelection
          minHeight={5}
          minWidth={5}
          onChange={handleChange}
          ruleOfThirds
          className="h-full w-full"
        >
          {/* biome-ignore lint/performance/noImgElement: react-image-crop requires <img> */}
          <img
            alt="Выбранное изображение"
            className="h-full w-full object-contain select-none"
            draggable={false}
            src={imageUrl}
          />
        </ReactCrop>
      )}
    </div>
  );
};
