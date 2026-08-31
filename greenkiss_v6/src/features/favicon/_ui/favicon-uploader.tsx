"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/shared/ui/kit/button";
import { Input } from "@/shared/ui/kit/input";
import { Separator } from "@/shared/ui/kit/separator";
import { FaviconCropper } from "./favicon-cropper";
import { FaviconPreview } from "./favicon-preview";

type UploadResult = {
  id: string;
  name: string;
  sizes: Record<
    string,
    {
      url: string;
      width: number;
      height: number;
      bytes: number;
    }
  >;
};

export function FaviconUploader({
  onUploaded,
  canCancel = true,
}: {
  onUploaded?: (r: UploadResult) => void;
  canCancel?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [preview, setPreview] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const onPick = useCallback(
    (f: File | null) => {
      setError(null);
      setProgress(0);
      setPreview(null);
      if (!f) {
        setFile(null);
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
        return;
      }
      if (f.type !== "image/png") {
        setError("Только PNG");
        return;
      }
      const url = URL.createObjectURL(f);
      setFile(f);
      setImageUrl(url);
    },
    [imageUrl],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      onPick(f || null);
    },
    [onPick],
  );

  const reset = useCallback(() => {
    setFile(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setProgress(0);
    setError(null);
    setPreview(null);
  }, [imageUrl]);

  const onUpload = useCallback(
    async (croppedPng: Blob) => {
      setError(null);
      setProgress(10);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const b64 = await blobToBase64(croppedPng);
        setProgress(30);
        const res = await fetch("/api/favicon/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file?.name || "favicon.png",
            imageBase64: b64,
          }),
          signal: ac.signal,
        });
        setProgress(80);
        const json = (await res.json()) as
          | { success: true; data: UploadResult }
          | { success: false; error: string };
        if (!res.ok || !json?.success) {
          throw new Error(
            (json as { success: false; error: string })?.error ||
              "Upload failed",
          );
        }
        setProgress(100);
        setPreview(json.data);
        onUploaded?.(json.data);
      } catch (e: unknown) {
        const err = e as { name?: string; message?: string };
        if (err?.name === "AbortError") {
          setError("Загрузка отменена");
        } else {
          setError(err?.message || "Ошибка загрузки");
        }
      }
    },
    [file?.name, onUploaded],
  );

  const onCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const _canUpload = useMemo(() => !!file && !!imageUrl, [file, imageUrl]);

  return (
    <div className="space-y-4">
      <section
        aria-label="Зона загрузки файла (перетащите PNG сюда)"
        className="rounded-md border border-dashed p-6 text-center bg-card/50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Перетащите PNG (квадрат, до 512x512), или выберите файл
          </div>
          <div className="flex items-center justify-center gap-3">
            <Input
              accept="image/png"
              onChange={(e) => onPick(e.target.files?.[0] || null)}
              type="file"
            />
            <Button
              onClick={() =>
                document
                  .querySelector<HTMLInputElement>('input[type="file"]')
                  ?.click()
              }
              variant="outline"
            >
              Выбрать файл
            </Button>
            {canCancel && (
              <Button onClick={onCancel} variant="ghost">
                Отменить
              </Button>
            )}
          </div>
        </div>
      </section>

      {imageUrl && (
        <>
          <Separator />
          <FaviconCropper
            onCancel={reset}
            onConfirm={(blob) => onUpload(blob)}
            src={imageUrl}
          />
        </>
      )}

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-secondary h-2 rounded">
          <div
            className="bg-primary h-2 rounded"
            style={{ width: `${progress}%`, transition: "width .2s" }}
          />
        </div>
      )}

      {error && <div className="text-sm text-destructive">{error}</div>}

      {preview && (
        <>
          <Separator />
          <FaviconPreview sizes={preview.sizes} />
        </>
      )}
    </div>
  );
}

async function blobToBase64(b: Blob) {
  const buf = await b.arrayBuffer();
  const b64 = Buffer.from(buf).toString("base64");
  return `data:image/png;base64,${b64}`;
}
