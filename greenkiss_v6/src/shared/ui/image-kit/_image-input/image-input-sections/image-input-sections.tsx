"use client";

import type React from "react";
import { type PixelCrop } from "react-image-crop";

import { Separator } from "@/shared/ui/kit/separator";
import { useObjectUrls } from "../../_hooks/use-object-urls";
import { useAspectRatio } from "./use-aspect-ratio";
import { useImageCrops } from "./use-image-crops";
import { useInitCropArrays } from "./use-init-crop-arrays";
import { ImageInputSectionItem } from "./image-input-section-item";

import "react-image-crop/dist/ReactCrop.css";

export const ImageInputSections = ({
  files,
  isProcessing,
  aspectRatio,
  setPixelCrops,
  setImgElements,
}: {
  files: File[];
  isProcessing: boolean;
  aspectRatio: {
    width: number;
    height: number;
  };
  setPixelCrops: React.Dispatch<
    React.SetStateAction<(PixelCrop | undefined)[]>
  >;
  setImgElements: React.Dispatch<
    React.SetStateAction<(HTMLImageElement | null)[]>
  >;
}) => {
  const filesLength = files.length;

  const imageUrls = useObjectUrls(files);
  const ratio = useAspectRatio(aspectRatio);

  useInitCropArrays(filesLength, setImgElements, setPixelCrops);

  const { percentCrops, handleImageLoaded, handleCropChange } = useImageCrops({
    aspectRatio: ratio,
    filesLength,
    setExternalPixelCrops: setPixelCrops,
    setExternalImgElements: setImgElements,
  });

  if (!filesLength) return null;

  return (
    <div className="max-h-[60vh] lg:max-h-[70vh] w-full flex flex-col overflow-y-auto">
      {files.map((file, index) => (
        <div className="flex flex-col" key={file.name}>
          <ImageInputSectionItem
            file={file}
            objectUrl={imageUrls[index]}
            crop={percentCrops[index]}
            aspect={ratio}
            isProcessing={isProcessing}
            onImageLoaded={handleImageLoaded(index)}
            onCropChange={handleCropChange(index)}
          />

          {index !== filesLength - 1 && <Separator className="mb-3" />}
        </div>
      ))}
    </div>
  );
};
