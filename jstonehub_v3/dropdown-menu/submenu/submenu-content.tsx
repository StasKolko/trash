import { cn } from "@packages/utils/css";
import type { JSX } from "solid-js";
import { For } from "solid-js";
import {
  createMenuKeyboardHandler,
  handleMenuKeyDown,
} from "../dropdown-menu.keyboard";
import { menuClasses } from "../dropdown-menu.styles";
import type { DropdownMenuSubMenu } from "../dropdown-menu.types";
import { flattenFocusableItems } from "../dropdown-menu.utils";
import {
  MenuGroup,
  MenuRadioGroup,
  MenuSeparator,
} from "../dropdown-menu-groups";
import { CheckboxItem, MenuItem } from "../dropdown-menu-items";
import type { SubMenuContentProps } from "./submenu.types";

type SubMenuContentWithNestedProps = SubMenuContentProps & {
  renderSubMenu: (
    item: DropdownMenuSubMenu,
    focused: boolean,
    parentClose: () => void,
  ) => JSX.Element;
};

function SubMenuContent(props: SubMenuContentWithNestedProps) {
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

  function handleKeyDown(e: KeyboardEvent) {
    const handler = createMenuKeyboardHandler({
      items: props.items,
      focusedIndex: props.focusedIndex,
      setFocusedIndex: props.setFocusedIndex,
      focusItem: props.focusItem,
      selectItem: props.onSelectItem,
      close: props.onClose,
      closeSubMenu: props.onClose,
    });
    handleMenuKeyDown(e, handler);
  }

  return (
    <div
      ref={props.ref}
      data-testid="DropdownMenuSubMenu"
      role="menu"
      tabindex={-1}
      data-state={props.visible ? "open" : "closed"}
      class={cn(
        menuClasses,
        props.position?.side && `floating-animate-${props.position.side}`,
      )}
      style={positionStyle()}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      onKeyDown={handleKeyDown}
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
            return props.renderSubMenu(item, focused(), () => {
              props.onClose();
              props.onParentClose();
            });
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

export { SubMenuContent };
export type { SubMenuContentWithNestedProps };
