import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/kit/button";

import styles from "./hamburger-menu.module.css";

export const HamburgerMenu = ({
  open,
  triggerName,
  ...props
}: { open: boolean; triggerName: string } & React.ComponentProps<"button">) => {
  return (
    <Button
      aria-label={triggerName}
      className="px-2 font-bold text-md uppercase gap-0"
      variant="ghost"
      {...props}
    >
      <span aria-hidden="true" className={cn(styles.icon, open && styles.open)}>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span aria-hidden="true" className="hidden lg:block">
        {triggerName}
      </span>
    </Button>
  );
};
