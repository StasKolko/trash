import type { Align, Side } from "../_model/type";

import {
  FLOATING_ARROW_INNER_TEST_ID,
  FLOATING_ARROW_OUTER_TEST_ID,
} from "./_floating-arrow.constant";
import {
  getInnerStyle,
  getOuterStyle,
  getWrapperStyle,
} from "./_floating-arrow.util";

export function FloatingArrow(props: {
  "data-testid"?: string;
  side: Side;
  align: Align;
  outerBackground: string;
  innerBackground: string;
}) {
  return (
    <span
      data-testid={props["data-testid"]}
      aria-hidden="true"
      class="absolute"
      style={getWrapperStyle(props.side, props.align)}
    >
      <span
        data-testid={FLOATING_ARROW_OUTER_TEST_ID}
        class={`absolute top-0 left-0 ${props.outerBackground}`}
        style={getOuterStyle(props.side)}
      />

      <span
        data-testid={FLOATING_ARROW_INNER_TEST_ID}
        class={`absolute ${props.innerBackground}`}
        style={getInnerStyle(props.side)}
      />
    </span>
  );
}
