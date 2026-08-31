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
