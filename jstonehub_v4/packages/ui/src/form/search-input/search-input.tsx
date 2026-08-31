import { cn } from "@packages/util/css";
import { Search, X } from "lucide-solid";
import { Show } from "solid-js";

import { IconButton } from "../../action/button/button";
import {
  SEARCH_CLEAR_STYLE,
  SEARCH_ICON_SIZE,
  SEARCH_ICON_STYLE,
  SEARCH_INPUT_ROOT_STYLE,
  SEARCH_INPUT_STYLE,
} from "./_search-input.style";

type SearchInputProps = {
  "data-testid"?: string;
  "data-clear-testid"?: string;
  placeholder?: string;
  disabled?: boolean;
  class?: string;
  value: string;
  onValueChange: (value: string) => void;
  clearLabel: string;
};

function SearchInput(props: SearchInputProps) {
  function handleClear() {
    props.onValueChange("");
  }

  return (
    <div class={cn(SEARCH_INPUT_ROOT_STYLE, props.class)}>
      <Search
        aria-hidden="true"
        size={SEARCH_ICON_SIZE}
        class={SEARCH_ICON_STYLE}
      />

      {/* biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation */}
      <input
        data-testid={props["data-testid"]}
        class={SEARCH_INPUT_STYLE}
        type="search"
        inputmode="search"
        placeholder={props.placeholder}
        disabled={props.disabled}
        value={props.value}
        onInput={(e) => props.onValueChange(e.currentTarget.value)}
      />

      <Show when={props.value.length > 0}>
        <IconButton
          data-testid={props["data-clear-testid"]}
          variant="ghost"
          size="sm"
          class={SEARCH_CLEAR_STYLE}
          disabled={props.disabled}
          aria-label={props.clearLabel}
          onClick={handleClear}
        >
          <X aria-hidden="true" size={SEARCH_ICON_SIZE} />
        </IconButton>
      </Show>
    </div>
  );
}

export type { SearchInputProps };
export { SearchInput };
