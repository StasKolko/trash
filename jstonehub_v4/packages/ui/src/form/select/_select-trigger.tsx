import { cn } from "@packages/util/css";
import { ChevronDown } from "lucide-solid";
import { Show } from "solid-js";

import {
  SELECT_TRIGGER_ICON_OPEN_STYLE,
  SELECT_TRIGGER_ICON_SIZE,
  SELECT_TRIGGER_ICON_STYLE,
  SELECT_TRIGGER_PLACEHOLDER_STYLE,
  SELECT_TRIGGER_STYLE,
  SELECT_TRIGGER_VALUE_STYLE,
} from "./_select.style";

export function SelectTrigger(props: {
  "data-testid"?: string;
  ref: HTMLButtonElement;
  open: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  invalidId?: string;
  placeholder?: string;
  displayValue: string | undefined;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}) {
  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: FALSE_POSITIVE
    <button
      data-testid={props["data-testid"]}
      // v8 ignore start
      ref={props.ref}
      // v8 ignore end
      type="button"
      class={SELECT_TRIGGER_STYLE}
      disabled={props.disabled}
      data-readonly={props.readonly || undefined}
      aria-required={props.required || undefined}
      aria-invalid={props.invalid || undefined}
      aria-describedby={props.invalid ? props.invalidId : undefined}
      aria-expanded={props.open}
      aria-haspopup="listbox"
      onClick={() => {
        if (!props.readonly) {
          props.onClick();
        }
      }}
      onKeyDown={props.onKeyDown}
    >
      <Show
        when={props.displayValue}
        fallback={
          <span class={SELECT_TRIGGER_PLACEHOLDER_STYLE}>
            {props.placeholder}
          </span>
        }
      >
        {(val) => <span class={SELECT_TRIGGER_VALUE_STYLE}>{val()}</span>}
      </Show>

      <ChevronDown
        aria-hidden="true"
        size={SELECT_TRIGGER_ICON_SIZE}
        class={cn(
          SELECT_TRIGGER_ICON_STYLE,
          props.open && SELECT_TRIGGER_ICON_OPEN_STYLE,
        )}
      />
    </button>
  );
}
