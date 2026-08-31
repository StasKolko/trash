import { useShallow } from "zustand/react/shallow";
import { useRenderLogger } from "@/shared/lib/react";
import { AlertDialogFooter } from "@/shared/ui/kit/alert-dialog";
import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";
import { useImageInputStore } from "../model/context";

export const ImageInputFooter = () => {
  useRenderLogger("ImageInputFooter");

  const { onCancel, onConfirm, isProcessing, hasInvalid } = useImageInputStore(
    useShallow((state) => ({
      onCancel: state.resetState,
      onConfirm: state.handleConfirm,
      isProcessing: state.isProcessing,
      hasInvalid: state.hasInvalid,
    })),
  );

  return (
    <AlertDialogFooter className="max-w-md grid grid-cols-[1fr_1fr] place-items-center gap-x-5 mx-auto py-3">
      <Button
        disabled={isProcessing}
        onClick={onCancel}
        type="button"
        variant="destructive"
      >
        {isProcessing && <Spinner aria-label="hidden" />}
        {isProcessing ? "Обработка..." : "Отменить"}
      </Button>
      <Button
        disabled={isProcessing || hasInvalid}
        onClick={onConfirm}
        type="button"
        variant="default"
      >
        {isProcessing && <Spinner aria-label="hidden" />}
        {isProcessing ? "Обработка..." : "Готово"}
      </Button>
    </AlertDialogFooter>
  );
};
