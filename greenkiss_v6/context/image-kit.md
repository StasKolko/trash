src\shared\ui\image-kit\index.ts

```
export { ImageCompare } from "./_image-compare";
export { ImageInput } from "./_image-input";

```

src\shared\ui\image-kit\_image-compare\index.tsx

```
"use client";

import { ImageCompareContent } from "./ui/content";
import { ImageCompareProvider } from "./ui/provider";

export const ImageCompare = ({
  left,
  right,
  className,
}: {
  left: File;
  right: File;
  className?: string;
}) => {
  return (
    <ImageCompareProvider>
      <ImageCompareContent left={left} right={right} className={className} />
    </ImageCompareProvider>
  );
};

```

src\shared\ui\image-kit\_image-compare\lib\common-size.ts

```
import type { CommonImageSize, LoadedImage } from "../model/types";

export function getCommonImageSize(
  leftImg: LoadedImage | null,
  rightImg: LoadedImage | null,
): CommonImageSize | null {
  if (!leftImg || !rightImg) return null;

  return {
    width: Math.min(leftImg.width, rightImg.width),
    height: Math.min(leftImg.height, rightImg.height),
    aspect: leftImg.aspect,
  };
}

```

src\shared\ui\image-kit\_image-compare\lib\load-images.ts

```
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

```

src\shared\ui\image-kit\_image-compare\lib\slider.ts

```
export function clampSliderPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function getSliderPercentFromClientX(
  clientX: number,
  rect: DOMRect,
): number {
  const x = clientX - rect.left;
  const rawPercent = (x / rect.width) * 100;
  return clampSliderPercent(rawPercent);
}

```

src\shared\ui\image-kit\_image-compare\model\context.ts

```
"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { ImageCompareStore, ImageCompareStoreApi } from "./store";

export const ImageCompareStoreContext =
  createContext<ImageCompareStoreApi | null>(null);

export const useImageCompareStore = <T>(
  selector: (state: ImageCompareStore) => T,
): T => {
  const imageCompareStoreContext = useContext(ImageCompareStoreContext);

  if (!imageCompareStoreContext) {
    throw new Error(
      "useImageCompareStore must be used within ImageCompareStoreProvider",
    );
  }

  return useStore(imageCompareStoreContext, selector);
};

```

src\shared\ui\image-kit\_image-compare\model\store.ts

```
"use client";

import type { StoreApi } from "zustand/vanilla";
import { createStore } from "zustand/vanilla";
import type { LoadedImage } from "./types";

export type ImageCompareState = {
  slider: number; // 0–100
  error: string | null;
  leftImg: LoadedImage | null;
  rightImg: LoadedImage | null;
  aspectRatio: number | null;
};

export type ImageCompareActions = {
  setSlider: (value: number) => void;
  setError: (error: string | null) => void;
  setLeftImg: (img: LoadedImage | null) => void;
  setRightImg: (img: LoadedImage | null) => void;
  setAspectRatio: (ratio: number | null) => void;
};

export type ImageCompareStore = ImageCompareState & ImageCompareActions;

export type ImageCompareStoreApi = StoreApi<ImageCompareStore>;

export const createImageCompareStore = (): ImageCompareStoreApi =>
  createStore<ImageCompareStore>()((set, get) => ({
    // RUNTIME STATE
    slider: 50,
    error: null,
    leftImg: null,
    rightImg: null,
    aspectRatio: null,

    setSlider: (value: number) => {
      if (value < 0 || value > 100) return;
      if (value === get().slider) return;

      set({ slider: value });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setLeftImg: (img: LoadedImage | null) => {
      set({ leftImg: img });
    },

    setRightImg: (img: LoadedImage | null) => {
      set({ rightImg: img });
    },

    setAspectRatio: (ratio: number | null) => {
      set({ aspectRatio: ratio });
    },
  }));

```

src\shared\ui\image-kit\_image-compare\model\types.ts

```
export type LoadedImage = {
  url: string;
  width: number;
  height: number;
  aspect: number;
  name: string;
};

export type CommonImageSize = {
  width: number;
  height: number;
  aspect: number;
};

```

src\shared\ui\image-kit\_image-compare\ui\aspect-ratio-frame.tsx

```
"use client";

import type { ReactNode } from "react";
import { useImageCompareStore } from "../model/context";

export const AspectRatioFrame = ({ children }: { children: ReactNode }) => {
  const aspectRatio = useImageCompareStore((state) => state.aspectRatio);

  return (
    <div
      className="relative w-full max-w-full max-h-full"
      style={{ aspectRatio: String(aspectRatio) }}
    >
      {children}
    </div>
  );
};

```

src\shared\ui\image-kit\_image-compare\ui\container.tsx

```
"use client";

import { useRef } from "react";
import { cn } from "@/shared/lib/css";
import { throttle } from "@/shared/lib/timing"; // <-- новый импорт
import { getSliderPercentFromClientX } from "../lib/slider";
import { useImageCompareStore } from "../model/context";

export const ImageCompareContainer = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const setSlider = useImageCompareStore((state) => state.setSlider);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const throttledSetSliderRef = useRef(
    throttle((value: number) => {
      setSlider(value);
    }, 40),
  );

  const stopDrag = () => {
    draggingRef.current = false;
    // Сбрасываем возможный отложенный trailing‑вызов
    throttledSetSliderRef.current.cancel();
  };

  const updateSliderByClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const percent = getSliderPercentFromClientX(clientX, rect);
    throttledSetSliderRef.current(percent);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateSliderByClientX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    updateSliderByClientX(t.clientX);
  };

  const handleMouseDown = () => {
    draggingRef.current = true;
  };

  const handleTouchStart = () => {
    draggingRef.current = true;
  };

  return (
    <div
      ref={containerRef}
      role="alert"
      className={cn(
        "relative overflow-hidden bg-secondary flex items-center justify-center select-none touch-none",
        className ?? "w-full h-64",
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={stopDrag}
      onMouseUp={stopDrag}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopDrag}
      onTouchCancel={stopDrag}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
};

```

src\shared\ui\image-kit\_image-compare\ui\content.tsx

