import { cn } from "@/shared/lib/css";
import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { ModeToggle } from "@/shared/ui/theme";

import { useImageInputStore } from "../model/context";
import { PreviewBackgroundToggle } from "../ui/preview-background-toggle";

export const ImageInputHeader = () => {
  const width = useImageInputStore((state) => state.width);
  const height = useImageInputStore((state) => state.height);

  const ASPECT_PREVIEW_MAX_SIZE = 96;
  const maxSide = Math.max(width, height);
  const scale = ASPECT_PREVIEW_MAX_SIZE / maxSide;

  const displayWidth = width * scale;
  const displayHeight = height * scale;

  const isPortraitOrSquare = width <= height;

  return (
    <AlertDialogHeader className="gap-0">
      <div className="h-[calc(2.25rem-1px)] w-full border-b relative">
        <PreviewBackgroundToggle className="absolute -left-px -top-px z-50 border rounded-none rounded-tl-md" />

        <ModeToggle className="absolute -right-px -top-px z-50 border rounded-none rounded-tr-md" />

        <AlertDialogTitle className="text-center md:text-2xl">
          Загрузка изображений
        </AlertDialogTitle>
      </div>

      <div className="flex items-center justify-center gap-3 py-3">
        <AlertDialogDescription className="text-center md:text-lg">
          Выберите область изображения для обрезки под нужные пропорции.
        </AlertDialogDescription>

        <div
          className="flex items-center justify-center rounded-md border border-primary text-sm font-bold text-primary"
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
          }}
        >
          <span
            className={cn(
              "flex flex-row items-center leading-tight",
              isPortraitOrSquare && "flex-col",
            )}
          >
            <span>{width}</span>
            <span>x</span>
            <span>{height}</span>
          </span>
        </div>
      </div>
    </AlertDialogHeader>
  );
};
