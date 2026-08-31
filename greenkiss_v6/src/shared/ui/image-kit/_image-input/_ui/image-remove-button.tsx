import { Button } from "@/shared/ui/kit/button";
import { Trash2Icon } from "lucide-react";

export const ImageRemoveButton = ({ onClick }: {
  onClick: () => void;
}) => (
  <Button
    aria-label="Удалить картинку"
    className="absolute right-2 top-2 z-20"
    onClick={onClick}
    size="icon"
    type="button"
    variant="destructive"
  >
    <Trash2Icon aria-hidden="true" className="size-4" />
  </Button>
);
