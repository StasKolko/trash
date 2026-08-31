"use client";

import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

import { useImageInputStore } from "../model/context";

export const ImageInputConfirmButton = () => {
  const onConfirm = useImageInputStore((state) => state.handleConfirm);
  const isProcessing = useImageInputStore((state) => state.isProcessing);
  const hasInvalid = useImageInputStore((state) => state.hasInvalid);

  return (
    <Button
      disabled={isProcessing || hasInvalid}
      onClick={onConfirm}
      type="button"
      variant="default"
    >
      {isProcessing && <Spinner aria-label="hidden" />}
      {isProcessing ? "Обработка..." : "Готово"}
    </Button>
  );
};
