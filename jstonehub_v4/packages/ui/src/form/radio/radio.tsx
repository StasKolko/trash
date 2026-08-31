import { cn } from "@packages/util/css";

import { RADIO_BASE_STYLE, RADIO_STYLE } from "./_radio.style";

export type RadioProps = {
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

export function Radio(props: RadioProps) {
  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: FALSE_POSITIVE
    <input
      data-testid={props["data-testid"]}
      aria-label={props["aria-label"]}
      class={cn(RADIO_BASE_STYLE, RADIO_STYLE)}
      type="radio"
      id={props.id}
      name={props.name}
      value={props.value ?? "on"}
      disabled={props.disabled}
      required={props.required}
      checked={props.checked}
      aria-readonly={props.readonly || undefined}
      aria-invalid={props.invalid || undefined}
      aria-describedby={props.invalid ? props.invalidId : undefined}
      onChange={(e) => props.onCheckedChange?.(e.currentTarget.checked)}
      onClick={(e) => {
        if (props.readonly) {
          e.preventDefault();
        }
      }}
    />
  );
}
