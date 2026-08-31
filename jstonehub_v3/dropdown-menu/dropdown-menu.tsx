import {
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import { getFloatingCoords } from "../floating-position/get-floating-coords";
import { resolveFloatingLayout } from "../floating-position/resolve-floating-layout";
import type { FloatingPosition } from "../model/overlays.types";
import {
  createMenuKeyboardHandler,
  handleMenuKeyDown,
} from "./dropdown-menu.keyboard";
import type {
  DropdownMenuProps,
  FocusableMenuItem,
} from "./dropdown-menu.types";
import { MenuContent } from "./dropdown-menu-content";

const ANIMATION_DURATION = 150;

const menuConfig = {
  offset: 4,
  minWidth: 180,
  maxWidth: 320,
  maxHeight: 400,
  minHeight: 100,
} as const;

export function DropdownMenu(props: DropdownMenuProps) {
  const id = createUniqueId();
  const menuId = `${id}-menu`;

  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);
  const [position, setPosition] = createSignal<FloatingPosition | null>(null);
  const [focusedIndex, setFocusedIndex] = createSignal(-1);

  let triggerRef: HTMLElement | null = null;
  let menuRef: HTMLDivElement | undefined;
  let unmountTimer: number | undefined;

  function calculatePosition() {
    if (!(triggerRef && menuRef)) {
      return;
    }

    const triggerRect = triggerRef.getBoundingClientRect();

    menuRef.style.width = "auto";
    menuRef.style.height = "auto";
    menuRef.style.maxHeight = "none";

    const menuRect = menuRef.getBoundingClientRect();

    const layout = resolveFloatingLayout({
      trigger: triggerRect,
      side: "bottom",
      offset: menuConfig.offset,
      minWidth: Math.max(menuRect.width, menuConfig.minWidth),
      minHeight: Math.min(menuRect.height, menuConfig.minHeight),
    });

    const finalWidth = Math.min(
      Math.max(menuRect.width, menuConfig.minWidth),
      menuConfig.maxWidth,
    );
    const finalHeight = Math.min(
      menuRect.height,
      menuConfig.maxHeight,
      layout.maxHeight,
    );

    const coords = getFloatingCoords({
      trigger: triggerRect,
      side: layout.side,
      align: "start",
      width: finalWidth,
      height: finalHeight,
      offset: menuConfig.offset,
    });

    setPosition({
      ...coords,
      width: finalWidth,
      height: finalHeight,
      side: layout.side,
      align: "start",
    });

    menuRef.style.maxHeight = `${finalHeight}px`;
    menuRef.style.maxWidth = `${finalWidth}px`;
  }

  function focusItem(index: number) {
    const items = menuRef?.querySelectorAll('[role^="menuitem"]');
    if (items?.[index]) {
      (items[index] as HTMLElement).focus();
    }
  }

  function open() {
    if (props.disabled) {
      return;
    }

    setMounted(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        calculatePosition();
        setVisible(true);
        setFocusedIndex(0);

        requestAnimationFrame(() => {
          menuRef?.focus();
        });
      });
    });
  }

  function close() {
    setVisible(false);

    if (unmountTimer !== undefined) {
      window.clearTimeout(unmountTimer);
    }

    unmountTimer = window.setTimeout(() => {
      setMounted(false);
      setPosition(null);
      unmountTimer = undefined;
      triggerRef?.focus();
    }, ANIMATION_DURATION);
  }

  function toggle() {
    if (mounted() && visible()) {
      close();
    } else {
      open();
    }
  }

  function handleItemSelect(item: FocusableMenuItem) {
    if (item.type === "item") {
      item.onSelect?.();
      close();
    } else if (item.type === "checkbox") {
      item.onCheckedChange?.(!item.checked);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    // Prevent Tab from leaving menu
    if (e.key === "Tab") {
      e.preventDefault();
      return;
    }

    const handler = createMenuKeyboardHandler({
      items: props.items,
      focusedIndex: focusedIndex(),
      setFocusedIndex,
      focusItem,
      selectItem: handleItemSelect,
      close,
    });
    handleMenuKeyDown(e, handler);
  }

  function handleTriggerKeyDown(e: KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      if (!mounted()) {
        open();
      }
    }
  }

  createEffect(() => {
    if (!mounted()) {
      return;
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef?.contains(target) || menuRef?.contains(target)) {
        return;
      }
      // Check if click is inside a submenu
      const submenus = document.querySelectorAll(
        '[data-testid="DropdownMenuSubMenu"]',
      );
      for (const submenu of submenus) {
        if (submenu.contains(target)) {
          return;
        }
      }
      close();
    }

    function handleScroll(e: Event) {
      if (menuRef?.contains(e.target as Node)) {
        return;
      }
      // Check if scroll is inside a submenu
      const submenus = document.querySelectorAll(
        '[data-testid="DropdownMenuSubMenu"]',
      );
      for (const submenu of submenus) {
        if (submenu.contains(e.target as Node)) {
          return;
        }
      }
      close();
    }

    function handleResize() {
      close();
    }

    document.addEventListener("pointerdown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { capture: true });
    window.addEventListener("resize", handleResize);

    onCleanup(() => {
      document.removeEventListener("pointerdown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleResize);
    });
  });

  onCleanup(() => {
    if (unmountTimer !== undefined) {
      window.clearTimeout(unmountTimer);
    }
  });

  return (
    <>
      {props.children({
        ref: (el) => {
          triggerRef = el;
        },
        onClick: toggle,
        onKeyDown: handleTriggerKeyDown,
        "aria-haspopup": "menu",
        "aria-expanded": visible() || undefined,
        "aria-controls": visible() ? menuId : undefined,
      })}

      <Show when={mounted()}>
        <Portal mount={document.body}>
          <MenuContent
            ref={(el) => {
              menuRef = el;
            }}
            id={menuId}
            items={props.items}
            visible={visible()}
            position={position()}
            focusedIndex={focusedIndex()}
            setFocusedIndex={setFocusedIndex}
            focusItem={focusItem}
            onSelectItem={handleItemSelect}
            onClose={close}
            onKeyDown={handleKeyDown}
          />
        </Portal>
      </Show>
    </>
  );
}
