import type React from "react";
import { CropAreaOverlay } from "./crop-area-overlay";
import type { CropRect, ImageInputAspectRatio } from "./types";

interface CropSectionProps {
  index: number;
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  cropRect: CropRect;
  aspectRatio: ImageInputAspectRatio;
  disabled?: boolean;
  isProcessing?: boolean;
  onCropChange: (rect: CropRect) => void;
}

export const CropSection: React.FC<CropSectionProps> = ({
  index,
  imageUrl,
  naturalWidth,
  naturalHeight,
  cropRect,
  aspectRatio,
  disabled = false,
  isProcessing = false,
  onCropChange,
}) => {
  return (
    <section className="w-full">
      <div className="mb-2 px-6 text-sm font-medium text-muted-foreground">
        Изображение {index + 1}
      </div>

      <div className="relative w-full aspect-square bg-muted/80 border border-border rounded-md overflow-hidden">
        <CropAreaOverlay
          aspectRatio={aspectRatio}
          cropRect={cropRect}
          disabled={disabled}
          imageHeight={naturalHeight}
          imageUrl={imageUrl}
          imageWidth={naturalWidth}
          onCropChange={onCropChange}
        />

        {isProcessing && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-md">
            <span className="text-sm font-medium text-muted-foreground">
              Обработка...
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
