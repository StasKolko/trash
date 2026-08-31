"use client";

import type React from "react";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";

import type { ImagePayload } from "../_lib/types";

type Props = {
  item: ImagePayload;
  disabled?: boolean;
  invalid?: boolean;
  onDelete: () => void;
  onCompress: () => void;
  onCompare?: () => void; // активна если есть предыдущая версия
  metaBefore?: {
    size: number;
    width: number;
    height: number;
    mime: string;
  } | null;
};

export const ImageCard: React.FC<Props> = ({
  item,
  disabled,
  invalid,
  onDelete,
  onCompress,
  onCompare,
  metaBefore,
}) => {
  return (
    <div
      className={`rounded-md border p-3 flex gap-3 ${invalid ? "border-destructive" : ""}`}
    >
      <div className="w-32 h-32 overflow-hidden rounded">
        <img
          alt={item.meta.name ?? item.id}
          className="object-cover w-full h-full"
          src={item.url}
        />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{item.meta.name ?? item.id}</div>
        <div className="text-xs text-muted-foreground">
          {item.meta.width}×{item.meta.height} •{" "}
          {(item.meta.size / 1024).toFixed(1)}KB • {item.meta.mime}
        </div>
        {invalid && (
          <div className="text-xs text-destructive mt-1">
            Не соответствует требованиям
          </div>
        )}
        {metaBefore && (
          <div className="mt-1">
            <Badge variant="outline">
              Было: {metaBefore.width}×{metaBefore.height} •{" "}
              {(metaBefore.size / 1024).toFixed(1)}KB
            </Badge>
          </div>
        )}
        <div className="mt-2 flex gap-2">
          <Button
            disabled={disabled}
            onClick={onDelete}
            size="sm"
            variant="destructive"
          >
            Удалить
          </Button>
          <Button
            disabled={disabled}
            onClick={onCompress}
            size="sm"
            variant="secondary"
          >
            Сжать
          </Button>
          {onCompare && (
            <Button disabled={disabled} onClick={onCompare} size="sm">
              Сравнить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