```
"use client";

import { GripVerticalIcon } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/shared/lib/css";
import { ImageProcessingOverlay } from "../../_ui/image-processing-overlay";
import { getCommonImageSize } from "../lib/common-size";
import {
  ASPECT_RATIO_MISMATCH_ERROR,
  GENERIC_LOAD_ERROR,
  loadAndValidatePair,
  revokeLoadedImage,
} from "../lib/load-images";
import { useImageCompareStore } from "../model/context";
import { AspectRatioFrame } from "./aspect-ratio-frame";
import { ImageCompareContainer } from "./container";
import { LeftImage } from "./left-image";
import { RightImage } from "./right-image";
import { CompareSliderHandle } from "./slider-handle";

export const ImageCompareContent = ({
  left,
  right,
  className,
}: {
  left: File;
  right: File;
  className?: string;
}) => {
  const error = useImageCompareStore((state) => state.error);
  const setError = useImageCompareStore((state) => state.setError);

  const leftImg = useImageCompareStore((state) => state.leftImg);
  const rightImg = useImageCompareStore((state) => state.rightImg);
  const setLeftImg = useImageCompareStore((state) => state.setLeftImg);
  const setRightImg = useImageCompareStore((state) => state.setRightImg);

  const aspectRatio = useImageCompareStore((state) => state.aspectRatio);
  const setAspectRatio = useImageCompareStore((state) => state.setAspectRatio);

  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      try {
        setError(null);
        setLeftImg(null);
        setRightImg(null);
        setAspectRatio(null);

        const { left: loadedLeft, right: loadedRight } =
          await loadAndValidatePair(left, right, {
            signal: abortController.signal,
          });

        if (abortController.signal.aborted) {
          revokeLoadedImage(loadedLeft);
          revokeLoadedImage(loadedRight);
          return;
        }

        setLeftImg(loadedLeft);
        setRightImg(loadedRight);

        const commonSize = getCommonImageSize(loadedLeft, loadedRight);
        if (commonSize) {
          setAspectRatio(commonSize.width / commonSize.height);
        } else {
          setAspectRatio(null);
        }
      } catch (e) {
        if (abortController.signal.aborted) return;

        const message =
          e instanceof Error && e.message === ASPECT_RATIO_MISMATCH_ERROR
            ? ASPECT_RATIO_MISMATCH_ERROR
            : GENERIC_LOAD_ERROR;

        setError(message);
      }
    })();

    return () => {
      abortController.abort();
      revokeLoadedImage(leftImg);
      revokeLoadedImage(rightImg);
      setAspectRatio(null);
    };
  }, [
    left,
    right,
    leftImg,
    rightImg,
    setLeftImg,
    setRightImg,
    setAspectRatio,
    setError,
  ]);

  if (error) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-destructive/10 text-destructive text-center text-sm md:text-base",
          className ?? "w-full h-64",
        )}
      >
        {error}
      </div>
    );
  }

  if (!leftImg || !rightImg || !aspectRatio) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-secondary text-muted-foreground text-sm",
          className ?? "w-full h-64",
        )}
      >
        <ImageProcessingOverlay text="Загрузка..." />
      </div>
    );
  }

  return (
    <ImageCompareContainer className={className}>
      <AspectRatioFrame>
        <LeftImage />

        <div className="absolute inset-0">
          <RightImage />
        </div>

        <CompareSliderHandle>
          <div className="w-1 h-full bg-foreground border-x border-background" />
          <button
            type="button"
            aria-label="Сдвинуть шторку сравнения"
            className="w-8 h-12 flex items-center justify-center absolute left-1/2 -translate-x-1/2 rounded-md cursor-move bg-foreground border border-background hover:bg-foreground/70 active:bg-primary text-background active:text-primary-foreground"
          >
            <GripVerticalIcon aria-hidden="true" />
          </button>
        </CompareSliderHandle>
      </AspectRatioFrame>
    </ImageCompareContainer>
  );
};

```

src\shared\ui\image-kit\_image-compare\ui\left-image.tsx

```
"use client";

import { useImageCompareStore } from "../model/context";

export const LeftImage = () => {
  const leftImg = useImageCompareStore((state) => state.leftImg);

  if (!leftImg) return null;

  return (
    // biome-ignore lint/performance/noImgElement: нужно именно <img>
    <img
      src={leftImg.url}
      alt={leftImg.name}
      className="absolute inset-0 w-full h-full object-contain"
      draggable={false}
    />
  );
};

```

src\shared\ui\image-kit\_image-compare\ui\provider.tsx

```
"use client";

import { type ReactNode, useRef } from "react";
import { ImageCompareStoreContext } from "../model/context";
import {
  createImageCompareStore,
  type ImageCompareStoreApi,
} from "../model/store";

export const ImageCompareProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<ImageCompareStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createImageCompareStore();
  }

  return (
    <ImageCompareStoreContext.Provider value={storeRef.current}>
      {children}
    </ImageCompareStoreContext.Provider>
  );
};

```

src\shared\ui\image-kit\_image-compare\ui\right-image.tsx

```
"use client";

import { useImageCompareStore } from "../model/context";

export const RightImage = () => {
  const rightImg = useImageCompareStore((state) => state.rightImg);
  const slider = useImageCompareStore((state) => state.slider);

  if (!rightImg) return null;

  return (
    // biome-ignore lint/performance/noImgElement: нужно именно <img>
    <img
      src={rightImg.url}
      alt={rightImg.name}
      className="absolute inset-0 w-full h-full object-contain"
      style={{
        clipPath: `inset(0 ${100 - slider}% 0 0)`,
      }}
      draggable={false}
    />
  );
};

```

src\shared\ui\image-kit\_image-compare\ui\slider-handle.tsx

```
"use client";

import type { ReactNode } from "react";
import { useImageCompareStore } from "../model/context";

export const CompareSliderHandle = ({ children }: { children: ReactNode }) => {
  const slider = useImageCompareStore((state) => state.slider);

  return (
    <div
      className="absolute top-0 bottom-0 flex items-center justify-center cursor-col-resize"
      style={{ left: `${slider}%`, transform: "translateX(-50%)" }}
    >
      {children}
    </div>
  );
};

```

src\shared\ui\image-kit\_image-input\doubtful\crop-controls.tsx

