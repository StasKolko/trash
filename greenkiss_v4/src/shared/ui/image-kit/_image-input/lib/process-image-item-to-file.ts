import type { PixelCrop } from "react-image-crop";

import type { ImageItem } from "../model/types";

export async function processImageItemToFile(
  item: ImageItem,
  targetWidth: number,
  targetHeight: number,
): Promise<File | null> {
  const { file, img, pixelCrop } = item;

  if (!file || !img || !pixelCrop) return null;

  // Если изображение уже нужного размера и кроп фактически покрывает весь кадр —
  // возвращаем оригинальный файл без повторного перекодирования.
  const EPS = 1; // допуск на погрешности конверсий

  const isSameSize =
    img.naturalWidth === targetWidth && img.naturalHeight === targetHeight;

  const isFullFrameCrop =
    Math.abs(pixelCrop.x) <= EPS &&
    Math.abs(pixelCrop.y) <= EPS &&
    Math.abs(pixelCrop.width - img.naturalWidth) <= EPS &&
    Math.abs(pixelCrop.height - img.naturalHeight) <= EPS;

  if (isSameSize && isFullFrameCrop) {
    return file;
  }

  // pixelCrop уже в NATURAL координатах
  const naturalCrop = pixelCrop;

  const cropCanvas = drawCropToCanvas(img, naturalCrop);
  if (!cropCanvas) return null;

  // Приводим итоговый размер к заданным в конфиге width/height
  const finalCanvas = prepareFinalCanvasFromCrop(
    cropCanvas,
    targetWidth,
    targetHeight,
  );
  if (!finalCanvas) return null;

  const mimeType = file.type || "image/png";
  const blob = await createBlobFromCanvas(finalCanvas, mimeType, 0.92);

  const fileName = buildCroppedFileName(file.name, blob.type);

  return new File([blob], fileName, { type: blob.type });
}

function drawCropToCanvas(
  img: HTMLImageElement,
  pixelCrop: PixelCrop,
): HTMLCanvasElement | null {
  const { x, y, width, height } = pixelCrop;

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = Math.round(width);
  cropCanvas.height = Math.round(height);

  const cropCtx = cropCanvas.getContext("2d");
  if (!cropCtx) return null;

  cropCtx.imageSmoothingQuality = "high";

  cropCtx.drawImage(
    img,
    x,
    y,
    width,
    height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height,
  );

  return cropCanvas;
}

function prepareFinalCanvasFromCrop(
  cropCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement | null {
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;

  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) return null;

  finalCtx.clearRect(0, 0, targetWidth, targetHeight);

  // Если хотите, здесь можно делать подгонку под нужные пропорции.
  // Сейчас просто рисуем crop 1:1 на весь итоговый холст.
  finalCtx.imageSmoothingQuality = "high";
  finalCtx.drawImage(
    cropCanvas,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  return finalCanvas;
}

function createBlobFromCanvas(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!("toBlob" in canvas)) {
      reject(new Error("Canvas toBlob not supported"));
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function buildCroppedFileName(originalName: string, blobType: string): string {
  const dotIndex = originalName.lastIndexOf(".");

  const base = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
  const extFromOriginal = dotIndex !== -1 ? originalName.slice(dotIndex) : "";

  if (!extFromOriginal) {
    if (blobType === "image/jpeg") return `${base}-cropped.jpg`;
    if (blobType === "image/webp") return `${base}-cropped.webp`;
    return `${base}-cropped.png`;
  }

  return `${base}-cropped${extFromOriginal}`;
}
