import { For } from "solid-js";
import { Portal } from "solid-js/web";

import { ToastItem } from "./_toast-item";
import { store } from "./_toaster.store";
import { TOASTER_ROOT_STYLE } from "./_toaster.style";

export function Toaster() {
  return (
    <Portal mount={document.body}>
      <div data-testid="Toaster" class={TOASTER_ROOT_STYLE}>
        <For each={store.toasts}>{(t) => <ToastItem toast={t} />}</For>
      </div>
    </Portal>
  );
}
