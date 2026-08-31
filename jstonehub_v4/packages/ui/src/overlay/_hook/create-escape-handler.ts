import type { Accessor } from "solid-js";

import { createEffect, onCleanup } from "solid-js";

const stack: (() => void)[] = [];

function createEscapeHandler(open: Accessor<boolean>, onClose: () => void) {
  createEffect(() => {
    if (open()) {
      if (stack.length === 0) {
        document.addEventListener("keydown", handleKeyDown);
      }
      stack.push(onClose);

      onCleanup(() => {
        const index = stack.lastIndexOf(onClose);
        stack.splice(index, 1);

        if (stack.length === 0) {
          document.removeEventListener("keydown", handleKeyDown);
        }
      });
    }
  });
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && stack.length > 0) {
    e.preventDefault();
    stack.at(-1)?.();
  }
}

export { createEscapeHandler };
