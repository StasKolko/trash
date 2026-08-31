import type { OutputFormat } from "../_types";

export const extToMime = (ext: OutputFormat): string => {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
  }
};

export const guessExtFromMime = (mime: string): OutputFormat => {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpeg"; // по умолчанию для image/jpeg
};

export const normalizeExt = (ext: string): OutputFormat => {
  const e = ext.toLowerCase();
  if (e === "jpg" || e === "jpeg") return "jpeg";
  if (e === "png") return "png";
  if (e === "webp") return "webp";
  // fallback
  return "jpeg";
};
