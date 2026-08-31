import type { JSX } from "solid-js";

import { Show } from "solid-js";

import { Label } from "../label/label";
import { FIELD_LABEL_ROW_STYLE } from "./_field.style";
import { InfoButton } from "./_info-button";

export function FieldLabel(props: {
  for: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  info?: JSX.Element;
  children: JSX.Element;
}) {
  return (
    <div class={FIELD_LABEL_ROW_STYLE}>
      <Label
        for={props.for}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
      >
        {props.children}
      </Label>
      <Show when={props.info}>{(info) => <InfoButton content={info()} />}</Show>
    </div>
  );
}
