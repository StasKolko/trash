import type { Accessor } from "solid-js";

import { createEffect, onCleanup } from "solid-js";

/**
 * Закрывает поповер при:
 * - скролле ИЗВНЕ панели (скролл внутри панели игнорируется)
 * - ресайзе окна
 */
function createOutsideScrollHandler(
  active: Accessor<boolean>,
  getPanel: () => HTMLElement | undefined,
  onClose: () => void,
) {
  createEffect(() => {
    if (!active()) {
      return;
    }

    function handleScroll(e: Event) {
      const panel = getPanel();
      if (!panel) {
        return;
      }

      const target = e.target;

      // Скролл внутри панели — игнорируем
      if (target instanceof Node && panel.contains(target)) {
        return;
      }

      // Скролл document тоже считается «извне»
      onClose();
    }

    function handleResize() {
      onClose();
    }

    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", handleResize, { passive: true });

    onCleanup(() => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("resize", handleResize);
    });
  });
}

export { createOutsideScrollHandler };
