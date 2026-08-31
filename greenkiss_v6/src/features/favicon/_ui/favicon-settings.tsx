"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Separator } from "@/shared/ui/kit/separator";

type Settings = {
  id: string;
  maxSizes: Record<string, { maxBytes: number }>;
  quality: number;
  updatedAt: string;
  updatedBy?: string | null;
};

export function FaviconSettings() {
  const [_settings, setSettings] = useState<Settings | null>(null);
  const [dirty, setDirty] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/favicon/settings", { method: "GET" });
      const json = await res.json();
      if (json?.success) {
        setSettings(json.data);
        setDirty(json.data);
      }
    })();
  }, []);

  const keys = useMemo(
    () => Object.keys(dirty?.maxSizes || {}),
    [dirty?.maxSizes],
  );

  const setMax = (k: string, v: number) => {
    if (!dirty) return;
    setDirty({
      ...dirty,
      maxSizes: { ...dirty.maxSizes, [k]: { maxBytes: v } },
    });
  };

  const save = async () => {
    if (!dirty) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/favicon/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maxSizes: dirty.maxSizes,
        quality: dirty.quality,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      setMsg(json?.error || "Ошибка сохранения");
    } else {
      setSettings(json.data);
      setDirty(json.data);
      setMsg("Сохранено");
    }
    setSaving(false);
  };

  if (!dirty)
    return (
      <div className="text-sm text-muted-foreground">Загрузка настроек...</div>
    );

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Максимальные размеры файлов задаются в байтах (шаг 256). Качество сжатия
        — 1..95.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keys.map((k) => (
          <div className="rounded-md border p-3 bg-card/60" key={k}>
            <div className="text-sm font-medium mb-2">{k}</div>
            <div className="flex items-center gap-2">
              <Input
                className="w-48"
                max={1_000_000}
                min={256}
                onChange={(e) => setMax(k, parseInt(e.target.value || "0", 10))}
                step={256}
                type="number"
                value={dirty.maxSizes[k].maxBytes}
              />
              <div className="text-xs text-muted-foreground">
                {(dirty.maxSizes[k].maxBytes / (1024 * 1024)).toFixed(3)} MB
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">Качество PNG</div>
        <Input
          className="w-24"
          max={95}
          min={1}
          onChange={(e) =>
            setDirty({ ...dirty, quality: parseInt(e.target.value || "0", 10) })
          }
          type="number"
          value={dirty.quality}
        />
      </div>

      <div className="flex gap-3">
        <Button disabled={saving} onClick={save}>
          Сохранить
        </Button>
        {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
      </div>
    </div>
  );
}
