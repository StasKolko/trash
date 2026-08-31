import type { JSX } from "solid-js";

import { Show } from "solid-js";

import { FIELD_ERROR_ROOT_STYLE } from "./_field-error.style";

export function FieldError(props: {
  id: string;
  show: boolean;
  children: JSX.Element;
}) {
  return (
    <Show when={props.show}>
      <span class={FIELD_ERROR_ROOT_STYLE} id={props.id} role="alert">
        {props.children}
      </span>
    </Show>
  );
}
