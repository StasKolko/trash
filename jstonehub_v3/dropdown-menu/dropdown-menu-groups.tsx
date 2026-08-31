import { For, Show } from "solid-js";
import { groupLabelClasses, separatorClasses } from "./dropdown-menu.styles";
import type {
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  FocusableMenuItem,
} from "./dropdown-menu.types";
import { CheckboxItem, MenuItem, RadioItem } from "./dropdown-menu-items";

function MenuSeparator() {
  return (
    <hr
      data-testid="DropdownMenuSeparator"
      class={separatorClasses}
      aria-orientation="horizontal"
    />
  );
}

type GroupProps = {
  group: DropdownMenuGroup;
  focusedItem: FocusableMenuItem | undefined;
  onSelectItem: (item: FocusableMenuItem) => void;
};

function MenuGroup(props: GroupProps) {
  return (
    <fieldset data-testid="DropdownMenuGroup" aria-label={props.group.label}>
      <Show when={props.group.label}>
        <legend data-testid="DropdownMenuGroupLabel" class={groupLabelClasses}>
          {props.group.label}
        </legend>
      </Show>
      <For each={props.group.items}>
        {(item) => {
          const focused = () => props.focusedItem === item;

          if (item.type === "checkbox") {
            return (
              <CheckboxItem
                item={item}
                focused={focused()}
                onToggle={() => props.onSelectItem(item)}
              />
            );
          }

          return (
            <MenuItem
              item={item}
              focused={focused()}
              onSelect={() => props.onSelectItem(item)}
            />
          );
        }}
      </For>
    </fieldset>
  );
}

type RadioGroupProps = {
  group: DropdownMenuRadioGroup;
  focusedItem: FocusableMenuItem | undefined;
  onSelectValue: (value: string) => void;
};

function MenuRadioGroup(props: RadioGroupProps) {
  return (
    <fieldset
      data-testid="DropdownMenuRadioGroup"
      aria-label={props.group.label}
    >
      <Show when={props.group.label}>
        <legend
          data-testid="DropdownMenuRadioGroupLabel"
          class={groupLabelClasses}
        >
          {props.group.label}
        </legend>
      </Show>
      <For each={props.group.items}>
        {(item) => {
          const focused = () => props.focusedItem === item;
          const checked = () => props.group.value === item.value;

          return (
            <RadioItem
              item={item}
              checked={checked()}
              focused={focused()}
              onSelect={() => props.onSelectValue(item.value)}
            />
          );
        }}
      </For>
    </fieldset>
  );
}

export { MenuSeparator, MenuGroup, MenuRadioGroup };
