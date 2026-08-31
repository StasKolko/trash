'use client';

import * as React from 'react';
import ReactImageCrop, { Crop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import type { AspectRatio, ProcessedImage, SizePx } from '../_lib/types';
import {
  getDefaultCrop,
  cropImageToProcessed,
  type CropRect,
} from '../_lib/crop';
import { loadImageFromSource, revokeLoadedImage } from '../_lib/image-load';
import { parseAspectRatio } from '../_lib/aspect-utils';
import { ProcessingOverlay } from '../_ui/processing-overlay';
import { IconButton } from '../_ui/icon-button';
import { formatBytesToHuman } from '../_lib/file-utils';

type LocalSource = {
  id: string;
  file: File;
  loaded?: {
    width: number;
    height: number;
    image: HTMLImageElement | ImageBitmap;
  };
  crop: PercentCrop;
  stretchSmall: boolean;
  processing: boolean;
  result?: ProcessedImage;
};

export type ImageInputCropperProps = {
  files: File[];
  aspect: AspectRatio;
  bannerSizePresets?: SizePx;
  onComplete: (images: ProcessedImage[]) => void;
  onError?: (error: Error) => void;
};

export function ImageInputCropper({
  files,
  aspect,
  bannerSizePresets,
  onComplete,
  onError,
}: ImageInputCropperProps) {
  const [items, setItems] = React.useState<LocalSource[]>([]);
  const [globalProcessing, setGlobalProcessing] = React.useState(false);

  /**
   * Числовое отношение сторон, которое отдаём react-image-crop.
   * Если есть баннер — считаем его ratio, иначе используем AspectRatio.
   */
  const numericAspect = React.useMemo(() => {
    if (bannerSizePresets) {
      if (bannerSizePresets.width <= 0 || bannerSizePresets.height <= 0) {
        throw new Error(
          'bannerSizePresets must have positive width and height'
        );
      }
      return bannerSizePresets.width / bannerSizePresets.height;
    }
    return parseAspectRatio(aspect);
  }, [aspect, bannerSizePresets]);

  /**
   * Строковый аспект, который используем в getDefaultCrop.
   * Если есть баннер — приводим его ratio к строковой форме "w:h",
   * чтобы начальный кроп уже был с этими пропорциями.
   */
  const effectiveAspect: AspectRatio = React.useMemo(() => {
    if (!bannerSizePresets) return aspect;

    const ratio = bannerSizePresets.width / bannerSizePresets.height;
    // Приближаем к ближайшему из заданных типов
    const known: AspectRatio[] = ['1:1', '3:4', '4:3', '16:9', '9:16'];
    let best: AspectRatio = '16:9';
    let bestDiff = Number.POSITIVE_INFINITY;
    for (const a of known) {
      const r = parseAspectRatio(a);
      const diff = Math.abs(ratio - r);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = a;
      }
    }
    return best;
  }, [aspect, bannerSizePresets]);

  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const nextItems: LocalSource[] = [];

        for (const file of files) {
          const loaded = await loadImageFromSource(file);
          if (cancelled) break;

          // ВАЖНО: всегда передаём effectiveAspect,
          // чтобы начальный crop имел правильные пропорции (1280×720 и т.п.)
          const defaultCropRect = getDefaultCrop(
            loaded.width,
            loaded.height,
            effectiveAspect
          );

          const crop: PercentCrop = {
            unit: '%',
            x: defaultCropRect.x * 100,
            y: defaultCropRect.y * 100,
            width: defaultCropRect.width * 100,
            height: defaultCropRect.height * 100,
          };

          nextItems.push({
            id: `${file.name}-${file.size}-${file.lastModified}`,
            file,
            loaded: {
              width: loaded.width,
              height: loaded.height,
              image: loaded.image,
            },
            crop,
            stretchSmall: false,
            processing: false,
            result: undefined,
          });

          revokeLoadedImage(loaded);
        }

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (e) {
        if (!cancelled) {
          onError?.(
            e instanceof Error
              ? e
              : new Error('Failed to init cropper for ImageInput')
          );
        }
      }
    }

    if (files.length > 0) {
      init();
    } else {
      setItems([]);
    }

    return () => {
      cancelled = true;
    };
  }, [files, effectiveAspect, onError]);

  const handleToggleStretch = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, stretchSmall: !it.stretchSmall } : it
      )
    );
  };

  const handleCropChange = (id: string, crop: Crop) => {
    // Явно формируем PercentCrop с unit: '%'
    const percent: PercentCrop = {
      unit: '%',
      x: crop.x ?? 0,
      y: crop.y ?? 0,
      width: crop.width ?? 0,
      height: crop.height ?? 0,
    };

    setItems((prev: LocalSource[]): LocalSource[] =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              crop: percent,
            }
          : it
      )
    );
  };

  const handleProcessAll = async () => {
    try {
      setGlobalProcessing(true);
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          processing: true,
        }))
      );

      const results: ProcessedImage[] = [];

      for (const item of items) {
        if (!item.loaded) continue;

        const relative: CropRect = {
          x: (item.crop.x ?? 0) / 100,
          y: (item.crop.y ?? 0) / 100,
          width: (item.crop.width ?? 0) / 100,
          height: (item.crop.height ?? 0) / 100,
        };

        const processed = await cropImageToProcessed(
          item.loaded.image,
          relative,
          {
            mime: item.file.type || 'image/png',
            quality: 0.92,
            sourceName: item.file.name,
          }
        );

        results.push(processed);
      }

      onComplete(results);
    } catch (e) {
      onError?.(
        e instanceof Error ? e : new Error('Failed to process cropped images')
      );
    } finally {
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          processing: false,
        }))
      );
      setGlobalProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Выберите изображения для обрезки.
      </div>
    );
  }

  return (
    <ProcessingOverlay active={globalProcessing}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border border-primary rounded-md px-3 py-2 text-xs text-primary">
          <span>
            Пропорции:{' '}
            {bannerSizePresets
              ? `${bannerSizePresets.width}×${bannerSizePresets.height}`
              : aspect.replace(':', 'x')}
          </span>
        </div>

        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {items.map((item) => {
            const w = item.loaded?.width ?? 0;
            const h = item.loaded?.height ?? 0;
            const isSmall = w < 400 && h < 300;

            // Базовый класс: реальный масштаб, центрирование
            const baseImgClass =
              'max-h-full max-w-full h-auto w-auto object-contain';

            // Растянуть мелкие: вписать в рамку по высоте, но с сохранением пропорций
            const stretchedImgClass =
              'h-full w-auto max-w-full object-contain';

            const useStretched = item.stretchSmall && isSmall;

            return (
              <div
                key={item.id}
                className="border rounded-md p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground truncate max-w-[60%]">
                    {item.file.name}{' '}
                    <span className="text-[10px]">
                      ({formatBytesToHuman(item.file.size)}, {w}×{h})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Растянуть мелкие
                    </span>
                    <IconButton
                      aria-label="Переключить растяжение маленького изображения"
                      onClick={() => handleToggleStretch(item.id)}
                    >
                      <span
                        aria-hidden="true"
                        className={`block h-4 w-4 border rounded-sm ${
                          item.stretchSmall ? 'bg-primary' : 'bg-transparent'
                        }`}
                      />
                    </IconButton>
                  </div>
                </div>

                <div className="relative border rounded-md bg-black/5 overflow-hidden">
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      minHeight: 220,
                      maxHeight: 320,
                    }}
                  >
                    {item.loaded && (
                      <ReactImageCrop
                        crop={item.crop}
                        onChange={(c) => handleCropChange(item.id, c)}
                        aspect={numericAspect}
                        className="flex h-full w-full items-center justify-center"
                      >
                        {'naturalWidth' in item.loaded.image ? (
                          <img
                            src={
                              (item.loaded.image as HTMLImageElement).src ||
                              undefined
                            }
                            alt="Предпросмотр"
                            className={
                              useStretched ? stretchedImgClass : baseImgClass
                            }
                          />
                        ) : (
                          <BitmapAsImage
                            bitmap={item.loaded.image as ImageBitmap}
                            stretched={useStretched}
                          />
                        )}
                      </ReactImageCrop>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center self-end rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          onClick={handleProcessAll}
          disabled={globalProcessing}
        >
          {globalProcessing && (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          )}
          Готово
        </button>
      </div>
    </ProcessingOverlay>
  );
}

function BitmapAsImage({
  bitmap,
  stretched,
}: {
  bitmap: ImageBitmap;
  stretched: boolean;
}) {
  const [src, setSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(bitmap, 0, 0);

    const url = canvas.toDataURL();
    setSrc(url);
  }, [bitmap]);

  if (!src) return null;

  const cls = stretched
    ? 'h-full w-auto max-w-full object-contain'
    : 'max-h-full max-w-full h-auto w-auto object-contain';

  return <img src={src} alt="Предпросмотр" className={cls} />;
}
