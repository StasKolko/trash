"use client";

import type { PixelCrop } from "react-image-crop";

/**
 * Crops an image file by given pixel crop and returns a new File (PNG).
 * All errors are logged to console and original file is returned as fallback.
 */
export async function cropImageFile(
  file: File,
  crop: PixelCrop | null
): Promise<File> {
  if (!crop) {
    console.error(
      "[ImageInput] cropImageFile called without pixelCrop, returning original file"
    );
    return file;
  }

  const imageDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(imageDataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("[ImageInput] Failed to get 2D context from canvas");
    return file;
  }

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b),
      "image/png",
      0.92 // quality (not really used for PNG)
    )
  );

  if (!blob) {
    console.error("[ImageInput] Failed to create blob from canvas");
    return file;
  }

  const croppedFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + ".png", {
    type: "image/png",
  });

  return croppedFile;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("[ImageInput] Failed to read file"));
    };
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("[ImageInput] Failed to load image for cropping"));
    img.src = src;
  });
}
