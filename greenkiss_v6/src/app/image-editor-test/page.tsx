"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { type EditableImage, ImageEditor } from "@/shared/ui/image-kit";
import { Button } from "@/shared/ui/kit/button";

type ImageMeta = {
  id: string;
  url: string;
  width: number;
  height: number;
  aspectRatio: string;
  sizeBytes: number;
  sizeHuman: string;
  name: string;
  type: string;
  order: number;
};

function formatFileSize(sizeBytes: number): string {
  const MB = 1024 * 1024;
  const KB = 1024;

  const mb = Math.floor(sizeBytes / MB);
  const restAfterMb = sizeBytes - mb * MB;
  const kb = Math.floor(restAfterMb / KB);
  const bytes = restAfterMb - kb * KB;

  const parts: string[] = [];
  if (mb > 0) parts.push(`${mb} МБ`);
  if (kb > 0) parts.push(`${kb} КБ`);
  parts.push(`${bytes} Б`);

  return parts.join(" ");
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src = url;
  });
}

async function buildImageMeta(items: EditableImage[]): Promise<ImageMeta[]> {
  const metas: ImageMeta[] = [];
  for (const item of items) {
    const { file, id, order } = item;
    const url = URL.createObjectURL(file);
    try {
      const { width, height } = await getImageDimensions(file);
      const divisor = gcd(width, height);
      const arW = width / divisor;
      const arH = height / divisor;
      const sizeBytes = file.size;

      metas.push({
        id,
        url,
        width,
        height,
        aspectRatio: `${arW}:${arH}`,
        sizeBytes,
        sizeHuman: formatFileSize(sizeBytes),
        name: file.name,
        type: file.type,
        order,
      });
    } catch {
      metas.push({
        id,
        url,
        width: 0,
        height: 0,
        aspectRatio: "не удалось определить",
        sizeBytes: file.size,
        sizeHuman: formatFileSize(file.size),
        name: file.name,
        type: file.type,
        order,
      });
    }
  }

  return metas.sort((a, b) => a.order - b.order);
}

export default function ImageEditorTestPage() {
  const [images, setImages] = useState<EditableImage[]>([]);
  const [finalImages, setFinalImages] = useState<EditableImage[]>([]);
  const [metaList, setMetaList] = useState<ImageMeta[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Очистка objectURL‑ов при размонтировании и при смене metaList
  useEffect(() => {
    return () => {
      for (const m of metaList) {
        URL.revokeObjectURL(m.url);
      }
    };
  }, [metaList]);

  const handleChangeEditor = useCallback((updated: EditableImage[]) => {
    setImages(updated);
    setFinalImages(updated);
  }, []);

  // analyze НЕ зависит от metaList, чтобы не создавать цикл
  const analyze = useCallback(async (source: EditableImage[]) => {
    if (!source.length) {
      // очистим старые URL‑ы и метаданные
      setMetaList((prev) => {
        for (const m of prev) {
          URL.revokeObjectURL(m.url);
        }
        return [];
      });
      return;
    }

    setIsAnalyzing(true);

    // сначала очищаем старые URL‑ы
    setMetaList((prev) => {
      for (const m of prev) {
        URL.revokeObjectURL(m.url);
      }
      return prev;
    });

    try {
      const metas = await buildImageMeta(source);
      setMetaList(metas);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    await analyze(finalImages);
  }, [analyze, finalImages]);

  // Автоматически анализировать при изменении finalImages
  useEffect(() => {
    void analyze(finalImages);
  }, [analyze, finalImages]);

  return (
    <main className="container mx-auto max-w-4xl space-y-8 py-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Тестовая страница ImageEditor</h1>
        <p className="text-sm text-muted-foreground">
          Откройте диалог &quot;Редактировать изображения&quot;, добавьте или
          измените изображения, затем нажмите &quot;Готово&quot;. Ниже
          отобразится список итоговых файлов с подробной информацией.
        </p>

        <ImageEditor
          images={images}
          minImages={1}
          maxImages={10}
          minSize={10 * 1024} // 10 КБ
          maxSize={10 * 1024 * 1024} // 10 МБ
          onChange={handleChangeEditor}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Результат после &quot;Готово&quot;
          </h2>
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={!finalImages.length || isAnalyzing}
          >
            Пересчитать информацию
          </Button>
        </div>

        {!finalImages.length ? (
          <p className="text-sm text-muted-foreground">
            Пока нет выбранных изображений. После завершения редактирования они
            появятся здесь.
          </p>
        ) : isAnalyzing ? (
          <p className="text-sm text-muted-foreground">Анализ изображений...</p>
        ) : metaList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Изображения есть, но данные ещё не рассчитаны.
          </p>
        ) : (
          <div className="space-y-4">
            {metaList.map((meta, index) => (
              <div key={meta.id} className="flex gap-4 rounded-md border p-3">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded bg-muted">
                  <Image
                    src={meta.url}
                    alt={meta.name}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>

                <div className="flex-1 text-sm">
                  <div className="mb-1 font-medium">
                    #{index + 1} · Порядок: {meta.order}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <span className="text-muted-foreground">Имя файла: </span>
                      <span>{meta.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Тип: </span>
                      <span>{meta.type || "неизвестен"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ширина: </span>
                      <span>{meta.width || "?"} px</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Высота: </span>
                      <span>{meta.height || "?"} px</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Аспект‑рацио:{" "}
                      </span>
                      <span>{meta.aspectRatio}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Размер: </span>
                      <span>
                        {meta.sizeHuman} ({meta.sizeBytes} Б)
                      </span>
                    </div>
                    {/* сюда можно добавлять другую диагностическую инфу */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
