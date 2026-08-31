import type { OutputFormat } from "../_types";
import { normalizeExt } from "./mime";

export const getFileExtension = (fileName: string): OutputFormat => {
  const idx = fileName.lastIndexOf(".");
  const ext = idx >= 0 ? fileName.slice(idx + 1) : "jpeg";
  return normalizeExt(ext);
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
};

export const buildAcceptAttr = (exts: OutputFormat[]): string => {
  return exts.map((e) => `.${e}`).join(",");
};

export const arrayBufferFromBlob = async (blob: Blob): Promise<Uint8Array> => {
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
};
