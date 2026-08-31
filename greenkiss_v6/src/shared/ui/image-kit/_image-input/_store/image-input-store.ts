"use client";

import { createStore } from "zustand/vanilla";
import type { PixelCrop } from "react-image-crop";
import type { ImageItem } from "../_types";

export type ImageInputState = {
  open: boolean;
  isProcessing: boolean;
  items: ImageItem[];
};

export type ImageInputActions = {
  setOpen: (open: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;

  resetState: () => void;
  handleItemsSelected: (newItems: ImageItem[]) => void;
  handleItemImageReady: (index: number, img: HTMLImageElement) => void;
  handleRemoveItem: (index: number) => void;
  handleItemCropChange: (params: {
    index: number;
    naturalCrop: PixelCrop;
    minWidth: number;
    minHeight: number;
  }) => void;
};

export type ImageInputStore = ImageInputState & ImageInputActions;

export const defaultImageInputState: ImageInputState = {
  open: false,
  isProcessing: false,
  items: [],
};

export const createImageInputStore = (
  initState: ImageInputState = defaultImageInputState,
) => {
  return createStore<ImageInputStore>()((set, get) => ({
    ...initState,
    setOpen: (open: boolean) => set({ open }),
    setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),

    resetState: () => {
      const { isProcessing, items } = get();
      if (isProcessing) return;

      for (const item of items) {
        URL.revokeObjectURL(item.objectUrl);
      }

      set({
        open: false,
        isProcessing: false,
        items: [],
      });
    },

    handleItemsSelected: (newItems: ImageItem[]) => {
      const { setOpen } = get();
      set({ items: newItems });
      setOpen(true);
    },

    handleItemImageReady: (index: number, img: HTMLImageElement) => {
      set((state) => ({
        items: state.items.map((item, i) =>
          i === index ? { ...item, img } : item,
        ),
      }));
    },

    handleRemoveItem: (index: number) => {
      const { isProcessing, items, resetState } = get();
      if (isProcessing) return;

      const isLastItem = items.length === 1;

      const itemToRemove = items[index];
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.objectUrl);
      }

      if (isLastItem) resetState();
      else {
        const nextItems = items.filter((_, i) => i !== index);
        set({ items: nextItems });
      }
    },

    handleItemCropChange: ({
      index,
      naturalCrop,
      minWidth,
      minHeight,
    }) => {
      set((state) => ({
        items: state.items.map((item, i) => {
          if (i !== index) return item;

          const isInvalid = naturalCrop.width < minWidth || naturalCrop.height < minHeight;

          return {
            ...item,
            pixelCrop: naturalCrop,
            isInvalid,
          };
        })
      }));
    },
  }));
};
