import { cn } from "@/shared/lib/css";
import { AlertDialogDescription } from "@/shared/ui/kit/alert-dialog";

interface ImageInputDescriptionProps {
  width: number;
  height: number;
}

const ASPECT_PREVIEW_MAX_SIZE = 96;

export const ImageInputDescription = ({
  width,
  height,
}: ImageInputDescriptionProps) => {
  const maxSide = Math.max(width, height) || 1;
  const scale = ASPECT_PREVIEW_MAX_SIZE / maxSide;

  const displayWidth = width * scale;
  const displayHeight = height * scale;

  const isPortraitOrSquare = width <= height;

  return (
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
  );
};
