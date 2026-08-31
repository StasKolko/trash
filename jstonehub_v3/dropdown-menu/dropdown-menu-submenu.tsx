import { cn } from "@packages/utils/css";
import { ChevronRight } from "lucide-solid";
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { getFloatingCoords } from "../floating-position/get-floating-coords";
import { resolveFloatingLayout } from "../floating-position/resolve-floating-layout";
import type { FloatingPosition } from "../model/overlays.types";
import {
  createMenuKeyboardHandler,
  handleMenuKeyDown,
} from "./dropdown-menu.keyboard";
import {
  iconClasses,
  itemClasses,
  itemDisabledClasses,
  menuClasses,
  subMenuChevronClasses,
} from "./dropdown-menu.styles";
import type {
  DropdownMenuItem,
  DropdownMenuSubMenu,
  FocusableMenuItem,
} from "./dropdown-menu.types";
import { flattenFocusableItems } from "./dropdown-menu.utils";
import {
  MenuGroup,
  MenuRadioGroup,
  MenuSeparator,
} from "./dropdown-menu-groups";
import { CheckboxItem, MenuItem } from "./dropdown-menu-items";

const SUBMENU_OPEN_DELAY = 100;
const SUBMENU_CLOSE_DELAY = 300;
const ANIMATION_DURATION = 150;
const SUBMENU_MIN_HEIGHT = 100;
const SUBMENU_MAX_HEIGHT = 400;
const SUBMENU_OFFSET = 4;

type SubMenuProps = {
  item: DropdownMenuSubMenu;
  focused: boolean;
  parentClose: () => void;
};

