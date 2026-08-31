"use client";

import { type ChangeEvent, useRef } from "react";

export const ImageInputTrigger = ({
  mode,
  onFilesSelected,
}: {
  mode: "single" | "multiple";
  onFilesSelected: (files: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (!inputRef.current) return;
    inputRef.current.value = ""; // reset, so same file selection still triggers change
    inputRef.current.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);

    if (mode === "single") {
      onFilesSelected(files.slice(0, 1));
    } else {
      onFilesSelected(files);
    }
  };

  return (
    <div className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        className="flex min-h-[80px] min-w-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground transition hover:border-primary hover:bg-muted/70 hover:text-primary"
      >
        <span className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
          Загрузка изображений
        </span>
        <span className="text-sm font-medium">
          Нажмите, чтобы выбрать {mode === "single" ? "изображение" : "изображения"}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          {mode === "single"
            ? "Поддерживаются форматы JPG, PNG, WEBP"
            : "Можно выбрать несколько файлов одновременно"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={mode === "multiple"}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};
