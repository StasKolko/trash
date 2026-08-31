"use client";

import { ImageIcon } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

import { Button } from "@/shared/ui/kit/button";

import { useImageInputStore } from "../model/context";
import type { ImageItem } from "../model/types";

export const ImageInputTrigger = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const multiple = useImageInputStore((store) => store.mode === "multiple");
  const onItemsSelected = useImageInputStore(
    (store) => store.handleItemsSelected,
  );

  const triggerInputClick = () => {
    if (!inputRef.current) return;
    // Reset value so selecting the same file again still triggers change
    inputRef.current.value = "";
    inputRef.current.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList?.length) return;

    const files = Array.from(fileList);

    const items: ImageItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      img: null,
      objectUrl: URL.createObjectURL(file),
      isInvalid: false,
    }));
    onItemsSelected(multiple ? items : items.slice(0, 1));
  };

  return (
    <Button
      aria-label="Загрузить изображение"
      onClick={triggerInputClick}
      type="button"
    >
      <ImageIcon aria-hidden="true" className="size-5" />
      <span aria-hidden="true">Загрузить</span>

      <input
        accept=".png,.webp,.jpg,.jpeg"
        aria-hidden="true"
        className="hidden"
        multiple={multiple}
        onChange={handleChange}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
    </Button>
  );
};
