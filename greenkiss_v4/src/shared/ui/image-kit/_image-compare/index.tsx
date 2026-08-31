"use client";

import { ImageCompareContent } from "./ui/content";
import { ImageCompareProvider } from "./ui/provider";

export const ImageCompare = ({
  left,
  right,
  className,
}: {
  left: File;
  right: File;
  className?: string;
}) => {
  return (
    <ImageCompareProvider>
      <ImageCompareContent left={left} right={right} className={className} />
    </ImageCompareProvider>
  );
};
