import type { ProcessedImage, SizePx } from './types';
import { inferAspectRatio } from './aspect-utils';
import { blobToFileWithName } from './file-utils';

/**
 * Resize image to targetSize with bilinear-like quality via canvas drawImage.
 */
export async function resizeImageToProcessed(
  image: HTMLImageElement | ImageBitmap,
  targetSize: SizePx,
  mime: string,
  quality = 0.92,
  sourceName?: string
): Promise<ProcessedImage> {
  const { width, height } = targetSize;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for resize canvas');
  }

  const srcWidth = 'naturalWidth' in image ? image.naturalWidth || image.width : image.width;
  const srcHeight = 'naturalHeight' in image ? image.naturalHeight || image.height : image.height;

  ctx.drawImage(image, 0, 0, srcWidth, srcHeight, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error('Canvas toBlob returned null during resize'));
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
  const aspect = inferAspectRatio(width, height);
  const file = blobToFileWithName(blob, sourceName ?? 'image', mime);

  return {
    file,
    dataUrl,
    width,
    height,
    bytes,
    mime,
    aspect,
    sourceName,
  };
}
