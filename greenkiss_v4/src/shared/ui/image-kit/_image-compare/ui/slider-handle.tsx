"use client";

import type { ReactNode } from "react";
import { useImageCompareStore } from "../model/context";

export const CompareSliderHandle = ({ children }: { children: ReactNode }) => {
  const slider = useImageCompareStore((state) => state.slider);

  return (
    <div
      className="absolute top-0 bottom-0 flex items-center justify-center cursor-col-resize"
      style={{ left: `${slider}%`, transform: "translateX(-50%)" }}
    >
      {children}
    </div>
  );
};
