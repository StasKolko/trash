"use client";

import { PaletteIcon, SquareXIcon } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";
import { useImageInputStore } from "../model/context";
import type { ImagePreviewBackgroundMode } from "../model/types";

const modes: {
  value: ImagePreviewBackgroundMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "solid", label: "Однородный фон", icon: PaletteIcon },
  { value: "checkerboard", label: "Шахматный фон", icon: SquareXIcon },
];

export const PreviewBackgroundToggle = ({
  className,
}: {
  className?: string;
}) => {
  const currentMode = useImageInputStore(
    (state) => state.previewBackgroundMode,
  );
  const setMode = useImageInputStore((state) => state.setPreviewBackgroundMode);

  const currentIndex = modes.findIndex((m) => m.value === currentMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  const NextIcon = modes[nextIndex].icon;
  const nextLabel = modes[nextIndex].label;

  const handleClick = () => {
    setMode(modes[nextIndex].value);
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={className}
      aria-label={nextLabel}
      onClick={handleClick}
    >
      <NextIcon className="size-4" aria-hidden="true" />
    </Button>
  );
};
