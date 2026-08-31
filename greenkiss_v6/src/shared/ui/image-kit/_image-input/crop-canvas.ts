import {
  type CropRect,
  canvasToBlob,
  drawCropToCanvas,
  fileToImageBitmap,
} from "../_lib/image-utils";

export type ComputeCropBlobParams = {
  file: Blob;
  crop: CropRect;
  outMime: string;
  outSize?: { width?: number; height?: number }; // если хотим конкретный вывод
  quality?: number; // 0..1 для jpeg/webp/avif
};

export const computeCropBlob = async ({
  file,
  crop,
  outMime,
  outSize,
  quality,
}: ComputeCropBlobParams) => {
  const bitmap = await fileToImageBitmap(file);
  const canvas = drawCropToCanvas(bitmap, crop, outSize);
  const blob = await canvasToBlob(canvas, outMime, quality);
  return blob;
};
