"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import ReactCrop, { type PixelCrop as RICPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./crop-theme.css";
import { parseAspect, topLeftMaxCrop } from "../_lib/aspect";
import type { AspectOption } from "../_types";

export interface CropModalResult {
  crop: { x: number; y: number; width: number; height: number };
}

interface CropModalProps {
  open: boolean;
  src: string;
  aspect: AspectOption;
  onCancel: () => void;
  onApply: (result: CropModalResult, imageEl: HTMLImageElement) => void;
  labels?: { cropTitle?: string; cancel?: string; apply?: string };
}

export const CropModal: React.FC<CropModalProps> = ({
  open,
  src,
  aspect,
  onCancel,
  onApply,
  labels,
}) => {
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<RICPixelCrop>();
  const [ready, setReady] = useState(false);

  const aspectValue = useMemo(() => parseAspect(aspect), [aspect]);

  const onImageLoaded = (img: HTMLImageElement) => {
    setImgEl(img);

    // Стартовый кроп: максимальный, с учётом отображаемых размеров и от (0,0)
    const displayW = img.width; // после применённых CSS ограничений
    const displayH = img.height;
    const initial = topLeftMaxCrop(displayW, displayH, aspectValue);

    setCrop({
      unit: "px",
      x: initial.x,
      y: initial.y,
      width: initial.width,
      height: initial.height,
    });

    setReady(true);
    return false; // предотвращаем автосохранение кропа от библиотеки
  };

  useEffect(() => {
    if (!open) {
      setReady(false);
      setImgEl(null);
      setCrop(undefined);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-lg bg-popover text-popover-foreground shadow-lg">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-medium">
            {labels?.cropTitle ?? "Кадрирование"}
          </h3>
        </div>

        <div className="p-4">
          <div className="relative w-full max-h-[60vh] overflow-hidden rounded-md bg-muted/20">
            <div className="crop-theme text-primary">
              <ReactCrop
                aspect={aspectValue}
                className="w-full"
                crop={crop}
                keepSelection
                onChange={(c) => setCrop(c as RICPixelCrop)}
                style={{ maxHeight: "60vh" }}
              >
                <img
                  alt="crop-target"
                  className="block max-w-full max-h-[60vh] w-auto h-auto object-contain select-none"
                  draggable={false}
                  onLoad={(e) => onImageLoaded(e.currentTarget)}
                  src={src}
                />
              </ReactCrop>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
            onClick={onCancel}
            type="button"
          >
            {labels?.cancel ?? "Отмена"}
          </button>
          <button
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 disabled:opacity-50"
            disabled={!ready || !crop}
            onClick={() => {
              if (!imgEl || !crop) return;
              onApply(
                {
                  crop: {
                    x: Math.round(crop.x),
                    y: Math.round(crop.y),
                    width: Math.round(crop.width),
                    height: Math.round(crop.height),
                  },
                },
                imgEl,
              );
            }}
            type="button"
          >
            {labels?.apply ?? "Применить"}
          </button>
        </div>
      </div>
    </div>
  );
};
