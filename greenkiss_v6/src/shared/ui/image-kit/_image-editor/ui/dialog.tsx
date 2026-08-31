"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/shared/ui/kit/alert-dialog";
import { useImageEditorContext } from "../model/context";
import { useImageEditorStore } from "../model/store";
import { ImageEditorHeader } from "./header";
import { ImageList } from "./image-list";

export function ImageEditorDialog() {
  const isDialogOpen = useImageEditorStore((state) => state.isDialogOpen);
  const isCompressing = useImageEditorStore((state) => state.isCompressing);
  const closeDialog = useImageEditorStore((state) => state.closeDialog);
  const resetToInitial = useImageEditorStore((state) => state.resetToInitial);
  const validateItems = useImageEditorStore((state) => state.validateItems);
  const items = useImageEditorStore((state) => state.items);
  const hasCountError = useImageEditorStore((state) => state.hasCountError);
  const hasSizeError = useImageEditorStore((state) => state.hasSizeError);

  const { onChange } = useImageEditorContext();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isCompressing) {
        // ignore close attempts
        return;
      }
      closeDialog();
    } else {
      // open handled via trigger
    }
  };

  const handleCancel = () => {
    if (isCompressing) return;
    resetToInitial();
    closeDialog();
  };

  const handleDone = () => {
    if (isCompressing) return;
    validateItems();
    if (hasCountError || hasSizeError) return;
    onChange(items);
    closeDialog();
  };

  const isDoneDisabled = isCompressing || hasCountError || hasSizeError;

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <ImageEditorHeader />
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <ImageList />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCompressing} onClick={handleCancel}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction disabled={isDoneDisabled} onClick={handleDone}>
            Готово
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
