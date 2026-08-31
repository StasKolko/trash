import type {
  NumberInputProps,
  PasswordInputProps,
  TextInputProps,
} from "../input/input";
import type {
  MultiSelectProps as MultiSelectBaseProps,
  SearchableMultiSelectProps as SearchableMultiSelectBaseProps,
  SearchableSelectProps as SearchableSelectBaseProps,
  SelectProps as SelectBaseInputProps,
} from "../select/select.type";
import type { TextareaProps } from "../textarea/textarea";
import type {
  CheckboxGroupFieldProps,
  FieldBaseProps,
  RadioGroupFieldProps,
  ToggleFieldProps,
} from "./field.type";

import { cn } from "@packages/util/css";
import { createUniqueId, For } from "solid-js";

import { DISABLED } from "../../_model/style";
import { Checkbox, Switch } from "../checkbox/checkbox";
import { NumberInput, PasswordInput, TextInput } from "../input/input";
import { Radio } from "../radio/radio";
import { MultiSelect, SearchableMultiSelect } from "../select/multi-select";
import { SearchableSelect, Select } from "../select/select";
import { Textarea } from "../textarea/textarea";
import {
  FIELD_GROUP_GRID_STYLE,
  FIELD_GROUP_ITEM_LABEL_STYLE,
  FIELD_GROUP_ITEM_STYLE,
  FIELD_GROUP_ROOT_STYLE,
  FIELD_ROOT_STYLE,
  FIELD_TOGGLE_ROOT_STYLE,
} from "./_field.style";
import { FieldError } from "./_field-error";
import { FieldLabel } from "./_field-label";

// --- Text Input Field ---

type TextInputFieldProps = FieldBaseProps &
  Omit<TextInputProps, "id" | "invalid" | "invalidId">;

function TextInputField(props: TextInputFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_ROOT_STYLE}>
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <TextInput
        {...props}
        id={id}
        invalid={Boolean(props.error)}
        invalidId={errorId}
      />
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Number Input Field ---

type NumberInputFieldProps = FieldBaseProps &
  Omit<NumberInputProps, "id" | "invalid" | "invalidId">;

function NumberInputField(props: NumberInputFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_ROOT_STYLE}>
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <NumberInput
        {...props}
        id={id}
        invalid={Boolean(props.error)}
        invalidId={errorId}
      />
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Password Input Field ---

type PasswordInputFieldProps = FieldBaseProps &
  Omit<PasswordInputProps, "id" | "invalid" | "invalidId">;

function PasswordInputField(props: PasswordInputFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_ROOT_STYLE}>
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <PasswordInput
        {...props}
        id={id}
        invalid={Boolean(props.error)}
        invalidId={errorId}
      />
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Textarea Field ---

type TextareaFieldProps = FieldBaseProps &
  Omit<TextareaProps, "id" | "invalid">;

function TextareaField(props: TextareaFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_ROOT_STYLE}>
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <Textarea {...props} id={id} invalid={Boolean(props.error)} />
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Checkbox Field (single) ---

function CheckboxField(props: ToggleFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_TOGGLE_ROOT_STYLE}>
      <Checkbox
        aria-label={props["aria-label"]}
        id={id}
        name={props.name}
        value={props.value}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        checked={props.checked}
        onCheckedChange={props.onCheckedChange}
        invalid={Boolean(props.error)}
        invalidId={errorId}
      />
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Switch Field ---

function SwitchField(props: ToggleFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_TOGGLE_ROOT_STYLE}>
      <Switch
        aria-label={props["aria-label"]}
        id={id}
        name={props.name}
        value={props.value}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        checked={props.checked}
        onCheckedChange={props.onCheckedChange}
        invalid={Boolean(props.error)}
        invalidId={errorId}
      />
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Radio Group Field ---

function RadioGroupField(props: RadioGroupFieldProps) {
  const groupId = createUniqueId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset
      class={FIELD_GROUP_ROOT_STYLE}
      aria-labelledby={`${groupId}-legend`}
    >
      <FieldLabel
        for={groupId}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        <span id={`${groupId}-legend`}>{props.label}</span>
      </FieldLabel>

      <div class={FIELD_GROUP_GRID_STYLE}>
        <For each={props.items}>
          {(item) => {
            const itemId = createUniqueId();
            const isDisabled = () => props.disabled || item.disabled;

            return (
              <div class={FIELD_GROUP_ITEM_STYLE}>
                <Radio
                  id={itemId}
                  name={props.name}
                  value={item.value}
                  checked={props.value === item.value}
                  disabled={isDisabled()}
                  readonly={props.readonly}
                  onCheckedChange={() => props.onValueChange?.(item.value)}
                />
                {/* biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation */}
                <label
                  for={itemId}
                  class={cn(
                    FIELD_GROUP_ITEM_LABEL_STYLE,
                    isDisabled() && DISABLED,
                  )}
                >
                  {item.label}
                </label>
              </div>
            );
          }}
        </For>
      </div>

      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </fieldset>
  );
}

