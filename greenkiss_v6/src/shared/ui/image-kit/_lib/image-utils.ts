import { extToMime, mimeToExt } from "./blobs";
import type { ImageLike, ImageMeta, ImagePayload, RasterExt } from "./types";

export const createObjectUrl = (blob: Blob) => URL.createObjectURL(blob);

export const revokeObjectUrlSafe = (url?: string) => {
  try {
    if (url) URL.revokeObjectURL(url);
  } catch {}
};

export const fileToImageBitmap = async (file: Blob): Promise<ImageBitmap> => {
  if ("createImageBitmap" in window) {
    return await createImageBitmap(file);
  }
  const img = await blobToHTMLImageElement(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return await createImageBitmap(canvas);
};

export const blobToHTMLImageElement = (blob: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });

export const imageLikeToBlob = async (src: ImageLike): Promise<Blob> => {
  if (src instanceof Blob) return src;
  if (typeof src === "string") {
    const res = await fetch(src);
    return await res.blob();
  }
  return src; // File is Blob
};

export const detectBlobMeta = async (
  blob: Blob,
  name?: string,
): Promise<ImageMeta> => {
  const img = await blobToHTMLImageElement(blob);
  const mime = blob.type;
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    aspect: img.naturalWidth / img.naturalHeight,
    mime,
    size: blob.size,
    name,
    lastModified: blob instanceof File ? blob.lastModified : undefined,
  };
};

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
      mime,
      quality,
    );
  });

export type CropRect = { x: number; y: number; width: number; height: number };

export const drawCropToCanvas = (
  source: CanvasImageSource,
  crop: CropRect,
  targetSize?: { width?: number; height?: number },
) => {
  const canvas = document.createElement("canvas");
  const outW = targetSize?.width ?? crop.width;
  const outH = targetSize?.height ?? crop.height;
  canvas.width = Math.max(1, Math.round(outW));
  canvas.height = Math.max(1, Math.round(outH));
  const ctx = canvas.getContext("2d")!;
  // Высокое качество ресемплинга
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    source,
    Math.round(crop.x),
    Math.round(crop.y),
    Math.round(crop.width),
    Math.round(crop.height),
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return canvas;
};

export const recompressBlob = async (
  blob: Blob,
  outExt: RasterExt,
  quality?: number,
): Promise<Blob> => {
  const imgBitmap = await fileToImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = imgBitmap.width;
  canvas.height = imgBitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imgBitmap, 0, 0);
  const outMime = extToMime(outExt);
  return await canvasToBlob(canvas, outMime, quality);
};

export const buildImagePayload = async (
  blob: Blob,
  id?: string,
  name?: string,
): Promise<ImagePayload> => {
  const meta = await detectBlobMeta(blob, name);
  return {
    id: id ?? crypto.randomUUID(),
    blob,
    url: createObjectUrl(blob),
    meta,
  };
};

// Выбор формата экспорта: сохраняем исходный, если разрешён; иначе первый из allowed
export const pickExportMime = (
  inputMime: string,
  allowed: Partial<Record<RasterExt, boolean>>,
): string => {
  const ext = mimeToExt(inputMime);
  if (ext && allowed[ext]) return inputMime;
  const pick = (Object.keys(allowed) as RasterExt[]).find((k) => allowed[k]);
  return pick ? extToMime(pick) : inputMime;
};
