src\shared\ui\image-kit\index.ts

```
export { ImageInput } from "./_image-input/image-input";

```

src\shared\ui\image-kit\_hooks\use-object-urls.ts

```
"use client";

import { useEffect, useState } from "react";

export function useObjectUrls(files: File[]) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!files.length) {
      setUrls([]);
      return;
    }

    const nextUrls = files.map((file) => URL.createObjectURL(file));
    setUrls(nextUrls);

    return () => {
      for (const url of nextUrls) URL.revokeObjectURL(url);
    };
  }, [files]);

  return urls;
}

```

src\shared\ui\image-kit\_image-input\image-input-dialog.tsx

```
import type { ReactNode } from "react";
import { AlertDialog, AlertDialogContent } from "@/shared/ui/kit/alert-dialog";

export const ImageInputDialog = ({
  trigger,
  children,
  open,
  setOpen,
}: {
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      {trigger}
      <AlertDialogContent className="max-w-[calc(100%-1rem)] w-screen md:max-w-5xl p-0 gap-0">
        {children}
      </AlertDialogContent>
    </AlertDialog>
  );
};

```

src\shared\ui\image-kit\_image-input\image-input-footer.tsx

```
import { AlertDialogFooter } from "@/shared/ui/kit/alert-dialog";
import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

export const ImageInputFooter = ({
  isProcessing,
  onCancel,
  onConfirm,
}: {
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  return (
    <AlertDialogFooter className="w-full border-t">
      <div className="max-w-md grid grid-cols-[1fr_1fr] place-items-center gap-x-10 mx-auto py-3">
        <Button
          className="w-full"
          disabled={isProcessing}
          onClick={onCancel}
          type="button"
          variant="destructive"
        >
          {isProcessing && <Spinner />}
          Отмена
        </Button>
        <Button
          className="w-full"
          disabled={isProcessing}
          onClick={onConfirm}
          type="button"
          variant="default"
        >
          {isProcessing && <Spinner />}
          Готово
        </Button>
      </div>
    </AlertDialogFooter>
  );
};

```

src\shared\ui\image-kit\_image-input\image-input-header.tsx

```
import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { ModeToggle } from "../../theme";

export const ImageInputHeader = ({
  aspectRatio: { width, height },
}: {
  aspectRatio: {
    width: number;
    height: number;
  };
}) => {
  const ASPECT_PREVIEW_MAX_SIZE = 96;
  const maxSide = Math.max(width, height);
  const scale = ASPECT_PREVIEW_MAX_SIZE / maxSide;

  const displayWidth = width * scale;
  const displayHeight = height * scale;

  return (
    <AlertDialogHeader className="max-w-3xl grid grid-cols-[auto_1fr] place-items-center gap-x-4 mx-auto p-3">
      <ModeToggle className="absolute -right-px -top-px z-50 border rounded-tl-none rounded-br-none" />
      <div>
        <AlertDialogTitle className="text-center md:text-2xl">
          Загрузка изображений
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center md:text-lg mt-2">
          Выберите область изображения для обрезки под нужные пропорции.
        </AlertDialogDescription>
      </div>

      <div>
        <div
          className="flex items-center justify-center rounded-md border border-primary text-sm font-bold text-primary"
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
        >
          <span>
            {width}x{height}
          </span>
        </div>
      </div>
    </AlertDialogHeader>
  );
};

```

src\shared\ui\image-kit\_image-input\image-input-sections\image-file-name.tsx

```
export const ImageFileName = ({ name }: { name: string }) => (
  <div className="relative py-2 my-3">
    <span className="text-md font-medium pl-5">{name}</span>
    <span
      aria-hidden="true"
      className="absolute top-0 left-2 h-full w-1 bg-primary rounded-md"
    />
  </div>
);

```

src\shared\ui\image-kit\_image-input\image-input-sections\image-preview-frame.tsx

```
import type { ReactNode } from "react";

export const ImagePreviewFrame = ({ children }: { children: ReactNode }) => (
  <div
    className="
      relative w-full aspect-square overflow-hidden rounded-md border
      flex items-center justify-center
    "
    style={{
      backgroundImage: `
        linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5),
        linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5)
      `,
      backgroundSize: "16px 16px",
      backgroundPosition: "0 0, 8px 8px",
      backgroundColor: "#ffffff",
    }}
  >
    {children}
  </div>
);

```

