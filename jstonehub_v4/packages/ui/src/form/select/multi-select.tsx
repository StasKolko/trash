import type { SelectAllState } from "./_multi-select-header";
import type { SelectOption } from "./select.type";

import { createMemo, createSignal, For, Show } from "solid-js";

import { Popover } from "../../overlay/popover/popover";
import { MultiSelectHeader } from "./_multi-select-header";
import { MultiSelectOptionRow } from "./_multi-select-option";
import { SELECT_POPOVER_CLASS } from "./_select.style";
import { SelectEmpty } from "./_select-empty";
import { SelectSearch } from "./_select-search";
import { SelectTrigger } from "./_select-trigger";

// --- Shared helpers ---

function toggleValues(
  current: string[],
  value: string,
  checked: boolean,
): string[] {
  return checked ? [...current, value] : current.filter((v) => v !== value);
}

function toggleAllFiltered(
  state: SelectAllState,
  selectedValues: string[],
  enabledValues: string[],
): string[] {
  if (state === "all") {
    return selectedValues.filter((v) => !enabledValues.includes(v));
  }
  return [
    ...selectedValues,
    ...enabledValues.filter((v) => !selectedValues.includes(v)),
  ];
}

// --- MultiSelect (no search) ---

function MultiSelect(props: import("./select.type").MultiSelectProps) {
  const [open, setOpen] = createSignal(false);

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let triggerRef!: HTMLButtonElement;

  const selectedValues = createMemo(() => props.value ?? []);

  const enabledOptions = createMemo(() =>
    props.options.filter((o) => !o.disabled),
  );

  const selectAllState = createMemo<SelectAllState>(() => {
    const selected = selectedValues();
    const enabled = enabledOptions();
    if (selected.length === 0) {
      return "none";
    }
    const allEnabled = enabled.every((o) => selected.includes(o.value));
    return allEnabled ? "all" : "some";
  });

  const displayValue = createMemo(() => {
    const selected = selectedValues();
    if (selected.length === 0) {
      return;
    }
    return props.selectedLabel(selected.length, props.options.length);
  });

  function handleTriggerKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div class="w-full relative">
      <SelectTrigger
        data-testid={props["data-trigger-testid"]}
        ref={triggerRef}
        open={open()}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        invalid={props.invalid}
        invalidId={props.invalidId}
        placeholder={props.placeholder}
        displayValue={displayValue()}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
      />

      <HiddenInputs name={props.name} values={selectedValues()} />

      <Popover
        data-testid={props["data-popover-testid"]}
        open={open()}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        matchTriggerWidth={true}
        class={SELECT_POPOVER_CLASS}
      >
        <MultiSelectHeader
          state={selectAllState()}
          label={props.selectAllLabel}
          disabled={props.disabled}
          onToggle={() => {
            const allEnabled = enabledOptions().map((o) => o.value);
            props.onValueChange?.(
              toggleAllFiltered(selectAllState(), selectedValues(), allEnabled),
            );
          }}
        />

        <div role="listbox" aria-multiselectable="true">
          <For each={props.options}>
            {(option) => (
              <MultiSelectOptionRow
                option={option}
                checked={selectedValues().includes(option.value)}
                disabled={props.disabled}
                onCheckedChange={(checked) =>
                  props.onValueChange?.(
                    toggleValues(selectedValues(), option.value, checked),
                  )
                }
              />
            )}
          </For>
        </div>
      </Popover>
    </div>
  );
}

// --- SearchableMultiSelect ---

