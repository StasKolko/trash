import { cn } from "@packages/utils/css";
import { ChevronRight } from "lucide-solid";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { getFloatingCoords } from "../../floating-position/get-floating-coords";
import { resolveFloatingLayout } from "../../floating-position/resolve-floating-layout";
import type { FloatingPosition } from "../../model/overlays.types";
import {
  iconClasses,
  itemClasses,
  itemDisabledClasses,
  subMenuChevronClasses,
} from "../dropdown-menu.styles";
import type { FocusableMenuItem } from "../dropdown-menu.types";
import {
  ANIMATION_DURATION,
  SUBMENU_CLOSE_DELAY,
  SUBMENU_MAX_HEIGHT,
  SUBMENU_MIN_HEIGHT,
  SUBMENU_OFFSET,
  SUBMENU_OPEN_DELAY,
} from "./submenu.constants";
import type { SubMenuProps } from "./submenu.types";
import { SubMenuContent } from "./submenu-content";

function SubMenuTrigger(props: SubMenuProps) {
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

  function handleTriggerBlur(e: FocusEvent) {
    const relatedTarget = e.relatedTarget as Node | null;

    // Don't close if focus moved to submenu content
    if (relatedTarget && subMenuRef?.contains(relatedTarget)) {
      return;
    }

    // Don't close if focus moved to a nested submenu
    const submenus = document.querySelectorAll(
      '[data-testid="DropdownMenuSubMenu"]',
    );
    for (const submenu of submenus) {
      if (submenu.contains(relatedTarget)) {
        return;
      }
    }

    scheduleClose();
  }

  createEffect(() => {
    if (props.focused && !mounted()) {
      scheduleOpen();
    }
  });

  onCleanup(clearAllTimers);

  return (
    <>
      {/* biome-ignore lint/a11y/useFocusableInteractive: Roving tabindex pattern */}
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
        onBlur={handleTriggerBlur}
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
            renderSubMenu={(subItem, focused, parentClose) => (
              <SubMenuTrigger
                item={subItem}
                focused={focused}
                parentClose={parentClose}
              />
            )}
          />
        </Portal>
      </Show>
    </>
  );
}

export { SubMenuTrigger };
