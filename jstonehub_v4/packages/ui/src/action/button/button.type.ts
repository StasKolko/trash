import type { JSX } from "solid-js";

import type { ComponentSize } from "../../_model/type";

type ButtonProps = BaseButtonProps & {
  "aria-label"?: string;
};

type IconButtonProps = BaseButtonProps & {
  "aria-label": string;
};

type LoadingButtonProps = BaseButtonProps & {
  "data-loader-testid"?: string;
  "aria-label"?: string;
  loading?: boolean;
};

type BaseButtonProps = {
  "data-testid"?: string;
  "aria-describedby"?: string;
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
  type?: ButtonType;
  form?: string;
  variant?: ButtonVariant;
  size?: ComponentSize;
  class?: string;
  style?: JSX.CSSProperties;
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  children: JSX.Element;
};

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

type ButtonType = Exclude<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"],
  undefined
>;

export type {
  ButtonProps,
  ButtonType,
  ButtonVariant,
  IconButtonProps,
  LoadingButtonProps,
};
