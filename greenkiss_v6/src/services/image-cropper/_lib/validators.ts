import type {
  AspectOption,
  ImageError,
  OutputFormat,
  TargetResolution,
} from "../_types";
import { parseAspect } from "./aspect";
import { getFileExtension } from "./file-utils";

export interface ImageMeta {
  width: number;
  height: number;
  size: number;
  name: string;
  ext: OutputFormat;
}

export const validateExtension = (
  fileName: string,
  allowed: OutputFormat[],
): ImageError | null => {
  const ext = getFileExtension(fileName);
  if (!allowed.includes(ext)) {
    return {
      code: "INVALID_EXTENSION",
      message: `Неразрешённое расширение: .${ext}. Разрешены: ${allowed.join(", ")}.`,
      fileName,
    };
  }
  return null;
};

export const validateMinSize = (
  size: number,
  minBytes: number | null,
  fileName: string,
): ImageError | null => {
  if (minBytes != null && size < minBytes) {
    return {
      code: "MIN_SIZE",
      message: `Файл меньше минимального размера (${Math.ceil(minBytes / 1024)} КБ).`,
      fileName,
    };
  }
  return null;
};

export const validateDimensions = (
  width: number,
  height: number,
  minWidth: number | null,
  minHeight: number | null,
  fileName: string,
): ImageError[] => {
  const errors: ImageError[] = [];
  if (minWidth != null && width < minWidth) {
    errors.push({
      code: "MIN_WIDTH",
      message: `Ширина меньше минимальной (${minWidth}px).`,
      fileName,
    });
  }
  if (minHeight != null && height < minHeight) {
    errors.push({
      code: "MIN_HEIGHT",
      message: `Высота меньше минимальной (${minHeight}px).`,
      fileName,
    });
  }
  return errors;
};

export const assertTargetResolutionMatchesAspect = (
  target: TargetResolution | null,
  aspect: AspectOption,
): void => {
  if (!target) return;
  const a = parseAspect(aspect);
  const rounded = (n: number) => Math.round(n * 1000) / 1000;
  const ok = rounded(target.width / target.height) === rounded(a);
  if (!ok) {
    // Бросаем ошибку без обработки: в dev сразу видно проблему конфигурации
    throw new Error(
      `targetResolution (${target.width}x${target.height}) не соответствует аспекту ${aspect}.`,
    );
  }
};
