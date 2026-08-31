import type { LoadedImage } from './types';

/**
 * Load a Blob/File/URL/dataURL into an HTMLImageElement or ImageBitmap.
 * Uses createImageBitmap when available for performance.
 */
export async function loadImageFromSource(
  source: Blob | File | string
): Promise<LoadedImage> {
  let blobPromise: Promise<Blob>;
  let fileName: string | undefined;

  if (typeof source === 'string') {
    // Assume URL or dataURL
    blobPromise = fetch(source).then((r) => {
      if (!r.ok) throw new Error(`Failed to load image from url: ${source}`);
      return r.blob();
    });
  } else {
    blobPromise = Promise.resolve(source);
    if ('name' in source) {
      fileName = source.name;
    }
  }

  const blob = await blobPromise;
  const mime = blob.type || 'image/*';
  const bytes = blob.size;

  const objectUrl = URL.createObjectURL(blob);

  // Try createImageBitmap first
  if ('createImageBitmap' in window) {
    const bmp = await createImageBitmap(blob);
    return {
      image: bmp,
      width: bmp.width,
      height: bmp.height,
      mime,
      bytes,
      fileName,
      objectUrl,
    };
  }

  // Fallback to HTMLImageElement
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Failed to decode image'));
    i.src = objectUrl;
  });

  return {
    image: img,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    mime,
    bytes,
    fileName,
    objectUrl,
  };
}

export function revokeLoadedImage(loaded: LoadedImage): void {
  if (loaded.objectUrl) {
    URL.revokeObjectURL(loaded.objectUrl);
  }
}
