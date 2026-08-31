import { cn } from "@packages/util/css";

import classes from "./_loader.module.css";

const DEFAULT_STROKE_WIDTH = 6;

function Loader(props: {
  "data-testid"?: string;
  size: number;
  strokeWidth?: number;
  class?: string;
}) {
  const strokeWidth = () => props.strokeWidth ?? DEFAULT_STROKE_WIDTH;

  return (
    <svg
      data-testid={props["data-testid"]}
      aria-hidden="true"
      viewBox="25 25 50 50"
      width={props.size}
      height={props.size}
      class={cn(classes.rotate, props.class)}
    >
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke="currentColor"
        stroke-width={strokeWidth()}
        stroke-linecap="round"
        class={classes.dash}
      />
    </svg>
  );
}

export { DEFAULT_STROKE_WIDTH, Loader };
