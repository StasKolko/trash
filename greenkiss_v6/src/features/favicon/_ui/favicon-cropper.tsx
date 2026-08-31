"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Slider } from "@/shared/ui/kit/slider";

export function FaviconCropper({
  src,
  onCancel,
  onConfirm,
}: {
  src: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1); // 1..3
  const [loaded, setLoaded] = useState(false);

  const onLoad = useCallback(() => setLoaded(true), []);

  const doCrop = useCallback(async () => {
    const img = imgRef.current;
    if (!img) return;

    // Рисуем квадратный canvas по минимальной стороне
    const natural = { w: img.naturalWidth, h: img.naturalHeight };
    const side = Math.min(natural.w, natural.h);

    // Влияем zoom: по сути берем меньший квадрат
    const zoomedSide = Math.max(64, Math.floor(side / zoom));

    const zx = Math.floor((natural.w - zoomedSide) / 2);
    const zy = Math.floor((natural.h - zoomedSide) / 2);

    const canvas = document.createElement("canvas");
    // Делаем 512x512 для "оригинала", сервер дальше ужмет
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, zx, zy, zoomedSide, zoomedSide, 0, 0, 512, 512);

    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("Failed to create PNG blob"))),
        "image/png",
      ),
    );
    onConfirm(blob);
  }, [zoom, onConfirm]);

  useEffect(
    () => () => {
      // revoke url будет в родителе
    },
    [],
  );

  const gridKeys = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Обрезка и зум</div>
      <div className="relative w-full overflow-hidden rounded-md border bg-muted/40 p-4">
        {/* Гайд-сетка */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
          {gridKeys.map((key, i) => (
            <div
              className="border border-white/10"
              key={key}
              style={{
                borderWidth: i % 3 === 0 ? "0 1px 1px 0" : "0 1px 1px 0",
              }}
            />
          ))}
        </div>
        {/* Изображение */}
        {/* biome-ignore lint/a11y/useAltText: preview */}
        {/* biome-ignore lint/performance/noImgElement: need natural sizes for canvas */}
        <img
          className="max-h-[50vh] mx-auto object-contain"
          onLoad={onLoad}
          ref={imgRef}
          src={src}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground w-12">Zoom</div>
        <Slider
          className="flex-1"
          max={3}
          min={1}
          onValueChange={(v) => setZoom(v[0])}
          step={0.01}
          value={[zoom]}
        />
        <div className="w-10 text-right text-xs">{zoom.toFixed(2)}×</div>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCancel} variant="outline">
          Отмена
        </Button>
        <Button disabled={!loaded} onClick={doCrop}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
