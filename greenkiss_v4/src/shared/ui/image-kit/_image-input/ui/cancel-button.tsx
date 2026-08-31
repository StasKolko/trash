"use client";

import { Button } from "@/shared/ui/kit/button";
import { Spinner } from "@/shared/ui/kit/spinner";

import { useImageInputStore } from "../model/context";

export const ImageInputCancelButton = () => {
  const onCancel = useImageInputStore((state) => state.resetState);
  const isProcessing = useImageInputStore((state) => state.isProcessing);

  return (
    <Button
      disabled={isProcessing}
      onClick={onCancel}
      type="button"
      variant="destructive"
    >
      {isProcessing && <Spinner aria-label="hidden" />}
      {isProcessing ? "Обработка..." : "Отменить"}
    </Button>
  );
};
