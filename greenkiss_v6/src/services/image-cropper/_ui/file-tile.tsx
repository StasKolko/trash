"use client";

import type React from "react";

interface FileTileProps {
  url: string;
  name: string;
  info?: string;
  errors?: string[];
  onEdit?: () => void;
  onRemove?: () => void;
  labels?: { edit?: string; remove?: string };
}

export const FileTile: React.FC<FileTileProps> = ({
  url,
  name,
  info,
  errors = [],
  onEdit,
  onRemove,
  labels,
}) => {
  const hasErrors = errors.length > 0;

  return (
    <div className="group relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="aspect-square w-full bg-muted/30 overflow-hidden">
        <img alt={name} className="h-full w-full object-cover" src={url} />
      </div>
      <div className="p-2">
        <div className="text-sm font-medium truncate" title={name}>
          {name}
        </div>
        {info && (
          <div className="text-xs text-muted-foreground mt-1">{info}</div>
        )}
        {hasErrors && (
          <ul className="mt-2 space-y-1">
            {errors.map((e, i) => (
              <li className="text-xs text-red-600" key={i}>
                {e}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-2 py-1 text-xs hover:opacity-90"
            onClick={onEdit}
            type="button"
          >
            {labels?.edit ?? "Обрезать"}
          </button>
        )}
        {onRemove && (
          <button
            className="inline-flex items-center rounded-md bg-destructive text-destructive-foreground px-2 py-1 text-xs hover:opacity-90"
            onClick={onRemove}
            type="button"
          >
            {labels?.remove ?? "Удалить"}
          </button>
        )}
      </div>
    </div>
  );
};
