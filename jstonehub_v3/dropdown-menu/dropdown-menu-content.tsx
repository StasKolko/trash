import { cn } from "@packages/utils/css";
import { For } from "solid-js";
import type { FloatingPosition } from "../model/overlays.types";
import { menuClasses } from "./dropdown-menu.styles";
import type {
  DropdownMenuItem,
  FocusableMenuItem,
} from "./dropdown-menu.types";
import { flattenFocusableItems } from "./dropdown-menu.utils";
import {
  MenuGroup,
  MenuRadioGroup,
  MenuSeparator,
} from "./dropdown-menu-groups";
import { CheckboxItem, MenuItem } from "./dropdown-menu-items";
import { SubMenuTrigger } from "./submenu/submenu-trigger";

type MenuContentProps = {
  ref: (el: HTMLDivElement) => void;
  id: string;
  items: DropdownMenuItem[];
  visible: boolean;
  position: FloatingPosition | null;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  focusItem: (index: number) => void;
  onSelectItem: (item: FocusableMenuItem) => void;
  onClose: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
};

export function MenuContent(props: MenuContentProps) {
  const positionStyle = () => {
    if (!props.position) {
      return { visibility: "hidden" as const };
    }
    return {
      left: `${props.position.x}px`,
      top: `${props.position.y}px`,
      visibility: props.visible ? ("visible" as const) : ("hidden" as const),
      width: `${props.position.width}px`,
      height: `${props.position.height}px`,
      "max-height": `${props.position.height}px`,
      "max-width": `${props.position.width}px`,
    };
  };

  const focusableItems = () => flattenFocusableItems(props.items);
  const getFocusedItem = () => focusableItems()[props.focusedIndex];

  return (
    <div
      ref={props.ref}
      data-testid="DropdownMenuContent"
      role="menu"
      id={props.id}
      tabindex={0}
      data-state={props.visible ? "open" : "closed"}
      class={cn(
        menuClasses,
        "outline-none",
        props.position?.side && `floating-animate-${props.position.side}`,
      )}
      style={positionStyle()}
      onKeyDown={props.onKeyDown}
    >
      <For each={props.items}>
        {(item) => {
          if (item.type === "separator") {
            return <MenuSeparator />;
          }

          if (item.type === "group") {
            return (
              <MenuGroup
                group={item}
                focusedItem={getFocusedItem()}
                onSelectItem={props.onSelectItem}
              />
            );
          }

          if (item.type === "radiogroup") {
            return (
              <MenuRadioGroup
                group={item}
                focusedItem={getFocusedItem()}
                onSelectValue={(value) => {
                  item.onValueChange?.(value);
                }}
              />
            );
          }

          const focused = () => getFocusedItem() === item;

          if (item.type === "checkbox") {
            return (
              <CheckboxItem
                item={item}
                focused={focused()}
                onToggle={() => props.onSelectItem(item)}
              />
            );
          }

          if (item.type === "submenu") {
            return (
              <SubMenuTrigger
                item={item}
                focused={focused()}
                parentClose={props.onClose}
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
    </div>
  );
}
