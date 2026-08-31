import type { Orientation } from "../../_model/type";

import { cn } from "@packages/util/css";

import { SEPARATOR_BASE, SEPARATOR_ORIENTATION } from "./_separator.style";

const DEFAULT_ORIENTATION: Orientation = "horizontal";

function Separator(props: {
  "data-testid"?: string;
  orientation?: Orientation;
  class?: string;
}) {
  const orientation = () => props.orientation ?? DEFAULT_ORIENTATION;

  return (
    <div
      data-testid={props["data-testid"]}
      aria-hidden="true"
      class={cn(
        SEPARATOR_BASE,
        SEPARATOR_ORIENTATION[orientation()],
        props.class,
      )}
    />
  );
}

export { DEFAULT_ORIENTATION, Separator };
