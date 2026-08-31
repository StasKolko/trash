import { CircleAlertIcon } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/kit/tooltip";
import { useImageInputStore } from "../model/context";

export const ImageCropInvalidIndicator = ({ id }: { id: string }) => {
  const isItemInvalid = useImageInputStore((state) => state.isItemInvalid);
  const hasInvalid = useImageInputStore((state) => state.hasInvalid);

  if (!isItemInvalid(id) || !hasInvalid) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label="Область обрезки слишком мала. Увеличьте её или удалите картинку."
          className="absolute z-20 top-2 left-2"
          variant="ghost"
          size="icon"
        >
          <CircleAlertIcon aria-hidden="true" className="size-5" />
          <span
            aria-hidden="true"
            className="size-5 bg-red-500 absolute animate-ping rounded-md"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="text-center font-semibold">
        Область обрезки слишком мала.
        <br />
        Увеличьте её или удалите картинку.
      </TooltipContent>
    </Tooltip>
  );
};
