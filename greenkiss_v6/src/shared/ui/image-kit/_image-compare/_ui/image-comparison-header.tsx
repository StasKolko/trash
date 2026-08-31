import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/shared/ui/kit/dialog";

export function ImageComparisonHeader({
  title,
  description,
  hasError,
}: {
  title: string;
  description?: string;
  hasError: boolean;
}) {
  return (
    <DialogHeader className="p-6 pb-0">
      <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
      {!hasError && description && (
        <DialogDescription className="text-foreground/70">{description}</DialogDescription>
      )}
    </DialogHeader>
  );
}