// --- Checkbox Group Field ---

function CheckboxGroupField(props: CheckboxGroupFieldProps) {
  const groupId = createUniqueId();
  const errorId = `${groupId}-error`;

  const isChecked = (itemValue: string) =>
    props.value?.includes(itemValue) ?? false;

  function handleItemChange(itemValue: string, checked: boolean) {
    const current = props.value ?? [];
    const next = checked
      ? [...current, itemValue]
      : current.filter((v) => v !== itemValue);
    props.onValueChange?.(next);
  }

  return (
    <fieldset
      class={FIELD_GROUP_ROOT_STYLE}
      aria-labelledby={`${groupId}-legend`}
    >
      <FieldLabel
        for={groupId}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        <span id={`${groupId}-legend`}>{props.label}</span>
      </FieldLabel>

      <div class={FIELD_GROUP_GRID_STYLE}>
        <For each={props.items}>
          {(item) => {
            const itemId = createUniqueId();
            const isDisabled = () => props.disabled || item.disabled;

            return (
              <div class={FIELD_GROUP_ITEM_STYLE}>
                <Checkbox
                  id={itemId}
                  name={props.name}
                  value={item.value}
                  checked={isChecked(item.value)}
                  disabled={isDisabled()}
                  readonly={props.readonly}
                  onCheckedChange={(checked) =>
                    handleItemChange(item.value, checked)
                  }
                />
                {/* biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation */}
                <label
                  for={itemId}
                  class={cn(
                    FIELD_GROUP_ITEM_LABEL_STYLE,
                    isDisabled() && DISABLED,
                  )}
                >
                  {item.label}
                </label>
              </div>
            );
          }}
        </For>
      </div>

      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </fieldset>
  );
}

// --- Select Field ---

type SelectFieldProps = FieldBaseProps &
  Omit<SelectBaseInputProps, "invalid" | "invalidId">;

function SelectField(props: SelectFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_ROOT_STYLE}>
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <Select {...props} invalid={Boolean(props.error)} invalidId={errorId} />
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Searchable Select Field ---

type SearchableSelectFieldProps = FieldBaseProps &
  Omit<SearchableSelectBaseProps, "invalid" | "invalidId">;

function SearchableSelectField(props: SearchableSelectFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_ROOT_STYLE}>
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <SearchableSelect
        {...props}
        invalid={Boolean(props.error)}
        invalidId={errorId}
      />
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Multi Select Field ---

type MultiSelectFieldProps = FieldBaseProps &
  Omit<MultiSelectBaseProps, "invalid" | "invalidId">;

function MultiSelectField(props: MultiSelectFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_ROOT_STYLE}>
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <MultiSelect
        {...props}
        invalid={Boolean(props.error)}
        invalidId={errorId}
      />
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

// --- Searchable Multi Select Field ---

type SearchableMultiSelectFieldProps = FieldBaseProps &
  Omit<SearchableMultiSelectBaseProps, "invalid" | "invalidId">;

function SearchableMultiSelectField(props: SearchableMultiSelectFieldProps) {
  const id = createUniqueId();
  const errorId = `${id}-error`;

  return (
    <div class={FIELD_ROOT_STYLE}>
      <FieldLabel
        for={id}
        info={props.info}
        required={props.required}
        disabled={props.disabled}
        readonly={props.readonly}
      >
        {props.label}
      </FieldLabel>
      <SearchableMultiSelect
        {...props}
        invalid={Boolean(props.error)}
        invalidId={errorId}
      />
      <FieldError id={errorId} show={Boolean(props.error)}>
        {props.error}
      </FieldError>
    </div>
  );
}

export type {
  MultiSelectFieldProps,
  NumberInputFieldProps,
  PasswordInputFieldProps,
  SearchableMultiSelectFieldProps,
  SearchableSelectFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
  TextInputFieldProps,
};
export {
  CheckboxField,
  CheckboxGroupField,
  MultiSelectField,
  NumberInputField,
  PasswordInputField,
  RadioGroupField,
  SearchableMultiSelectField,
  SearchableSelectField,
  SelectField,
  SwitchField,
  TextareaField,
  TextInputField,
};
