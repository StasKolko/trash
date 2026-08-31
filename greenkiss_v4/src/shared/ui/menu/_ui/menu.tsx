import type { ReactNode } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/kit/sheet";
import { MenuProvider } from "./provider";

export const Menu = ({
  triggerClassName,
  title,
  triggerName,
  children,
}: {
  triggerClassName?: string;
  title: string;
  triggerName: string;
  children: ReactNode;
}) => {
  return (
    <MenuProvider triggerClassName={triggerClassName} triggerName={triggerName}>
      <SheetContent className="gap-0">
        <SheetHeader className="border-b py-2">
          <SheetTitle className="font-bold text-lg">{title}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </MenuProvider>
  );
};
