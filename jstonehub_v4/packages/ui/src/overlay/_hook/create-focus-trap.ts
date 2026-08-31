import type { Accessor } from "solid-js";

import { focusFirstElement } from "@packages/util/dom";
import { createEffect, onCleanup } from "solid-js";

import { OVERLAY_ANIMATION_DURATION } from "../../_model/constant";

type FocusTrapEntry = {
  previouslyFocused: HTMLElement | null;
  getContainer: () => HTMLElement | undefined;
};

const stack: FocusTrapEntry[] = [];

function createFocusTrap(
  open: Accessor<boolean>,
  getContainer: () => HTMLElement | undefined,
) {
  createEffect(() => {
    if (open()) {
      const entry: FocusTrapEntry = {
        previouslyFocused: document.activeElement as HTMLElement | null,
        getContainer,
      };

      stack.push(entry);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (stack.at(-1) === entry) {
            focusFirstElement(getContainer());
          }
        });
      });

      onCleanup(() => {
        const index = stack.indexOf(entry);
        if (index < stack.length - 1) {
          stack[index + 1].previouslyFocused = entry.previouslyFocused;
        }
        stack.splice(index, 1);
        restoreFocus(entry);
      });
    }
  });
}

function restoreFocus(entry: FocusTrapEntry) {
  setTimeout(() => {
    if (stack.length > 0) {
      focusFirstElement(stack.at(-1)?.getContainer());
    } else {
      entry.previouslyFocused?.focus();
    }
  }, OVERLAY_ANIMATION_DURATION);
}

export { createFocusTrap };
