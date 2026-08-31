import type { ReactNode } from "react";
import { AlertDialog, AlertDialogContent } from "@/shared/ui/kit/alert-dialog";

export const ImageInputDialog = ({
  trigger,
  children,
  open,
  setOpen,
}: {
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      {trigger}
      <AlertDialogContent className="w-screen lg:max-w-5xl p-0 gap-0">
        {children}
      </AlertDialogContent>
    </AlertDialog>
  );
};
