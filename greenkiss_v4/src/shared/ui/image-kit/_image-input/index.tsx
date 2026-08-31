import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/kit/alert-dialog";
import { ModeToggle } from "@/shared/ui/theme";
import { ImageInputCancelButton } from "./ui/cancel-button";
import { ImageInputConfirmButton } from "./ui/confirm-button";
import { ImageInputDialog } from "./ui/dialog";
import { PreviewBackgroundToggle } from "./ui/preview-background-toggle";
import { ImageInputProvider } from "./ui/provider";
import { ImageInputSections } from "./ui/sections";
import { ImageInputTrigger } from "./ui/trigger";

export const ImageInput = (props: {
  mode: "single" | "multiple";
  width: number;
  height: number;
  onComplete: (images: File[]) => void;
}) => {
  return (
    <ImageInputProvider {...props}>
      <ImageInputDialog trigger={<ImageInputTrigger />}>
        <AlertDialogHeader className="h-16 w-full relative gap-0">
          <PreviewBackgroundToggle className="absolute -left-px -top-px z-50 border rounded-none rounded-tl-md" />

          <ModeToggle className="absolute -right-px -top-px z-50 border rounded-none rounded-tr-md" />

          <AlertDialogTitle className="text-center md:text-2xl">
            Загрузка изображений
          </AlertDialogTitle>

          <AlertDialogDescription className="h-9 text-center md:text-lg line-clamp-none pt-2 md:pt-0">
            Выберите область для обрезки изображения.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ImageInputSections />

        <AlertDialogFooter className="h-12 max-w-md grid grid-cols-[1fr_1fr] place-items-center gap-x-5 mx-auto">
          <ImageInputCancelButton />
          <ImageInputConfirmButton />
        </AlertDialogFooter>
      </ImageInputDialog>
    </ImageInputProvider>
  );
};
