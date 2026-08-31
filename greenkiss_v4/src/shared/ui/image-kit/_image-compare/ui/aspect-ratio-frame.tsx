"use client";

import type { ReactNode } from "react";
import { useImageCompareStore } from "../model/context";

export const AspectRatioFrame = ({ children }: { children: ReactNode }) => {
  const aspectRatio = useImageCompareStore((state) => state.aspectRatio);

  return (
    <div
      className="relative w-full max-w-full max-h-full"
      style={{ aspectRatio: String(aspectRatio) }}
    >
      {children}
    </div>
  );
};