src\shared\ui\image-kit\_image-input\image-input-sections\index.tsx

```
"use client";

import { useState } from "react";
import ReactCrop, {
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
} from "react-image-crop";

import { Separator } from "@/shared/ui/kit/separator";
import { useObjectUrls } from "../../_hooks/use-object-urls";
import { ImageProcessingOverlay } from "../../_ui/image-processing-overlay";

import { useInitCropArrays } from "./use-init-crop-arrays";

import "react-image-crop/dist/ReactCrop.css";
import { ImageFileName } from "./image-file-name";
import { ImagePreviewFrame } from "./image-preview-frame";
import { useAspectRatio } from "./use-aspect-ratio";

type AspectRatio = {
  width: number;
  height: number;
};

export const ImageInputSections = ({
  files,
  isProcessing,
  aspectRatio,
  setPixelCrops,
  setImgElements,
}: {
  files: File[];
  isProcessing: boolean;
  aspectRatio: AspectRatio;
  setPixelCrops: React.Dispatch<
    React.SetStateAction<(PixelCrop | undefined)[]>
  >;
  setImgElements: React.Dispatch<
    React.SetStateAction<(HTMLImageElement | null)[]>
  >;
}) => {
  const [percentCrops, setPercentCrops] = useState<(PercentCrop | undefined)[]>(
    [],
  );

  const imageUrls = useObjectUrls(files);
  const ratio = useAspectRatio(aspectRatio);

  useInitCropArrays(
    files.length,
    setImgElements,
    setPercentCrops,
    setPixelCrops,
  );

  if (!files.length) return null;

  const handleImageLoaded = (index: number) => (img: HTMLImageElement) => {
    setImgElements((prev) => {
      const next = [...prev];
      next[index] = img;
      return next;
    });

    if (!ratio) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const fullPercentCrop: PercentCrop = {
      unit: "%",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };

    const aspectCrop = makeAspectCrop(
      fullPercentCrop,
      ratio,
      imgWidth,
      imgHeight,
    );

    setPercentCrops((prev) => {
      const next = [...prev];
      next[index] = aspectCrop;
      return next;
    });

    const pixelCrop: PixelCrop = {
      unit: "px",
      x: (aspectCrop.x / 100) * imgWidth,
      y: (aspectCrop.y / 100) * imgHeight,
      width: (aspectCrop.width / 100) * imgWidth,
      height: (aspectCrop.height / 100) * imgHeight,
    };

    setPixelCrops((prev) => {
      const next = [...prev];
      next[index] = pixelCrop;
      return next;
    });
  };

  const handleCropChange =
    (index: number) => (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
      setPercentCrops((prev) => {
        const next = [...prev];
        next[index] = percentCrop;
        return next;
      });

      setPixelCrops((prev) => {
        const next = [...prev];
        next[index] = pixelCrop;
        return next;
      });
    };

  return (
    <div className="max-h-[60vh] lg:max-h-[70vh] w-full flex flex-col overflow-y-auto">
      {files.map((file, index) => {
        const objectUrl = imageUrls[index];
        const crop = percentCrops[index];

        const section = (
          <section className="relative mx-auto w-full" key={file.name}>
            <ImagePreviewFrame>
              {objectUrl && (
                <ReactCrop
                  aspect={ratio}
                  className="max-w-full max-h-full flex items-center justify-center"
                  crop={crop}
                  keepSelection
                  onChange={handleCropChange(index)}
                >
                  {/* biome-ignore lint/performance/noImgElement: нужно именно <img> для превью */}
                  <img
                    alt={file.name}
                    className="max-w-full max-h-full object-contain"
                    onLoad={(event) =>
                      handleImageLoaded(index)(event.currentTarget)
                    }
                    src={objectUrl}
                  />
                </ReactCrop>
              )}

              <ImageProcessingOverlay isProcessing={isProcessing} />
            </ImagePreviewFrame>

            <ImageFileName name={file.name} />
          </section>
        );

        return (
          <div className="flex flex-col" key={file.name}>
            {section}
            {index !== files.length - 1 && <Separator className="mb-3" />}
          </div>
        );
      })}
    </div>
  );
};

```

src\shared\ui\image-kit\_image-input\image-input-sections\use-aspect-ratio.ts

