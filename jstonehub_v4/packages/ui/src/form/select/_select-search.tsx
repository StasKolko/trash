import { Search, X } from "lucide-solid";
import { Show } from "solid-js";

import { IconButton } from "../../action/button/button";
import {
  SELECT_SEARCH_INPUT_STYLE,
  SELECT_SEARCH_WRAPPER_STYLE,
} from "./_select.style";

export function SelectSearch(props: {
  "data-testid"?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  clearLabel: string;
  ref?: HTMLInputElement;
}) {
  return (
    <div class={SELECT_SEARCH_WRAPPER_STYLE}>
      <div class="flex items-center gap-[4px]">
        <Search aria-hidden="true" size={14} class="shrink-0 text-subtle" />

        {/* biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation */}
        <input
          data-testid={props["data-testid"]}
          // v8 ignore start
          ref={props.ref}
          // v8 ignore end
          class={SELECT_SEARCH_INPUT_STYLE}
          type="text"
          inputmode="search"
          placeholder={props.placeholder ?? "Search..."}
          value={props.value}
          onInput={(e) => props.onValueChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            // Prevent popover from closing on Escape when search is focused
            e.stopPropagation();
            if (e.key === "Escape" && props.value) {
              props.onValueChange("");
            }
          }}
        />

        <Show when={props.value.length > 0}>
          <IconButton
            variant="ghost"
            size="sm"
            class="shrink-0 text-subtle !w-[20px] !h-[20px]"
            aria-label={props.clearLabel}
            onClick={() => props.onValueChange("")}
          >
            <X aria-hidden="true" size={14} />
          </IconButton>
        </Show>
      </div>
    </div>
  );
}
