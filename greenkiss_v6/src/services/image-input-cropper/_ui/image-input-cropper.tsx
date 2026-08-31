"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  compressToMaxBytes,
  encodeCanvasToBlob,
  extFromMime,
  getPixelCropCanvas,
  mimeSupported,
  resizeCanvas,
} from "../_lib/image-utils";

import styles from "../_styles/image-input-cropper.module.css";

export type OutputFormat = "image/webp" | "image/jpeg" | "image/png";

export type SmartImageInputProps = {
  accept?: string;
  defaultAspect?: number | "free";
  defaultOutputFormat?: OutputFormat;
  defaultTargetWidth?: number;
  defaultTargetHeight?: number;
  maxBytes?: number;
  onProcessed?: (
    file: File,
    meta: {
      width: number;
      height: number;
      mime: string;
      bytes: number;
      from: { width: number; height: number; mime?: string; bytes?: number };
      quality?: number;
    },
  ) => void;
  className?: string;
  style?: React.CSSProperties;
};

const ASPECTS = [
  { label: "Свободно", value: "free" as const },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
];

const FORMATS: { label: string; mime: OutputFormat }[] = [
  { label: "WebP", mime: "image/webp" },
  { label: "JPEG", mime: "image/jpeg" },
  { label: "PNG", mime: "image/png" },
];

const cn = (...tokens: Array<string | false | null | undefined>) =>
  tokens
    .filter(Boolean)
    .map((t) => {
      const key = String(t);
      return (styles as Record<string, string>)[key] ?? key;
    })
    .join(" ");

