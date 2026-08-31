'use client';

import * as React from 'react';
import type {
  AllowedExtensions,
  AspectRatio,
  OutputFormat,
  ProcessedImage,
  SizePx,
} from '../_lib/types';
import { DialogShell } from '../_ui/dialog-shell';
import {
  EditorItem,
  EditorState,
  canSubmit,
  hasAspectMismatch,
  hasBytesViolation,
  hasSizeMismatch,
} from './image-editor-state';
import { ImageEditorHeader } from './image-editor-header';
import { ImageEditorItem } from './image-editor-item';
import { loadImageFromSource, revokeLoadedImage } from '../_lib/image-load';
import { compressImageWithCanvas } from '../_lib/compress';
import { resizeImageToProcessed } from '../_lib/resize';
import { inferAspectRatio, sizeMatchesAspect } from '../_lib/aspect-utils';
import { detectOutputMimeFromFormat, extensionFromMime } from '../_lib/file-utils';
import { ImageCompare } from '../_image-compare/image-compare';

export type ImageEditorProps = {
  open: boolean;
  onOpenChange?: (next: boolean) => void;
  images: Array<Blob | File | string>;
  requiredFormat: OutputFormat;
  allowedExtensions?: AllowedExtensions;
  requiredAspect: AspectRatio;
  requiredSize: SizePx;
  maxBytes: number;
  minBytes: number;
  onSubmit: (images: ProcessedImage[]) => void;
  onError?: (error: Error) => void;
};

