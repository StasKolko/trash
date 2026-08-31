import type { AspectRatio, ProcessedImage } from './types';
import { inferAspectRatio } from './aspect-utils';
import { blobToFileWithName } from './file-utils';

export type CropRect = {
  x: number; // relative 0..1
  y: number; // relative 0..1
  width: number; // relative 0..1
  height: number; // relative 0..1
};

export type CropOptions = {
  mime?: string;
  quality?: number;
  targetAspect?: AspectRatio;
  sourceName?: string;
};

/**
 * Crop image according to relative crop rect using Canvas.
 * Returns ProcessedImage.
 */
export async function cropImageToProcessed(
  image: HTMLImageElement | ImageBitmap,
  crop: CropRect,
  options: CropOptions = {}
): Promise<ProcessedImage> {
  const { mime = 'image/png', quality = 0.92, sourceName } = options;

  const srcWidth = 'naturalWidth' in image ? image.naturalWidth || image.width : image.width;
  const srcHeight = 'naturalHeight' in image ? image.naturalHeight || image.height : image.height;

  const x = crop.x * srcWidth;
  const y = crop.y * srcHeight;
  const w = crop.width * srcWidth;
  const h = crop.height * srcHeight;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w);
  canvas.height = Math.round(h);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for crop canvas');
  }

  ctx.drawImage(image, x, y, w, h, 0, 0, canvas.width, canvas.height);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error('Canvas toBlob returned null during crop'));
          return;
        }
        resolve(b);
      },
      mime,
      quality
    );
  });

  const bytes = blob.size;
  const dataUrl = canvas.toDataURL(mime, quality);

  const aspect = inferAspectRatio(canvas.width, canvas.height);
  const file = blobToFileWithName(blob, sourceName ?? 'image', mime);

  return {
    file,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    bytes,
    mime,
    aspect,
    sourceName,
  };
}

/**
 * Compute default crop rect in top-left corner with size of min dimension.
 * If aspect provided, fit that aspect into min side.
 */
export function getDefaultCrop(
  width: number,
  height: number,
  aspect?: AspectRatio
): CropRect {
  const minSide = Math.min(width, height);
  let cropWidth = minSide;
  let cropHeight = minSide;

  if (aspect) {
    const [w, h] = aspect.split(':').map(Number);
    const target = w / h;
    if (width / height > target) {
      // Image is wider than target aspect → height constrained
      cropHeight = minSide;
      cropWidth = minSide * target;
    } else {
      // Image is taller → width constrained
      cropWidth = minSide;
      cropHeight = minSide / target;
    }
  }

  const relW = cropWidth / width;
  const relH = cropHeight / height;

  return {
    x: 0,
    y: 0,
    width: relW,
    height: relH,
  };
}