function SmartImageInput({
  accept = "image/*",
  defaultAspect = 1,
  defaultOutputFormat = "image/webp",
  defaultTargetWidth = 1024,
  defaultTargetHeight = 1024,
  maxBytes,
  onProcessed,
  className,
  style,
}: SmartImageInputProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  const [aspect, setAspect] = useState<number | "free">(defaultAspect);
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop>();
  const [outputFormat, setOutputFormat] =
    useState<OutputFormat>(defaultOutputFormat);
  const [targetW, setTargetW] = useState<number>(defaultTargetWidth);
  const [targetH, setTargetH] = useState<number>(defaultTargetHeight);
  const [lockTargetAspect, setLockTargetAspect] = useState<boolean>(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  const chooseFile = () => inputRef.current?.click();

  const onFiles = async (files: FileList | null) => {
    setError(null);
    if (!files || !files[0]) return;
    const f = files[0];
    if (!f.type.startsWith("image/")) {
      setError("Пожалуйста, выберите файл изображения.");
      return;
    }
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    const url = URL.createObjectURL(f);
    setFile(f);
    setImgUrl(url);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    onFiles(e.dataTransfer.files);
  };

  const initCropForAspect = useCallback(
    (mediaW: number, mediaH: number, asp: number | "free") => {
      if (asp === "free") {
        const full: Crop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };
        setCrop(full);
        setPixelCrop({ x: 0, y: 0, width: mediaW, height: mediaH, unit: "px" });
        return;
      }
      const base = makeAspectCrop(
        { unit: "%", width: 100, height: 100, x: 0, y: 0 },
        asp,
        mediaW,
        mediaH,
      );
      const c = centerCrop(base, mediaW, mediaH);
      setCrop(c);
    },
    [],
  );

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setImgEl(img);
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      initCropForAspect(img.naturalWidth, img.naturalHeight, aspect);
    },
    [aspect, initCropForAspect],
  );

  const onCropChange = (next: Crop) => setCrop(next);

  const onCropComplete = (c: PixelCrop) => {
    setPixelCrop(c);
    if (lockTargetAspect && aspect !== "free") {
      const asp =
        c.width > 0 && c.height > 0
          ? c.width / c.height
          : typeof aspect === "number"
            ? aspect
            : 1;
      if (asp && asp > 0) {
        if (targetW / targetH > asp) setTargetW(Math.round(targetH * asp));
        else setTargetH(Math.round(targetW / asp));
      }
    }
  };

  useEffect(() => {
    if (!natural) return;
    initCropForAspect(natural.w, natural.h, aspect);
  }, [aspect, natural, initCropForAspect]);

  const setAspectSafe = (val: number | "free") => setAspect(val);

  const adjustTargetWH = (w?: number, h?: number) => {
    if (w != null) {
      const nw = Math.max(1, Math.round(w));
      if (lockTargetAspect && aspect !== "free") {
        const asp =
          typeof aspect === "number"
            ? aspect
            : pixelCrop
              ? pixelCrop.width / pixelCrop.height
              : 1;
        setTargetW(nw);
        setTargetH(Math.max(1, Math.round(nw / asp)));
      } else setTargetW(nw);
    }
    if (h != null) {
      const nh = Math.max(1, Math.round(h));
      if (lockTargetAspect && aspect !== "free") {
        const asp =
          typeof aspect === "number"
            ? aspect
            : pixelCrop
              ? pixelCrop.width / pixelCrop.height
              : 1;
        setTargetH(nh);
        setTargetW(Math.max(1, Math.round(nh * asp)));
      } else setTargetH(nh);
    }
  };

  const process = useCallback(async () => {
    setError(null);
    if (!imgEl || !pixelCrop) {
      setError("Сначала выберите изображение и задайте область обрезки.");
      return;
    }
    setBusy(true);
    try {
      const cropCanvas = await getPixelCropCanvas(imgEl, pixelCrop);
      const resized = await resizeCanvas(cropCanvas, targetW, targetH);

      let targetMime: OutputFormat = outputFormat;
      if (!mimeSupported(targetMime)) targetMime = "image/jpeg";

      const encoded = await encodeCanvasToBlob(
        resized,
        targetMime,
        targetMime === "image/png" ? undefined : 0.92,
      );
      let finalBlob = encoded.blob;
      let finalQuality = encoded.quality;

      if (maxBytes && finalBlob.size > maxBytes) {
        if (targetMime === "image/png")
          targetMime = mimeSupported("image/webp")
            ? "image/webp"
            : "image/jpeg";
        const comp = await compressToMaxBytes(resized, targetMime, maxBytes, {
          minQuality: 0.4,
          maxQuality: 0.95,
          maxDownscaleSteps: 6,
          downscaleFactor: 0.85,
        });
        finalBlob = comp.blob;
        finalQuality = comp.quality;
      }

      const nameBase =
        file?.name?.split(".")?.slice(0, -1)?.join(".") || "image" || "image";
      const ext = extFromMime(targetMime);
      const outFile = new File([finalBlob], `${nameBase}.${ext}`, {
        type: targetMime,
      });

      onProcessed?.(outFile, {
        width: resized.width,
        height: resized.height,
        mime: targetMime,
        bytes: outFile.size,
        from: {
          width: imgEl.naturalWidth,
          height: imgEl.naturalHeight,
          mime: file?.type,
          bytes: file?.size,
        },
        quality: finalQuality,
      });
    } catch (e: unknown) {
      console.error(e);
      const message =
        e instanceof Error ? e.message : "Ошибка обработки изображения.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [
    imgEl,
    pixelCrop,
    targetW,
    targetH,
    outputFormat,
    maxBytes,
    file,
    onProcessed,
  ]);

  const hasImage = !!imgUrl;

  const DropTag: React.ElementType = hasImage ? "div" : "button";

  return (
    <div className={cn("smart-image-input", className)} style={style}>
      <DropTag
        className={cn("dropzone", dragOver && "over", hasImage && "has-image")}
        {...(!hasImage ? { type: "button" as const } : {})}
        aria-label="Загрузить изображение"
        onClick={() => {
          if (!hasImage) chooseFile();
        }}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(e: React.DragEvent) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDrop={onDrop}
      >
        {!hasImage && (
          <div className={cn("dropzone-content")}>
            <div className={cn("icon")}>🖼️</div>
            <div className={cn("title")}>Перетащите сюда изображение</div>
            <div className={cn("or")}>или</div>
            <button
              className={cn("btn")}
              onClick={(e) => {
                e.stopPropagation();
                chooseFile();
              }}
              type="button"
            >
              Выбрать файл
            </button>
            <div className={cn("hint")}>Поддержка: {accept}</div>
          </div>
        )}

        {hasImage && (
          <div className={cn("editor")}>
            <div className={cn("editor-left")}>
              <div className={cn("image-wrapper")}>
                <ReactCrop
                  aspect={aspect === "free" ? undefined : aspect}
                  crop={crop}
                  keepSelection
                  minHeight={20}
                  minWidth={20}
                  onChange={onCropChange}
                  onComplete={onCropComplete}
                  ruleOfThirds
                >
                  {/* biome-ignore lint/performance/noImgElement: react-image-crop требует <img> */}
                  {imgUrl ? (
                    <img
                      alt="source"
                      crossOrigin="anonymous"
                      onLoad={onImageLoad}
                      src={imgUrl}
                      style={{ maxHeight: 520, maxWidth: "100%" }}
                    />
                  ) : null}
                </ReactCrop>
              </div>
            </div>

            <div className={cn("editor-right")}>
              <fieldset className={cn("control")}>
                <legend className={cn("control-legend")}>Аспект</legend>
                <div className={cn("options")}>
                  {ASPECTS.map((a) => (
                    <button
                      className={cn("chip", aspect === a.value && "active")}
                      key={a.label}
                      onClick={() => setAspectSafe(a.value)}
                      type="button"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className={cn("control")}>
                <legend className={cn("control-legend")}>
                  Размер результата
                </legend>
                <div className={cn("size-row")}>
                  <div className={cn("size-item")}>
                    <label htmlFor="smart-img-width">Ширина</label>
                    <input
                      id="smart-img-width"
                      min={1}
                      onChange={(e) =>
                        adjustTargetWH(Number(e.target.value), undefined)
                      }
                      type="number"
                      value={targetW}
                    />
                  </div>
                  <div className={cn("size-item")}>
                    <label htmlFor="smart-img-height">Высота</label>
                    <input
                      id="smart-img-height"
                      min={1}
                      onChange={(e) =>
                        adjustTargetWH(undefined, Number(e.target.value))
                      }
                      type="number"
                      value={targetH}
                    />
                  </div>
                  <label className={cn("lock")}>
                    <input
                      checked={lockTargetAspect}
                      onChange={(e) => setLockTargetAspect(e.target.checked)}
                      type="checkbox"
                    />
                    Сохр. пропорции
                  </label>
                </div>
                <div className={cn("subhint")}>
                  Текущий кроп:{" "}
                  {pixelCrop?.width ? Math.round(pixelCrop.width) : "-"} ×{" "}
                  {pixelCrop?.height ? Math.round(pixelCrop.height) : "-"}
                </div>
              </fieldset>

              <fieldset className={cn("control")}>
                <legend className={cn("control-legend")}>Формат</legend>
                <div className={cn("options")}>
                  {FORMATS.map((f) => (
                    <button
                      className={cn(
                        "chip",
                        outputFormat === f.mime && "active",
                      )}
                      disabled={!mimeSupported(f.mime)}
                      key={f.mime}
                      onClick={() => setOutputFormat(f.mime)}
                      title={
                        !mimeSupported(f.mime)
                          ? "Формат кодирования не поддерживается этим браузером"
                          : ""
                      }
                      type="button"
                    >
                      {f.label}
                      {!mimeSupported(f.mime) ? " (недоступно)" : ""}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className={cn("control")}>
                <label htmlFor="max-bytes">Ограничение размера, байт</label>
                <input
                  disabled
                  id="max-bytes"
                  onChange={() => {}}
                  placeholder="например, 200000"
                  type="number"
                  value={maxBytes || ""}
                />
                <div className={cn("subhint")}>
                  Можно передать через проп maxBytes, и компонент ужмёт
                  результат до этого лимита.
                </div>
              </div>

              <div className={cn("actions")}>
                <button
                  className={cn("btn", "ghost")}
                  onClick={() => {
                    setFile(null);
                    setImgUrl(null);
                    setPixelCrop(undefined);
                  }}
                  type="button"
                >
                  Сбросить
                </button>
                <button
                  className={cn("btn", "primary")}
                  disabled={busy || !pixelCrop}
                  onClick={process}
                  type="button"
                >
                  {busy ? "Обработка…" : "Сохранить"}
                </button>
              </div>

              {error && <div className={cn("error")}>{error}</div>}
              {file && (
                <div className={cn("fileinfo")}>
                  Исходник: {file.name} · {(file.size / 1024).toFixed(1)} KB ·{" "}
                  {file.type || "image/*"}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          accept={accept}
          onChange={(e) => onFiles(e.currentTarget.files)}
          ref={inputRef}
          style={{ display: "none" }}
          type="file"
        />
      </DropTag>
    </div>
  );
}

export default SmartImageInput;
export { SmartImageInput };
