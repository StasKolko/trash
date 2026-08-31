import { cn } from "@packages/utils/css";
import { Check, Circle } from "lucide-solid";
import { Show } from "solid-js";
import {
  checkboxClasses,
  iconClasses,
  itemClasses,
  itemDisabledClasses,
  radioClasses,
  shortcutClasses,
} from "./dropdown-menu.styles";
import type {
  DropdownMenuActionItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
} from "./dropdown-menu.types";

type MenuItemProps = {
  item: DropdownMenuActionItem;
  focused: boolean;
  onSelect: () => void;
};

function MenuItem(props: MenuItemProps) {
  return (
    // biome-ignore lint/a11y/useFocusableInteractive: Roving tabindex pattern
    <div
      data-testid="DropdownMenuItem"
      role="menuitem"
      tabindex={props.focused ? 0 : -1}
      aria-disabled={props.item.disabled || undefined}
      class={cn(itemClasses, props.item.disabled && itemDisabledClasses)}
      onClick={() => {
        if (!props.item.disabled) {
          props.onSelect();
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !props.item.disabled) {
          e.preventDefault();
          props.onSelect();
        }
      }}
    >
      <Show when={props.item.icon}>
        <span class={iconClasses}>{props.item.icon}</span>
      </Show>
      <span class="flex-1">{props.item.label}</span>
      <Show when={props.item.shortcut}>
        <span class={shortcutClasses}>{props.item.shortcut}</span>
      </Show>
    </div>
  );
}

type CheckboxItemProps = {
  item: DropdownMenuCheckboxItem;
  focused: boolean;
  onToggle: () => void;
};

function CheckboxItem(props: CheckboxItemProps) {
  return (
    // biome-ignore lint/a11y/useFocusableInteractive: Roving tabindex pattern
    <div
      data-testid="DropdownMenuCheckboxItem"
      role="menuitemcheckbox"
      tabindex={props.focused ? 0 : -1}
      aria-checked={props.item.checked}
      aria-disabled={props.item.disabled || undefined}
      class={cn(itemClasses, props.item.disabled && itemDisabledClasses)}
      onClick={() => {
        if (!props.item.disabled) {
          props.onToggle();
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !props.item.disabled) {
          e.preventDefault();
          props.onToggle();
        }
      }}
    >
      <span class={checkboxClasses}>
        <Show when={props.item.checked}>
          <Check aria-hidden="true" size={14} />
        </Show>
      </span>
      <span class="flex-1">{props.item.label}</span>
    </div>
  );
}

type RadioItemProps = {
  item: DropdownMenuRadioItem;
  checked: boolean;
  focused: boolean;
  onSelect: () => void;
};

function RadioItem(props: RadioItemProps) {
  return (
    // biome-ignore lint/a11y/useFocusableInteractive: Roving tabindex pattern
    <div
      data-testid="DropdownMenuRadioItem"
      role="menuitemradio"
      tabindex={props.focused ? 0 : -1}
      aria-checked={props.checked}
      aria-disabled={props.item.disabled || undefined}
      class={cn(itemClasses, props.item.disabled && itemDisabledClasses)}
      onClick={() => {
        if (!props.item.disabled) {
          props.onSelect();
        }
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !props.item.disabled) {
          e.preventDefault();
          props.onSelect();
        }
      }}
    >
      <span class={radioClasses}>
        <Show when={props.checked}>
          <Circle aria-hidden="true" size={8} fill="currentColor" />
        </Show>
      </span>
      <span class="flex-1">{props.item.label}</span>
    </div>
  );
}

export { MenuItem, CheckboxItem, RadioItem };
