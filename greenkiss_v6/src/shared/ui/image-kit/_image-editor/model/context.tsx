"use client";

import { createContext, useContext } from "react";
import type { ImageEditorProps } from "./types";

export type ImageEditorContextValue = ImageEditorProps;

const ImageEditorContext = createContext<ImageEditorContextValue | null>(null);

export function ImageEditorProvider({
  value,
  children,
}: {
  value: ImageEditorContextValue;
  children: React.ReactNode;
}) {
  return (
    <ImageEditorContext.Provider value={value}>
      {children}
    </ImageEditorContext.Provider>
  );
}

export function useImageEditorContext(): ImageEditorContextValue {
  const ctx = useContext(ImageEditorContext);
  if (!ctx) {
    throw new Error("ImageEditorContext is not provided");
  }
  return ctx;
}
