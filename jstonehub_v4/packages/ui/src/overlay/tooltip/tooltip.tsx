import type { JSX } from "solid-js";

import type { Side } from "../_model/type";
import type { TooltipPosition } from "./_tooltip.type";

import {
  createEffect,
  createSignal,
  createUniqueId,
  on,
  onCleanup,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

import { createOutsideScrollHandler } from "../_hook/create-outside-scroll-handler";
import {
  TOOLTIP_ARROW_TEST_ID,
  TOOLTIP_CONFIG,
  TOOLTIP_ROLE,
} from "./_tooltip.constant";
import { TOOLTIP_ROOT_STYLE } from "./_tooltip.style";
import {
  calculateTooltipPosition,
  createTooltipTimers,
  getTooltipPositionStyle,
} from "./_tooltip.util";
import { TooltipArrow } from "./_tooltip-arrow";

export function Tooltip(props: {
  "data-testid"?: string;
  label: JSX.Element;
  side: Side;
  disabled?: boolean;
  trigger: (triggerProps: {
    ref: (el: HTMLElement) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    "aria-describedby": string | undefined;
  }) => JSX.Element;
}) {
  const id = createUniqueId();

  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);
  const [position, setPosition] = createSignal<TooltipPosition | null>(null);

  let triggerRef: HTMLElement | null = null;
  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let tooltipRef!: HTMLDivElement;

  const timers = createTooltipTimers();

  onCleanup(timers.clearAll);

  createEffect(
    on(
      () => props.disabled,
      (disabled) => {
        if (disabled && mounted()) {
          hide();
        }
      },
    ),
  );

  createOutsideScrollHandler(mounted, () => tooltipRef, handleDismiss);

  function show(delay: number) {
    if (props.disabled) {
      return;
    }

    setMounted(true);

    timers.scheduleShow(() => {
      requestAnimationFrame(() => {
        const pos = calculateTooltipPosition({
          triggerRef,
          tooltipRef,
          side: props.side,
        });
        setPosition(pos);

        requestAnimationFrame(() => {
          setVisible(true);

          if (TOOLTIP_CONFIG.autoHideDelay > 0) {
            timers.scheduleAutoHide(hide, TOOLTIP_CONFIG.autoHideDelay);
          }
        });
      });
    }, delay);
  }

  function hide() {
    setVisible(false);

    timers.scheduleUnmount(() => {
      setMounted(false);
      setPosition(null);
    }, TOOLTIP_CONFIG.animationDuration);
  }

  function handleDismiss() {
    timers.clearAll();
    setVisible(false);
    setMounted(false);
    setPosition(null);
  }

  function scheduleHide() {
    if (TOOLTIP_CONFIG.hideDelay <= 0) {
      hide();
      return;
    }

    timers.scheduleHide(hide, TOOLTIP_CONFIG.hideDelay);
  }

  return (
    <>
      {props.trigger({
        ref: (el: HTMLElement) => {
          triggerRef = el;
        },
        onMouseEnter: () => show(TOOLTIP_CONFIG.hoverDelay),
        onMouseLeave: scheduleHide,
        onFocus: () => show(TOOLTIP_CONFIG.focusDelay),
        onBlur: scheduleHide,
        get "aria-describedby"() {
          return visible() ? id : undefined;
        },
      })}

      <Show when={mounted()}>
        <Portal mount={document.body}>
          <div
            // v8 ignore start
            ref={tooltipRef}
            // v8 ignore end
            data-testid={props["data-testid"]}
            role={TOOLTIP_ROLE}
            id={id}
            data-state={visible() ? "open" : "closed"}
            data-side={position()?.side}
            data-align={position()?.align}
            class={TOOLTIP_ROOT_STYLE}
            style={getTooltipPositionStyle(position(), visible())}
          >
            <TooltipArrow
              data-testid={TOOLTIP_ARROW_TEST_ID}
              position={position}
            />
            {props.label}
          </div>
        </Portal>
      </Show>
    </>
  );
}
