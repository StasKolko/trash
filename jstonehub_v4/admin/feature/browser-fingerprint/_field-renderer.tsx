import type { FieldMeta } from "./_fingerprint-field";

import {
  NumberInputField,
  SwitchField,
  TextareaField,
  TextInputField,
} from "@packages/ui/form";
import { Show } from "solid-js";

import { NativeSelectField } from "./_native-select-field";

type FieldRendererProps = {
  field: FieldMeta;
  value: unknown;
  onValueChange: (value: unknown) => void;
  languagesText: string;
  onLanguagesChange: (value: string) => void;
};

function FieldRenderer(props: FieldRendererProps) {
  return (
    <>
      <Show when={props.field.type === "text"}>
        <TextInputField
          type="text"
          label={props.field.label}
          value={(props.value as string) ?? ""}
          onValueChange={props.onValueChange}
          required={props.field.required}
        />
      </Show>
      <Show when={props.field.type === "textarea"}>
        <TextareaField
          label={props.field.label}
          value={(props.value as string) ?? ""}
          onValueChange={(v) => props.onValueChange(v)}
          required={props.field.required}
          disabled={false}
          readonly={false}
          name={props.field.key}
          maxLength={props.field.max ?? 0}
          minLength={props.field.min ?? 0}
          placeholder=""
          counterLabel={(current, max) => `${current}/${max}`}
        />
      </Show>
      <Show when={props.field.type === "number"}>
        <NumberInputField
          label={props.field.label}
          value={(props.value as number) ?? 0}
          onValueChange={props.onValueChange}
          required={props.field.required}
        />
      </Show>
      <Show when={props.field.type === "select" && props.field.options}>
        <NativeSelectField
          label={props.field.label}
          value={String(props.value ?? "")}
          onValueChange={(v) => {
            const parsed = Number(v);
            props.onValueChange(Number.isNaN(parsed) ? v : parsed);
          }}
          options={(props.field.options ?? []).map((o) => ({
            value: String(o),
            label: String(o),
          }))}
          required={props.field.required}
        />
      </Show>
      <Show when={props.field.type === "boolean"}>
        <SwitchField
          label={props.field.label}
          checked={(props.value as boolean) ?? false}
          onCheckedChange={props.onValueChange}
        />
      </Show>
      <Show when={props.field.type === "multi-text"}>
        <TextInputField
          type="text"
          label={`${props.field.label} (comma-separated)`}
          value={props.languagesText}
          onValueChange={props.onLanguagesChange}
          required={props.field.required}
          placeholder="en-US, en"
        />
      </Show>
    </>
  );
}

export { FieldRenderer };
