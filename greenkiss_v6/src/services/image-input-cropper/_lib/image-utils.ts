export function mimeSupported(mime: string): boolean {
  const canvas = document.createElement("canvas");
  try {
    const dataURL = canvas.toDataURL(mime);
    return dataURL.startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

export function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "img";
}

export async function getPixelCropCanvas(
  img: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number },
): Promise<HTMLCanvasElement> {
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width * scaleX));
  canvas.height = Math.max(1, Math.round(crop.height * scaleY));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context is not available");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  let bmp: ImageBitmap | null = null;
  try {
    bmp = await createImageBitmap(img);
  } catch {
    bmp = null;
  }

  const sx = Math.max(0, Math.round(crop.x * scaleX));
  const sy = Math.max(0, Math.round(crop.y * scaleY));
  const sw = Math.min(img.naturalWidth - sx, Math.round(crop.width * scaleX));
  const sh = Math.min(img.naturalHeight - sy, Math.round(crop.height * scaleY));

  if (bmp) {
    ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    bmp.close();
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

type WindowWithOffscreen = Window & {
  OffscreenCanvas?: new (width: number, height: number) => OffscreenCanvas;
};

export async function resizeCanvas(
  source: HTMLCanvasElement,
  targetW: number,
  targetH: number,
): Promise<HTMLCanvasElement> {
  const w = window as WindowWithOffscreen;

  if (w.OffscreenCanvas) {
    // OffscreenCanvas для производительности (если доступно)
    const oc = new w.OffscreenCanvas(targetW, targetH);
    const ctx = oc.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("2D context is not available (OffscreenCanvas)");
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      source,
      0,
      0,
      source.width,
      source.height,
      0,
      0,
      targetW,
      targetH,
    );

    // Преобразуем в обычный canvas
    const blob = await oc.convertToBlob({ type: "image/png" });
    const img = await blobToImage(blob);
    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const c2 = canvas.getContext("2d");
    if (!c2) {
      throw new Error("2D context is not available");
    }
    c2.imageSmoothingEnabled = true;
    c2.imageSmoothingQuality = "high";
    c2.drawImage(img, 0, 0);
    return canvas;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D context is not available");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  try {
    const bmp = await createImageBitmap(source);
    ctx.drawImage(
      bmp,
      0,
      0,
      source.width,
      source.height,
      0,
      0,
      targetW,
      targetH,
    );
    bmp.close();
  } catch {
    ctx.drawImage(
      source,
      0,
      0,
      source.width,
      source.height,
      0,
      0,
      targetW,
      targetH,
    );
  }
  return canvas;
}

export async function encodeCanvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<{ blob: Blob; quality?: number }> {
  const blob = await canvasToBlobAsync(canvas, mime, quality);
  return { blob, quality };
}

export async function compressToMaxBytes(
  canvas: HTMLCanvasElement,
  mime: string,
  maxBytes: number,
  options?: {
    minQuality?: number;
    maxQuality?: number;
    maxDownscaleSteps?: number;
    downscaleFactor?: number;
  },
): Promise<{ blob: Blob; quality: number; width: number; height: number }> {
  const minQ = options?.minQuality ?? 0.4;
  const maxQ = options?.maxQuality ?? 0.95;
  const maxSteps = options?.maxDownscaleSteps ?? 6;
  const factor = options?.downscaleFactor ?? 0.85;

  const supportsQuality =
    mime === "image/jpeg" || mime === "image/webp" || mime === "image/avif";

  let current = canvas;
  let width = canvas.width;
  let height = canvas.height;

  for (let step = 0; step <= maxSteps; step++) {
    let low = minQ;
    let high = maxQ;
    let best: { blob: Blob; q: number } | null = null;

    if (supportsQuality) {
      for (let i = 0; i < 8; i++) {
        const mid = (low + high) / 2;
        const b = await canvasToBlobAsync(current, mime, mid);
        if (b.size <= maxBytes) {
          best = { blob: b, q: mid };
          low = mid; // пробуем лучшее качество
        } else {
          high = mid;
        }
      }
    } else {
      const b = await canvasToBlobAsync(current, mime);
      if (b.size <= maxBytes) {
        best = { blob: b, q: 1 };
      }
    }

    if (best) {
      return { blob: best.blob, quality: best.q, width, height };
    }

    if (step < maxSteps) {
      width = Math.max(1, Math.floor(width * factor));
      height = Math.max(1, Math.floor(height * factor));
      current = await resizeCanvas(current, width, height);
    }
  }

  const smallestBlob = await canvasToBlobAsync(
    current,
    mime,
    supportsQuality ? (options?.minQuality ?? 0.4) : undefined,
  );
  return {
    blob: smallestBlob,
    quality: supportsQuality ? (options?.minQuality ?? 0.4) : 1,
    width: current.width,
    height: current.height,
  };
}

function canvasToBlobAsync(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob(
        (blob) => {
          resolve(blob || new Blob());
        },
        mime,
        quality,
      );
    } else {
      const dataURL = canvas.toDataURL(mime, quality);
      resolve(dataUrlToBlob(dataURL));
    }
  });
}

function dataUrlToBlob(dataURL: string): Blob {
  const [meta, base64] = dataURL.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const binStr = atob(base64);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
