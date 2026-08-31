import type { JSX } from "solid-js";

import { cn } from "@packages/util/css";

import { DISABLED } from "../../_model/style";
import {
  LABEL_INTERACTIVE_STYLE,
  LABEL_REQUIRED_HIDDEN_STYLE,
  LABEL_ROOT_STYLE,
} from "./_label.style";

export function Label(props: {
  "data-testid"?: string;
  for: string;
  children: JSX.Element;
  disabled?: boolean;
  required?: boolean;
  readonly?: boolean;
}) {
  const isInteractive = () => !(props.disabled || props.readonly);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: FALSE_POSITIVE
    // biome-ignore lint/a11y/useKeyWithClickEvents: FALSE_POSITIVE
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <label
      data-testid={props["data-testid"]}
      for={props.for}
      class={cn(
        LABEL_ROOT_STYLE,
        props.disabled && DISABLED,
        isInteractive() && LABEL_INTERACTIVE_STYLE,
        !props.required && LABEL_REQUIRED_HIDDEN_STYLE,
      )}
      onClick={(e) => {
        if (!isInteractive()) {
          e.preventDefault();
        }
      }}
    >
      {props.children}
    </label>
  );
}
