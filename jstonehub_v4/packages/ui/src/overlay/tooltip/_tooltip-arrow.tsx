import type { Accessor } from "solid-js";

import type { TooltipPosition } from "./_tooltip.type";

import { Show } from "solid-js";

import { FloatingArrow } from "../_floating-arrow/floating-arrow";
import {
  TOOLTIP_ARROW_INNER_BACKGROUND,
  TOOLTIP_ARROW_OUTER_BACKGROUND,
} from "./_tooltip.style";

export function TooltipArrow(props: {
  "data-testid"?: string;
  position: Accessor<TooltipPosition | null>;
}) {
  return (
    <Show when={props.position()}>
      {(pos) => (
        <FloatingArrow
          data-testid={props["data-testid"]}
          side={pos().side}
          align={pos().align}
          outerBackground={TOOLTIP_ARROW_OUTER_BACKGROUND}
          innerBackground={TOOLTIP_ARROW_INNER_BACKGROUND}
        />
      )}
    </Show>
  );
}