```
"use client";

import { type ChangeEvent, type FocusEvent, useEffect, useState } from "react";
import type { PixelCrop } from "react-image-crop";
import { CropNumberField } from "./crop-number-field";

export const CropControls = ({
  crop,
  limits,
  onChange,
}: {
  crop: PixelCrop | undefined;
  limits: {
    xMax?: number;
    yMax?: number;
    wMax?: number;
    hMax?: number;
  };
  onChange: (next: PixelCrop) => void;
}) => {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [w, setW] = useState("");
  const [h, setH] = useState("");

  // Синхронизируемся, когда crop меняется извне (ReactCrop, инициализация и т.п.)
  useEffect(() => {
    if (!crop) {
      setX("");
      setY("");
      setW("");
      setH("");
      return;
    }

    setX(String(Math.round(crop.x)));
    setY(String(Math.round(crop.y)));
    setW(String(Math.round(crop.width)));
    setH(String(Math.round(crop.height)));
  }, [crop]);

  const patchCrop = (field: "x" | "y" | "width" | "height", value: number) => {
    if (!crop) return;

    const next: PixelCrop = {
      ...crop,
      [field]: value,
    } as PixelCrop;

    onChange(next);
  };

  const handleChange =
    (field: "x" | "y" | "width" | "height") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Обновляем локальную строку всегда
      if (field === "x") setX(raw);
      if (field === "y") setY(raw);
      if (field === "width") setW(raw);
      if (field === "height") setH(raw);

      // Пустое значение — даём пользователю продолжить ввод, crop не трогаем
      if (!crop || raw.trim() === "") return;

      const num = Number(raw);
      if (Number.isNaN(num)) return;

      patchCrop(field, num);
    };

  const handleBlur =
    (field: "x" | "y" | "width" | "height") =>
    (e: FocusEvent<HTMLInputElement>) => {
      if (!crop) return;

      let raw = e.target.value.trim();
      if (raw === "") raw = e.target.min || "0";

      let num = Number(raw);
      if (Number.isNaN(num)) num = Number(e.target.min || 0);

      const min = e.target.min !== "" ? Number(e.target.min) : undefined;
      const max = e.target.max !== "" ? Number(e.target.max) : undefined;

      if (min !== undefined && !Number.isNaN(min)) num = Math.max(min, num);
      if (max !== undefined && !Number.isNaN(max)) num = Math.min(max, num);

      patchCrop(field, num);

      const final = String(num);
      if (field === "x") setX(final);
      if (field === "y") setY(final);
      if (field === "width") setW(final);
      if (field === "height") setH(final);
    };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm px-4 pt-2 pb-4">
      <CropNumberField
        label="x"
        value={x}
        min={0}
        max={limits.xMax}
        onChange={handleChange("x")}
        onBlur={handleBlur("x")}
      />

      <CropNumberField
        label="y"
        value={y}
        min={0}
        max={limits.yMax}
        onChange={handleChange("y")}
        onBlur={handleBlur("y")}
      />

      <CropNumberField
        label="width"
        value={w}
        min={1}
        max={limits.wMax}
        onChange={handleChange("width")}
        onBlur={handleBlur("width")}
      />

      <CropNumberField
        label="height"
        value={h}
        min={1}
        max={limits.hMax}
        onChange={handleChange("height")}
        onBlur={handleBlur("height")}
      />
    </div>
  );
};

```

src\shared\ui\image-kit\_image-input\doubtful\crop-number-field.tsx

```
import type { ChangeEvent, FocusEvent } from "react";
import { Input } from "@/shared/ui/kit/input";

export const CropNumberField = ({
  label,
  value,
  min,
  max,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  min?: number;
  max?: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col">
    <label htmlFor={label} className="mb-1">
      {label.toUpperCase()}
    </label>
    <Input
      id={label}
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      onBlur={onBlur}
    />
  </div>
);

```

src\shared\ui\image-kit\_image-input\doubtful\crop-preview.tsx

```
"use client";

import ReactCrop, { type PercentCrop, type PixelCrop } from "react-image-crop";
import { ImageProcessingOverlay } from "../../_ui/image-processing-overlay";
import { useImageInputStore } from "../model/context";
import { ImagePreviewFrame } from "../ui/preview-frame";

import "react-image-crop/dist/ReactCrop.css";

export const CropPreview = ({
  fileName,
  objectUrl,
  crop,
  onInitImage,
  onChangeCrop,
}: {
  fileName: string;
  objectUrl: string;
  // ReactCrop будет работать с PercentCrop
  crop: PercentCrop | undefined;
  onInitImage: (img: HTMLImageElement) => void;
  // коллбек принимает оба значения, как сам ReactCrop.onChange
  onChangeCrop: (pixel: PixelCrop, percent: PercentCrop) => void;
}) => {
  const aspect = useImageInputStore((state) => state.aspect);
  const isProcessing = useImageInputStore((state) => state.isProcessing);

  return (
    <ImagePreviewFrame>
      <ReactCrop
        className="max-w-full max-h-full flex items-center justify-center"
        crop={crop}
        keepSelection
        onChange={onChangeCrop}
        {...(aspect ? { aspect } : {})}
      >
        {/* biome-ignore lint/performance/noImgElement: нужно именно <img> для превью */}
        <img
          alt={fileName}
          className="max-w-full max-h-full object-contain"
          onLoad={(e) => onInitImage(e.currentTarget)}
          src={objectUrl}
        />
      </ReactCrop>

      {isProcessing && <ImageProcessingOverlay text="Обработка..." />}
    </ImagePreviewFrame>
  );
};

```

src\shared\ui\image-kit\_image-input\doubtful\image-crop-section-content.tsx

