"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CompassIcon as CompressIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { ImageProcessingOverlay } from "@/shared/ui/image-kit/_ui/image-processing-overlay";
import { Button } from "@/shared/ui/kit/button";
import { useImageEditorStore } from "../model/store";
import type { EditableImage } from "../model/types";

type Props = {
  item: EditableImage;
  index: number;
  total: number;
};

export function ImageListItem({ item, index, total }: Props) {
  const {
    moveItemUp,
    moveItemDown,
    removeItem,
    startCompression,
    isCompressing,
  } = useImageEditorStore((state) => ({
    moveItemUp: state.moveItemUp,
    moveItemDown: state.moveItemDown,
    removeItem: state.removeItem,
    startCompression: state.startCompression,
    isCompressing: state.isCompressing,
  }));

  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  const objectUrl = useMemo(() => URL.createObjectURL(item.file), [item.file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const handleCompress = () => {
    if (isCompressing) return;
    void startCompression(item.id);
  };

  const handleRemove = () => {
    if (isCompressing) return;
    removeItem(item.id);
  };

  return (
    <div className="relative flex items-center gap-3 rounded-md border p-2">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
        <Image
          src={objectUrl}
          alt="Превью"
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 items-center justify-between gap-2">
        <div className="break-all text-xs text-muted-foreground">
          <div>{item.file.name}</div>
          <div>{item.file.size} байт</div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => moveItemUp(item.id)}
            disabled={!canMoveUp || isCompressing}
            aria-label="Переместить вверх"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => moveItemDown(item.id)}
            disabled={!canMoveDown || isCompressing}
            aria-label="Переместить вниз"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleCompress}
            disabled={isCompressing}
            aria-label="Сжать"
          >
            <CompressIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={handleRemove}
            disabled={isCompressing}
            aria-label="Удалить"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* По ошибке видно, что у ImageProcessingOverlay есть проп text, а не active */}
      {isCompressing && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/60">
          <ImageProcessingOverlay text="Идёт обработка..." />
        </div>
      )}
    </div>
  );
}
