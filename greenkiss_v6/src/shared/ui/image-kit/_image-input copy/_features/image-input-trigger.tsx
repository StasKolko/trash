"use client";

import { ImageIcon } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

import { Button } from "@/shared/ui/kit/button";

import type { ImageItem } from "../_types";

export const ImageInputTrigger = ({
  mode,
  onItemsSelected,
}: {
  mode: "single" | "multiple";
  onItemsSelected: (items: ImageItem[]) => void;
}) => {
  const { hiddenInput, triggerInputClick } = useFileInputTrigger({
    onFilesSelected: (files) => {
      const items: ImageItem[] = files.map((file) => ({
        file,
        img: null,
        objectUrl: URL.createObjectURL(file),
        isInvalid: true,
      }));
      onItemsSelected(items);
    },
    multiple: mode === "multiple",
    accept: ".png,.webp,.jpg,.jpeg",
  });

  return (
    <Button
      aria-label="Загрузить изображение"
      onClick={triggerInputClick}
      type="button"
    >
      <ImageIcon aria-hidden="true" className="size-5" />
      <span aria-hidden="true">Загрузить</span>
      {hiddenInput}
    </Button>
  );
};

function useFileInputTrigger({
  onFilesSelected,
  multiple,
  accept,
}: {
  onFilesSelected: (files: File[]) => void;
  multiple: boolean;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

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

    onFilesSelected(multiple ? files : files.slice(0, 1));
  };

  const hiddenInput = (
    <input
      accept={accept}
      aria-hidden="true"
      className="hidden"
      multiple={multiple}
      onChange={handleChange}
      ref={inputRef}
      tabIndex={-1}
      type="file"
    />
  );

  return {
    triggerInputClick,
    hiddenInput,
  };
}
