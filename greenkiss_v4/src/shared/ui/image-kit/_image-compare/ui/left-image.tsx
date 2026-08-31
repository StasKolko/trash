"use client";

import { useImageCompareStore } from "../model/context";

export const LeftImage = () => {
  const leftImg = useImageCompareStore((state) => state.leftImg);

  if (!leftImg) return null;

  return (
    // biome-ignore lint/performance/noImgElement: нужно именно <img>
    <img
      src={leftImg.url}
      alt={leftImg.name}
      className="absolute inset-0 w-full h-full object-contain"
      draggable={false}
    />
  );
};
