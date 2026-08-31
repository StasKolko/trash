"use client";

import { useCallback, useMemo, useState } from "react";
import type { PercentCrop, PixelCrop } from "react-image-crop";
import {
  buildInitialNaturalCrop,
  getCropLimits,
  handleReactCropChangeLogic,
  naturalCropToPercentCrop,
  updateCropFromControlsLogic,
} from "../lib/crop-logic";
import { useImageInputStore } from "../model/context";
import type { ImageItem } from "../model/types";

import { CropControls } from "./crop-controls";
import { CropPreview } from "./crop-preview";

export const ImageCropSectionContent = ({ item }: { item: ImageItem }) => {
  const aspect = useImageInputStore((state) => state.aspect);
  const handleItemCropChange = useImageInputStore(
    (state) => state.handleItemCropChange,
  );
  const handleItemImageReady = useImageInputStore(
    (state) => state.handleItemImageReady,
  );

  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(item.img);
  const [naturalCrop, setNaturalCrop] = useState<PixelCrop | undefined>(
    item.pixelCrop
      ? {
          x: item.pixelCrop.x,
          y: item.pixelCrop.y,
          width: item.pixelCrop.width,
          height: item.pixelCrop.height,
          unit: "px",
        }
      : undefined,
  );

  const [percentCrop, setPercentCrop] = useState<PercentCrop | undefined>(
    undefined,
  );

  const initCropFromImage = useCallback(
    (img: HTMLImageElement) => {
      setImgEl(img);
      handleItemImageReady(item.id, img);

      const initialNatural = buildInitialNaturalCrop(img, aspect, naturalCrop);
      const initialPercent = naturalCropToPercentCrop(initialNatural, img);

      setNaturalCrop(initialNatural);
      setPercentCrop(initialPercent);
      handleItemCropChange(item.id, initialNatural);
    },
    [aspect, handleItemCropChange, handleItemImageReady, item, naturalCrop],
  );

  const updateCropFromControls = useCallback(
    (naturalNextRaw: PixelCrop) => {
      if (!imgEl) return;

      const { natural, percent } = updateCropFromControlsLogic({
        nextNaturalRaw: naturalNextRaw,
        img: imgEl,
        aspect,
      });

      setNaturalCrop(natural);
      setPercentCrop(percent);
      handleItemCropChange(item.id, natural);
    },
    [aspect, handleItemCropChange, imgEl, item],
  );

  const handleReactCropChange = useCallback(
    (_pixel: PixelCrop, percent: PercentCrop) => {
      if (!imgEl) return;

      setPercentCrop(percent);

      const { natural } = handleReactCropChangeLogic({
        percent,
        img: imgEl,
        aspect,
      });

      setNaturalCrop(natural);
      handleItemCropChange(item.id, natural);
    },
    [aspect, handleItemCropChange, imgEl, item],
  );

  const limits = useMemo(
    () => getCropLimits(imgEl, aspect, naturalCrop),
    [imgEl, naturalCrop, aspect],
  );

  return (
    <>
      <CropControls
        crop={naturalCrop}
        limits={limits}
        onChange={updateCropFromControls}
      />

      <CropPreview
        crop={percentCrop}
        fileName={item.file.name}
        objectUrl={item.objectUrl}
        onChangeCrop={handleReactCropChange}
        onInitImage={initCropFromImage}
      />
    </>
  );
};
