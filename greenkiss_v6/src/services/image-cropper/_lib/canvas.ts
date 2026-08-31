import { clamp } from "./../_lib/bytes";
import type { OutputFormat } from "../_types";
import type { PixelCrop } from "./aspect";
import { extToMime } from "./mime";

const getPixelRatio = (): number =>
  typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

/**
 * Рисуем кроп в канвас, с учётом devicePixelRatio для резкости
 */
export const drawCroppedToCanvas = (
  image: HTMLImageElement,
  crop: PixelCrop,
  targetWidth?: number,
  targetHeight?: number,
): HTMLCanvasElement => {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Исходный вырез в пикселях оригинала
  const sx = crop.x * scaleX;
  const sy = crop.y * scaleY;
  const sw = crop.width * scaleX;
  const sh = crop.height * scaleY;

  // Итоговые размеры
  const outW = targetWidth ?? Math.round(sw);
  const outH = targetHeight ?? Math.round(sh);

  const pixelRatio = getPixelRatio();
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(outW * pixelRatio));
  canvas.height = Math.max(1, Math.round(outH * pixelRatio));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return canvas;
};

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Проверяем поддержку через прототип и сам экземпляр — без сужения до never
    const supportsToBlob =
      typeof HTMLCanvasElement !== "undefined" &&
      typeof HTMLCanvasElement.prototype.toBlob === "function" &&
      typeof canvas.toBlob === "function";

    if (supportsToBlob) {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob from canvas"));
          } else {
            resolve(blob);
          }
        },
        mime,
        quality,
      );
      return;
    }

    // Фолбэк через dataURL (старые браузеры)
    try {
      const dataUrl = canvas.toDataURL(mime, quality);
      const comma = dataUrl.indexOf(",");
      const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
      const bin = atob(base64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      resolve(new Blob([arr], { type: mime }));
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });
};

const supportsQuality = (mime: string): boolean => {
  return mime === "image/jpeg" || mime === "image/webp";
};

interface CompressOptions {
  canvas: HTMLCanvasElement;
  mime: string;
  maxBytes: number;
  startQuality?: number; // 0..1
}

/**
  Сжатие до maxBytes:
  - Сначала уменьшаем quality (если формат поддерживает).
  - Если всё ещё больше — уменьшаем размеры на 10% в цикле.
*/
export const compressToMaxBytes = async ({
  canvas,
  mime,
  maxBytes,
  startQuality = 0.92,
}: CompressOptions): Promise<{
  blob: Blob;
  width: number;
  height: number;
  quality?: number;
}> => {
  let quality = clamp(startQuality, 0.1, 0.95);
  let currentCanvas = canvas;

  // 1) Понижаем качество
  if (supportsQuality(mime)) {
    while (true) {
      const testBlob = await canvasToBlob(currentCanvas, mime, quality);
      if (testBlob.size <= maxBytes || quality <= 0.35) {
        if (testBlob.size <= maxBytes) {
          return {
            blob: testBlob,
            width: currentCanvas.width,
            height: currentCanvas.height,
            quality,
          };
        }
        break; // переходим к уменьшению размеров
      }
      quality = quality - 0.07;
    }
  } else {
    // PNG и т.п.: quality не влияет в большинстве браузеров
    const blob = await canvasToBlob(currentCanvas, mime);
    if (blob.size <= maxBytes) {
      return {
        blob,
        width: currentCanvas.width,
        height: currentCanvas.height,
      };
    }
  }

  // 2) Уменьшаем размеры (90% за шаг), пока не уложимся или не станет маленьким
  let w = currentCanvas.width;
  let h = currentCanvas.height;
  const minSide = 128 * (window.devicePixelRatio || 1);

  while ((w > minSide || h > minSide) && w > 10 && h > 10) {
    w = Math.max(minSide, Math.round(w * 0.9));
    h = Math.max(minSide, Math.round(h * 0.9));

    const scaled = document.createElement("canvas");
    scaled.width = w;
    scaled.height = h;
    const sCtx = scaled.getContext("2d");
    if (!sCtx) throw new Error("Canvas 2D context not available");
    sCtx.imageSmoothingQuality = "high";
    sCtx.drawImage(currentCanvas, 0, 0, w, h);
    currentCanvas = scaled;

    const blob = await canvasToBlob(
      currentCanvas,
      mime,
      supportsQuality(mime) ? quality : undefined,
    );
    if (blob.size <= maxBytes) {
      return { blob, width: w, height: h, quality };
    }
  }

  // Вернём лучшее, что получилось (последний blob)
  const finalBlob = await canvasToBlob(
    currentCanvas,
    mime,
    supportsQuality(mime) ? quality : undefined,
  );
  return {
    blob: finalBlob,
    width: currentCanvas.width,
    height: currentCanvas.height,
    quality,
  };
};

export const makeFileFromBlob = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, { type: blob.type });
};

export const ensureOutputFormat = (
  desired: OutputFormat | null | undefined,
  originalExt: OutputFormat,
): OutputFormat => {
  return desired ?? originalExt;
};

export const mimeFromOutputExt = (ext: OutputFormat): string => extToMime(ext);
