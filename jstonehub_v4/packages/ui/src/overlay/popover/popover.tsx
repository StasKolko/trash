import type { JSX } from "solid-js";

import type { Side } from "../_model/type";
import type { PopoverPosition } from "./_popover.type";

import { createEffect, createSignal, on, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { createEscapeHandler } from "../_hook/create-escape-handler";
import { createOutsideClickHandler } from "../_hook/create-outside-click-handler";
import { createOutsideScrollHandler } from "../_hook/create-outside-scroll-handler";
import { POPOVER_CONFIG } from "./_popover.constant";
import { POPOVER_ROOT_STYLE } from "./_popover.style";
import {
  computePosition,
  getPopoverStyle,
  measureLayout,
} from "./_popover.util";

type PopoverProps = {
  "data-testid"?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: Side;
  triggerRef: HTMLElement | null | undefined;
  anchorRef?: HTMLElement | null | undefined;
  matchTriggerWidth?: boolean;
  class?: string;
  children: JSX.Element;
};

function Popover(props: PopoverProps) {
  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);
  const [position, setPosition] = createSignal<PopoverPosition | null>(null);

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let panelRef!: HTMLDivElement;

  const side = () => props.side ?? "bottom";

  // --- Закрытие по Escape ---
  createEscapeHandler(
    () => props.open,
    () => props.onOpenChange(false),
  );

  // --- Закрытие по клику извне ---
  createOutsideClickHandler(
    () => props.open,
    () => [panelRef, props.triggerRef],
    () => props.onOpenChange(false),
  );

  // --- Закрытие по скроллу извне / ресайзу ---
  createOutsideScrollHandler(
    () => props.open && visible(),
    () => panelRef,
    () => props.onOpenChange(false),
  );

  // --- Жизненный цикл open/close ---
  createEffect(
    on(
      () => props.open,
      (isOpen) => {
        if (isOpen) {
          openPopover();
        } else {
          closePopover();
        }
      },
      { defer: true },
    ),
  );

  function openPopover() {
    const anchor = props.anchorRef ?? props.triggerRef;
    if (!anchor) {
      return;
    }

    setMounted(true);

    requestAnimationFrame(() => {
      if (!panelRef) {
        return;
      }

      const layout = measureLayout({
        anchor,
        panel: panelRef,
        side: side(),
        matchTriggerWidth: props.matchTriggerWidth ?? false,
      });

      requestAnimationFrame(() => {
        if (!panelRef) {
          return;
        }

        setPosition(computePosition(panelRef, layout));

        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    });
  }

  function closePopover() {
    setVisible(false);
    const timer = window.setTimeout(() => {
      setMounted(false);
      setPosition(null);
    }, POPOVER_CONFIG.animationDuration);

    onCleanup(() => window.clearTimeout(timer));
  }

  return (
    <Show when={mounted()}>
      <Portal mount={document.body}>
        <div
          // v8 ignore start
          ref={panelRef}
          // v8 ignore end
          data-testid={props["data-testid"]}
          class={`${POPOVER_ROOT_STYLE} ${props.class ?? ""}`.trim()}
          style={getPopoverStyle(position(), visible())}
        >
          {props.children}
        </div>
      </Portal>
    </Show>
  );
}

export type { PopoverProps };
export { Popover };
