import type { SelectOption } from "./select.type";

import { cn } from "@packages/util/css";
import { createUniqueId } from "solid-js";

import { Checkbox } from "../checkbox/checkbox";
import {
  MULTI_SELECT_OPTION_DISABLED_STYLE,
  MULTI_SELECT_OPTION_LABEL_STYLE,
  MULTI_SELECT_OPTION_STYLE,
} from "./_select.style";

export function MultiSelectOptionRow(props: {
  option: SelectOption;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = createUniqueId();
  const isDisabled = () => props.disabled || props.option.disabled;

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <label
      for={id}
      class={cn(
        MULTI_SELECT_OPTION_STYLE,
        isDisabled() && MULTI_SELECT_OPTION_DISABLED_STYLE,
      )}
    >
      <Checkbox
        id={id}
        checked={props.checked}
        disabled={isDisabled()}
        onCheckedChange={props.onCheckedChange}
      />
      <span class={MULTI_SELECT_OPTION_LABEL_STYLE}>{props.option.label}</span>
    </label>
  );
}