```
"use client";

import { useMemo } from "react";

export function useAspectRatio(aspectRatio?: {
  width: number;
  height: number;
}) {
  return useMemo(
    () =>
      aspectRatio?.width && aspectRatio?.height
        ? aspectRatio.width / aspectRatio.height
        : undefined,
    [aspectRatio?.width, aspectRatio?.height],
  );
}

```

src\shared\ui\image-kit\_image-input\image-input-sections\use-init-crop-arrays.ts

```
"use client";

import { useEffect } from "react";
import type { PercentCrop, PixelCrop } from "react-image-crop";

export function useInitCropArrays(
  filesLength: number,
  setImgElements: React.Dispatch<
    React.SetStateAction<(HTMLImageElement | null)[]>
  >,
  setPercentCrops: React.Dispatch<
    React.SetStateAction<(PercentCrop | undefined)[]>
  >,
  setPixelCrops: React.Dispatch<
    React.SetStateAction<(PixelCrop | undefined)[]>
  >,
) {
  useEffect(() => {
    if (!filesLength) {
      setImgElements([]);
      setPercentCrops([]);
      setPixelCrops([]);
      return;
    }

    setImgElements(new Array(filesLength).fill(null));
    setPercentCrops(new Array(filesLength).fill(undefined));
    setPixelCrops(new Array(filesLength).fill(undefined));
  }, [filesLength, setImgElements, setPercentCrops, setPixelCrops]);
}

```

src\shared\ui\image-kit\_image-input\image-input-trigger\index.tsx

```
"use client";

import { ImageIcon } from "lucide-react";
import { Button } from "@/shared/ui/kit/button";

import { useFileInputTrigger } from "./use-file-input-trigger";

export const ImageInputTrigger = ({
  mode,
  onFilesSelected,
}: {
  mode: "single" | "multiple";
  onFilesSelected: (files: File[]) => void;
}) => {
  const { hiddenInput, triggerInputClick } = useFileInputTrigger({
    onFilesSelected,
    multiple: mode === "multiple",
    accept: "image/*",
  });

  return (
    <>
      <Button
        aria-label="Загрузить изображение"
        onClick={triggerInputClick}
        type="button"
      >
        <ImageIcon aria-hidden="true" className="size-5" />
        <span aria-hidden="true">Загрузить</span>
      </Button>

      {hiddenInput}
    </>
  );
};

```

src\shared\ui\image-kit\_image-input\image-input-trigger\use-file-input-trigger.tsx

```
"use client";

import { type ChangeEvent, useRef } from "react";

export function useFileInputTrigger({
  onFilesSelected,
  multiple,
  accept,
}: {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerInputClick = () => {
    if (!inputRef.current) return;
    // Reset value so selecting the same file again still triggers change
    inputRef.current.value = "";
    inputRef.current.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList?.length) return;

    const files = Array.from(fileList);

    if (multiple) onFilesSelected(files);
    onFilesSelected(multiple ? files : files.slice(0, 1));
  };

  const hiddenInput = (
    <input
      accept={accept ?? "image/*"}
      aria-hidden="true"
      className="hidden"
      multiple={multiple ?? false}
      onChange={handleChange}
      ref={inputRef}
      tabIndex={-1}
      type="file"
    />
  );

  return {
    triggerInputClick,
    hiddenInput,
  };
}

```

src\shared\ui\image-kit\_image-input\image-input.tsx

