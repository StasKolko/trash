import "server-only";
import pngToIco from "png-to-ico";
import sharp from "sharp";

export type ProcessResult = {
  png: { buffer: Buffer; bytes: number };
  ico?: { buffer: Buffer; bytes: number };
};

export async function processFaviconTo96(
  input: Buffer,
  _mime: string,
  maxBytes: number,
): Promise<ProcessResult> {
  // 1) нормализуем в квадрат
  // Приводим к PNG 96x96
  const image = sharp(input, { failOn: "none" });

  // Автокадрирование и приведение в квадрат по короткой стороне
  const metadata = await image.metadata();
  const _size = Math.min(metadata.width || 96, metadata.height || 96);

  // Resize 96x96 с cover, центрируем
  const pipeline = image
    .resize(96, 96, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .png({ palette: true, compressionLevel: 9, quality: 80 });

  // 2) Ужимаем под лимит maxBytes — пытаемся понижать качество до порога
  let qLow = 30;
  let qHigh = 90;
  let best = await pipeline.toBuffer();
  if (best.length > maxBytes) {
    // бинпоиск по quality
    while (qLow <= qHigh) {
      const mid = Math.floor((qLow + qHigh) / 2);
      const buf = await image
        .resize(96, 96, {
          fit: "cover",
          position: "centre",
          withoutEnlargement: false,
        })
        .png({ palette: true, compressionLevel: 9, quality: mid })
        .toBuffer();
      if (buf.length <= maxBytes) {
        best = buf;
        qLow = mid + 1; // попробуем качество повыше, но всё ещё <= лимита
      } else {
        qHigh = mid - 1; // уменьшаем качество
      }
    }
    // если всё равно больше лимита, best останется равным последнему лучшему
  }

  const png = best;

  // 3) ICO из PNG (мультиразмерность тут не обязательна, сделаем один размер)
  let ico: Buffer | undefined;
  try {
    ico = await pngToIco(png);
  } catch {
    // ок, будет только png
  }

  return {
    png: { buffer: png, bytes: png.length },
    ico: ico ? { buffer: ico, bytes: ico.length } : undefined,
  };
}
