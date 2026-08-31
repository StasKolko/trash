import type { JSX } from "solid-js";

import { is } from "@packages/util/guard";
import { createSignal, createUniqueId, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { Separator } from "../../_primitive/separator/separator";
import { H3 } from "../../typography/heading/heading";
import { P } from "../../typography/text/text";
import { Backdrop } from "../_backdrop/backdrop";
import { createEscapeHandler } from "../_hook/create-escape-handler";
import { createFocusTrap } from "../_hook/create-focus-trap";
import { createOverlayLifecycle } from "../_hook/create-overlay-lifecycle";
import { createScrollLock } from "../_hook/create-scroll-lock";
import {
  DIALOG_BACKDROP_DATA_TESTID,
  DIALOG_CONTENT_DATA_TESTID,
  DIALOG_DATA_TESTID,
  DIALOG_FOOTER_DATA_TESTID,
  DIALOG_HEADER_DATA_TESTID,
} from "./_dialog.constant";
import {
  DIALOG_CONTENT_STYLE,
  DIALOG_FOOTER_STYLE,
  DIALOG_HEADER_STYLE,
  DIALOG_ROOT_STYLE,
  DIALOG_WRAPPER_STYLE,
} from "./_dialog.style";

type DialogRenderProp = ((close: () => void) => JSX.Element) | JSX.Element;

type DialogProps = {
  alert: boolean;
  title: JSX.Element;
  description: JSX.Element;
  content?: DialogRenderProp;
  footer: DialogRenderProp;
  trigger?: (openDialog: () => void) => JSX.Element;
  open?: boolean;
  onClose?: () => void;
};

function resolveRenderProp(
  value: DialogRenderProp,
  close: () => void,
): JSX.Element {
  if (is.function(value)) {
    return (value as (close: () => void) => JSX.Element)(close);
  }
  return value as JSX.Element;
}

function Dialog(props: DialogProps) {
  const titleId = createUniqueId();
  const descriptionId = createUniqueId();

  const [internalOpen, setInternalOpen] = createSignal(false);

  const isControlled = () => props.open !== undefined;
  const isOpen = () =>
    isControlled() ? (props.open as boolean) : internalOpen();

  function open() {
    if (isControlled()) {
      props.onClose?.(); // controlled — notify parent
    } else {
      setInternalOpen(true);
    }
  }

  function close() {
    if (isControlled()) {
      props.onClose?.();
    } else {
      setInternalOpen(false);
    }
  }

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let panelRef!: HTMLDivElement;

  const { mounted, visible } = createOverlayLifecycle(isOpen);
  createScrollLock(isOpen);

  // Escape: only non-alert dialogs
  createEscapeHandler(() => isOpen() && !props.alert, close);

  // Focus trap: always
  createFocusTrap(isOpen, () => panelRef);

  function handleBackdropClick() {
    if (!props.alert) {
      close();
    }
  }

  return (
    <>
      <Show when={props.trigger}>{(trigger) => trigger()(open)}</Show>

      <Show when={mounted()}>
        <Portal mount={document.body}>
          <Backdrop
            data-testid={DIALOG_BACKDROP_DATA_TESTID}
            visible={visible()}
            onClose={handleBackdropClick}
          />
          {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: div with dialog role requires aria-modal for screen readers */}
          <div
            // v8 ignore start
            ref={panelRef}
            // v8 ignore end
            data-testid={DIALOG_DATA_TESTID}
            data-state={visible() ? "open" : "closed"}
            role={props.alert ? "alertdialog" : "dialog"}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            class={DIALOG_ROOT_STYLE}
          >
            <div class={DIALOG_WRAPPER_STYLE}>
              <div
                data-testid={DIALOG_HEADER_DATA_TESTID}
                class={DIALOG_HEADER_STYLE}
              >
                <H3 id={titleId} variant="foreground">
                  {props.title}
                </H3>
                <P id={descriptionId} level={3} variant="foreground">
                  {props.description}
                </P>
              </div>

              <Separator />

              <Show when={props.content}>
                {(content) => (
                  <>
                    <div
                      data-testid={DIALOG_CONTENT_DATA_TESTID}
                      class={DIALOG_CONTENT_STYLE}
                    >
                      {resolveRenderProp(content(), close)}
                    </div>
                    <Separator />
                  </>
                )}
              </Show>

              <div
                data-testid={DIALOG_FOOTER_DATA_TESTID}
                class={DIALOG_FOOTER_STYLE}
              >
                {resolveRenderProp(props.footer, close)}
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </>
  );
}

export type { DialogProps, DialogRenderProp };
export { Dialog };
