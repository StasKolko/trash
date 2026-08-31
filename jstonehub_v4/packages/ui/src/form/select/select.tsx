import type { SelectOption } from "./select.type";

import { createMemo, createSignal, For, Show } from "solid-js";

import { Popover } from "../../overlay/popover/popover";
import { SELECT_POPOVER_CLASS } from "./_select.style";
import { SelectEmpty } from "./_select-empty";
import { SelectOptionRow } from "./_select-option";
import { SelectSearch } from "./_select-search";
import { SelectTrigger } from "./_select-trigger";

// --- Select (single, no search) ---

function Select(props: import("./select.type").SelectProps) {
  const [open, setOpen] = createSignal(false);

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let triggerRef!: HTMLButtonElement;

  const selectedOption = createMemo(() =>
    props.options.find((o) => o.value === props.value),
  );

  const displayValue = createMemo(() => {
    const opt = selectedOption();
    if (!opt) {
      return;
    }
    return typeof opt.label === "string" ? opt.label : String(opt.value);
  });

  function handleSelect(option: SelectOption) {
    if (option.disabled) {
      return;
    }
    props.onValueChange?.(option.value);
    setOpen(false);
  }

  function handleTriggerKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handleOptionKeyDown(e: KeyboardEvent, option: SelectOption) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(option);
    } else if (e.key === "Escape") {
      setOpen(false);
      triggerRef.focus();
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

      <HiddenInput name={props.name} value={props.value} />

      <Popover
        data-testid={props["data-popover-testid"]}
        open={open()}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        matchTriggerWidth={true}
        class={SELECT_POPOVER_CLASS}
      >
        <div role="listbox">
          <For each={props.options}>
            {(option) => (
              <SelectOptionRow
                option={option}
                active={props.value === option.value}
                onSelect={() => handleSelect(option)}
                onKeyDown={(e) => handleOptionKeyDown(e, option)}
              />
            )}
          </For>
        </div>
      </Popover>
    </div>
  );
}

// --- SearchableSelect (single, with search) ---

function SearchableSelect(
  props: import("./select.type").SearchableSelectProps,
) {
  const [open, setOpen] = createSignal(false);
  const [search, setSearch] = createSignal("");

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let triggerRef!: HTMLButtonElement;
  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let searchRef!: HTMLInputElement;

  const selectedOption = createMemo(() =>
    props.options.find((o) => o.value === props.value),
  );

  const displayValue = createMemo(() => {
    const opt = selectedOption();
    if (!opt) {
      return;
    }
    return typeof opt.label === "string" ? opt.label : String(opt.value);
  });

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

  function handleSelect(option: SelectOption) {
    if (option.disabled) {
      return;
    }
    props.onValueChange?.(option.value);
    setOpen(false);
    setSearch("");
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          searchRef?.focus();
        });
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

  function handleOptionKeyDown(e: KeyboardEvent, option: SelectOption) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(option);
    } else if (e.key === "Escape") {
      handleOpenChange(false);
      triggerRef.focus();
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

      <HiddenInput name={props.name} value={props.value} />

      <Popover
        data-testid={props["data-popover-testid"]}
        open={open()}
        onOpenChange={handleOpenChange}
        triggerRef={triggerRef}
        matchTriggerWidth={true}
        class={SELECT_POPOVER_CLASS}
      >
        <SelectSearch
          data-testid={props["data-search-testid"]}
          // v8 ignore start
          ref={searchRef}
          // v8 ignore end
          value={search()}
          onValueChange={setSearch}
          placeholder={props.searchPlaceholder}
          clearLabel={props.clearSearchLabel}
        />

        <div role="listbox">
          <Show
            when={filteredOptions().length > 0}
            fallback={
              <SelectEmpty>{props.emptyLabel ?? "No results"}</SelectEmpty>
            }
          >
            <For each={filteredOptions()}>
              {(option) => (
                <SelectOptionRow
                  option={option}
                  active={props.value === option.value}
                  onSelect={() => handleSelect(option)}
                  onKeyDown={(e) => handleOptionKeyDown(e, option)}
                />
              )}
            </For>
          </Show>
        </div>
      </Popover>
    </div>
  );
}

// --- Hidden input for form submission ---

function HiddenInput(props: { name?: string; value?: string }) {
  return (
    <Show when={props.name}>
      {/* biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation */}
      <input type="hidden" name={props.name} value={props.value ?? ""} />
    </Show>
  );
}

export type { SearchableSelectProps, SelectProps } from "./select.type";

export { SearchableSelect, Select };
