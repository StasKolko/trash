import type { FieldMeta } from "./_fingerprint-field";

import {
  NumberInputField,
  SelectField,
  SwitchField,
  TextareaField,
  TextInputField,
} from "@packages/ui/form";
import { Show } from "solid-js";

type FieldRowProps = {
  field: FieldMeta;
  editing: boolean;
  value: unknown;
  languagesText: string;
  onFieldChange: (key: string, value: unknown) => void;
  onLanguagesChange: (value: string) => void;
};

function FieldRow(props: FieldRowProps) {
  const { field } = props;

  return (
    <>
      <Show when={field.type === "text"}>
        <Show
          when={props.editing}
          fallback={
            <ReadOnlyField
              label={field.label}
              value={String(props.value ?? "—")}
            />
          }
        >
          <TextInputField
            type="text"
            label={field.label}
            value={(props.value as string) ?? ""}
            onValueChange={(v) => props.onFieldChange(field.key, v)}
            required={field.required}
          />
        </Show>
      </Show>

      <Show when={field.type === "textarea"}>
        <Show
          when={props.editing}
          fallback={
            <ReadOnlyField
              label={field.label}
              value={String(props.value ?? "—")}
              wrap={true}
            />
          }
        >
          <TextareaField
            label={field.label}
            value={(props.value as string) ?? ""}
            onValueChange={(v) => props.onFieldChange(field.key, v)}
            required={field.required}
            disabled={false}
            readonly={false}
            name={field.key}
            maxLength={field.max ?? 0}
            minLength={field.min ?? 0}
            placeholder=""
            counterLabel={(current, max) => `${current}/${max}`}
          />
        </Show>
      </Show>

      <Show when={field.type === "number"}>
        <Show
          when={props.editing}
          fallback={
            <ReadOnlyField
              label={field.label}
              value={String(props.value ?? "—")}
            />
          }
        >
          <NumberInputField
            label={field.label}
            value={(props.value as number) ?? 0}
            onValueChange={(v) => props.onFieldChange(field.key, v)}
            required={field.required}
          />
        </Show>
      </Show>

      <Show when={field.type === "select" && field.options}>
        <Show
          when={props.editing}
          fallback={
            <ReadOnlyField
              label={field.label}
              value={String(props.value ?? "—")}
            />
          }
        >
          <SelectField
            label={field.label}
            value={String(props.value ?? "")}
            onValueChange={(v) => {
              const parsed = Number(v);
              props.onFieldChange(field.key, Number.isNaN(parsed) ? v : parsed);
            }}
            options={(field.options ?? []).map((o) => ({
              value: String(o),
              label: String(o),
            }))}
            required={field.required}
          />
        </Show>
      </Show>

      <Show when={field.type === "boolean"}>
        <Show
          when={props.editing}
          fallback={
            <ReadOnlyField
              label={field.label}
              value={props.value ? "Yes" : "No"}
            />
          }
        >
          <SwitchField
            label={field.label}
            checked={(props.value as boolean) ?? false}
            onCheckedChange={(v) => props.onFieldChange(field.key, v)}
          />
        </Show>
      </Show>

      <Show when={field.type === "multi-text"}>
        <Show
          when={props.editing}
          fallback={
            <ReadOnlyField
              label={field.label}
              value={(props.value as string[])?.join(", ") ?? "—"}
            />
          }
        >
          <TextInputField
            type="text"
            label={`${field.label} (comma-separated)`}
            value={props.languagesText}
            onValueChange={props.onLanguagesChange}
            required={field.required}
            placeholder="en-US, en"
          />
        </Show>
      </Show>
    </>
  );
}

function ReadOnlyField(props: {
  label: string;
  value: string;
  wrap?: boolean;
}) {
  return (
    <div class="space-y-1">
      <div class="text-xs font-medium text-subtle">{props.label}</div>
      <div
        class={`text-sm text-foreground ${props.wrap ? "break-all whitespace-pre-wrap" : "break-all"}`}
      >
        {props.value}
      </div>
    </div>
  );
}

export { FieldRow };
