import type { JSX } from "solid-js";

type FieldBaseProps = {
  label: JSX.Element;
  info?: JSX.Element;
  error?: JSX.Element;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
};

type ToggleFieldProps = FieldBaseProps & {
  "aria-label"?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

type RadioGroupItem = {
  value: string;
  label: JSX.Element;
  disabled?: boolean;
};

type CheckboxGroupItem = {
  value: string;
  label: JSX.Element;
  disabled?: boolean;
};

type RadioGroupFieldProps = FieldBaseProps & {
  name: string;
  items: RadioGroupItem[];
  value?: string;
  onValueChange?: (value: string) => void;
};

type CheckboxGroupFieldProps = FieldBaseProps & {
  name: string;
  items: CheckboxGroupItem[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
};

export type {
  CheckboxGroupFieldProps,
  CheckboxGroupItem,
  FieldBaseProps,
  RadioGroupFieldProps,
  RadioGroupItem,
  ToggleFieldProps,
};