```
"use client";

import { useState } from "react";
import type { PixelCrop } from "react-image-crop";
import { ImageInputDialog } from "./image-input-dialog";
import { ImageInputFooter } from "./image-input-footer";
import { ImageInputHeader } from "./image-input-header";
import { ImageInputSections } from "./image-input-sections";
import { ImageInputTrigger } from "./image-input-trigger";

export const ImageInput = ({
  mode = "single",
  aspectRatio,
  onComplete,
}: {
  mode?: "single" | "multiple";
  aspectRatio: {
    width: number;
    height: number;
  };
  onComplete: (images: File[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pixelCrops, setPixelCrops] = useState<(PixelCrop | undefined)[]>([]);
  const [imgElements, setImgElements] = useState<(HTMLImageElement | null)[]>(
    [],
  );

  const resetState = () => {
    setSelectedFiles([]);
    setPixelCrops([]);
    setImgElements([]);
    setIsProcessing(false);
  };

  const handleConfirm = async () => {
    if (isProcessing) return;
    if (!selectedFiles.length) return;

    setIsProcessing(true);

    try {
      const croppedFiles: File[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const crop = pixelCrops[i];
        const img = imgElements[i];

        if (!file || !crop || !img) continue;

        const { x, y, width, height } = crop;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        ctx.drawImage(
          img,
          x,
          y,
          width,
          height,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const blob: Blob = await new Promise((resolve, reject) => {
          // сохраняем исходный mime-типа файла, если браузер его поддерживает
          const mimeType = file.type || "image/png";

          if ("toBlob" in canvas) {
            canvas.toBlob(
              (b) => {
                if (!b) {
                  reject(new Error("Failed to create blob from canvas"));
                  return;
                }
                resolve(b);
              },
              mimeType,
              0.92,
            );
          } else {
            reject(new Error("Canvas toBlob not supported"));
          }
        });

        // сохраняем расширение из оригинального файла
        const originalName = file.name;
        const dotIndex = originalName.lastIndexOf(".");
        const base =
          dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
        const ext = dotIndex !== -1 ? originalName.slice(dotIndex) : ".png";

        const croppedFile = new File([blob], `${base}-cropped${ext}`, {
          type: blob.type,
        });

        croppedFiles.push(croppedFile);
      }

      onComplete(croppedFiles);
      setOpen(false);
      resetState();
    } catch (error) {
      console.error("Error while cropping images", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ImageInputDialog
      open={open}
      setOpen={(value) => {
        if (isProcessing && value === false) return;
        setOpen(value);
        if (!value) resetState();
      }}
      trigger={
        <ImageInputTrigger
          mode={mode}
          onFilesSelected={(files: File[]) => {
            if (!files.length) return;
            setSelectedFiles(files);
            setOpen(true);
          }}
        />
      }
    >
      <ImageInputHeader aspectRatio={aspectRatio} />

      <ImageInputSections
        aspectRatio={aspectRatio}
        files={selectedFiles}
        isProcessing={isProcessing}
        setImgElements={setImgElements}
        setPixelCrops={setPixelCrops}
      />

      <ImageInputFooter
        isProcessing={isProcessing}
        onCancel={() => {
          if (isProcessing) return;
          setOpen(false);
          resetState();
        }}
        onConfirm={handleConfirm}
      />
    </ImageInputDialog>
  );
};

```

src\shared\ui\image-kit\_ui\image-processing-overlay.tsx

```
import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

export const ImageProcessingOverlay = ({
  isProcessing,
}: {
  isProcessing: boolean;
}) => {
  if (!isProcessing) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
      <Button variant="inverted">
        {isProcessing && <Spinner />}
        Обработка...
      </Button>
    </div>
  );
};

```

- напиши новую папку компонента с префиксом _ (придумай название (пока буду называть его IMAGE_UI), он будет менять разрешение: width, height. Сжимать, менять расширение: png, webp. Менять картинки местами через нажатия на стрелки). Напши src/app/test/page.tsx которая будет ImageInput передавать картинки новому компоненту и в него передавать колбек, чтобы потом вывести обработанные картинки на страницу

Внешний вид IMAGE_UI:
- Заголовок
- описание
- Характиристики текстом
- - Аспект ратио: 1x1, 16x9 или другое (передаются в IMAGE_UI пропсом)
- - Разрешение: widht: 1000px, height: 400px или другие значение (передаются в IMAGE_UI пропсом) 
- - Расширение/Формат: webp, png (передаются в IMAGE_UI пропсом)
- - Максимальный вес: в бегабайтах, килобайтах, байтах (сам правильно выбирает в зависимости от размера по принципу целого числа, то есть байты превысили или равны 1 килобайту, то теперь в килобайтах, если килобайты равны или превысили бегабайт то в мегабайтах. Без округлеий. То есть Берем общую сумму байт из него забираем целые мегайты и показываем их, затем целые килобайты и показываем сколько их, затем оставшиеся байты)
- - Минимальный вес: (так же как и Максимальный вес показывается оба передаются в виде байт числом в пропсы)

Логика IMAGE_UI:
- При первом отображении переводит все картинки в Расширение/Формат переданный пропсом. Также меняет Разрешение на переданные пропсом (если у картинки изначальна одна из сторон или обе меньше нужных, то ее не меняет. Но сама секции картинки горит красным, все кнопки кроме кнопки удаления горит красным)

