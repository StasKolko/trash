"use client";

import { useImageEditorContext } from "../model/context";
import { useImageEditorStore } from "../model/store";
import { ImageListItem } from "./image-list-item";

export function ImageList() {
  const items = useImageEditorStore((state) =>
    [...state.items].sort((a, b) => a.order - b.order),
  );
  const { minSize } = useImageEditorContext();

  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Изображения не выбраны. Добавьте изображения через форму выше.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <ImageListItemWrapper
          key={item.id}
          itemId={item.id}
          index={index}
          total={items.length}
          minSize={minSize}
        />
      ))}
    </div>
  );
}

type ItemWrapperProps = {
  itemId: string;
  index: number;
  total: number;
  minSize: number;
};

// Обертка, чтобы пробросить условие видимости кнопки "Сжать"
function ImageListItemWrapper({
  itemId,
  index,
  total,
  minSize,
}: ItemWrapperProps) {
  const item = useImageEditorStore((state) =>
    state.items.find((i) => i.id === itemId),
  );

  if (!item) return null;

  const canCompress = item.file.size > minSize;

  return (
    <div className="relative">
      {/* Можно также просто прокинуть флаг в сам Item */}
      <ImageListItem item={item} index={index} total={total} />
      {!canCompress && (
        <div className="mt-1 text-xs text-muted-foreground">
          Сжатие недоступно: файл уже меньше минимального размера.
        </div>
      )}
    </div>
  );
}
