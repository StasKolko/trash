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
