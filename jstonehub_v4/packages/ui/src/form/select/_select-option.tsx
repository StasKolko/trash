import type { SelectOption } from "./select.type";

import { cn } from "@packages/util/css";
import { Check } from "lucide-solid";

import {
  SELECT_OPTION_ACTIVE_STYLE,
  SELECT_OPTION_CHECK_SIZE,
  SELECT_OPTION_DISABLED_STYLE,
  SELECT_OPTION_STYLE,
} from "./_select.style";

export function SelectOptionRow(props: {
  option: SelectOption;
  active: boolean;
  onSelect: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}) {
  return (
    <div
      role="option"
      tabIndex={props.option.disabled ? -1 : 0}
      aria-selected={props.active}
      aria-disabled={props.option.disabled || undefined}
      class={cn(
        SELECT_OPTION_STYLE,
        props.active && SELECT_OPTION_ACTIVE_STYLE,
        props.option.disabled && SELECT_OPTION_DISABLED_STYLE,
      )}
      onClick={() => {
        if (!props.option.disabled) {
          props.onSelect();
        }
      }}
      onKeyDown={props.onKeyDown}
    >
      <span class="w-[16px] shrink-0 flex items-center justify-center">
        {props.active && (
          <Check aria-hidden="true" size={SELECT_OPTION_CHECK_SIZE} />
        )}
      </span>
      <span class="truncate">{props.option.label}</span>
    </div>
  );
}
