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
