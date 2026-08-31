"use client";

import { useMemo } from "react";

export function useAspectRatio({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return useMemo(
    () => (width && height ? width / height : undefined),
    [width, height],
  );
}
