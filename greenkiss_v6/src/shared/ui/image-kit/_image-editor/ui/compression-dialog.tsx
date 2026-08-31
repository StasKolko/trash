"use client";

import { ImageCompare } from "@/shared/ui/image-kit/_image-compare";
import { ImageProcessingOverlay } from "@/shared/ui/image-kit/_ui/image-processing-overlay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { useImageEditorStore } from "../model/store";

export function CompressionDialog() {
  const activeCompressionItemId = useImageEditorStore(
    (s) => s.activeCompressionItemId,
  );
  const compressedPreviewFile = useImageEditorStore(
    (s) => s.compressedPreviewFile,
  );
  const items = useImageEditorStore((s) => s.items);
  const cancelCompression = useImageEditorStore((s) => s.cancelCompression);
  const saveCompression = useImageEditorStore((s) => s.saveCompression);
  const isCompressing = useImageEditorStore((s) => s.isCompressing);

  const isOpen = !!activeCompressionItemId;
  const original = items.find((item) => item.id === activeCompressionItemId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      cancelCompression();
    }
  };

  if (!original) {
    return null;
  }

  const isPreviewLoading = isCompressing && !compressedPreviewFile;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Сжатие изображения</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="relative mt-4 min-h-[200px]">
          {isPreviewLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/60">
              <ImageProcessingOverlay text="Подготовка сжатой версии..." />
            </div>
          )}

          {compressedPreviewFile ? (
            <ImageCompare left={original.file} right={compressedPreviewFile} />
          ) : (
            !isPreviewLoading && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Подготовка сжатой версии...
              </div>
            )
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelCompression}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={saveCompression}
            disabled={!compressedPreviewFile}
          >
            Сохранить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
