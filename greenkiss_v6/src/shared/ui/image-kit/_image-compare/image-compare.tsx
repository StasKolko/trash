'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/kit/dialog';
import { loadImageFromSource, revokeLoadedImage } from '../_lib/image-load';
import { inferAspectRatio } from '../_lib/aspect-utils';
import type { AspectRatio } from '../_lib/types';

export type ImageCompareProps = {
  open: boolean;
  onOpenChange?: (next: boolean) => void;
  left: Blob | File | string;
  right: Blob | File | string;
  onError?: (error: Error) => void;
};

type LoadedSide = {
  url: string;
  width: number;
  height: number;
  aspect?: AspectRatio;
};

export function ImageCompare({
  open,
  onOpenChange,
  left,
  right,
  onError,
}: ImageCompareProps) {
  const [leftImg, setLeftImg] = React.useState<LoadedSide | null>(null);
  const [rightImg, setRightImg] = React.useState<LoadedSide | null>(null);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [position, setPosition] = React.useState(0.5);

  React.useEffect(() => {
    let cancelled = false;

    async function loadBoth() {
      try {
        const [l, r] = await Promise.all([
          loadImageFromSource(left),
          loadImageFromSource(right),
        ]);

        if (cancelled) {
          revokeLoadedImage(l);
          revokeLoadedImage(r);
          return;
        }

        const lAspect = inferAspectRatio(l.width, l.height);
        const rAspect = inferAspectRatio(r.width, r.height);

        const lUrl = l.objectUrl ?? createObjectURLSafe(l.image);
        const rUrl = r.objectUrl ?? createObjectURLSafe(r.image);

        setLeftImg({
          url: lUrl,
          width: l.width,
          height: l.height,
          aspect: lAspect,
        });
        setRightImg({
          url: rUrl,
          width: r.width,
          height: r.height,
          aspect: rAspect,
        });

        // keep aspects consistent
        if (lAspect && rAspect && lAspect !== rAspect) {
          const msg = `Формат левой: ${lAspect}, правой: ${rAspect}. Форматы должны совпадать.`;
          setErrorText(msg);
        } else {
          setErrorText(null);
        }

        // We can revoke initial loaded images now
        revokeLoadedImage(l);
        revokeLoadedImage(r);
      } catch (e) {
        const err =
          e instanceof Error ? e : new Error('Failed to load images for comparison');
        onError?.(err);
        setErrorText('Ошибка загрузки изображений для сравнения.');
      }
    }

    if (open) {
      loadBoth();
    }

    return () => {
      cancelled = true;
      if (leftImg?.url) URL.revokeObjectURL(leftImg.url);
      if (rightImg?.url) URL.revokeObjectURL(rightImg.url);
      setLeftImg(null);
      setRightImg(null);
      setErrorText(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, left, right]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    const updatePos = (clientX: number) => {
      const rel = (clientX - rect.left) / rect.width;
      setPosition(Math.min(1, Math.max(0, rel)));
    };

    updatePos(e.clientX);

    const move = (event: PointerEvent) => {
      updatePos(event.clientX);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  const maxWidth =
    leftImg && rightImg ? Math.min(leftImg.width, rightImg.width) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1024px] w-[90vw] p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-sm font-medium">
            Сравнение двух изображений
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 px-0 pb-3">
          {errorText && (
            <div className="mx-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorText}
            </div>
          )}

          <div className="relative mx-0 overflow-hidden">
            <div
              className="relative mx-auto bg-black flex items-center justify-center"
              style={{
                maxWidth: maxWidth ?? '100%',
              }}
            >
              {leftImg && rightImg && (
                <div
                  className="relative w-full"
                  style={{
                    aspectRatio:
                      leftImg.height > 0
                        ? `${leftImg.width} / ${leftImg.height}`
                        : undefined,
                  }}
                  onPointerDown={handlePointerDown}
                >
                  <img
                    src={rightImg.url}
                    alt="После"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden"
                    style={{ width: `${position * 100}%` }}
                  >
                    <img
                      src={leftImg.url}
                      alt="До"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  {/* handle */}
                  <div
                    className="absolute inset-y-0 flex items-center justify-center"
                    style={{ left: `${position * 100}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="h-full w-px bg-white/70" />
                    <div className="absolute flex items-center justify-center rounded-full bg-white shadow-md h-6 w-6">
                      <div
                        aria-hidden="true"
                        className="flex items-center justify-between w-4 text-[10px] text-muted-foreground"
                      >
                        <span>&lt;</span>
                        <span>&gt;</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {!leftImg || !rightImg ? (
                <div className="flex h-64 w-full items-center justify-center text-xs text-muted-foreground">
                  Загрузка изображений…
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end px-4">
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm"
              onClick={handleClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function createObjectURLSafe(image: HTMLImageElement | ImageBitmap): string {
  // Fallback if image-load did not provide objectUrl (very rare)
  const canvas = document.createElement('canvas');
  canvas.width = 'naturalWidth' in image ? image.naturalWidth || image.width : image.width;
  canvas.height = 'naturalHeight' in image
    ? image.naturalHeight || image.height
    : image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context in createObjectURLSafe');
  ctx.drawImage(image, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  const byteString = atob(dataUrl.split(',')[1] ?? '');
  const mimeString = dataUrl.split(',')[0]?.split(':')[1]?.split(';')[0] ?? 'image/png';
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  return URL.createObjectURL(blob);
}
