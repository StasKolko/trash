import sharp from "sharp";
import { s3PublicUrl } from "@/shared/lib/s3";
import type {
  FaviconVariantKey,
  GeneratedVariant,
  VariantSpec,
} from "../_types";
import { FAVICON_PREFIX, VARIANTS, variantFilename } from "./config";

async function optimizeWithin(
  image: sharp.Sharp,
  size: number,
  maxBytes: number,
  quality = 85,
) {
  let lo = 40;
  let hi = Math.min(quality, 95);
  let best = await image
    .resize(size, size, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    })
    .png({ palette: true, compressionLevel: 9, quality })
    .toBuffer();

  if (best.length <= maxBytes) return best;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const buf = await image
      .resize(size, size, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      })
      .png({ palette: true, compressionLevel: 9, quality: mid })
      .toBuffer();
    if (buf.length <= maxBytes) {
      best = buf;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

export async function generateFaviconSizes(
  id: string,
  inputPng: Buffer,
  quality = 85,
): Promise<GeneratedVariant[]> {
  const base = sharp(inputPng, { failOn: "none" }).ensureAlpha();

  const origSpec = VARIANTS.original as Extract<VariantSpec, { kind: "range" }>;
  const origSize = Math.max(origSpec.minSize, Math.min(origSpec.maxSize, 512));
  const originalBuf = await optimizeWithin(
    base.clone(),
    origSize,
    origSpec.maxBytes,
    quality,
  );

  const variants: GeneratedVariant[] = [];
  const idPrefix = `${id}/`;

  // original
  {
    const width = origSize;
    const height = origSize;
    const filename = variantFilename("original", width, height);
    const s3Key = `${idPrefix}${filename}`;
    variants.push({
      key: "original",
      filename,
      width,
      height,
      buffer: originalBuf,
      bytes: originalBuf.length,
      contentType: "image/png",
      s3Key,
      cdnUrl: s3PublicUrl(`${s3FolderFor(id)}/${filename}`),
    });
  }

  // fixed variants
  const fixedKeys = (Object.keys(VARIANTS) as FaviconVariantKey[]).filter(
    (k) => k !== "original",
  );

  for (const key of fixedKeys) {
    const spec = VARIANTS[key] as Extract<VariantSpec, { kind: "fixed" }>;
    const buf = await optimizeWithin(
      base.clone(),
      spec.size,
      spec.maxBytes,
      quality,
    );
    const filename = variantFilename(key, spec.size, spec.size);
    const s3Key = `${idPrefix}${filename}`;
    variants.push({
      key,
      filename,
      width: spec.size,
      height: spec.size,
      buffer: buf,
      bytes: buf.length,
      contentType: "image/png",
      s3Key,
      cdnUrl: s3PublicUrl(`${s3FolderFor(id)}/${filename}`),
    });
  }

  return variants;
}

export function s3FolderFor(id: string) {
  return `${FAVICON_PREFIX}/${id}`;
}
