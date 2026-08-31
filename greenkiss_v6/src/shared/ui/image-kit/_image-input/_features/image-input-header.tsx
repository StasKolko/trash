import { cn } from "@/shared/lib/css";
import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { ModeToggle } from "@/shared/ui/theme";

export const ImageInputHeader = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const ASPECT_PREVIEW_MAX_SIZE = 96;
  const maxSide = Math.max(width, height);
  const scale = ASPECT_PREVIEW_MAX_SIZE / maxSide;

  const displayWidth = width * scale;
  const displayHeight = height * scale;

  const isPortraitOrSquare = width <= height;

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
    </AlertDialogHeader>
  );
};
