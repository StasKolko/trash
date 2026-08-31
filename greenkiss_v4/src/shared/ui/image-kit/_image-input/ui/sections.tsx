"use client";

import { ImageCropSectionContent } from "../doubtful/image-crop-section-content";
import { useImageInputStore } from "../model/context";
import { ImageCropInvalidIndicator } from "./crop-invalid-tooltip";
import { ImageInputRemoveItemButton } from "./remove-item-button";

export const ImageInputSections = () => {
  const items = useImageInputStore((state) => state.items);

  return (
    <div className="max-h-[calc(100vh-8rem)] w-full flex flex-col overflow-y-auto border-t">
      {items.map((item) => (
        <section key={item.id} className="w-full relative">
          <ImageInputRemoveItemButton id={item.id} />
          <ImageCropInvalidIndicator id={item.id} />

          <div className="w-full h-12 flex items-center justify-center gap-3 border-b">
            <h3 className="font-bold text-md md:text-xl leading-none">
              {item.file.name}
            </h3>
          </div>

          <ImageCropSectionContent item={item} />
        </section>
      ))}
    </div>
  );
};
