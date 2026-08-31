import type { RasterExt } from "./types";

export const extToMime = (ext: RasterExt): string => {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
  }
};

export const mimeToExt = (mime: string): RasterExt | undefined => {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpeg";
  return undefined;
};

export const buildAcceptAttr = (
  allowed: Partial<Record<RasterExt, boolean>>,
) => {
  const mimes = Object.entries(allowed)
    .filter(([, v]) => !!v)
    .map(([ext]) => extToMime(ext as RasterExt))
    .filter(Boolean);
  return mimes.join(",");
};
