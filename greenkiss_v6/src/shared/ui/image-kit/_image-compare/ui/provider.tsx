"use client";

import { type ReactNode, useRef, useEffect } from "react";
import { ImageCompareStoreContext } from "../model/context";
import {
  createImageCompareStore,
  type ImageCompareStoreApi,
} from "../model/store";
import type { ImageCompareConfig } from "../model/types";

export const ImageCompareProvider = ({
  left,
  right,
  className,
  children,
}: ImageCompareConfig & { children: ReactNode }) => {
  const storeRef = useRef<ImageCompareStoreApi | null>(null);

  // Инициализируем стор один раз
  if (storeRef.current === null) {
    storeRef.current = createImageCompareStore({ left, right, className });
  }

  // При смене props обновляем конфиг в сторе и перезагружаем изображения
  useEffect(() => {
    if (!storeRef.current) return;
    const store = storeRef.current;
    store.getState().setImages(left, right, className);
    void store.getState().loadImages();

    return () => {
      // отменяем загрузку и чистим objectURL
      const anyStore = store as any;
      if (typeof anyStore.__cancelCompareLoading === "function") {
        anyStore.__cancelCompareLoading();
      }
    };
  }, [left, right, className]);

  return (
    <ImageCompareStoreContext.Provider value={storeRef.current}>
      {children}
    </ImageCompareStoreContext.Provider>
  );
};
