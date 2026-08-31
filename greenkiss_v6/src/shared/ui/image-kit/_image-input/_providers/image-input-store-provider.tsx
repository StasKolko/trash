"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useRef,
} from "react";
import { useStore } from "zustand";

import {
  type ImageInputStore,
  createImageInputStore,
} from "../_store/image-input-store";

export type ImageInputStoreApi = ReturnType<typeof createImageInputStore>;

const ImageInputStoreContext = createContext<ImageInputStoreApi | undefined>(
  undefined,
);

export const ImageInputStoreProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const storeRef = useRef<ImageInputStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createImageInputStore();
  }

  return (
    <ImageInputStoreContext.Provider value={storeRef.current}>
      {children}
    </ImageInputStoreContext.Provider>
  );
};

export const useImageInputStore = <T,>(
  selector: (store: ImageInputStore) => T,
): T => {
  const imageInputStoreContext = useContext(ImageInputStoreContext);

  if (!imageInputStoreContext) {
    throw new Error(
      "useImageInputStore must be used within ImageInputStoreProvider",
    );
  }

  return useStore(imageInputStoreContext, selector);
};
