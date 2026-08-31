import { createEffect, createSignal, on, onCleanup } from "solid-js";

import { OVERLAY_ANIMATION_DURATION } from "../../_model/constant";

export function createOverlayLifecycle(open: () => boolean) {
  const [mounted, setMounted] = createSignal(false);
  const [visible, setVisible] = createSignal(false);

  createEffect(
    on(
      open,
      (isOpen) => {
        if (isOpen) {
          setMounted(true);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setVisible(true);
            });
          });
        } else {
          setVisible(false);
          const timer = window.setTimeout(() => {
            setMounted(false);
          }, OVERLAY_ANIMATION_DURATION);
          onCleanup(() => window.clearTimeout(timer));
        }
      },
      { defer: true },
    ),
  );

  return { mounted, visible };
}
