"use client";

import { useRef } from "react";
import { cn } from "@/shared/lib/css";
import { throttle } from "@/shared/lib/timing"; // <-- новый импорт
import { getSliderPercentFromClientX } from "../lib/slider";
import { useImageCompareStore } from "../model/context";

export const ImageCompareContainer = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const setSlider = useImageCompareStore((state) => state.setSlider);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const throttledSetSliderRef = useRef(
    throttle((value: number) => {
      setSlider(value);
    }, 40),
  );

  const stopDrag = () => {
    draggingRef.current = false;
    // Сбрасываем возможный отложенный trailing‑вызов
    throttledSetSliderRef.current.cancel();
  };

  const updateSliderByClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const percent = getSliderPercentFromClientX(clientX, rect);
    throttledSetSliderRef.current(percent);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    updateSliderByClientX(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    updateSliderByClientX(t.clientX);
  };

  const handleMouseDown = () => {
    draggingRef.current = true;
  };

  const handleTouchStart = () => {
    draggingRef.current = true;
  };

  return (
    <div
      ref={containerRef}
      role="alert"
      className={cn(
        "relative overflow-hidden bg-secondary flex items-center justify-center select-none touch-none",
        className ?? "w-full h-64",
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={stopDrag}
      onMouseUp={stopDrag}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopDrag}
      onTouchCancel={stopDrag}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
};
