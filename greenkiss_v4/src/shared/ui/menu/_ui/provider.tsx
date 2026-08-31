"use client";

import { type ReactNode, useState } from "react";
import { Sheet } from "@/shared/ui/kit/sheet";
import { HamburgerMenu } from "./hamburger-menu";

export const MenuProvider = ({
  triggerClassName,
  triggerName,
  children,
}: {
  triggerClassName?: string;
  triggerName: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <HamburgerMenu
        className={triggerClassName}
        triggerName={triggerName}
        onClick={() => setOpen(!open)}
        open={open}
      />
      {children}
    </Sheet>
  );
};
