import type { InternalToast } from "./toaster.type";

import { cn } from "@packages/util/css";
import { createMemo } from "solid-js";

import { TOAST_DURATION } from "./_toaster.constant";
import {
  TOAST_PROGRESS_BAR_STYLE,
  TOAST_PROGRESS_TRACK_STYLE,
  TOAST_PROGRESS_VARIANT_STYLE,
} from "./_toaster.style";

const PROGRESS_PERCENT_MAX = 100;

export function ToastProgress(props: { toast: InternalToast }) {
  const progressPercent = createMemo(() => {
    const remaining = Math.max(0, TOAST_DURATION - props.toast.elapsed);
    return (remaining / TOAST_DURATION) * PROGRESS_PERCENT_MAX;
  });

  return (
    <div class={TOAST_PROGRESS_TRACK_STYLE}>
      <div
        data-testid="ToastProgress"
        class={cn(
          TOAST_PROGRESS_BAR_STYLE,
          TOAST_PROGRESS_VARIANT_STYLE[props.toast.variant],
        )}
        style={{ width: `${progressPercent()}%` }}
      />
    </div>
  );
}
