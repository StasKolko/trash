"use client";

import { useState } from "react";
import { ImageCompare, ImageInput } from "@/shared/ui/image-kit";
import { Button } from "@/shared/ui/kit/button";

export default function ImageCompareTestPage() {
  const [files, setFiles] = useState<File[]>([]);

  const handleComplete = (images: File[]) => {
    // Берём первые две картинки
    setFiles(images.slice(0, 2));
  };

  const hasTwo = files.length >= 2;

  return (
    <div className="min-h-screen flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Тест сравнения изображений</h1>

      <div className="flex items-center gap-4">
        <ImageInput
          mode="multiple"
          width={800}
          height={800}
          onComplete={handleComplete}
        />
        {hasTwo && (
          <Button type="button" variant="outline" onClick={() => setFiles([])}>
            Сбросить выбор
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-xl">
        Выберите минимум две картинки. После кропа они будут переданы в
        компонент сравнения. Если пропорции различаются, отобразится ошибка.
      </p>

      <div className="w-full max-w-3xl">
        {hasTwo ? (
          <ImageCompare
            left={files[0]}
            right={files[1]}
            className="w-full h-[400px] border rounded-md"
          />
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center border rounded-md text-sm text-muted-foreground">
            Выберите две картинки и нажмите &quot;Готово&quot;, чтобы увидеть
            сравнение.
          </div>
        )}
      </div>
    </div>
  );
}
