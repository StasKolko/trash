import type { IconButtonProps } from "../action/button/button.type";

export type Theme = "light" | "dark";

export type ModeToggleProps = Omit<IconButtonProps, "children"> & {
  "data-dark-testid"?: string;
  "data-light-testid"?: string;
};
