import type { JSX } from "solid-js";

import { createUniqueId, For } from "solid-js";

type NativeSelectFieldProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
};

const LABEL_STYLE = "text-[13px] font-medium text-foreground";

const SELECT_STYLE = [
  "w-full h-[36px] px-[12px]",
  "bg-control rounded-lg",
  "border border-control-border",
  "text-[14px] text-foreground",
  "outline-none",
  "focus:ring-2 focus:ring-ring",
  "transition-[border-color,box-shadow] duration-150",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

function NativeSelectField(props: NativeSelectFieldProps): JSX.Element {
  const id = createUniqueId();

  return (
    <div class="space-y-1.5">
      {/* biome-ignore lint/correctness/noRestrictedElements: internal primitive */}
      <label for={id} class={LABEL_STYLE}>
        {props.label}
      </label>
      <select
        id={id}
        class={SELECT_STYLE}
        value={props.value}
        required={props.required}
        disabled={props.disabled}
        onChange={(e) => props.onValueChange(e.currentTarget.value)}
      >
        <For each={props.options}>
          {(option) => <option value={option.value}>{option.label}</option>}
        </For>
      </select>
    </div>
  );
}

export { NativeSelectField };
