import { AlertDialogFooter } from "@/shared/ui/kit/alert-dialog";
import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

export const ImageInputFooter = ({
  onCancel,
  onConfirm,
  isProcessing,
  isConfirmDisabled,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  isConfirmDisabled?: boolean;
}) => {
  const disabledDone = isProcessing || isConfirmDisabled;

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
        disabled={disabledDone}
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