```
"use client";

import { useCallback, useMemo, useState } from "react";
import type { PercentCrop, PixelCrop } from "react-image-crop";
import {
  buildInitialNaturalCrop,
  getCropLimits,
  handleReactCropChangeLogic,
  naturalCropToPercentCrop,
  updateCropFromControlsLogic,
} from "../lib/crop-logic";
import { useImageInputStore } from "../model/context";
import type { ImageItem } from "../model/types";

import { CropControls } from "./crop-controls";
import { CropPreview } from "./crop-preview";

export const ImageCropSectionContent = ({ item }: { item: ImageItem }) => {
  const aspect = useImageInputStore((state) => state.aspect);
  const handleItemCropChange = useImageInputStore(
    (state) => state.handleItemCropChange,
  );
  const handleItemImageReady = useImageInputStore(
    (state) => state.handleItemImageReady,
  );

  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(item.img);
  const [naturalCrop, setNaturalCrop] = useState<PixelCrop | undefined>(
    item.pixelCrop
      ? {
          x: item.pixelCrop.x,
          y: item.pixelCrop.y,
          width: item.pixelCrop.width,
          height: item.pixelCrop.height,
          unit: "px",
        }
      : undefined,
  );

  const [percentCrop, setPercentCrop] = useState<PercentCrop | undefined>(
    undefined,
  );

  const initCropFromImage = useCallback(
    (img: HTMLImageElement) => {
      setImgEl(img);
      handleItemImageReady(item.id, img);

      const initialNatural = buildInitialNaturalCrop(img, aspect, naturalCrop);
      const initialPercent = naturalCropToPercentCrop(initialNatural, img);

      setNaturalCrop(initialNatural);
      setPercentCrop(initialPercent);
      handleItemCropChange(item.id, initialNatural);
    },
    [aspect, handleItemCropChange, handleItemImageReady, item, naturalCrop],
  );

  const updateCropFromControls = useCallback(
    (naturalNextRaw: PixelCrop) => {
      if (!imgEl) return;

      const { natural, percent } = updateCropFromControlsLogic({
        nextNaturalRaw: naturalNextRaw,
        img: imgEl,
        aspect,
      });

      setNaturalCrop(natural);
      setPercentCrop(percent);
      handleItemCropChange(item.id, natural);
    },
    [aspect, handleItemCropChange, imgEl, item],
  );

  const handleReactCropChange = useCallback(
    (_pixel: PixelCrop, percent: PercentCrop) => {
      if (!imgEl) return;

      setPercentCrop(percent);

      const { natural } = handleReactCropChangeLogic({
        percent,
        img: imgEl,
        aspect,
      });

      setNaturalCrop(natural);
      handleItemCropChange(item.id, natural);
    },
    [aspect, handleItemCropChange, imgEl, item],
  );

  const limits = useMemo(
    () => getCropLimits(imgEl, aspect, naturalCrop),
    [imgEl, naturalCrop, aspect],
  );

  return (
    <>
      <CropControls
        crop={naturalCrop}
        limits={limits}
        onChange={updateCropFromControls}
      />

      <CropPreview
        crop={percentCrop}
        fileName={item.file.name}
        objectUrl={item.objectUrl}
        onChangeCrop={handleReactCropChange}
        onInitImage={initCropFromImage}
      />
    </>
  );
};

```

src\shared\ui\image-kit\_image-input\index.tsx

```
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { ModeToggle } from "@/shared/ui/theme";
import { ImageInputCancelButton } from "./ui/cancel-button";
import { ImageInputConfirmButton } from "./ui/confirm-button";
import { ImageInputDialog } from "./ui/dialog";
import { PreviewBackgroundToggle } from "./ui/preview-background-toggle";
import { ImageInputProvider } from "./ui/provider";
import { ImageInputSections } from "./ui/sections";
import { ImageInputTrigger } from "./ui/trigger";

export const ImageInput = (props: {
  mode: "single" | "multiple";
  width: number;
  height: number;
  onComplete: (images: File[]) => void;
}) => {
  return (
    <ImageInputProvider {...props}>
      <ImageInputDialog trigger={<ImageInputTrigger />}>
        <AlertDialogHeader className="h-16 w-full relative gap-0">
          <PreviewBackgroundToggle className="absolute -left-px -top-px z-50 border rounded-none rounded-tl-md" />

          <ModeToggle className="absolute -right-px -top-px z-50 border rounded-none rounded-tr-md" />

          <AlertDialogTitle className="text-center md:text-2xl">
            Загрузка изображений
          </AlertDialogTitle>

          <AlertDialogDescription className="h-9 text-center md:text-lg line-clamp-none pt-2 md:pt-0">
            Выберите область для обрезки изображения.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ImageInputSections />

        <AlertDialogFooter className="h-12 max-w-md grid grid-cols-[1fr_1fr] place-items-center gap-x-5 mx-auto">
          <ImageInputCancelButton />
          <ImageInputConfirmButton />
        </AlertDialogFooter>
      </ImageInputDialog>
    </ImageInputProvider>
  );
};

```

src\shared\ui\image-kit\_image-input\lib\crop-logic.ts

