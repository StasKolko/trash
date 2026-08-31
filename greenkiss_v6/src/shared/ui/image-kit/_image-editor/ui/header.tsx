"use client";

import { useEffect } from "react";
import { ImageInput } from "@/shared/ui/image-kit/_image-input";
import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { ModeToggle } from "@/shared/ui/theme";
import { useImageEditorContext } from "../model/context";
import { useImageEditorStore } from "../model/store";

export function ImageEditorHeader() {
  const { minImages, maxImages, minSize, maxSize } = useImageEditorContext();

  const items = useImageEditorStore((state) => state.items);
  const addItemsFromFiles = useImageEditorStore(
    (state) => state.addItemsFromFiles,
  );
  const validateItems = useImageEditorStore((state) => state.validateItems);

  useEffect(() => {
    validateItems();
  }, [validateItems]);

  const countTooFew = items.length < minImages;
  const countTooMany = items.length > maxImages;

  const hasTooSmall = items.some((item) => item.file.size < minSize);
  const hasTooBig = items.some((item) => item.file.size > maxSize);

  const handleComplete = (files: File[] | File) => {
    const arr = Array.isArray(files) ? files : [files];
    addItemsFromFiles(arr);
  };

  return (
    <AlertDialogHeader className="relative">
      <div className="absolute right-0 top-0">
        <ModeToggle />
      </div>

      <AlertDialogTitle>Редактирование изображений</AlertDialogTitle>

      <AlertDialogDescription asChild>
        <div className="space-y-2 pt-2">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Минимум:</span>
                {countTooFew ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted decoration-red-500">
                        {minImages} изображений
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Слишком мало изображений.</TooltipContent>
                  </Tooltip>
                ) : (
                  <span>{minImages} изображений</span>
                )}
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <span>Максимум:</span>
                {countTooMany ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted decoration-red-500">
                        {maxImages} изображений
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Слишком много изображений.</TooltipContent>
                  </Tooltip>
                ) : (
                  <span>{maxImages} изображений</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Минимальный размер файла:</span>
                {hasTooSmall ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted decoration-red-500">
                        {minSize} байт
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Есть изображение с слишком маленьким размером файла.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span>{minSize} байт</span>
                )}
              </div>
              <span>·</span>
              <div className="flex items-center gap-1">
                <span>Максимальный размер файла:</span>
                {hasTooBig ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted decoration-red-500">
                        {maxSize} байт
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Есть изображение с слишком большим размером файла.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span>{maxSize} байт</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <ImageInput
              mode="multiple"
              width={1024}
              height={1024}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
  );
}
