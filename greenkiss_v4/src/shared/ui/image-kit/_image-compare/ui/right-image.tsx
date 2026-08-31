"use client";

import { useImageCompareStore } from "../model/context";

export const RightImage = () => {
  const rightImg = useImageCompareStore((state) => state.rightImg);
  const slider = useImageCompareStore((state) => state.slider);

  if (!rightImg) return null;

  return (
    // biome-ignore lint/performance/noImgElement: нужно именно <img>
    <img
      src={rightImg.url}
      alt={rightImg.name}
      className="absolute inset-0 w-full h-full object-contain"
      style={{
        clipPath: `inset(0 ${100 - slider}% 0 0)`,
      }}
      draggable={false}
    />
  );
};
