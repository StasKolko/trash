"use client";

import type { StoreApi } from "zustand/vanilla";
import { createStore } from "zustand/vanilla";

import type { ImageCompareConfig, LoadedImage } from "./types";

const ASPECT_EPS = 0.02;

export type ImageCompareState = ImageCompareConfig & {
  leftImg: LoadedImage | null;
  rightImg: LoadedImage | null;
  error: string | null;
  slider: number; // 0–100
  isDragging: boolean;
};

export type ImageCompareActions = {
  setImages: (left: File, right: File, className?: string) => void;
  loadImages: () => Promise<void>;
  cleanupObjectUrls: () => void;
  setError: (error: string | null) => void;
  setSlider: (value: number) => void;
  startDrag: () => void;
  stopDrag: () => void;
  updateSliderByClientX: (
    container: HTMLDivElement | null,
    clientX: number,
  ) => void;
};

export type ImageCompareStore = ImageCompareState & ImageCompareActions;

export type ImageCompareStoreApi = StoreApi<ImageCompareStore>;

export const createImageCompareStore = (
  config: ImageCompareConfig,
): ImageCompareStoreApi => {
  const { left, right, className } = config;

  let cancelled = false;

  const loadFile = (file: File): Promise<LoadedImage> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        resolve({
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspect: img.naturalWidth / img.naturalHeight,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Не удалось загрузить изображение"));
      };
      img.src = url;
    });

  const store = createStore<ImageCompareStore>()((set, get) => ({
    // --- config
    left,
    right,
    className,

    // --- state
    leftImg: null,
    rightImg: null,
    error: null,
    slider: 50,
    isDragging: false,

    // --- actions

    setImages: (l: File, r: File, cls?: string) => {
      // при смене файлов сбрасываем состояние
      const { cleanupObjectUrls } = get();
      cleanupObjectUrls();
      set({
        left: l,
        right: r,
        className: cls,
        leftImg: null,
        rightImg: null,
        error: null,
        slider: 50,
        isDragging: false,
      });
    },

    loadImages: async () => {
      const { left, right, cleanupObjectUrls } = get();
      cancelled = false;

      set({
        error: null,
        leftImg: null,
        rightImg: null,
      });

      try {
        const [l, r] = await Promise.all([loadFile(left), loadFile(right)]);
        if (cancelled) {
          URL.revokeObjectURL(l.url);
          URL.revokeObjectURL(r.url);
          return;
        }

        const diff = Math.abs(l.aspect - r.aspect);
        if (diff > ASPECT_EPS) {
          URL.revokeObjectURL(l.url);
          URL.revokeObjectURL(r.url);
          set({
            error:
              "Аспект‑ратио изображений различается. Для сравнения выберите картинки с одинаковыми пропорциями.",
          });
          return;
        }

        // перед тем как заменить ссылки, очищаем старые (если были)
        cleanupObjectUrls();
        set({
          leftImg: l,
          rightImg: r,
          error: null,
        });
      } catch {
        set({
          error: "Ошибка при загрузке изображений.",
          leftImg: null,
          rightImg: null,
        });
      }
    },

    cleanupObjectUrls: () => {
      const { leftImg, rightImg } = get();
      if (leftImg) URL.revokeObjectURL(leftImg.url);
      if (rightImg) URL.revokeObjectURL(rightImg.url);
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setSlider: (value: number) => {
      const v = Math.max(0, Math.min(100, value));
      set({ slider: v });
    },

    startDrag: () => {
      set({ isDragging: true });
    },

    stopDrag: () => {
      set({ isDragging: false });
    },

    updateSliderByClientX: (
      container: HTMLDivElement | null,
      clientX: number,
    ) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = (x / rect.width) * 100;
      const v = Math.max(0, Math.min(100, percent));
      set({ slider: v });
    },
  }));

  // хелпер для корректного завершения жизненного цикла стора (на случай,
  // если когда‑нибудь будем делать dispose)
  const api = store as ImageCompareStoreApi;

  // патчим api, чтобы при необходимости снаружи можно было отменить загрузку
  (api as any).__cancelCompareLoading = () => {
    cancelled = true;
    const { cleanupObjectUrls } = api.getState();
    cleanupObjectUrls();
  };

  return api;
};
