import { createUniqueId } from "solid-js";

import { IndeterminateCheckbox } from "../checkbox/checkbox";
import {
  MULTI_SELECT_HEADER_LABEL_STYLE,
  MULTI_SELECT_HEADER_STYLE,
} from "./_select.style";

type SelectAllState = "none" | "some" | "all";

export function MultiSelectHeader(props: {
  state: SelectAllState;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const id = createUniqueId();

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <label for={id} class={MULTI_SELECT_HEADER_STYLE}>
      <IndeterminateCheckbox
        id={id}
        checked={props.state === "all"}
        indeterminate={props.state === "some"}
        disabled={props.disabled}
        onCheckedChange={props.onToggle}
      />
      <span class={MULTI_SELECT_HEADER_LABEL_STYLE}>{props.label}</span>
    </label>
  );
}

export type { SelectAllState };