export function ImageEditor({
  open,
  onOpenChange,
  images,
  requiredFormat,
  allowedExtensions, // not used in this base version, SRP can be extended by parent
  requiredAspect,
  requiredSize,
  maxBytes,
  minBytes,
  onSubmit,
  onError,
}: ImageEditorProps) {
  const [state, setState] = React.useState<EditorState | null>(null);
  const [processingAll, setProcessingAll] = React.useState(false);
  const [processingMap, setProcessingMap] = React.useState<Record<string, boolean>>({});
  const [comparePair, setComparePair] = React.useState<{
    left: ProcessedImage;
    right: ProcessedImage;
  } | null>(null);
  const [compareOpen, setCompareOpen] = React.useState(false);

  // init
  React.useEffect(() => {
    if (!open || images.length === 0) {
      setState(null);
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        const items: EditorItem[] = [];
        const mime = detectOutputMimeFromFormat(requiredFormat);

        for (const src of images) {
          const loaded = await loadImageFromSource(src);
          if (cancelled) {
            revokeLoadedImage(loaded);
            return;
          }

          const aspect = inferAspectRatio(loaded.width, loaded.height);
          const aspectOk = aspect === requiredAspect;
          const sizeOk =
            loaded.width >= requiredSize.width &&
            loaded.height >= requiredSize.height;
          const bytesOk =
            loaded.bytes >= minBytes && loaded.bytes <= maxBytes;

          const dataUrl = await createDataUrlFromLoaded(loaded, mime);

          const file =
            src instanceof File
              ? new File([src], src.name, { type: mime })
              : new File([loaded.image as unknown as Blob], loaded.fileName ?? 'image', {
                  type: mime,
                });

          const processed: ProcessedImage = {
            file,
            dataUrl,
            width: loaded.width,
            height: loaded.height,
            bytes: loaded.bytes,
            mime: mime,
            aspect,
            sourceName: loaded.fileName,
          };

          const id = `${loaded.fileName ?? 'image'}-${loaded.bytes}-${loaded.width}x${
            loaded.height
          }`;

          items.push({
            id,
            current: { kind: 'original', image: processed },
            previous: undefined,
            aspectOk,
            sizeOk,
            bytesOk,
          });

          revokeLoadedImage(loaded);
        }

        const st: EditorState = {
          items,
          requiredAspect,
          requiredSize,
          requiredFormat,
          maxBytes,
          minBytes,
        };

        setState(st);
      } catch (e) {
        const err =
          e instanceof Error ? e : new Error('Failed to initialize ImageEditor');
        onError?.(err);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    images,
    requiredFormat,
    requiredAspect,
    requiredSize,
    maxBytes,
    minBytes,
    onError,
  ]);

  const setItemProcessing = (id: string, value: boolean) => {
    setProcessingMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleCompressOne = async (item: EditorItem) => {
    if (!state) return;
    try {
      setItemProcessing(item.id, true);

      const loaded = await loadImageFromSource(item.current.image.file);
      const processed = await compressImageWithCanvas(
        loaded.image,
        state.maxBytes,
        state.requiredFormat,
        item.current.image.sourceName ?? item.current.image.file.name
      );
      revokeLoadedImage(loaded);

      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((it) => {
            if (it.id !== item.id) return it;
            return {
              ...it,
              previous: it.current,
              current: { kind: 'compressed', image: processed },
              aspectOk: processed.aspect === prev.requiredAspect,
              sizeOk:
                processed.width >= prev.requiredSize.width &&
                processed.height >= prev.requiredSize.height,
              bytesOk:
                processed.bytes >= prev.minBytes &&
                processed.bytes <= prev.maxBytes,
            };
          }),
        };
      });

      // auto-open comparison
      setComparePair({
        left: item.current.image,
        right: processed,
      });
      setCompareOpen(true);
    } catch (e) {
      const err =
        e instanceof Error ? e : new Error('Failed to compress image in editor');
      onError?.(err);
    } finally {
      setItemProcessing(item.id, false);
    }
  };

  const handleCompareOne = (item: EditorItem) => {
    if (!item.previous) return;
    setComparePair({
      left: item.previous.image,
      right: item.current.image,
    });
    setCompareOpen(true);
  };

  const handleRemoveCurrent = (item: EditorItem) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((it) => it.id !== item.id),
      };
    });
  };

  const handleRemovePrevious = (item: EditorItem) => {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.id === item.id ? { ...it, previous: undefined } : it
        ),
      };
    });
  };

  const handleSave = () => {
    if (!state) return;
    const result = state.items.map((it) => it.current.image);
    onSubmit(result);
    onOpenChange?.(false);
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  if (!state || images.length === 0) return null;

  const differentAspects = hasAspectMismatch(state);
  const sizeMismatch = hasSizeMismatch(state);
  const bytesIssue = hasBytesViolation(state);

  const headerLockedAspect = true; // requiredAspect is fixed via props
  const headerLockedFormat = true; // requiredFormat is fixed via props

  return (
    <>
      <DialogShell
        open={open}
        onOpenChange={onOpenChange}
        title="Редактор изображений"
        footer={
          <div className="flex w-full justify-between">
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm"
              onClick={handleClose}
            >
              Закрыть
            </button>
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
              disabled={!canSubmit(state) || processingAll}
              onClick={handleSave}
            >
              {processingAll && (
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              )}
              Сохранить
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <ImageEditorHeader
            aspect={state.requiredAspect}
            size={state.requiredSize}
            format={state.requiredFormat}
            differentAspects={differentAspects}
            sizeMismatch={sizeMismatch}
            bytesIssue={bytesIssue}
            lockedAspect={headerLockedAspect}
            lockedFormat={headerLockedFormat}
            onAspectChange={undefined}
            onSizeChange={undefined}
          />

          <div className="mt-2 flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {state.items.map((item) => (
              <ImageEditorItem
                key={item.id}
                item={item}
                isProcessing={!!processingMap[item.id]}
                canCompare={!!item.previous}
                onCompress={() => handleCompressOne(item)}
                onCompare={() => handleCompareOne(item)}
                onRemoveCurrent={() => handleRemoveCurrent(item)}
                onRemovePrevious={() => handleRemovePrevious(item)}
              />
            ))}
            {state.items.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Все изображения удалены.
              </div>
            )}
          </div>
        </div>
      </DialogShell>

      {comparePair && (
        <ImageCompare
          open={compareOpen}
          onOpenChange={setCompareOpen}
          left={comparePair.left.dataUrl ?? comparePair.left.file}
          right={comparePair.right.dataUrl ?? comparePair.right.file}
          onError={onError}
        />
      )}
    </>
  );
}

async function createDataUrlFromLoaded(
  loaded: Awaited<ReturnType<typeof loadImageFromSource>>,
  mime: string
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = loaded.width;
  canvas.height = loaded.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get context in createDataUrlFromLoaded');
  ctx.drawImage(loaded.image, 0, 0);
  return canvas.toDataURL(mime);
}