```
"use client";

import type { PercentCrop, PixelCrop } from "react-image-crop";
import {
  naturalToRenderedCrop,
  percentToPixelCrop,
  pixelToPercentCrop,
  renderedToNaturalCrop,
} from "./crop-utils";

export type CropLimits = {
  xMax?: number;
  yMax?: number;
  wMax?: number;
  hMax?: number;
};

export function buildInitialNaturalCrop(
  img: HTMLImageElement,
  aspect: number | undefined,
  existingNaturalCrop?: PixelCrop,
): PixelCrop {
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  // Уже есть готовый NATURAL crop — просто возвращаем его (как есть)
  if (existingNaturalCrop) {
    return {
      x: existingNaturalCrop.x,
      y: existingNaturalCrop.y,
      width: existingNaturalCrop.width,
      height: existingNaturalCrop.height,
      unit: "px",
    };
  }

  // Нет фиксированного аспекта — берём всё изображение
  if (!aspect) {
    return {
      x: 0,
      y: 0,
      width: natW,
      height: natH,
      unit: "px",
    };
  }

  // Есть аспект — максимальный возможный кроп внутри NATURAL img по центру
  const imgRatio = natW / natH;
  let cropW: number;
  let cropH: number;

  if (imgRatio > aspect) {
    cropH = natH;
    cropW = cropH * aspect;
  } else {
    cropW = natW;
    cropH = cropW / aspect;
  }

  return {
    x: (natW - cropW) / 2,
    y: (natH - cropH) / 2,
    width: cropW,
    height: cropH,
    unit: "px",
  };
}

/**
 * Кламп в NATURAL системе координат (naturalWidth / naturalHeight) с учётом aspect.
 * Чистая функция: зависит только от аргументов.
 */
export function clampNaturalCropToImage(
  crop: PixelCrop,
  img: HTMLImageElement,
  aspect?: number,
): PixelCrop {
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  let { x, y, width, height } = crop;

  // Ограничиваем размеры
  width = Math.min(width, natW);
  height = Math.min(height, natH);

  // Ограничиваем позицию
  const maxX = natW - width;
  const maxY = natH - height;

  x = Math.max(0, Math.min(x, Math.max(0, maxX)));
  y = Math.max(0, Math.min(y, Math.max(0, maxY)));

  if (aspect) {
    const currentAspect = width / height;
    if (Math.abs(currentAspect - aspect) > 0.01) {
      if (currentAspect > aspect) {
        width = height * aspect;
      } else {
        height = width / aspect;
      }

      const maxX2 = natW - width;
      const maxY2 = natH - height;
      x = Math.max(0, Math.min(x, Math.max(0, maxX2)));
      y = Math.max(0, Math.min(y, Math.max(0, maxY2)));
    }
  }

  return {
    x,
    y,
    width,
    height,
    unit: "px",
  };
}

/**
 * Считает процентный crop для ReactCrop по NATURAL‑crop’у и img.
 */
export function naturalCropToPercentCrop(
  naturalCrop: PixelCrop,
  img: HTMLImageElement,
): PercentCrop {
  const rendered = naturalToRenderedCrop(naturalCrop, img);
  return pixelToPercentCrop(rendered, img.width, img.height);
}

/**
 * Обновление crop из числовых инпутов (NATURAL -> clamp -> PERCENT).
 * Возвращает новый naturalCrop и percentCrop.
 */
export function updateCropFromControlsLogic(params: {
  nextNaturalRaw: PixelCrop;
  img: HTMLImageElement;
  aspect?: number;
}): { natural: PixelCrop; percent: PercentCrop } {
  const { nextNaturalRaw, img, aspect } = params;

  // Инпуты оперируют целыми значениями — нормализуем сразу
  const normalizedRaw: PixelCrop = {
    ...nextNaturalRaw,
    x: Math.round(nextNaturalRaw.x),
    y: Math.round(nextNaturalRaw.y),
    width: Math.round(nextNaturalRaw.width),
    height: Math.round(nextNaturalRaw.height),
  };

  const naturalClamped = clampNaturalCropToImage(normalizedRaw, img, aspect);
  const renderedClamped = naturalToRenderedCrop(naturalClamped, img);
  const percent = pixelToPercentCrop(renderedClamped, img.width, img.height);

  return {
    natural: naturalClamped,
    percent,
  };
}

/**
 * Обработка изменений от ReactCrop (PERCENT -> RENDERED -> NATURAL -> clamp).
 */
export function handleReactCropChangeLogic(params: {
  percent: PercentCrop;
  img: HTMLImageElement;
  aspect?: number;
}): {
  natural: PixelCrop;
  rendered: PixelCrop;
} {
  const { percent, img, aspect } = params;

  const rendered = percentToPixelCrop(percent, img.width, img.height);
  const naturalUnclamped = renderedToNaturalCrop(rendered, img);
  const natural = clampNaturalCropToImage(naturalUnclamped, img, aspect);

  return {
    natural,
    rendered,
  };
}

/**
 * Лимиты для инпутов в NATURAL координатах.
 */
export function getCropLimits(
  img: HTMLImageElement | null,
  aspect: number,
  naturalCrop?: PixelCrop,
): CropLimits {
  if (!img) {
    return {
      xMax: undefined,
      yMax: undefined,
      wMax: undefined,
      hMax: undefined,
    };
  }

  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  if (!naturalCrop) {
    return {
      xMax: undefined,
      yMax: undefined,
      wMax: natW,
      hMax: natH,
    };
  }

  const availableWidth = natW - naturalCrop.x;
  const availableHeight = natH - naturalCrop.y;

  let wMax = availableWidth;
  let hMax = availableHeight;

  const maxWByHeight = availableHeight * aspect;
  const maxHByWidth = availableWidth / aspect;

  wMax = Math.min(availableWidth, maxWByHeight);
  hMax = Math.min(availableHeight, maxHByWidth);

  return {
    xMax: natW - naturalCrop.width,
    yMax: natH - naturalCrop.height,
    wMax,
    hMax,
  };
}

```

src\shared\ui\image-kit\_image-input\lib\crop-utils.ts

```
"use client";

import type { PercentCrop, PixelCrop } from "react-image-crop";

/**
 * Конвертация процентного crop (из ReactCrop) в пиксельный
 * с учётом реального отображаемого размера <img>.
 *
 * Аналог convertToPixelCrop из примера:
 * convertToPixelCrop(percentCrop, img.width, img.height)
 */
export function percentToPixelCrop(
  percentCrop: PercentCrop,
  renderedWidth: number,
  renderedHeight: number,
): PixelCrop {
  return {
    unit: "px",
    x: (percentCrop.x / 100) * renderedWidth,
    y: (percentCrop.y / 100) * renderedHeight,
    width: (percentCrop.width / 100) * renderedWidth,
    height: (percentCrop.height / 100) * renderedHeight,
  };
}

/**
 * Обратная конвертация: из пикселей в проценты (для передачи в ReactCrop).
 */
export function pixelToPercentCrop(
  pixelCrop: PixelCrop,
  renderedWidth: number,
  renderedHeight: number,
): PercentCrop {
  return {
    unit: "%",
    x: (pixelCrop.x / renderedWidth) * 100,
    y: (pixelCrop.y / renderedHeight) * 100,
    width: (pixelCrop.width / renderedWidth) * 100,
    height: (pixelCrop.height / renderedHeight) * 100,
  };
}

/**
 * NATURAL (naturalWidth/naturalHeight) -> RENDERED (width/height в контейнере)
 */
export function naturalToRenderedCrop(
  natural: PixelCrop,
  img: HTMLImageElement,
): PixelCrop {
  const scaleX = img.width / img.naturalWidth;
  const scaleY = img.height / img.naturalHeight;

  return {
    unit: "px",
    x: natural.x * scaleX,
    y: natural.y * scaleY,
    width: natural.width * scaleX,
    height: natural.height * scaleY,
  };
}

/**
 * RENDERED (width/height в контейнере) -> NATURAL (naturalWidth/naturalHeight)
 */
export function renderedToNaturalCrop(
  rendered: PixelCrop,
  img: HTMLImageElement,
): PixelCrop {
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;

  return {
    unit: "px",
    x: rendered.x * scaleX,
    y: rendered.y * scaleY,
    width: rendered.width * scaleX,
    height: rendered.height * scaleY,
  };
}

```

