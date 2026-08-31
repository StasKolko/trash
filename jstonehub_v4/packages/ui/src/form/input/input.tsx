import type { JSX } from "solid-js";

import { cn } from "@packages/util/css";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-solid";
import { createSignal, Show, splitProps } from "solid-js";

import { IconButton } from "../../action/button/button";
import {
  INPUT_ROOT_STYLE,
  INPUT_WRAPPER_STYLE,
  NUMBER_BUTTON_BOTTOM_STYLE,
  NUMBER_BUTTON_TOP_STYLE,
  NUMBER_BUTTON_WRAPPER_STYLE,
  NUMBER_INPUT_STYLE,
  PASSWORD_TOGGLE_STYLE,
} from "./_input.style";

type HtmlInputElement = JSX.InputHTMLAttributes<HTMLInputElement>;
type InputMode = HtmlInputElement["inputmode"];
type InputType = HtmlInputElement["type"];
type InputAutocomplete = HtmlInputElement["autocomplete"];

type BaseInputProps = {
  "data-testid"?: string;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
  id: string;
  name?: string;

  placeholder?: string;

  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;

  invalid?: boolean;
  invalidId?: string;

  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
};

type InputProps = BaseInputProps & {
  value?: string;
  onValueChange?: (value: string) => void;
};

type PasswordInputProps = InputProps & {
  "data-toggle-testid"?: string;
  autocomplete?: "current-password" | "new-password";
  showPasswordLabel: string;
  hidePasswordLabel: string;
};

type NumberInputProps = BaseInputProps & {
  "data-increment-testid"?: string;
  "data-decrement-testid"?: string;
  inputmode?: "numeric" | "decimal";

  min?: number;
  max?: number;
  step?: number;

  value?: number;
  onValueChange?: (value: number | undefined) => void;
};

type TextInputProps = InputProps & {
  type: "text" | "url" | "email" | "tel";
  autocomplete?: InputAutocomplete;
  minLength?: number;
  maxLength?: number;
};

function PasswordInput(props: PasswordInputProps) {
  const [local, rest] = splitProps(props, [
    "hidePasswordLabel",
    "showPasswordLabel",
  ]);

  const [showPassword, setShowPassword] = createSignal(false);
  const toggleAriaLabel = () =>
    showPassword() ? local.hidePasswordLabel : local.showPasswordLabel;
  const toggleType = () => (showPassword() ? "text" : "password");
  const handleToggleClick = () => setShowPassword((prev) => !prev);

  return (
    <div class={INPUT_WRAPPER_STYLE}>
      <Input
        type={toggleType()}
        inputmode="text"
        autocomplete={props.autocomplete ?? "current-password"}
        {...rest}
      />

      <IconButton
        data-testid={props["data-toggle-testid"]}
        variant="ghost"
        size="sm"
        class={PASSWORD_TOGGLE_STYLE}
        disabled={props.disabled}
        aria-label={toggleAriaLabel()}
        onClick={handleToggleClick}
      >
        <Show
          when={showPassword()}
          fallback={<Eye aria-hidden="true" size={16} />}
        >
          <EyeOff aria-hidden="true" size={16} />
        </Show>
      </IconButton>
    </div>
  );
}

function NumberInput(props: NumberInputProps) {
  const [local, rest] = splitProps(props, ["onValueChange", "value"]);

  const min = () => props.min ?? 0;
  const max = () => props.max ?? Number.MAX_SAFE_INTEGER;
  const step = () => props.step ?? 1;

  const stringValue = () =>
    local.value === undefined ? "" : String(local.value);

  function incrementValue() {
    const current = local.value ?? min();
    const newValue = roundToStep(current + step(), step());
    local.onValueChange?.(Math.min(newValue, max()));
  }

  function decrementValue() {
    const current = local.value ?? min();
    const newValue = roundToStep(current - step(), step());
    local.onValueChange?.(Math.max(newValue, min()));
  }

  function handleValueChange(newValue: string) {
    if (newValue === "" || newValue === "-" || newValue === ".") {
      local.onValueChange?.(undefined);
      return;
    }

    const numberValue = Number(newValue);
    const clamped = Math.min(Math.max(numberValue, min()), max());
    const rounded = roundToStep(clamped, step());
    local.onValueChange?.(rounded);
  }

  return (
    <div class={INPUT_WRAPPER_STYLE}>
      <Input
        value={stringValue()}
        onValueChange={handleValueChange}
        type="number"
        inputmode={props.inputmode ?? "numeric"}
        min={min()}
        max={max()}
        step={step()}
        class={NUMBER_INPUT_STYLE}
        {...rest}
      />

      <div class={NUMBER_BUTTON_WRAPPER_STYLE} aria-hidden="true">
        {/* biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation */}
        <button
          data-testid={props["data-increment-testid"]}
          type="button"
          class={NUMBER_BUTTON_TOP_STYLE}
          disabled={props.disabled || props.readonly}
          tabindex={-1}
          onClick={incrementValue}
        >
          <ChevronUp size={14} />
        </button>
        {/* biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation */}
        <button
          data-testid={props["data-decrement-testid"]}
          type="button"
          class={NUMBER_BUTTON_BOTTOM_STYLE}
          disabled={props.disabled || props.readonly}
          tabindex={-1}
          onClick={decrementValue}
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}

function TextInput(props: TextInputProps) {
  return (
    <Input
      {...props}
      inputmode={props.type}
      autocomplete={props.autocomplete}
      minLength={props.minLength}
      maxLength={props.maxLength}
    />
  );
}

function Input(
  props: InputProps & {
    class?: string;

    type: InputType;
    inputmode?: InputMode;

    autocomplete?: InputAutocomplete;

    minLength?: number;
    maxLength?: number;

    min?: number;
    max?: number;
    step?: number;
  },
) {
  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <input
      // v8 ignore start
      ref={props.ref}
      // v8 ignore end
      data-testid={props["data-testid"]}
      class={cn(INPUT_ROOT_STYLE, props.class)}
      id={props.id}
      name={props.name}
      type={props.type}
      inputmode={props.inputmode}
      disabled={props.disabled}
      required={props.required}
      readonly={props.readonly}
      aria-readonly={props.readonly || undefined}
      aria-invalid={props.invalid || undefined}
      aria-describedby={props.invalid ? props.invalidId : undefined}
      placeholder={props.placeholder}
      autocomplete={props.autocomplete}
      minlength={props.minLength}
      maxlength={props.maxLength}
      min={props.min}
      max={props.max}
      step={props.step}
      value={props.value}
      onInput={(e) => props.onValueChange?.(e.currentTarget.value)}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
}

function roundToStep(value: number, step: number): number {
  const decimals = getDecimalPlaces(step);
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function getDecimalPlaces(step: number) {
  const stepStr = String(step);
  const decimalIndex = stepStr.indexOf(".");
  return decimalIndex === -1 ? 0 : stepStr.length - decimalIndex - 1;
}

export type {
  InputProps,
  NumberInputProps,
  PasswordInputProps,
  TextInputProps,
};
export { Input, NumberInput, PasswordInput, TextInput };
