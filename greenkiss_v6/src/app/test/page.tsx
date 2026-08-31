"use client";

import React, { useCallback, useState } from "react";
import { ImageInput } from "@/shared/ui/image-kit";
import { Button } from "@/shared/ui/kit/button";

type CroppedInfo = {
  file: File;
  url: string;
  width: number;
  height: number;
};

function formatFileSize(bytes: number): string {
  const MB = 1024 * 1024;
  const KB = 1024;

  const mb = Math.floor(bytes / MB);
  const restAfterMb = bytes % MB;

  const kb = Math.floor(restAfterMb / KB);
  const restBytes = restAfterMb % KB;

  const parts: string[] = [];
  parts.push(`${mb} MB`);
  parts.push(`${kb} KB`);
  parts.push(`${restBytes} B`);

  return parts.join(" ");
}

function getFileExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return name.slice(dotIndex);
}

/**
 * Отдельный компонент с ImageInput, обёрнутый в React.memo.
 * Он будет ререндериться только при изменении ПРОПСОВ.
 */
type ImageInputIsolatedProps = {
  onComplete: (images: File[]) => void | Promise<void>;
};

const ImageInputIsolated = React.memo(function ImageInputIsolated(
  props: ImageInputIsolatedProps,
) {
  const { onComplete } = props;

  return (
    <ImageInput
      mode="multiple"
      width={750}
      height={1000}
      onComplete={onComplete}
    />
  );
});

export default function TestPage() {
  const [croppedImages, setCroppedImages] = useState<CroppedInfo[]>([]);

  // useCallback, чтобы ссылка на колбэк была стабильной
  const handleComplete = useCallback(async (images: File[]) => {
    setCroppedImages((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.url);
      return [];
    });

    const result: CroppedInfo[] = [];

    for (const file of images) {
      const objectUrl = URL.createObjectURL(file);
      const img = await loadImage(objectUrl);

      result.push({
        file,
        url: objectUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }

    setCroppedImages(result);
  }, []); // пустой массив — колбэк создаётся один раз

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Тест кропа изображений</h1>

      <p className="text-sm text-muted-foreground">
        Ниже кнопка открытия диалога <code>ImageInput</code>. После выбора и
        кропа изображений, эта страница выведет итоговые файлы с их
        характеристиками: расширение, размер, ширину и высоту.
      </p>

      {/* Изолированный ImageInput */}
      <ImageInputIsolated onComplete={handleComplete} />

      {croppedImages.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">
            Результат кропа ({croppedImages.length} файл(ов))
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {croppedImages.map(({ file, url, width, height }, index) => {
              const ext = getFileExtension(file.name);
              const sizeFormatted = formatFileSize(file.size);

              return (
                <article
                  key={`${file.name}-${index}`}
                  className="border rounded-md p-3 space-y-2"
                >
                  <header className="space-y-1">
                    <h3 className="font-semibold break-all">{file.name}</h3>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>
                        <span className="font-medium">Расширение:</span>{" "}
                        {ext || "(без расширения)"}
                      </p>
                      <p>
                        <span className="font-medium">Размер файла:</span>{" "}
                        {sizeFormatted}
                      </p>
                      <p>
                        <span className="font-medium">Ширина:</span> {width} px
                      </p>
                      <p>
                        <span className="font-medium">Высота:</span> {height} px
                      </p>
                      <p>
                        <span className="font-medium">Соотношение:</span>{" "}
                        {width / height - 400 / 300}
                      </p>
                    </div>
                  </header>

                  <div className="relative w-full aspect-video overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                    <img
                      src={url}
                      alt={file.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <footer className="flex justify-end">
                    <a href={url} download={file.name} className="inline-flex">
                      <Button type="button" size="sm" variant="outline">
                        Скачать
                      </Button>
                    </a>
                  </footer>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`Не удалось загрузить изображение: ${src}`));
    img.src = src;
  });
}
