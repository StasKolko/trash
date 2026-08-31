"use client";

import { Button } from "@/shared/ui/kit/button";
import { useImageEditorStore } from "../model/store";

export function ImageEditorTrigger() {
  const openDialog = useImageEditorStore((state) => state.openDialog);

  return (
    <Button type="button" onClick={openDialog}>
      Редактировать изображения
    </Button>
  );
}
