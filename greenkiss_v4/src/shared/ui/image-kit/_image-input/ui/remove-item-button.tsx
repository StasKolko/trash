import { Trash2Icon } from "lucide-react";

import { Button } from "@/shared/ui/kit/button";

import { useImageInputStore } from "../model/context";

export const ImageInputRemoveItemButton = ({ id }: { id: string }) => {
  const onClick = useImageInputStore((state) => state.handleRemoveItem);
  const isProcessing = useImageInputStore((state) => state.isProcessing);

  return (
    <Button
      aria-label="Удалить картинку"
      className="absolute right-2 top-2 z-20"
      onClick={() => onClick(id)}
      size="icon"
      type="button"
      variant="destructive"
      disabled={isProcessing}
    >
      <Trash2Icon aria-hidden="true" className="size-4" />
    </Button>
  );
};
