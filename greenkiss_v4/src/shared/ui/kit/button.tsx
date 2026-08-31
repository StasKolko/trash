import type { ReactNode } from "react";

import { cn, createVariantClasses, flattenSizes, type VariantProps } from "@/shared/lib/css";

const sizes = flattenSizes({
  button: {
    height: {
      xs: "h-[28px]",
      sm: "h-[32px]",
      md: "h-[36px]",
      lg: "h-[40px]",
      xl: "h-[44px]",
    },
    padding: {
      xs: "px-[12px]",
      sm: "px-[14px]",
      md: "px-[16px]",
      lg: "px-[18px]",
      xl: "px-[20px]",
    },
    radius: {
      xs: "rounded-[6px]",
      sm: "rounded-[7px]",
      md: "rounded-[8px]",
      lg: "rounded-[9px]",
      xl: "rounded-[10px]",
    },
    gap: {
      xs: "gap-[6px]",
      sm: "gap-[7px]",
      md: "gap-[8px]",
      lg: "gap-[9px]",
      xl: "gap-[10px]",
    },
    icon: {
      xs: "[&>svg]:w-[12px] [&>svg]:h-[12px]",
      sm: "[&>svg]:w-[14px] [&>svg]:h-[14px]",
      md: "[&>svg]:w-[16px] [&>svg]:h-[16px]",
      lg: "[&>svg]:w-[18px] [&>svg]:h-[18px]",
      xl: "[&>svg]:w-[20px] [&>svg]:h-[20px]",
    },
    fontSize: {
      xs: "text-[12px]",
      sm: "text-[13px]",
      md: "text-[14px]",
      lg: "text-[15px]",
      xl: "text-[16px]",
    },
  },

  icon: {
    size: {
      xs: "h-[28px] w-[28px]",
      sm: "h-[32px] w-[32px]",
      md: "h-[36px] w-[36px]",
      lg: "h-[40px] w-[40px]",
      xl: "h-[44px] w-[44px]",
    },
    radius: {
      xs: "rounded-[6px]",
      sm: "rounded-[7px]",
      md: "rounded-[8px]",
      lg: "rounded-[9px]",
      xl: "rounded-[10px]",
    },
    icon: {
      xs: "[&>svg]:w-[16px] [&>svg]:h-[16px]",
      sm: "[&>svg]:w-[18px] [&>svg]:h-[18px]",
      md: "[&>svg]:w-[20px] [&>svg]:h-[20px]",
      lg: "[&>svg]:w-[22px] [&>svg]:h-[22px]",
      xl: "[&>svg]:w-[24px] [&>svg]:h-[24px]",
    },
  },

  link: {
    paddingX: {
      xs: "px-[8px]",
      sm: "px-[10px]",
      md: "px-[12px]",
      lg: "px-[14px]",
      xl: "px-[16px]",
    },
    paddingY: {
      xs: "py-[4px]",
      sm: "py-[4px]",
      md: "py-[4px]",
      lg: "py-[6px]",
      xl: "py-[8px]",
    },
    radius: {
      xs: "rounded-[6px]",
      sm: "rounded-[7px]",
      md: "rounded-[8px]",
      lg: "rounded-[9px]",
      xl: "rounded-[10px]",
    },
    gap: {
      xs: "gap-[4px]",
      sm: "gap-[5px]",
      md: "gap-[6px]",
      lg: "gap-[7px]",
      xl: "gap-[8px]",
    },
    icon: {
      xs: "[&>svg]:w-[12px] [&>svg]:h-[12px]",
      sm: "[&>svg]:w-[13px] [&>svg]:h-[13px]",
      md: "[&>svg]:w-[14px] [&>svg]:h-[14px]",
      lg: "[&>svg]:w-[15px] [&>svg]:h-[15px]",
      xl: "[&>svg]:w-[16px] [&>svg]:h-[16px]",
    },
    fontSize: {
      xs: "text-[12px]",
      sm: "text-[13px]",
      md: "text-[14px]",
      lg: "text-[15px]",
      xl: "text-[16px]",
    },
  },
});

const buttonVariantClasses = createVariantClasses(
  "inline-flex shrink-0 items-center justify-center [&_svg]:shrink-0 [&_svg]:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:bg-active cursor-pointer whitespace-nowrap font-bold leading-none transition-colors transition-shadow",
  {
    variant: {
      default: "primary",
      primary: "",
      outline: "",
      secondary: "",
      inverted: "text-background bg-foreground border border-foreground hover:bg-foreground/70",
      ok: "",
      error: "",
      info: "",
      warning: "",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "button-md",
      // BUTTON
      "button-xs": sizes.button.xs,
      "button-sm": sizes.button.sm,
      "button-md": sizes.button.md,
      "button-lg": sizes.button.lg,
      "button-xl": sizes.button.xl,
      // ICON
      "icon-xs": sizes.icon.xs,
      "icon-sm": sizes.icon.sm,
      "icon-md": sizes.icon.md,
      "icon-lg": sizes.icon.lg,
      "icon-xl": sizes.icon.xl,
      // LINK
      "link-xs": sizes.link.xs,
      "link-sm": sizes.link.sm,
      "link-md": sizes.link.md,
      "link-lg": sizes.link.lg,
      "link-xl": sizes.link.xl,
    },
  },
);

export const variant = {
  default:
    "bg-primary border border-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  destructive:
    "bg-destructive text-destructive-foreground border border-destructive-foreground shadow-xs hover:bg-destructive-foreground hover:text-destructive focus-visible:ring-destructive-foreground/40 dark:focus-visible:ring-destructive-foreground/70 focus-visible:border-destructive-foreground",
  successful:
    "bg-successful text-successful-foreground border border-successful-foreground shadow-xs hover:bg-successful-foreground hover:text-successful focus-visible:ring-successful-foreground/40 dark:focus-visible:ring-successful-foreground/70 focus-visible:border-successful-foreground",
  outline:
    "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
  secondary:
    "bg-secondary border border-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
  link: "",
};

export type ButtonProps = React.ComponentProps<"button"> & {
  ui?: VariantProps<typeof buttonVariantClasses>;
  renderAs?: (classes: string) => ReactNode;
};

export function Button({
  className,
  ui,
  type = "button",
  renderAs,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariantClasses({ ...ui }), className);

  if (renderAs) {
    return renderAs(classes);
  }

  return <button type={type} className={classes} {...props} />;
}