"use client";

import { useImageInputStore } from "../model/context";

export const ImageSizePreview = () => {
  const maxSize = 70;
  const width = useImageInputStore((state) => state.width);
  const height = useImageInputStore((state) => state.height);

  const maxSide = Math.max(width, height);
  const scale = maxSize / maxSide;

  const displayWidth = width * scale;
  const displayHeight = height * scale;

  console.log(`width: ${width}, height: ${height}`);
  console.log(`displayWidth: ${displayWidth}, displayHeight: ${displayHeight}`);

  return (
    <div
      aria-hidden="true"
      className="shrink-0 rounded-md border border-primary text-xs font-bold text-primary relative"
      style={{
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
      }} >
        <span className="absolute left-0 right-0 -top-4">{width}</span>
        <span>{height}</span>
      </div>
  );
};
