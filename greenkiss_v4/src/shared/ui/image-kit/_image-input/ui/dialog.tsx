"use client";

import type { ReactNode } from "react";

import { AlertDialog, AlertDialogContent } from "@/shared/ui/kit/alert-dialog";

import { useImageInputStore } from "../model/context";

export const ImageInputDialog = ({
  children,
  trigger,
}: {
  children: ReactNode;
  trigger: ReactNode;
}) => {
  const open = useImageInputStore((state) => state.open);
  const onOpenChange = useImageInputStore((state) => state.resetState);

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      {trigger}
      <AlertDialogContent className="w-screen lg:max-w-5xl p-0 gap-0">
        {children}
      </AlertDialogContent>
    </AlertDialog>
  );
};
