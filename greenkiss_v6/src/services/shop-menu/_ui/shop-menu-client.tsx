"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/kit/sheet";
import { HamburgerMenu } from "./hamburger-menu";

export const ShopMenuClient = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <HamburgerMenu onClick={() => setOpen(!open)} open={open} />
      <SheetContent
        className="w-[320px] sm:w-[380px] border-r border-border/60 bg-background/95 backdrop-blur"
        side="left"
      >
        <SheetHeader className="pb-2 border-b border-border/40">
          <SheetTitle className="text-base font-semibold tracking-tight">
            Каталог
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <nav className="space-y-2 text-sm">123</nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
