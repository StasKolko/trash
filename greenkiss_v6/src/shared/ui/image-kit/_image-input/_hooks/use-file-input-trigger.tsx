"use client";

import { type ChangeEvent, useRef } from "react";

export function useFileInputTrigger({
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
