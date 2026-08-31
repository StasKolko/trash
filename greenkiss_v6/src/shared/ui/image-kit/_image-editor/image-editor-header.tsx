'use client';

import * as React from 'react';
import type { AspectRatio, OutputFormat, SizePx } from '../_lib/types';
import { FieldLabel } from '../_ui/field-label';
import { cn } from '@/shared/lib/css';

type ImageEditorHeaderProps = {
  aspect: AspectRatio;
  size: SizePx;
  format: OutputFormat;
  differentAspects: boolean;
  sizeMismatch: boolean;
  bytesIssue: boolean;
  lockedAspect: boolean;
  lockedFormat: boolean;
  onAspectChange?: (aspect: AspectRatio) => void;
  onSizeChange?: (size: SizePx) => void;
};

export function ImageEditorHeader({
  aspect,
  size,
  format,
  differentAspects,
  sizeMismatch,
  bytesIssue,
  lockedAspect,
  lockedFormat,
  onAspectChange,
  onSizeChange,
}: ImageEditorHeaderProps) {
  const [localWidth, setLocalWidth] = React.useState(size.width.toString());
  const [localHeight, setLocalHeight] = React.useState(size.height.toString());

  React.useEffect(() => {
    setLocalWidth(size.width.toString());
    setLocalHeight(size.height.toString());
  }, [size.width, size.height]);

  const handleWidthBlur = () => {
    const val = parseInt(localWidth, 10);
    if (Number.isNaN(val) || val <= 0) return;
    onSizeChange?.({ width: val, height: size.height });
  };

  const handleHeightBlur = () => {
    const val = parseInt(localHeight, 10);
    if (Number.isNaN(val) || val <= 0) return;
    onSizeChange?.({ width: size.width, height: val });
  };

  return (
    <div
      className={cn(
        'rounded-md border p-3 flex flex-col gap-3',
        (differentAspects || sizeMismatch || bytesIssue) && 'border-destructive'
      )}
    >
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex flex-col">
          <FieldLabel>Формат (пропорции)</FieldLabel>
          <span
            className={cn(
              'inline-flex items-center rounded-md border px-2 py-1',
              differentAspects && 'border-destructive text-destructive'
            )}
          >
            {aspect.replace(':', 'x')}
          </span>
          {differentAspects && !lockedAspect && (
            <p className="mt-1 max-w-xs text-[11px] text-destructive">
              У изображений разные пропорции. Выберите единый формат и выполните
              обрезку.
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <FieldLabel>Размер (px)</FieldLabel>
          <div className="flex items-center gap-1">
            <input
              type="number"
              className={cn(
                'h-8 w-20 rounded-md border bg-background px-2 text-xs',
                sizeMismatch && 'border-destructive text-destructive'
              )}
              value={localWidth}
              onChange={(e) => setLocalWidth(e.target.value)}
              onBlur={handleWidthBlur}
              aria-label="Ширина изображения"
            />
            <span className="text-xs text-muted-foreground">×</span>
            <input
              type="number"
              className={cn(
                'h-8 w-20 rounded-md border bg-background px-2 text-xs',
                sizeMismatch && 'border-destructive text-destructive'
              )}
              value={localHeight}
              onChange={(e) => setLocalHeight(e.target.value)}
              onBlur={handleHeightBlur}
              aria-label="Высота изображения"
            />
          </div>
          {sizeMismatch && (
            <p className="mt-1 max-w-xs text-[11px] text-destructive">
              Некоторые изображения меньше требуемого размера. Их можно только
              удалить или заменить.
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <FieldLabel>Расширение</FieldLabel>
          <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs">
            {format.toUpperCase()}
          </span>
        </div>

        {bytesIssue && (
          <p className="mt-1 text-[11px] text-destructive">
            Некоторые изображения выходят за пределы допустимого веса. Сожмите
            их или удалите.
          </p>
        )}
      </div>
    </div>
  );
}
