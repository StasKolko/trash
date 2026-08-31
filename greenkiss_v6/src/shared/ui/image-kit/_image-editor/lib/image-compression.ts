"use client";

import imageCompression from "browser-image-compression";

export type CompressionOptions = {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
  useWebWorker?: boolean;
};

export async function compressImageFile(
  file: File,
  options: CompressionOptions,
): Promise<File> {
  // Явно типизируем результат
  const compressed = (await imageCompression(file, {
    maxSizeMB: options.maxSizeMB ?? 1,
    maxWidthOrHeight: options.maxWidthOrHeight ?? 2048,
    initialQuality: options.initialQuality ?? 0.8,
    useWebWorker: options.useWebWorker ?? true,
    fileType: file.type,
  })) as Blob | File;

  // imageCompression возвращает Blob или File, приводим к File
  if (compressed instanceof File) {
    return compressed;
  }

  const mimeType = file.type || "image/jpeg";

  return new File([compressed], file.name, {
    type: mimeType,
    lastModified: Date.now(),
  });
}