src\shared\ui\image-kit\_image-input\lib\process-image-item-to-file.ts

```
import type { PixelCrop } from "react-image-crop";

import type { ImageItem } from "../model/types";

export async function processImageItemToFile(
  item: ImageItem,
  targetWidth: number,
  targetHeight: number,
): Promise<File | null> {
  const { file, img, pixelCrop } = item;

  if (!file || !img || !pixelCrop) return null;

  // Если изображение уже нужного размера и кроп фактически покрывает весь кадр —
  // возвращаем оригинальный файл без повторного перекодирования.
  const EPS = 1; // допуск на погрешности конверсий

  const isSameSize =
    img.naturalWidth === targetWidth && img.naturalHeight === targetHeight;

  const isFullFrameCrop =
    Math.abs(pixelCrop.x) <= EPS &&
    Math.abs(pixelCrop.y) <= EPS &&
    Math.abs(pixelCrop.width - img.naturalWidth) <= EPS &&
    Math.abs(pixelCrop.height - img.naturalHeight) <= EPS;

  if (isSameSize && isFullFrameCrop) {
    return file;
  }

  // pixelCrop уже в NATURAL координатах
  const naturalCrop = pixelCrop;

  const cropCanvas = drawCropToCanvas(img, naturalCrop);
  if (!cropCanvas) return null;

  // Приводим итоговый размер к заданным в конфиге width/height
  const finalCanvas = prepareFinalCanvasFromCrop(
    cropCanvas,
    targetWidth,
    targetHeight,
  );
  if (!finalCanvas) return null;

  const mimeType = file.type || "image/png";
  const blob = await createBlobFromCanvas(finalCanvas, mimeType, 0.92);

  const fileName = buildCroppedFileName(file.name, blob.type);

  return new File([blob], fileName, { type: blob.type });
}

function drawCropToCanvas(
  img: HTMLImageElement,
  pixelCrop: PixelCrop,
): HTMLCanvasElement | null {
  const { x, y, width, height } = pixelCrop;

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = Math.round(width);
  cropCanvas.height = Math.round(height);

  const cropCtx = cropCanvas.getContext("2d");
  if (!cropCtx) return null;

  cropCtx.imageSmoothingQuality = "high";

  cropCtx.drawImage(
    img,
    x,
    y,
    width,
    height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height,
  );

  return cropCanvas;
}

function prepareFinalCanvasFromCrop(
  cropCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement | null {
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;

  const finalCtx = finalCanvas.getContext("2d");
  if (!finalCtx) return null;

  finalCtx.clearRect(0, 0, targetWidth, targetHeight);

  // Если хотите, здесь можно делать подгонку под нужные пропорции.
  // Сейчас просто рисуем crop 1:1 на весь итоговый холст.
  finalCtx.imageSmoothingQuality = "high";
  finalCtx.drawImage(
    cropCanvas,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  return finalCanvas;
}

function createBlobFromCanvas(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!("toBlob" in canvas)) {
      reject(new Error("Canvas toBlob not supported"));
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function buildCroppedFileName(originalName: string, blobType: string): string {
  const dotIndex = originalName.lastIndexOf(".");

  const base = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
  const extFromOriginal = dotIndex !== -1 ? originalName.slice(dotIndex) : "";

  if (!extFromOriginal) {
    if (blobType === "image/jpeg") return `${base}-cropped.jpg`;
    if (blobType === "image/webp") return `${base}-cropped.webp`;
    return `${base}-cropped.png`;
  }

  return `${base}-cropped${extFromOriginal}`;
}

```

src\shared\ui\image-kit\_image-input\model\context.ts

```
"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { ImageInputStore, ImageInputStoreApi } from "./store";

export const ImageInputStoreContext = createContext<ImageInputStoreApi | null>(
  null,
);

export const useImageInputStore = <T>(
  selector: (state: ImageInputStore) => T,
): T => {
  const imageInputStoreContext = useContext(ImageInputStoreContext);
  if (!imageInputStoreContext) {
    throw new Error(
      "useImageInputStore must be used within ImageInputStoreProvider",
    );
  }
  return useStore(imageInputStoreContext, selector);
};

```

src\shared\ui\image-kit\_image-input\model\store.ts

