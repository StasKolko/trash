"use client";

import type { ReactNode } from "react";

import { useImageInputStore } from "../model/context";

export const ImagePreviewFrame = ({ children }: { children: ReactNode }) => {
  const previewBackgroundMode = useImageInputStore(
    (state) => state.previewBackgroundMode,
  );

  const isCheckerboard = previewBackgroundMode === "checkerboard";

  return (
    <div
      className="relative w-full aspect-square overflow-hidden flex items-center justify-center bg-secondary"
      style={
        isCheckerboard
          ? {
              backgroundImage: `
        linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5),
        linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5)
      `,
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0, 8px 8px",
              backgroundColor: "#ffffff",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};
