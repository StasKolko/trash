import type { JSX } from "solid-js";

type SelectOption = {
  value: string;
  label: JSX.Element;
  disabled?: boolean;
};

type SelectBaseProps = {
  "data-testid"?: string;
  "data-trigger-testid"?: string;
  "data-popover-testid"?: string;

  name?: string;
  placeholder?: string;

  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  invalidId?: string;

  options: SelectOption[];
};

type SelectProps = SelectBaseProps & {
  value?: string;
  onValueChange?: (value: string | undefined) => void;
};

type SearchableSelectProps = SelectProps & {
  "data-search-testid"?: string;
  searchPlaceholder?: string;
  emptyLabel?: JSX.Element;
  clearSearchLabel: string;
};

type MultiSelectProps = SelectBaseProps & {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  selectAllLabel: string;
  selectedLabel: (count: number, total: number) => string;
};

type SearchableMultiSelectProps = MultiSelectProps & {
  "data-search-testid"?: string;
  searchPlaceholder?: string;
  emptyLabel?: JSX.Element;
  clearSearchLabel: string;
};

export type {
  MultiSelectProps,
  SearchableMultiSelectProps,
  SearchableSelectProps,
  SelectBaseProps,
  SelectOption,
  SelectProps,
};
