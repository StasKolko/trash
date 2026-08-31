import type { PixelCrop } from "react-image-crop";

export type ImageItem = {
  file: File;
  img: HTMLImageElement | null;
  pixelCrop?: PixelCrop;
  objectUrl: string;
};
