import type { Accessor } from "solid-js";

import { createEffect, onCleanup } from "solid-js";

type ClickOutsideEntry = {
  containers: () => (HTMLElement | null | undefined)[];
  onClose: () => void;
};

const stack: ClickOutsideEntry[] = [];
let listening = false;

function createOutsideClickHandler(
  open: Accessor<boolean>,
  containers: () => (HTMLElement | null | undefined)[],
  onClose: () => void,
) {
  createEffect(() => {
    if (open()) {
      const entry: ClickOutsideEntry = { containers, onClose };
      stack.push(entry);
      addListener();

      onCleanup(() => {
        const index = stack.indexOf(entry);
        if (index !== -1) {
          stack.splice(index, 1);
        }
        if (stack.length === 0) {
          removeListener();
        }
      });
    }
  });
}

function handlePointerDown(e: PointerEvent) {
  const target = e.target as Node | null;
  if (!target || stack.length === 0) {
    return;
  }

  // Walk from topmost — close only the topmost outside entry
  const topEntry = stack.at(-1);
  const refs = topEntry?.containers();
  const isInside = refs?.some((ref) => ref?.contains(target));

  if (!isInside) {
    topEntry?.onClose();
  }
}

function addListener() {
  if (!listening) {
    document.addEventListener("pointerdown", handlePointerDown, true);
    listening = true;
  }
}

function removeListener() {
  document.removeEventListener("pointerdown", handlePointerDown, true);
  listening = false;
}

export { createOutsideClickHandler };
