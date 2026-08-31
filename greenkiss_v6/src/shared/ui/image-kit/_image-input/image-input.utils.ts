import type { ImageAspectRatio } from "./image-input.types";

export const ASPECT_PREVIEW_MAX_SIZE = 96;

export interface AspectPreviewSize {
  width: number;
  height: number;
}

/**
 * Calculates preview box size keeping aspect ratio.
 */
export const calculateAspectPreviewSize = (
  ratio: ImageAspectRatio
): AspectPreviewSize => {
  const maxSide = Math.max(ratio.width, ratio.height);
  if (maxSide === 0) {
    return { width: ASPECT_PREVIEW_MAX_SIZE, height: ASPECT_PREVIEW_MAX_SIZE };
  }
  const scale = ASPECT_PREVIEW_MAX_SIZE / maxSide;
  return {
    width: ratio.width * scale,
    height: ratio.height * scale,
  };
};

export const createObjectUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const revokeObjectUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

export const fileToCanvasCroppedBlob = async (
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  // This implementation follows react-image-crop docs to crop image via canvas.
  return new Promise<Blob>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = crop.width * scaleX * pixelRatio;
    canvas.height = crop.height * scaleY * pixelRatio;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas 2D context is not available"));
      return;
    }

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create blob from canvas"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
};

export const blobToFile = (blob: Blob, original: File): File => {
  return new File([blob], original.name, {
    type: blob.type || original.type || "image/jpeg",
    lastModified: Date.now(),
  });
};
