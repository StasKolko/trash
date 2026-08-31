"use client";

import { createContext, useContext } from "react";
import { useStore } from "zustand";
import type { ImageCompareStore, ImageCompareStoreApi } from "./store";

export const ImageCompareStoreContext =
  createContext<ImageCompareStoreApi | null>(null);

export const useImageCompareStore = <T,>(
  selector: (state: ImageCompareStore) => T,
): T => {
  const ctx = useContext(ImageCompareStoreContext);
  if (!ctx) {
    throw new Error(
      "useImageCompareStore must be used within ImageCompareProvider",
    );
  }
  return useStore(ctx, selector);
};
