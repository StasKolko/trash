import type { Accessor } from "solid-js";

import { createEffect, onCleanup } from "solid-js";

let lockCount = 0;
let savedStyles: {
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
} | null = null;
let savedScrollY = 0;

function createScrollLock(open: Accessor<boolean>) {
  createEffect(() => {
    if (open()) {
      if (lockCount === 0) {
        lock();
      }
      lockCount++;

      onCleanup(() => {
        lockCount--;
        if (lockCount === 0) {
          unlock();
        }
      });
    }
  });
}

function lock() {
  savedScrollY = window.scrollY;
  savedStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    left: document.body.style.left,
    right: document.body.style.right,
    width: document.body.style.width,
  };

  Object.assign(document.body.style, {
    overflow: "hidden",
    position: "fixed",
    top: `-${savedScrollY}px`,
    left: "0",
    right: "0",
    width: "100%",
  });
}

function unlock() {
  Object.assign(document.body.style, savedStyles);
  savedStyles = null;
  window.scrollTo(0, savedScrollY);
}

export { createScrollLock };
