import type { JSX } from "solid-js";

import { Show } from "solid-js";
import { Portal } from "solid-js/web";

import { Separator } from "../../_primitive/separator/separator";
import { Backdrop } from "../_backdrop/backdrop";
import { createEscapeHandler } from "../_hook/create-escape-handler";
import { createFocusTrap } from "../_hook/create-focus-trap";
import { createOverlayLifecycle } from "../_hook/create-overlay-lifecycle";
import { createScrollLock } from "../_hook/create-scroll-lock";
import { SHEET_SEPARATOR_STYLE } from "./_sheet.style";
import { SheetHeader } from "./_sheet-header";
import { SheetPanel } from "./_sheet-panel";

export function Sheet(props: {
  "data-testid"?: string;
  "data-backdrop-testid"?: string;
  "data-header-testid"?: string;
  "data-separator-testid"?: string;
  open: boolean;
  onClose: () => void;
  closeLabel: string;
  logo: JSX.Element;
  content: JSX.Element;
}) {
  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let panelRef!: HTMLElement;

  const { mounted, visible } = createOverlayLifecycle(() => props.open);
  createScrollLock(() => props.open);
  createEscapeHandler(() => props.open, props.onClose);
  createFocusTrap(
    () => props.open,
    () => panelRef,
  );

  return (
    <Show when={mounted()}>
      <Portal mount={document.body}>
        <Backdrop
          data-testid={props["data-backdrop-testid"]}
          onClose={props.onClose}
          visible={visible()}
        />

        <SheetPanel
          data-testid={props["data-testid"]}
          // v8 ignore start
          ref={panelRef}
          // v8 ignore end
          visible={visible()}
        >
          <SheetHeader
            data-testid={props["data-header-testid"]}
            closeLabel={props.closeLabel}
            logo={props.logo}
            onClose={props.onClose}
          />

          <Separator
            data-testid={props["data-separator-testid"]}
            class={SHEET_SEPARATOR_STYLE}
          />

          {props.content}
        </SheetPanel>
      </Portal>
    </Show>
  );
}
