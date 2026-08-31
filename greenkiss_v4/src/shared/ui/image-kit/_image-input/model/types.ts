import type { PixelCrop } from "react-image-crop";

export type ImagePreviewBackgroundMode = "solid" | "checkerboard";

export type ImageInputConfig = {
  mode: ImageInputMode;
  width: number;
  height: number;
  onComplete: (images: File[]) => void;
};

export type ImageInputMode = "single" | "multiple";

export type ImageItem = {
  id: string;
  file: File;
  img: HTMLImageElement | null;
  pixelCrop?: PixelCrop;
  objectUrl: string;
  isInvalid: boolean;
};
