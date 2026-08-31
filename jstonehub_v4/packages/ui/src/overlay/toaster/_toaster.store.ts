import type { SemanticVariant } from "../../_model/type";
import type { InternalToast } from "./toaster.type";

import { createStore, produce } from "solid-js/store";

import { TOAST_MAX_COUNT, TOAST_SETTLE_DURATION } from "./_toaster.constant";

let nextId = 1;
const [store, setStore] = createStore<{ toasts: InternalToast[] }>({
  toasts: [],
});

function findIndex(id: number): number {
  return store.toasts.findIndex((t) => t.id === id);
}

function addToast(variant: SemanticVariant, title: string) {
  const id = nextId++;
  const settlingIds: number[] = [];

  setStore(
    produce((s) => {
      s.toasts.unshift({
        id,
        variant,
        title,
        phase: "entering",
        elapsed: 0,
        paused: false,
      });

      let activeCount = 0;
      for (const t of s.toasts) {
        if (
          t.phase !== "exiting-right"
          && t.phase !== "evicting"
          && t.phase !== "settling"
        ) {
          activeCount++;
          if (activeCount > TOAST_MAX_COUNT) {
            t.phase = "settling";
            settlingIds.push(t.id);
          }
        }
      }
    }),
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const idx = findIndex(id);
      if (idx !== -1 && store.toasts[idx].phase === "entering") {
        setStore("toasts", idx, "phase", "visible");
      }
    });
  });

  for (const settlingId of settlingIds) {
    setTimeout(() => {
      const idx = findIndex(settlingId);
      if (idx !== -1 && store.toasts[idx].phase === "settling") {
        setStore("toasts", idx, "phase", "evicting");
      }
    }, TOAST_SETTLE_DURATION);
  }
}

function dismissToast(id: number) {
  const idx = findIndex(id);
  if (idx === -1) {
    return;
  }
  const phase = store.toasts[idx].phase;
  if (
    phase !== "exiting-right"
    && phase !== "evicting"
    && phase !== "settling"
  ) {
    setStore("toasts", idx, "phase", "exiting-right");
  }
}

function removeToast(id: number) {
  setStore(
    produce((s) => {
      const idx = s.toasts.findIndex((t) => t.id === id);
      if (idx !== -1) {
        s.toasts.splice(idx, 1);
      }
    }),
  );
}

function pauseToast(id: number) {
  const idx = findIndex(id);
  if (idx !== -1) {
    setStore("toasts", idx, "paused", true);
  }
}

function resumeToast(id: number) {
  const idx = findIndex(id);
  if (idx !== -1) {
    setStore("toasts", idx, "paused", false);
  }
}

function tickElapsed(id: number, delta: number) {
  const idx = findIndex(id);
  if (idx !== -1 && !store.toasts[idx].paused) {
    setStore("toasts", idx, "elapsed", store.toasts[idx].elapsed + delta);
  }
}

const toast = {
  success: (title: string) => addToast("success", title),
  error: (title: string) => addToast("error", title),
  warning: (title: string) => addToast("warning", title),
  info: (title: string) => addToast("info", title),
};

export {
  dismissToast,
  pauseToast,
  removeToast,
  resumeToast,
  store,
  tickElapsed,
  toast,
};
