"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseAspect } from "../_lib/aspect";
import { formatKB } from "../_lib/bytes";
import {
  canvasToBlob,
  compressToMaxBytes,
  drawCroppedToCanvas,
  ensureOutputFormat,
  makeFileFromBlob,
  mimeFromOutputExt,
} from "../_lib/canvas";
import {
  buildAcceptAttr,
  getFileExtension,
  loadImage,
  readFileAsDataURL,
} from "../_lib/file-utils";
import { normalizeExt } from "../_lib/mime";
import {
  assertTargetResolutionMatchesAspect,
  validateDimensions,
  validateExtension,
  validateMinSize,
} from "../_lib/validators";
import type {
  ImageCropperProps,
  ImageError,
  OutputFormat,
  ProcessedImage,
} from "../_types";
import { CropModal } from "./crop-modal";
import { FileTile } from "./file-tile";

type LocalFile = {
  id: string;
  file: File;
  src: string;
  image?: HTMLImageElement;
  width?: number;
  height?: number;
  errors: string[];
  valid: boolean;
  processed?: ProcessedImage;
};

const defaultLabels = {
  pickFiles: "Выбрать файлы",
  orDropHere: "или перетащите сюда",
  cropTitle: "Кадрирование",
  cancel: "Отмена",
  apply: "Применить",
  remove: "Удалить",
  edit: "Обрезать",
  done: "Готово",
  compressing: "Сжатие...",
  maxBytesInfo: (kb: string) => `Сжимаем до ≤ ${kb} КБ`,
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const ImageCropper: React.FC<ImageCropperProps> = ({
  allowedExtensions = ["webp", "png", "jpg", "jpeg"],
  maxCount = 1,
  targetExtension = null,
  aspect = "1:1",
  targetResolution = null,
  minWidth = null,
  minHeight = null,
  minBytes = null,
  maxBytes = null,
  onChange,
  onError,
  className,
  labels,
}) => {
  const L = { ...defaultLabels, ...(labels ?? {}) };

  // Проверка соответствия целевого разрешения аспекту (в dev — кидаем ошибку, как просили)
  useMemo(() => {
    assertTargetResolutionMatchesAspect(targetResolution ?? null, aspect);
  }, [aspect, targetResolution]);

  const [files, setFiles] = useState<LocalFile[]>([]);
  const [cropOpen, setCropOpen] = useState(false);
  const [croppingId, setCroppingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dndRef = useRef<HTMLDivElement | null>(null);
  const aspectValue = useMemo(() => parseAspect(aspect), [aspect]);

  const acceptAttr = useMemo(
    () => buildAcceptAttr(allowedExtensions),
    [allowedExtensions],
  );

  const reportErrors = useCallback(
    (errs: ImageError[]) => {
      if (onError && errs.length) onError(errs);
    },
    [onError],
  );

  const openCropFor = (id: string) => {
    setCroppingId(id);
    setCropOpen(true);
  };

  const closeCrop = () => {
    setCropOpen(false);
    setCroppingId(null);
  };

  const removeById = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((p) => p.id === id);
      if (f?.processed?.url) {
        URL.revokeObjectURL(f.processed.url);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const readAndValidate = useCallback(
    async (file: File): Promise<LocalFile> => {
      const id = uid();
      const src = await readFileAsDataURL(file).catch(() => "");
      if (!src) {
        const lf: LocalFile = {
          id,
          file,
          src,
          errors: ["Не удалось прочитать файл"],
          valid: false,
        };
        reportErrors([
          {
            code: "LOAD_FAILED",
            message: "Не удалось прочитать файл",
            fileName: file.name,
          },
        ]);
        return lf;
      }

      const errs: string[] = [];
      const extErr = validateExtension(file.name, allowedExtensions);
      if (extErr) errs.push(extErr.message);

      const minSizeErr = validateMinSize(
        file.size,
        minBytes ?? null,
        file.name,
      );
      if (minSizeErr) errs.push(minSizeErr.message);

      let img: HTMLImageElement | undefined;
      let width: number | undefined;
      let height: number | undefined;

      try {
        img = await loadImage(src);
        width = img.naturalWidth;
        height = img.naturalHeight;

        const dimErrs = validateDimensions(
          width,
          height,
          minWidth ?? null,
          minHeight ?? null,
          file.name,
        );
        if (dimErrs.length) errs.push(...dimErrs.map((e) => e.message));
      } catch {
        errs.push("Не удалось загрузить изображение");
        reportErrors([
          {
            code: "LOAD_FAILED",
            message: "Не удалось загрузить изображение",
            fileName: file.name,
          },
        ]);
      }

      const lf: LocalFile = {
        id,
        file,
        src,
        image: img,
        width,
        height,
        errors: errs,
        valid: errs.length === 0,
      };
      return lf;
    },
    [allowedExtensions, minBytes, minWidth, minHeight, reportErrors],
  );

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      let selected = Array.from(fileList);
      if (maxCount > 0) {
        const spaceLeft = Math.max(0, maxCount - files.length);
        if (selected.length > spaceLeft) {
          selected = selected.slice(0, spaceLeft);
          reportErrors([
            {
              code: "TOO_MANY_FILES",
              message: `Превышен лимит файлов. Максимум: ${maxCount}.`,
            },
          ]);
        }
      }

      const prepared = await Promise.all(
        selected.map((f) => readAndValidate(f)),
      );
      const newFiles = [...files, ...prepared];
      setFiles(newFiles);

      // Автоматически открыть кроп для первого валидного без processed
      const firstToCrop = prepared.find((f) => f.valid && !f.processed);
      if (firstToCrop) {
        openCropFor(firstToCrop.id);
      }
    },
    [files, maxCount, readAndValidate, reportErrors],
  );

  // DnD
  useEffect(() => {
    const el = dndRef.current;
    if (!el) return;
    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = (e: DragEvent) => {
      prevent(e);
      const dt = e.dataTransfer;
      if (!dt) return;
      addFiles(dt.files);
    };
    el.addEventListener("dragover", prevent);
    el.addEventListener("dragenter", prevent);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", prevent);
      el.removeEventListener("dragenter", prevent);
      el.removeEventListener("drop", onDrop);
    };
  }, [addFiles]);

  // При изменении processed — шлём наружу
  useEffect(() => {
    const processed: ProcessedImage[] = files
      .map((f) => f.processed)
      .filter((p): p is ProcessedImage => Boolean(p));
    onChange?.(processed);
  }, [files, onChange]);

  const startCrop = (id: string) => openCropFor(id);

  const applyCrop = async (
    cropData: { x: number; y: number; width: number; height: number },
    imageEl: HTMLImageElement,
  ) => {
    if (!croppingId) return;

    const lf = files.find((f) => f.id === croppingId);
    if (!lf || !lf.image) {
      closeCrop();
      return;
    }

    try {
      // Рисуем кроп
      const targetExt: OutputFormat = ensureOutputFormat(
        targetExtension ?? null,
        getFileExtension(lf.file.name),
      );
      const mime = mimeFromOutputExt(targetExt);

      const canvas = drawCroppedToCanvas(
        imageEl,
        {
          x: cropData.x,
          y: cropData.y,
          width: cropData.width,
          height: cropData.height,
        },
        targetResolution?.width,
        targetResolution?.height,
      );

      // Если задан maxBytes — сначала пробуем сжатие, иначе обычный toBlob
      let blob: Blob;
      let outW = canvas.width;
      let outH = canvas.height;

      if (maxBytes != null) {
        const res = await compressToMaxBytes({
          canvas,
          mime,
          maxBytes,
          startQuality: 0.92,
        });
        blob = res.blob;
        outW = res.width;
        outH = res.height;
      } else {
        const q =
          mime === "image/webp" || mime === "image/jpeg" ? 0.92 : undefined;
        blob = await canvasToBlob(canvas, mime, q);
      }

      // Собираем File
      const originalNameNoExt = lf.file.name.replace(/\.[^.]+$/, "");
      const fileName = `${originalNameNoExt}.${targetExt === "jpeg" ? "jpg" : targetExt}`;
      const outFile = makeFileFromBlob(blob, fileName);
      const url = URL.createObjectURL(blob);

      const processed: ProcessedImage = {
        id: lf.id,
        file: outFile,
        blob,
        url,
        width: Math.round(outW / (window.devicePixelRatio || 1)),
        height: Math.round(outH / (window.devicePixelRatio || 1)),
        size: blob.size,
        mime: mime,
        originalFileName: lf.file.name,
        ext: normalizeExt(targetExt),
      };

      setFiles((prev) =>
        prev.map((f) => (f.id === lf.id ? { ...f, processed } : f)),
      );
    } catch (e) {
      console.error(e);
      reportErrors([
        {
          code: "LOAD_FAILED",
          message: "Не удалось обработать изображение",
          fileName: lf?.file.name,
        },
      ]);
    } finally {
      closeCrop();
    }
  };

  const infoForTile = (f: LocalFile): string | undefined => {
    const sizeKB = formatKB(f.file.size);
    if (maxBytes != null) {
      const maxKB = formatKB(maxBytes);
      return `${sizeKB} КБ • ${f.width ?? "-"}×${f.height ?? "-"} • ${L.maxBytesInfo(maxKB)}`;
    }
    return `${sizeKB} КБ • ${f.width ?? "-"}×${f.height ?? "-"}`;
  };

  const processedAllValid =
    files.length > 0 && files.every((f) => !f.valid || !!f.processed);

  return (
    <div className={className}>
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center hover:bg-muted/30 transition"
        ref={dndRef}
      >
        <div className="text-sm">
          <button
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {L.pickFiles}
          </button>
          <span className="ml-2 text-muted-foreground">{L.orDropHere}</span>
        </div>
        <input
          accept={acceptAttr}
          className="hidden"
          multiple={maxCount > 1}
          onChange={(e) => addFiles(e.currentTarget.files)}
          ref={inputRef}
          type="file"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((f) => (
            <FileTile
              errors={f.errors}
              info={
                f.processed
                  ? `${formatKB(f.processed.size)} КБ • ${f.processed.width}×${f.processed.height}`
                  : infoForTile(f)
              }
              key={f.id}
              labels={{ edit: L.edit, remove: L.remove }}
              name={f.processed?.file.name ?? f.file.name}
              onEdit={f.valid ? () => startCrop(f.id) : undefined}
              onRemove={() => removeById(f.id)}
              url={f.processed?.url ?? f.src}
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
          onClick={() => setFiles([])}
          type="button"
        >
          Очистить
        </button>
        <button
          className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 disabled:opacity-50"
          disabled={!processedAllValid || files.length === 0}
          onClick={() => {
            // Дополнительно уведомим onChange (уже отрабатывает в useEffect)
            // Можно показать тост или закрыть модалку, здесь просто no-op.
          }}
          type="button"
        >
          {L.done}
        </button>
      </div>

      {/* Модалка кропа */}
      {croppingId && (
        <CropModal
          aspect={aspect}
          labels={{ cropTitle: L.cropTitle, cancel: L.cancel, apply: L.apply }}
          onApply={(res, img) => applyCrop(res.crop, img)}
          onCancel={closeCrop}
          open={cropOpen}
          src={files.find((f) => f.id === croppingId)?.src ?? ""}
        />
      )}
    </div>
  );
};
