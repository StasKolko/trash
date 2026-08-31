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
