import { cn } from "@packages/util/css";
import { createEffect, splitProps } from "solid-js";

import {
  CHECKBOX_BASE_STYLE,
  CHECKBOX_INDETERMINATE_STYLE,
  CHECKBOX_STYLE,
  SWITCH_STYLE,
} from "./_checkbox.style";

type BaseCheckboxProps = {
  "data-testid"?: string;
  "aria-label"?: string;

  id?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  invalidId?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

type IndeterminateCheckboxProps = Omit<BaseCheckboxProps, "name" | "value"> & {
  indeterminate?: boolean;
};

function Checkbox(props: BaseCheckboxProps) {
  return <BaseCheckbox class={CHECKBOX_STYLE} {...props} />;
}

function IndeterminateCheckbox(props: IndeterminateCheckboxProps) {
  const [local, rest] = splitProps(props, ["indeterminate"]);

  // biome-ignore lint/suspicious/noUnassignedVariables: FALSE_POSITIVE
  let inputRef!: HTMLInputElement;

  createEffect(() => {
    inputRef.indeterminate = local.indeterminate ?? false;
  });

  return (
    <BaseCheckbox
      // v8 ignore start
      ref={inputRef}
      // v8 ignore end
      class={CHECKBOX_INDETERMINATE_STYLE}
      aria-checked={local.indeterminate ? "mixed" : undefined}
      {...rest}
    />
  );
}

function Switch(props: BaseCheckboxProps) {
  return <BaseCheckbox role="switch" class={SWITCH_STYLE} {...props} />;
}

function BaseCheckbox(
  props: BaseCheckboxProps & {
    ref?: HTMLInputElement;
    class: string;
    role?: "switch";
    "aria-checked"?: "mixed";
  },
) {
  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <input
      data-testid={props["data-testid"]}
      aria-label={props["aria-label"]}
      ref={props.ref}
      class={cn(CHECKBOX_BASE_STYLE, props.class)}
      type="checkbox"
      role={props.role}
      id={props.id}
      name={props.name}
      value={props.value ?? "on"}
      disabled={props.disabled}
      required={props.required}
      checked={props.checked}
      aria-readonly={props.readonly || undefined}
      aria-invalid={props.invalid || undefined}
      aria-checked={props["aria-checked"]}
      aria-describedby={props.invalid ? props.invalidId : undefined}
      onInput={(e) => props.onCheckedChange?.(e.currentTarget.checked)}
      onClick={(e) => {
        if (props.readonly) {
          e.preventDefault();
        }
      }}
    />
  );
}

export type { BaseCheckboxProps, IndeterminateCheckboxProps };
export { Checkbox, IndeterminateCheckbox, Switch };