```
"use client";

import type { PixelCrop } from "react-image-crop";
import type { StoreApi } from "zustand/vanilla";
import { createStore } from "zustand/vanilla";
import { processImageItemToFile } from "../lib/process-image-item-to-file";
import type {
  ImageInputConfig,
  ImageItem,
  ImagePreviewBackgroundMode,
} from "./types";

export type ImageInputState = ImageInputConfig & {
  open: boolean;
  items: ImageItem[];
  isProcessing: boolean;
  aspect: number;
  previewBackgroundMode: ImagePreviewBackgroundMode;
  hasInvalid: boolean;
};

export type ImageInputActions = {
  setProcessing: (isProcessing: boolean) => void;
  resetState: () => void;
  setPreviewBackgroundMode: (mode: ImagePreviewBackgroundMode) => void;
  handleItemsSelected: (newItems: ImageItem[]) => void;
  handleRemoveItem: (id: string) => void;
  handleItemImageReady: (id: string, img: HTMLImageElement) => void;
  handleItemCropChange: (id: string, naturalCrop: PixelCrop) => void;
  handleConfirm: () => Promise<void>;
  isItemInvalid: (id: string) => boolean;
};

export type ImageInputStore = ImageInputState & ImageInputActions;

export type ImageInputStoreApi = StoreApi<ImageInputStore>;

export const createImageInputStore = (config: ImageInputConfig) => {
  const { mode, width, height, onComplete } = config;
  const aspect = width / height;

  const isCropInvalid = (
    crop: PixelCrop | undefined,
    img: HTMLImageElement | null,
  ) => {
    if (!crop || !img) return false;

    // crop в NATURAL координатах, после процентов/масштабов могут быть дробные хвосты
    const cropW = Math.round(crop.width);
    const cropH = Math.round(crop.height);

    return cropW < width || cropH < height;
  };

  return createStore<ImageInputStore>()((set, get) => ({
    // --- конфиг
    mode,
    width,
    height,
    onComplete,

    // --- state
    open: false,
    items: [],
    isProcessing: false,
    aspect,
    previewBackgroundMode: "solid",
    hasInvalid: false,

    setProcessing: (isProcessing: boolean) => {
      set({ isProcessing });
    },

    setPreviewBackgroundMode: (mode: ImagePreviewBackgroundMode) => {
      set({ previewBackgroundMode: mode });
    },

    resetState: () => {
      const { isProcessing, items } = get();

      if (isProcessing) return;

      for (const item of items) {
        URL.revokeObjectURL(item.objectUrl);
      }

      set({
        items: [],
        isProcessing: false,
        hasInvalid: true,
        previewBackgroundMode: "solid",
        open: false,
      });
    },

    handleItemsSelected: (newItems: ImageItem[]) => {
      set({
        items: newItems,
        open: true,
      });
    },

    handleRemoveItem: (id: string) => {
      const { isProcessing, items, resetState, hasInvalid } = get();
      if (isProcessing) return;

      const isLastItem = items.length === 1;
      const itemToRemove = items.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.objectUrl);
      }

      if (isLastItem) {
        resetState();
        return;
      }

      const newItems = items.filter((item) => item.id !== id);
      const currentHasInvalid = newItems.some((item) => item.isInvalid);

      if (currentHasInvalid !== hasInvalid) {
        return set({ items: newItems, hasInvalid: currentHasInvalid });
      }

      set({ items: newItems });
    },

    handleItemImageReady: (id: string, img: HTMLImageElement) => {
      set((state) => {
        const item = state.items.find((item) => item.id === id);
        if (!item) return state;
        item.img = img;
        return state;
      });
    },

    handleItemCropChange: (id: string, naturalCrop: PixelCrop) => {
      set((state) => {
        const item = state.items.find((item) => item.id === id);
        if (!item) return state;

        const isInvalid = isCropInvalid(naturalCrop, item.img);

        item.pixelCrop = naturalCrop;
        item.isInvalid = isInvalid;

        const currentHasInvalid = state.items.some((item) => item.isInvalid);

        if (currentHasInvalid !== state.hasInvalid) {
          return {
            ...state,
            hasInvalid: currentHasInvalid,
          };
        }

        return { ...state };
      });
    },

    isItemInvalid: (id: string) => {
      const { items } = get();
      const item = items.find((it) => it.id === id);
      return item?.isInvalid ?? false;
    },

    handleConfirm: async () => {
      const {
        isProcessing,
        items,
        onComplete,
        resetState,
        setProcessing,
        width,
        height,
      } = get();

      if (isProcessing || items.some((item) => item.isInvalid)) return;

      set({ isProcessing: true });

      try {
        const croppedFiles: File[] = [];

        for (const item of items) {
          const croppedFile = await processImageItemToFile(item, width, height);
          if (croppedFile) {
            croppedFiles.push(croppedFile);
          }
        }

        if (croppedFiles.length) onComplete(croppedFiles);
        setProcessing(false);
        resetState();
      } catch (error) {
        console.error("Error while cropping images", error);
        set({ isProcessing: false });
      }
    },
  }));
};

```

src\shared\ui\image-kit\_image-input\model\types.ts

```
import type { PixelCrop } from "react-image-crop";

export type ImagePreviewBackgroundMode = "solid" | "checkerboard";

export type ImageInputConfig = {
  mode: ImageInputMode;
  width: number;
  height: number;
  onComplete: (images: File[]) => void;
};

export type ImageInputMode = "single" | "multiple";

export type ImageItem = {
  id: string;
  file: File;
  img: HTMLImageElement | null;
  pixelCrop?: PixelCrop;
  objectUrl: string;
  isInvalid: boolean;
};

```

src\shared\ui\image-kit\_image-input\ui\cancel-button.tsx

```
"use client";

import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

import { useImageInputStore } from "../model/context";

export const ImageInputCancelButton = () => {
  const onCancel = useImageInputStore((state) => state.resetState);
  const isProcessing = useImageInputStore((state) => state.isProcessing);

  return (
    <Button
      disabled={isProcessing}
      onClick={onCancel}
      type="button"
      variant="destructive"
    >
      {isProcessing && <Spinner aria-label="hidden" />}
      {isProcessing ? "Обработка..." : "Отменить"}
    </Button>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\confirm-button.tsx

```
"use client";

import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

import { useImageInputStore } from "../model/context";

