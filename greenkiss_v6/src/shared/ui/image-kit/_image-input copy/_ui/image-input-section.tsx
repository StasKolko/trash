import { Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui/kit/button";

export const ImageInputSection = ({
  isInvalid,
  title,
  children,
  onRemoveItem,
}: {
  isInvalid: boolean;
  title: string;
  children: ReactNode;
  onRemoveItem: () => void;
}) => {
  return (
    <section className="w-full relative p-1">
      <Button
        aria-label="Удалить картинку"
        className="absolute right-2 top-2 z-20"
        onClick={onRemoveItem}
        size="icon"
        type="button"
        variant="destructive"
      >
        <Trash2Icon aria-hidden="true" className="size-4" />
      </Button>

      <h3 className="pt-2 font-bold text-xl text-center">{title}</h3>

      {isInvalid && (
        <div className="p-3 m-4 rounded-md border border-red-700 bg-red-800/20 text-md text-red-700">
          Область обрезки слишком мала. Увеличьте её или удалите картинку.
        </div>
      )}

      {children}
    </section>
  );
};
