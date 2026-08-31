import type { OutputFormat, ProcessedImage } from './types';
import { blobToFileWithName, detectOutputMimeFromFormat } from './file-utils';
import { inferAspectRatio } from './aspect-utils';

/**
 * Compress (and optionally convert) an image using a binary-search-like quality reduction.
 * Works for jpeg/webp. PNG stays lossless; if size is too large, caller should suggest conversion.
 */
export async function compressImageWithCanvas(
  image: HTMLImageElement | ImageBitmap,
  targetBytes: number,
  targetFormat: OutputFormat,
  sourceName?: string
): Promise<ProcessedImage> {
  const mime = detectOutputMimeFromFormat(targetFormat);

  const srcWidth = 'naturalWidth' in image ? image.naturalWidth || image.width : image.width;
  const srcHeight = 'naturalHeight' in image ? image.naturalHeight || image.height : image.height;

  const canvas = document.createElement('canvas');
  canvas.width = srcWidth;
  canvas.height = srcHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for compression canvas');
  }
  ctx.drawImage(image, 0, 0, srcWidth, srcHeight);

  // For png we cannot effectively compress by quality; just return single blob
  if (mime === 'image/png') {
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) {
            reject(new Error('Canvas toBlob returned null during PNG export'));
            return;
          }
          resolve(b);
        },
        mime
      );
    });

    const bytes = blob.size;
    const dataUrl = canvas.toDataURL(mime);

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

  let low = 0.3;
  let high = 0.95;
  let bestBlob: Blob | null = null;
  let bestBytes = Number.MAX_SAFE_INTEGER;
  const iterations = 6;

  for (let i = 0; i < iterations; i += 1) {
    const q = (low + high) / 2;

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) {
            reject(new Error('Canvas toBlob returned null during compression'));
            return;
          }
          resolve(b);
        },
        mime,
        q
      );
    });

    const size = blob.size;

    if (size <= targetBytes) {
      bestBlob = blob;
      bestBytes = size;
      // we can increase quality
      low = q;
    } else {
      // too large, decrease quality
      high = q;
      if (!bestBlob || size < bestBytes) {
        bestBlob = blob;
        bestBytes = size;
      }
    }
  }

  if (!bestBlob) {
    throw new Error('Failed to compress image: no blob produced');
  }

  const bytes = bestBlob.size;
  const dataUrl = canvas.toDataURL(mime, low);

  const aspect = inferAspectRatio(canvas.width, canvas.height);
  const file = blobToFileWithName(bestBlob, sourceName ?? 'image', mime);

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
