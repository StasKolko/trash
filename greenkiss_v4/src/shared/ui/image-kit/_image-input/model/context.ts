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