function SearchableMultiSelect(
  props: import("./select.type").SearchableMultiSelectProps,
) {
  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let triggerRef!: HTMLButtonElement;
  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let searchRef!: HTMLInputElement;

  const selectedValues = createMemo(() => props.value ?? []);

  const filteredOptions = createMemo(() => {
    const query = search().toLowerCase().trim();
    if (!query) {
      return props.options;
    }
    return props.options.filter((option) => {
      const label =
        typeof option.label === "string" ? option.label : String(option.value);
      return label.toLowerCase().includes(query);
    });
  });

  const enabledFiltered = createMemo(() =>
    filteredOptions().filter((o) => !o.disabled),
  );

  const selectAllState = createMemo<SelectAllState>(() => {
    const selected = selectedValues();
    const enabled = enabledFiltered();
    if (enabled.length === 0) {
      return "none";
    }
    if (enabled.every((o) => selected.includes(o.value))) {
      return "all";
    }
    if (enabled.some((o) => selected.includes(o.value))) {
      return "some";
    }
    return "none";
  });

  const displayValue = createMemo(() => {
    const selected = selectedValues();
    if (selected.length === 0) {
      return;
    }
    return props.selectedLabel(selected.length, props.options.length);
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => searchRef?.focus());
      });
    } else {
      setSearch("");
    }
  }

  function handleTriggerKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpenChange(true);
    }
  }

  return (
    <div class="w-full relative">
      <SelectTrigger
        data-testid={props["data-trigger-testid"]}
        ref={triggerRef}
        open={open()}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        invalid={props.invalid}
        invalidId={props.invalidId}
        placeholder={props.placeholder}
        displayValue={displayValue()}
        onClick={() => handleOpenChange(!open())}
        onKeyDown={handleTriggerKeyDown}
      />
      <HiddenInputs name={props.name} values={selectedValues()} />
      <Popover
        data-testid={props["data-popover-testid"]}
        open={open()}
        onOpenChange={handleOpenChange}
        triggerRef={triggerRef}
        matchTriggerWidth={true}
        class={SELECT_POPOVER_CLASS}
      >
        <SearchableMultiSelectPanel
          searchTestId={props["data-search-testid"]}
          searchRef={searchRef}
          search={search()}
          onSearchChange={setSearch}
          searchPlaceholder={props.searchPlaceholder}
          clearSearchLabel={props.clearSearchLabel}
          emptyLabel={props.emptyLabel}
          selectAllLabel={props.selectAllLabel}
          selectAllState={selectAllState()}
          disabled={props.disabled}
          options={filteredOptions()}
          selectedValues={selectedValues()}
          enabledValues={enabledFiltered().map((o) => o.value)}
          onValueChange={(next) => props.onValueChange?.(next)}
        />
      </Popover>
    </div>
  );
}

// --- Panel subcomponent ---

function SearchableMultiSelectPanel(props: {
  searchTestId?: string;
  searchRef: HTMLInputElement;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  clearSearchLabel: string;
  emptyLabel?: import("solid-js").JSX.Element;
  selectAllLabel: string;
  selectAllState: SelectAllState;
  disabled?: boolean;
  options: SelectOption[];
  selectedValues: string[];
  enabledValues: string[];
  onValueChange: (next: string[]) => void;
}) {
  return (
    <>
      <SelectSearch
        data-testid={props.searchTestId}
        // v8 ignore start
        ref={props.searchRef}
        // v8 ignore end
        value={props.search}
        onValueChange={props.onSearchChange}
        placeholder={props.searchPlaceholder}
        clearLabel={props.clearSearchLabel}
      />

      <Show when={props.options.length > 0}>
        <MultiSelectHeader
          state={props.selectAllState}
          label={props.selectAllLabel}
          disabled={props.disabled}
          onToggle={() =>
            props.onValueChange(
              toggleAllFiltered(
                props.selectAllState,
                props.selectedValues,
                props.enabledValues,
              ),
            )
          }
        />
      </Show>

      <div role="listbox" aria-multiselectable="true">
        <Show
          when={props.options.length > 0}
          fallback={
            <SelectEmpty>{props.emptyLabel ?? "No results"}</SelectEmpty>
          }
        >
          <For each={props.options}>
            {(option) => (
              <MultiSelectOptionRow
                option={option}
                checked={props.selectedValues.includes(option.value)}
                disabled={props.disabled}
                onCheckedChange={(checked) =>
                  props.onValueChange(
                    toggleValues(props.selectedValues, option.value, checked),
                  )
                }
              />
            )}
          </For>
        </Show>
      </div>
    </>
  );
}

// --- Hidden inputs for form submission ---

function HiddenInputs(props: { name?: string; values: string[] }) {
  return (
    <Show when={props.name}>
      <For each={props.values}>
        {(value) => (
          // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
          <input type="hidden" name={props.name} value={value} />
        )}
      </For>
    </Show>
  );
}

export type {
  MultiSelectProps,
  SearchableMultiSelectProps,
} from "./select.type";

export { MultiSelect, SearchableMultiSelect };
