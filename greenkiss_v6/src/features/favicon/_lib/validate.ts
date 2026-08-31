// src/features/favicon/_lib/validate.ts
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

export async function isPng(buffer: Buffer) {
  const kind = await fileTypeFromBuffer(buffer);
  return kind?.mime === "image/png";
}

export async function validateImageDimensions(buffer: Buffer) {
  const meta = await sharp(buffer, { failOn: "none" }).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) {
    throw new Error("Invalid image");
  }
  if (w !== h) {
    throw new Error("Image must be square (1:1)");
  }
  if (w > 512 || h > 512) {
    throw new Error("Max resolution is 512x512");
  }
  if (w < 128 || h < 128) {
    // минимальная разумная защита, чтобы апскейл не был экстремальным
    throw new Error("Image is too small (min 128x128)");
  }
  return { width: w, height: h };
}
