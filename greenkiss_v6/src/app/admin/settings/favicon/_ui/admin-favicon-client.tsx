"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Separator } from "@/shared/ui/kit/separator";

type Item = {
  id: string;
  originalKey: string;
  originalMime: string;
  pngKey: string;
  pngBytes: number;
  sizePx: number;
  icoKey: string | null;
  isDeleted: boolean;
  createdAt: string | null;
};

export function AdminFaviconClient({
  initialItems,
  initialMaxBytes,
}: {
  initialItems: Item[];
  initialMaxBytes: number;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [maxBytes, setMaxBytes] = useState<number>(initialMaxBytes);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/admin/favicon", { cache: "no-store" });
    const data = await res.json();
    setItems(data.items);
    setMaxBytes(data.settings.faviconMaxBytes);
  };

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/favicon", { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Upload failed");
    } else {
      await res.json();
      setMessage("Загружено");
      await refresh();
    }
    setLoading(false);
  };

  const onActivate = async (id: string) => {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/admin/favicon/${id}/activate`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Activation failed");
    } else {
      setMessage("Активировано");
    }
    setLoading(false);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Удалить фавиконку?")) return;
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/admin/favicon/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Delete failed");
    } else {
      setMessage("Удалено");
      await refresh();
    }
    setLoading(false);
  };

  const onSaveLimit = async () => {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/admin/favicon/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faviconMaxBytes: maxBytes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Save failed");
    } else {
      const s = await res.json();
      setMaxBytes(s.faviconMaxBytes);
      setMessage("Лимит сохранён");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Фавиконка</h1>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            accept="image/*,.ico,.svg"
            onChange={(e) => onUpload(e.target.files?.[0] || null)}
            type="file"
          />
          <Button
            disabled={loading}
            onClick={() => refresh()}
            variant="outline"
          >
            Обновить список
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Изображение будет обрезано до квадрата, сжато и уменьшено до 96×96
          пикселей. Лимит размера PNG: {maxBytes} байт.
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <label className="text-sm font-medium" htmlFor="favicon-max-bytes">
          Лимит размера PNG (в байтах)
        </label>
        <div className="flex items-center gap-3">
          <Input
            className="w-48"
            id="favicon-max-bytes"
            max={65536}
            min={200}
            onChange={(e) => setMaxBytes(parseInt(e.target.value || "0", 10))}
            type="number"
            value={maxBytes}
          />
          <Button disabled={loading} onClick={onSaveLimit}>
            Сохранить
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it) => (
          <div className="border rounded-md p-4 space-y-3 bg-card" key={it.id}>
            <div className="flex items-center gap-4">
              {/* Превью грузим через CDN */}
              <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center overflow-hidden">
                <Image
                  alt="favicon"
                  height={48}
                  src={`${process.env.NEXT_PUBLIC_CDN_BASE_URL || ""}/${it.pngKey}`}
                  unoptimized
                  width={48}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <div>PNG: {it.pngBytes} байт</div>
                <div>
                  Размер: {it.sizePx}×{it.sizePx}
                </div>
                <div>ICO: {it.icoKey ? "да" : "нет"}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button disabled={loading} onClick={() => onActivate(it.id)}>
                Сделать активной
              </Button>
              <Button
                disabled={loading}
                onClick={() => onDelete(it.id)}
                variant="destructive"
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className="text-sm text-muted-foreground">{message}</div>
      )}
    </div>
  );
}
