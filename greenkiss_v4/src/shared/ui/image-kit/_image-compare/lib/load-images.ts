import type { LoadedImage } from "../model/types";

const ASPECT_EPS = 0.02;

export const ASPECT_RATIO_MISMATCH_ERROR =
  "Аспект‑ратио изображений различается. Для сравнения выберите картинки с одинаковыми пропорциями.";
export const GENERIC_LOAD_ERROR = "Ошибка при загрузке изображений.";

export async function loadImageFile(
  file: File,
  signal: AbortSignal,
): Promise<LoadedImage> {
  return new Promise<LoadedImage>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    const abortHandler = () => {
      cleanup();
      URL.revokeObjectURL(url);
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal.aborted) {
      URL.revokeObjectURL(url);
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    signal.addEventListener("abort", abortHandler, { once: true });

    img.onload = () => {
      signal.removeEventListener("abort", abortHandler);
      if (signal.aborted) {
        cleanup();
        URL.revokeObjectURL(url);
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      const loaded: LoadedImage = {
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspect: img.naturalWidth / img.naturalHeight,
        name: file.name,
      };

      cleanup();
      resolve(loaded);
    };

    img.onerror = () => {
      signal.removeEventListener("abort", abortHandler);
      cleanup();
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось загрузить изображение"));
    };

    img.src = url;
  });
}

export function validateAspectRatio(
  left: LoadedImage,
  right: LoadedImage,
): boolean {
  const diff = Math.abs(left.aspect - right.aspect);
  return diff <= ASPECT_EPS;
}

export function revokeLoadedImage(image: LoadedImage | null): void {
  if (!image) return;
  URL.revokeObjectURL(image.url);
}

export async function loadAndValidatePair(
  left: File,
  right: File,
  options?: { signal?: AbortSignal },
): Promise<{ left: LoadedImage; right: LoadedImage }> {
  const controller = options?.signal ? null : new AbortController();
  let signal: AbortSignal;
  if (options?.signal) {
    signal = options.signal;
  } else if (controller) {
    signal = controller.signal;
  } else {
    throw new Error("Failed to create AbortController signal");
  }

  const [l, r] = await Promise.all([
    loadImageFile(left, signal),
    loadImageFile(right, signal),
  ]);

  if (!validateAspectRatio(l, r)) {
    revokeLoadedImage(l);
    revokeLoadedImage(r);
    throw new Error(ASPECT_RATIO_MISMATCH_ERROR);
  }

  return { left: l, right: r };
}
