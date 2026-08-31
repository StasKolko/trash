import type { JSX } from "solid-js";

type DropdownMenuItemBase = {
  disabled?: boolean;
};

type DropdownMenuActionItem = DropdownMenuItemBase & {
  type: "item";
  label: JSX.Element;
  icon?: JSX.Element;
  shortcut?: string;
  onSelect?: () => void;
};

type DropdownMenuCheckboxItem = DropdownMenuItemBase & {
  type: "checkbox";
  label: JSX.Element;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

type DropdownMenuRadioItem = DropdownMenuItemBase & {
  type: "radio";
  value: string;
  label: JSX.Element;
};

type DropdownMenuRadioGroup = {
  type: "radiogroup";
  label?: string;
  value: string;
  onValueChange?: (value: string) => void;
  items: DropdownMenuRadioItem[];
};

type DropdownMenuGroup = {
  type: "group";
  label?: string;
  items: (DropdownMenuActionItem | DropdownMenuCheckboxItem)[];
};

type DropdownMenuSeparator = {
  type: "separator";
};

type DropdownMenuSubMenu = DropdownMenuItemBase & {
  type: "submenu";
  label: JSX.Element;
  icon?: JSX.Element;
  items: DropdownMenuItem[];
};

type DropdownMenuItem =
  | DropdownMenuActionItem
  | DropdownMenuCheckboxItem
  | DropdownMenuRadioGroup
  | DropdownMenuGroup
  | DropdownMenuSeparator
  | DropdownMenuSubMenu;

type FocusableMenuItem =
  | DropdownMenuActionItem
  | DropdownMenuCheckboxItem
  | DropdownMenuRadioItem
  | DropdownMenuSubMenu;

type DropdownMenuTriggerProps = {
  ref: (el: HTMLElement) => void;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean | undefined;
  "aria-controls": string | undefined;
};

type DropdownMenuProps = {
  items: DropdownMenuItem[];
  disabled?: boolean;
  children: (props: DropdownMenuTriggerProps) => JSX.Element;
};

export type {
  DropdownMenuActionItem,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuProps,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuTriggerProps,
  FocusableMenuItem,
};
