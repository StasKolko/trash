import type { JSX } from "solid-js";

import type { SemanticVariant } from "../../_model/type";
import type { InternalToast } from "./toaster.type";

import { cn } from "@packages/util/css";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-solid";
import { createEffect, on, onCleanup } from "solid-js";

import { ToastProgress } from "./_toast-progress";
import {
  TOAST_DURATION,
  TOAST_EVICT_DURATION,
  TOAST_EXIT_DURATION,
  TOAST_PROGRESS_INTERVAL,
} from "./_toaster.constant";
import {
  dismissToast,
  pauseToast,
  removeToast,
  resumeToast,
  tickElapsed,
} from "./_toaster.store";
import {
  TOAST_CLOSE_BUTTON_STYLE,
  TOAST_ICON_STYLE,
  TOAST_ROOT_STYLE,
  TOAST_TITLE_STYLE,
  TOAST_VARIANT_STYLE,
} from "./_toaster.style";
import { getPhaseStyle, getTransitionStyle } from "./_toaster.util";

const VARIANT_ICONS: Record<SemanticVariant, () => JSX.Element> = {
  success: () => <CheckCircle2 aria-hidden="true" />,
  error: () => <AlertCircle aria-hidden="true" />,
  warning: () => <AlertTriangle aria-hidden="true" />,
  info: () => <Info aria-hidden="true" />,
};

export function ToastItem(props: { toast: InternalToast }) {
  const id = props.toast.id;

  createEffect(() => {
    const phase = props.toast.phase;
    if (phase !== "visible" && phase !== "entering") {
      return;
    }

    const interval = setInterval(() => {
      if (!props.toast.paused) {
        tickElapsed(id, TOAST_PROGRESS_INTERVAL);
      }
    }, TOAST_PROGRESS_INTERVAL);

    onCleanup(() => clearInterval(interval));
  });

  createEffect(() => {
    if (
      props.toast.elapsed >= TOAST_DURATION
      && props.toast.phase !== "exiting-right"
      && props.toast.phase !== "evicting"
      && props.toast.phase !== "settling"
    ) {
      dismissToast(id);
    }
  });

  createEffect(
    on(
      () => props.toast.phase,
      (phase) => {
        if (phase === "exiting-right") {
          const timer = setTimeout(() => removeToast(id), TOAST_EXIT_DURATION);
          onCleanup(() => clearTimeout(timer));
        }
        if (phase === "evicting") {
          const timer = setTimeout(() => removeToast(id), TOAST_EVICT_DURATION);
          onCleanup(() => clearTimeout(timer));
        }
      },
    ),
  );

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: FALSE_POSITIVE
    <output
      data-testid="Toast"
      data-variant={props.toast.variant}
      data-phase={props.toast.phase}
      class={cn(TOAST_ROOT_STYLE, TOAST_VARIANT_STYLE[props.toast.variant])}
      style={{
        ...getPhaseStyle(props.toast.phase),
        transition: getTransitionStyle(props.toast.phase),
      }}
      onMouseEnter={() => pauseToast(id)}
      onMouseLeave={() => resumeToast(id)}
    >
      <span data-testid="ToastIcon" class={TOAST_ICON_STYLE}>
        {VARIANT_ICONS[props.toast.variant]()}
      </span>

      <span data-testid="ToastTitle" class={TOAST_TITLE_STYLE}>
        {props.toast.title}
      </span>

      {/* biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation */}
      <button
        type="button"
        data-testid="ToastClose"
        class={TOAST_CLOSE_BUTTON_STYLE}
        tabindex={-1}
        onClick={() => dismissToast(id)}
      >
        <X aria-hidden="true" size={14} />
      </button>

      <ToastProgress toast={props.toast} />
    </output>
  );
}
