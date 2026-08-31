import type { AspectOption } from "../_types";

export const parseAspect = (aspect: AspectOption): number => {
  const [w, h] = aspect.split(":").map((n) => Number(n));
  return w / h;
};

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: "px";
}

/**
 * Максимальный кроп с заданным аспектом внутри исходного изображения
 */
export const maxCoverCrop = (
  imgWidth: number,
  imgHeight: number,
  aspect: number,
): PixelCrop => {
  const imageAspect = imgWidth / imgHeight;

  if (imageAspect > aspect) {
    // изображение шире — ограничиваем по высоте
    const height = imgHeight;
    const width = Math.round(height * aspect);
    const x = Math.round((imgWidth - width) / 2);
    return { x, y: 0, width, height, unit: "px" };
  } else {
    // изображение выше/уже — ограничиваем по ширине
    const width = imgWidth;
    const height = Math.round(width / aspect);
    const y = Math.round((imgHeight - height) / 2);
    return { x: 0, y, width, height, unit: "px" };
  }
};

export const topLeftMaxCrop = (
  imgWidth: number,
  imgHeight: number,
  aspect: number,
): PixelCrop => {
  const imageAspect = imgWidth / imgHeight;

  if (imageAspect >= aspect) {
    // картинка шире целевого аспекта — заполняем высоту
    const height = imgHeight;
    const width = Math.round(height * aspect);
    return { x: 0, y: 0, width, height, unit: "px" };
  } else {
    // картинка уже/выше — заполняем ширину
    const width = imgWidth;
    const height = Math.round(width / aspect);
    return { x: 0, y: 0, width, height, unit: "px" };
  }
};
