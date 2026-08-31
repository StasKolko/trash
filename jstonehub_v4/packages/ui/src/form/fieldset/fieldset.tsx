import type { JSX } from "solid-js";

import { cn } from "@packages/util/css";

import {
  FIELDSET_BORDERLESS_STYLE,
  FIELDSET_LEGEND_STYLE,
  FIELDSET_ROOT_STYLE,
} from "./_fieldset.style";

type FieldsetProps = {
  "data-testid"?: string;
  legend: JSX.Element;
  class?: string;
  borderless?: boolean;
  disabled?: boolean;
  children: JSX.Element;
};

function Fieldset(props: FieldsetProps) {
  return (
    <fieldset
      data-testid={props["data-testid"]}
      class={cn(
        FIELDSET_ROOT_STYLE,
        props.borderless && FIELDSET_BORDERLESS_STYLE,
        props.class,
      )}
      disabled={props.disabled || undefined}
    >
      <legend class={FIELDSET_LEGEND_STYLE}>{props.legend}</legend>
      {props.children}
    </fieldset>
  );
}

export type { FieldsetProps };
export { Fieldset };