export const ImageInputConfirmButton = () => {
  const onConfirm = useImageInputStore((state) => state.handleConfirm);
  const isProcessing = useImageInputStore((state) => state.isProcessing);
  const hasInvalid = useImageInputStore((state) => state.hasInvalid);

  return (
    <Button
      disabled={isProcessing || hasInvalid}
      onClick={onConfirm}
      type="button"
      variant="default"
    >
      {isProcessing && <Spinner aria-label="hidden" />}
      {isProcessing ? "Обработка..." : "Готово"}
    </Button>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\crop-invalid-tooltip.tsx

```
import { CircleAlertIcon } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { useImageInputStore } from "../model/context";

export const ImageCropInvalidIndicator = ({ id }: { id: string }) => {
  const isItemInvalid = useImageInputStore((state) => state.isItemInvalid);
  const hasInvalid = useImageInputStore((state) => state.hasInvalid);

  if (!isItemInvalid(id) || !hasInvalid) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label="Область обрезки слишком мала. Увеличьте её или удалите картинку."
          className="absolute z-20 top-2 left-2"
          variant="ghost"
          size="icon"
        >
          <CircleAlertIcon aria-hidden="true" className="size-5" />
          <span
            aria-hidden="true"
            className="size-5 bg-red-500 absolute animate-ping rounded-md"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="text-center font-semibold">
        Область обрезки слишком мала.
        <br />
        Увеличьте её или удалите картинку.
      </TooltipContent>
    </Tooltip>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\dialog.tsx

```
"use client";

import type { ReactNode } from "react";

import { AlertDialog, AlertDialogContent } from "@/shared/ui/kit/alert-dialog";

import { useImageInputStore } from "../model/context";

export const ImageInputDialog = ({
  children,
  trigger,
}: {
  children: ReactNode;
  trigger: ReactNode;
}) => {
  const open = useImageInputStore((state) => state.open);
  const onOpenChange = useImageInputStore((state) => state.resetState);

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      {trigger}
      <AlertDialogContent className="w-screen lg:max-w-5xl p-0 gap-0">
        {children}
      </AlertDialogContent>
    </AlertDialog>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\preview-background-toggle.tsx

```
"use client";

import { PaletteIcon, SquareXIcon } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";
import { useImageInputStore } from "../model/context";
import type { ImagePreviewBackgroundMode } from "../model/types";

const modes: {
  value: ImagePreviewBackgroundMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "solid", label: "Однородный фон", icon: PaletteIcon },
  { value: "checkerboard", label: "Шахматный фон", icon: SquareXIcon },
];

export const PreviewBackgroundToggle = ({
  className,
}: {
  className?: string;
}) => {
  const currentMode = useImageInputStore(
    (state) => state.previewBackgroundMode,
  );
  const setMode = useImageInputStore((state) => state.setPreviewBackgroundMode);

  const currentIndex = modes.findIndex((m) => m.value === currentMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  const NextIcon = modes[nextIndex].icon;
  const nextLabel = modes[nextIndex].label;

  const handleClick = () => {
    setMode(modes[nextIndex].value);
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={className}
      aria-label={nextLabel}
      onClick={handleClick}
    >
      <NextIcon className="size-4" aria-hidden="true" />
    </Button>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\preview-frame.tsx

```
"use client";

import type { ReactNode } from "react";

import { useImageInputStore } from "../model/context";

export const ImagePreviewFrame = ({ children }: { children: ReactNode }) => {
  const previewBackgroundMode = useImageInputStore(
    (state) => state.previewBackgroundMode,
  );

  const isCheckerboard = previewBackgroundMode === "checkerboard";

  return (
    <div
      className="relative w-full aspect-square overflow-hidden flex items-center justify-center bg-secondary"
      style={
        isCheckerboard
          ? {
              backgroundImage: `
        linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5),
        linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5)
      `,
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 8px 8px",
              backgroundColor: "#ffffff",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\provider.tsx

```
"use client";

import { type ReactNode, useRef } from "react";
import { ImageInputStoreContext } from "../model/context";
import { createImageInputStore, type ImageInputStoreApi } from "../model/store";
import type { ImageInputConfig } from "../model/types";

export const ImageInputProvider = ({
  mode,
  width,
  height,
  onComplete,
  children,
}: ImageInputConfig & { children: ReactNode }) => {
  const storeRef = useRef<ImageInputStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createImageInputStore({
      mode,
      width,
      height,
      onComplete,
    });
  }

  return (
    <ImageInputStoreContext.Provider value={storeRef.current}>
      {children}
    </ImageInputStoreContext.Provider>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\remove-item-button.tsx

```
import { Trash2Icon } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";

import { useImageInputStore } from "../model/context";

export const ImageInputRemoveItemButton = ({ id }: { id: string }) => {
  const onClick = useImageInputStore((state) => state.handleRemoveItem);
  const isProcessing = useImageInputStore((state) => state.isProcessing);

  return (
    <Button
      aria-label="Удалить картинку"
      className="absolute right-2 top-2 z-20"
      onClick={() => onClick(id)}
      size="icon"
      type="button"
      variant="destructive"
      disabled={isProcessing}
    >
      <Trash2Icon aria-hidden="true" className="size-4" />
    </Button>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\sections.tsx

```
"use client";

import { ImageCropSectionContent } from "../doubtful/image-crop-section-content";
import { useImageInputStore } from "../model/context";
import { ImageCropInvalidIndicator } from "./crop-invalid-tooltip";
import { ImageInputRemoveItemButton } from "./remove-item-button";

export const ImageInputSections = () => {
  const items = useImageInputStore((state) => state.items);

  return (
    <div className="max-h-[calc(100vh-8rem)] w-full flex flex-col overflow-y-auto border-t">
      {items.map((item) => (
        <section key={item.id} className="w-full relative">
          <ImageInputRemoveItemButton id={item.id} />
          <ImageCropInvalidIndicator id={item.id} />

          <div className="w-full h-12 flex items-center justify-center gap-3 border-b">
            <h3 className="font-bold text-md md:text-xl leading-none">
              {item.file.name}
            </h3>
          </div>

          <ImageCropSectionContent item={item} />
        </section>
      ))}
    </div>
  );
};

```

src\shared\ui\image-kit\_image-input\ui\trigger.tsx

```
"use client";

import { ImageIcon } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

import { Button } from "@/shared/ui/kit/button";

import { useImageInputStore } from "../model/context";
import type { ImageItem } from "../model/types";

export const ImageInputTrigger = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const multiple = useImageInputStore((store) => store.mode === "multiple");
  const onItemsSelected = useImageInputStore(
    (store) => store.handleItemsSelected,
  );

  const triggerInputClick = () => {
    if (!inputRef.current) return;
    // Reset value so selecting the same file again still triggers change
    inputRef.current.value = "";
    inputRef.current.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList?.length) return;

    const files = Array.from(fileList);

    const items: ImageItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      img: null,
      objectUrl: URL.createObjectURL(file),
      isInvalid: false,
    }));
    onItemsSelected(multiple ? items : items.slice(0, 1));
  };

  return (
    <Button
      aria-label="Загрузить изображение"
      onClick={triggerInputClick}
      type="button"
    >
      <ImageIcon aria-hidden="true" className="size-5" />
      <span aria-hidden="true">Загрузить</span>

      <input
        accept=".png,.webp,.jpg,.jpeg"
        aria-hidden="true"
        className="hidden"
        multiple={multiple}
        onChange={handleChange}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
    </Button>
  );
};

```

src\shared\ui\image-kit\_ui\image-processing-overlay.tsx

```
import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

export const ImageProcessingOverlay = ({ text }: { text: string }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <Button variant="inverted">
        <Spinner />
        {text}
      </Button>
    </div>
  );
};

```