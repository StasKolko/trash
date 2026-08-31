import type { ToastPhase } from "./toaster.type";

import { assertNever } from "@packages/util/assert";

import {
  TOAST_ENTER_DURATION,
  TOAST_EVICT_DURATION,
  TOAST_EXIT_DURATION,
} from "./_toaster.constant";

const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_IN = "ease-in";
const EASE_SNAP = "cubic-bezier(0.4, 0, 0.2, 1)";

const EVICT_OPACITY_DURATION_RATIO = 0.5;

function getPhaseStyle(phase: ToastPhase): Record<string, string> {
  switch (phase) {
    case "entering":
      return {
        opacity: "0",
        transform: "translateY(-16px) scale(0.95)",
      };
    case "visible":
      return {
        opacity: "1",
        transform: "translateY(0) scale(1)",
      };
    case "settling":
      return {
        opacity: "1",
        transform: "translateY(0) scale(1)",
      };
    case "exiting-right":
      return {
        opacity: "0",
        transform: "translateX(120%) scale(0.96)",
      };
    case "evicting":
      return {
        opacity: "0",
        transform: "scale(0.85)",
        "max-height": "0px",
        "margin-bottom": "-8px",
        "padding-top": "0px",
        "padding-bottom": "0px",
        overflow: "hidden",
      };
    // v8 ignore start
    default:
      assertNever(phase);
    // v8 ignore end
  }
}

function getTransitionStyle(phase: ToastPhase): string {
  switch (phase) {
    case "entering":
      return "none";
    case "visible":
      return [
        `opacity ${TOAST_ENTER_DURATION}ms ${EASE_OUT_EXPO}`,
        `transform ${TOAST_ENTER_DURATION}ms ${EASE_OUT_EXPO}`,
      ].join(", ");
    case "settling":
      return [
        `opacity ${TOAST_ENTER_DURATION}ms ${EASE_OUT_EXPO}`,
        `transform ${TOAST_ENTER_DURATION}ms ${EASE_OUT_EXPO}`,
      ].join(", ");
    case "exiting-right":
      return [
        `opacity ${TOAST_EXIT_DURATION}ms ${EASE_IN}`,
        `transform ${TOAST_EXIT_DURATION}ms ${EASE_IN}`,
      ].join(", ");
    case "evicting":
      return [
        `opacity ${TOAST_EVICT_DURATION * EVICT_OPACITY_DURATION_RATIO}ms ${EASE_SNAP}`,
        `transform ${TOAST_EVICT_DURATION}ms ${EASE_SNAP}`,
        `max-height ${TOAST_EVICT_DURATION}ms ${EASE_SNAP}`,
        `margin-bottom ${TOAST_EVICT_DURATION}ms ${EASE_SNAP}`,
        `padding ${TOAST_EVICT_DURATION}ms ${EASE_SNAP}`,
      ].join(", ");
    // v8 ignore start
    default:
      assertNever(phase);
    // v8 ignore end
  }
}

export { getPhaseStyle, getTransitionStyle };