function SubMenu(props: SubMenuProps) {
  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);
  const [position, setPosition] = createSignal<FloatingPosition | null>(null);
  const [focusedIndex, setFocusedIndex] = createSignal(-1);

  let itemRef: HTMLDivElement | undefined;
  let subMenuRef: HTMLDivElement | undefined;
  let openTimer: number | undefined;
  let closeTimer: number | undefined;
  let unmountTimer: number | undefined;

  function calculatePosition() {
    if (!(itemRef && subMenuRef)) {
      return;
    }

    const triggerRect = itemRef.getBoundingClientRect();
    subMenuRef.style.width = "auto";
    subMenuRef.style.height = "auto";

    const menuRect = subMenuRef.getBoundingClientRect();

    const layout = resolveFloatingLayout({
      trigger: triggerRect,
      side: "right",
      offset: SUBMENU_OFFSET,
      minWidth: menuRect.width,
      minHeight: Math.min(menuRect.height, SUBMENU_MIN_HEIGHT),
    });

    const finalHeight = Math.min(
      menuRect.height,
      layout.maxHeight,
      SUBMENU_MAX_HEIGHT,
    );

    const coords = getFloatingCoords({
      trigger: triggerRect,
      side: layout.side,
      align: "start",
      width: menuRect.width,
      height: finalHeight,
      offset: SUBMENU_OFFSET,
    });

    setPosition({
      ...coords,
      width: menuRect.width,
      height: finalHeight,
      side: layout.side,
      align: "start",
    });

    subMenuRef.style.maxHeight = `${finalHeight}px`;
  }

  function clearAllTimers() {
    if (openTimer !== undefined) {
      window.clearTimeout(openTimer);
      openTimer = undefined;
    }
    if (closeTimer !== undefined) {
      window.clearTimeout(closeTimer);
      closeTimer = undefined;
    }
    if (unmountTimer !== undefined) {
      window.clearTimeout(unmountTimer);
      unmountTimer = undefined;
    }
  }

  function open() {
    if (props.item.disabled) {
      return;
    }

    clearAllTimers();
    setMounted(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        calculatePosition();
        setVisible(true);
        setFocusedIndex(0);
      });
    });
  }

  function close() {
    clearAllTimers();
    setVisible(false);

    unmountTimer = window.setTimeout(() => {
      setMounted(false);
      setPosition(null);
      unmountTimer = undefined;
    }, ANIMATION_DURATION);
  }

  function scheduleOpen() {
    if (closeTimer !== undefined) {
      window.clearTimeout(closeTimer);
      closeTimer = undefined;
    }

    if (mounted() && visible()) {
      return;
    }

    if (openTimer !== undefined) {
      return;
    }

    openTimer = window.setTimeout(() => {
      open();
      openTimer = undefined;
    }, SUBMENU_OPEN_DELAY);
  }

  function scheduleClose() {
    if (openTimer !== undefined) {
      window.clearTimeout(openTimer);
      openTimer = undefined;
    }

    if (!mounted()) {
      return;
    }

    if (closeTimer !== undefined) {
      return;
    }

    closeTimer = window.setTimeout(() => {
      close();
      closeTimer = undefined;
    }, SUBMENU_CLOSE_DELAY);
  }

  function cancelClose() {
    if (closeTimer !== undefined) {
      window.clearTimeout(closeTimer);
      closeTimer = undefined;
    }
  }

  function focusItem(index: number) {
    const items = subMenuRef?.querySelectorAll('[role^="menuitem"]');
    if (items?.[index]) {
      (items[index] as HTMLElement).focus();
    }
  }

  function handleItemSelect(item: FocusableMenuItem) {
    if (item.type === "item") {
      item.onSelect?.();
      close();
      props.parentClose();
    } else if (item.type === "checkbox") {
      item.onCheckedChange?.(!item.checked);
    }
  }

  createEffect(() => {
    if (props.focused && !mounted()) {
      scheduleOpen();
    }
  });

  onCleanup(clearAllTimers);

  return (
    <>
      {/* biome-ignore lint/a11y/useFocusableInteractive: FALSE_POSITIVE */}
      <div
        ref={(el) => {
          itemRef = el;
        }}
        data-testid="DropdownMenuSubMenuTrigger"
        role="menuitem"
        tabindex={props.focused ? 0 : -1}
        aria-haspopup="menu"
        aria-expanded={visible() || undefined}
        aria-disabled={props.item.disabled || undefined}
        class={cn(
          itemClasses,
          "justify-between",
          props.item.disabled && itemDisabledClasses,
        )}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onFocus={scheduleOpen}
        onBlur={scheduleClose}
        onClick={() => {
          if (!props.item.disabled) {
            open();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" && !props.item.disabled) {
            e.preventDefault();
            open();
            requestAnimationFrame(() => focusItem(0));
          }
        }}
      >
        <Show when={props.item.icon}>
          <span class={iconClasses}>{props.item.icon}</span>
        </Show>
        <span class="flex-1">{props.item.label}</span>
        <ChevronRight
          aria-hidden="true"
          size={16}
          class={subMenuChevronClasses}
        />
      </div>

      <Show when={mounted()}>
        <Portal mount={document.body}>
          <SubMenuContent
            ref={(el) => {
              subMenuRef = el;
            }}
            items={props.item.items}
            visible={visible()}
            position={position()}
            focusedIndex={focusedIndex()}
            setFocusedIndex={setFocusedIndex}
            focusItem={focusItem}
            onSelectItem={handleItemSelect}
            onClose={close}
            onParentClose={props.parentClose}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          />
        </Portal>
      </Show>
    </>
  );
}

type SubMenuContentProps = {
  ref: (el: HTMLDivElement) => void;
  items: DropdownMenuItem[];
  visible: boolean;
  position: FloatingPosition | null;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  focusItem: (index: number) => void;
  onSelectItem: (item: FocusableMenuItem) => void;
  onClose: () => void;
  onParentClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function SubMenuContent(props: SubMenuContentProps) {
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
            return (
              <SubMenu
                item={item}
                focused={focused()}
                parentClose={() => {
                  props.onClose();
                  props.onParentClose();
                }}
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

export { SubMenu };
