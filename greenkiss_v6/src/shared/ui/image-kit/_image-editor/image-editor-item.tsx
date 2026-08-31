'use client';

import * as React from 'react';
import type { EditorItem } from './image-editor-state';
import { formatBytesToHuman } from '../_lib/file-utils';
import { FieldLabel } from '../_ui/field-label';
import { ProcessingOverlay } from '../_ui/processing-overlay';

type ImageEditorItemProps = {
  item: EditorItem;
  isProcessing: boolean;
  canCompare: boolean;
  onRemoveCurrent: () => void;
  onRemovePrevious: () => void;
  onCompress: () => void;
  onCompare: () => void;
};

export function ImageEditorItem({
  item,
  isProcessing,
  canCompare,
  onRemoveCurrent,
  onRemovePrevious,
  onCompress,
  onCompare,
}: ImageEditorItemProps) {
  const imgUrl = React.useMemo(
    () => item.current.image.dataUrl ?? URL.createObjectURL(item.current.image.file),
    [item.current.image]
  );

  React.useEffect(() => {
    if (!item.current.image.dataUrl) {
      return () => {
        URL.revokeObjectURL(imgUrl);
      };
    }
    return undefined;
  }, [imgUrl, item.current.image.dataUrl]);

  const bytesLabel = formatBytesToHuman(item.current.image.bytes);

  const showWarning = !item.aspectOk || !item.sizeOk || !item.bytesOk;

  return (
    <div className="rounded-md border p-3 flex flex-col gap-3">
      <div className="flex justify-between gap-3">
        <div className="flex flex-col">
          <FieldLabel>Текущее изображение</FieldLabel>
          <div className="text-xs">
            {item.current.image.sourceName ?? item.current.image.file.name}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {item.current.image.width}×{item.current.image.height},{' '}
            {bytesLabel}
          </div>
          {showWarning && (
            <div className="mt-1 text-[11px] text-destructive">
              {!item.aspectOk && 'Неверный формат пропорций. '}
              {!item.sizeOk && 'Неверный размер. '}
              {!item.bytesOk && 'Выходит за пределы допустимого веса. '}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border px-2 py-1 text-xs"
              onClick={onCompress}
              disabled={isProcessing}
            >
              {isProcessing && (
                <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              )}
              Сжать
            </button>
            <button
              type="button"
              className="rounded-md border px-2 py-1 text-xs"
              onClick={onCompare}
              disabled={!canCompare || isProcessing}
            >
              Сравнить
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border px-2 py-1 text-[11px]"
              onClick={onRemoveCurrent}
              disabled={isProcessing}
            >
              Удалить текущее
            </button>
            {item.previous && (
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-[11px]"
                onClick={onRemovePrevious}
                disabled={isProcessing}
              >
                Удалить предыдущую версию
              </button>
            )}
          </div>
        </div>
      </div>

      <ProcessingOverlay active={isProcessing}>
        <div className="mt-2 flex justify-center">
          <div className="relative max-h-64 max-w-full overflow-hidden rounded border bg-black/5 flex items-center justify-center">
            <img
              src={imgUrl}
              alt="Предпросмотр"
              className="max-h-64 w-auto object-contain"
            />
          </div>
        </div>
      </ProcessingOverlay>
    </div>
  );
}
