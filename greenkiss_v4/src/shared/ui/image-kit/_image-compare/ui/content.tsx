"use client";

import { GripVerticalIcon } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/shared/lib/css";
import { ImageProcessingOverlay } from "../../_ui/image-processing-overlay";
import { getCommonImageSize } from "../lib/common-size";
import {
  ASPECT_RATIO_MISMATCH_ERROR,
  GENERIC_LOAD_ERROR,
  loadAndValidatePair,
  revokeLoadedImage,
} from "../lib/load-images";
import { useImageCompareStore } from "../model/context";
import { AspectRatioFrame } from "./aspect-ratio-frame";
import { ImageCompareContainer } from "./container";
import { LeftImage } from "./left-image";
import { RightImage } from "./right-image";
import { CompareSliderHandle } from "./slider-handle";

export const ImageCompareContent = ({
  left,
  right,
  className,
}: {
  left: File;
  right: File;
  className?: string;
}) => {
  const error = useImageCompareStore((state) => state.error);
  const setError = useImageCompareStore((state) => state.setError);

  const leftImg = useImageCompareStore((state) => state.leftImg);
  const rightImg = useImageCompareStore((state) => state.rightImg);
  const setLeftImg = useImageCompareStore((state) => state.setLeftImg);
  const setRightImg = useImageCompareStore((state) => state.setRightImg);

  const aspectRatio = useImageCompareStore((state) => state.aspectRatio);
  const setAspectRatio = useImageCompareStore((state) => state.setAspectRatio);

  useEffect(() => {
    const abortController = new AbortController();

    (async () => {
      try {
        setError(null);
        setLeftImg(null);
        setRightImg(null);
        setAspectRatio(null);

        const { left: loadedLeft, right: loadedRight } =
          await loadAndValidatePair(left, right, {
            signal: abortController.signal,
          });

        if (abortController.signal.aborted) {
          revokeLoadedImage(loadedLeft);
          revokeLoadedImage(loadedRight);
          return;
        }

        setLeftImg(loadedLeft);
        setRightImg(loadedRight);

        const commonSize = getCommonImageSize(loadedLeft, loadedRight);
        if (commonSize) {
          setAspectRatio(commonSize.width / commonSize.height);
        } else {
          setAspectRatio(null);
        }
      } catch (e) {
        if (abortController.signal.aborted) return;

        const message =
          e instanceof Error && e.message === ASPECT_RATIO_MISMATCH_ERROR
            ? ASPECT_RATIO_MISMATCH_ERROR
            : GENERIC_LOAD_ERROR;

        setError(message);
      }
    })();

    return () => {
      abortController.abort();
      revokeLoadedImage(leftImg);
      revokeLoadedImage(rightImg);
      setAspectRatio(null);
    };
  }, [
    left,
    right,
    leftImg,
    rightImg,
    setLeftImg,
    setRightImg,
    setAspectRatio,
    setError,
  ]);

  if (error) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-destructive/10 text-destructive text-center text-sm md:text-base",
          className ?? "w-full h-64",
        )}
      >
        {error}
      </div>
    );
  }

  if (!leftImg || !rightImg || !aspectRatio) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-secondary text-muted-foreground text-sm",
          className ?? "w-full h-64",
        )}
      >
        <ImageProcessingOverlay text="Загрузка..." />
      </div>
    );
  }

  return (
    <ImageCompareContainer className={className}>
      <AspectRatioFrame>
        <LeftImage />

        <div className="absolute inset-0">
          <RightImage />
        </div>

        <CompareSliderHandle>
          <div className="w-1 h-full bg-foreground border-x border-background" />
          <button
            type="button"
            aria-label="Сдвинуть шторку сравнения"
            className="w-8 h-12 flex items-center justify-center absolute left-1/2 -translate-x-1/2 rounded-md cursor-move bg-foreground border border-background hover:bg-foreground/70 active:bg-primary text-background active:text-primary-foreground"
          >
            <GripVerticalIcon aria-hidden="true" />
          </button>
        </CompareSliderHandle>
      </AspectRatioFrame>
    </ImageCompareContainer>
  );
};
