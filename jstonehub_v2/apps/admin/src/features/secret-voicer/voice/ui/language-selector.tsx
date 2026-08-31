import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { Button } from "@packages/ui/button";
import { Checkbox } from "@packages/ui/checkbox";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { Typography } from "@packages/ui/typography";
import { cn } from "@packages/utils/css";
import { ChevronDown, Search, X } from "lucide-solid";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

const DROPDOWN_OFFSET = 4;

type LanguageSelectorProps = {
  value: string[];
  onChange: (languages: string[]) => void;
  disabled?: boolean;
  /** Use modal mode for proper stacking in dialogs */
  modal?: boolean;
  id?: string;
};

export function LanguageSelector(props: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [triggerRect, setTriggerRect] = createSignal<DOMRect | null>(null);

  // biome-ignore lint/suspicious/noUnassignedVariables: ref assignment
  let triggerRef: HTMLButtonElement | undefined;
  // biome-ignore lint/suspicious/noUnassignedVariables: ref assignment
  let dropdownRef: HTMLDivElement | undefined;

  const allLanguages = secretVoicerContract.supportedLanguage.options;

  const filteredLanguages = createMemo(() => {
    const query = searchQuery().toLowerCase();
    if (!query) {
      return [...allLanguages];
    }
    return allLanguages.filter(
      (lang) =>
        lang.label.toLowerCase().includes(query)
        || lang.value.toLowerCase().includes(query),
    );
  });

  const selectedCount = () => props.value.length;

  const isSelected = (langValue: string) => props.value.includes(langValue);

  const toggleLanguage = (langValue: string) => {
    if (isSelected(langValue)) {
      props.onChangeValue(props.value.filter((v) => v !== langValue));
    } else {
      props.onChangeValue([...props.value, langValue]);
    }
  };

  const clearAll = () => {
    props.onChangeValue([]);
  };

  const getSelectedLabels = () => {
    if (props.value.length === 0) {
      return "Выберите языки...";
    }
    if (props.value.length <= 2) {
      return props.value
        .map((v) => allLanguages.find((l) => l.value === v)?.label ?? v)
        .join(", ");
    }
    return `${props.value.length} языков выбрано`;
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery("");

    if (props.modal && dropdownRef && "hidePopover" in dropdownRef) {
      try {
        dropdownRef.hidePopover();
      } catch {
        // Already hidden
      }
    }
  };

  const openDropdown = () => {
    if (triggerRef) {
      setTriggerRect(triggerRef.getBoundingClientRect());
    }
    setIsOpen(true);
  };

  const handleTriggerClick = () => {
    if (props.disabled) {
      return;
    }

    if (isOpen()) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  // Show native popover when opening in modal mode
  createEffect(() => {
    if (!(props.modal && dropdownRef && "showPopover" in dropdownRef)) {
      return;
    }

    if (isOpen()) {
      try {
        dropdownRef.showPopover();
      } catch {
        // Already showing
      }
    }
  });

  // Update position on scroll/resize
  createEffect(() => {
    if (!isOpen()) {
      return;
    }

    const updatePosition = () => {
      if (triggerRef) {
        setTriggerRect(triggerRef.getBoundingClientRect());
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    onCleanup(() => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    });
  });

  // Click outside handler
  onMount(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef
        && !triggerRef.contains(target)
        && dropdownRef
        && !dropdownRef.contains(target)
      ) {
        closeDropdown();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        e.stopPropagation();
        closeDropdown();
        triggerRef?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    onCleanup(() => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    });
  });

  const dropdownContent = (
    <div
      ref={dropdownRef}
      popover={props.modal ? "manual" : undefined}
      class={cn(
        "fixed w-[320px] overflow-hidden",
        "border border-border bg-popover text-popover-foreground",
        "rounded-[8px] shadow-[var(--shadow-lg)]",
        "animate-in fade-in zoom-in-95 duration-150",
        props.modal ? "z-[9999]" : "z-50",
      )}
      style={{
        top: `${(triggerRect()?.bottom ?? 0) + DROPDOWN_OFFSET}px`,
        left: `${triggerRect()?.left ?? 0}px`,
        ...(props.modal
          ? {
              margin: "0",
              padding: "0",
              background: "transparent",
              border: "none",
            }
          : {}),
      }}
    >
      <div
        class={cn(
          props.modal
            && "border border-border bg-popover rounded-[8px] shadow-[var(--shadow-lg)]",
        )}
      >
        <div class="p-3 space-y-3">
          {/* Search */}
          <Input
            placeholder="Поиск языка..."
            prefix={<Search class="w-4 h-4" />}
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            autofocus={true}
          />

          {/* Header with clear button */}
          <div class="flex items-center justify-between">
            <Typography level={5} color="muted">
              {selectedCount()} выбрано
            </Typography>
            <Show when={selectedCount() > 0}>
              <Button variant="ghost" size="btn-xs" onClick={clearAll}>
                <X class="w-3 h-3" />
                Очистить
              </Button>
            </Show>
          </div>

          {/* Language list with scroll */}
          <div class="max-h-[240px] overflow-y-auto space-y-1 -mx-1 px-1">
            <Show
              when={filteredLanguages().length > 0}
              fallback={
                <Typography level={5} color="muted" class="text-center py-4">
                  Языки не найдены
                </Typography>
              }
            >
              <For each={filteredLanguages()}>
                {(lang) => {
                  const checkboxId = `lang-checkbox-${lang.value}`;
                  return (
                    <div class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <Checkbox
                        id={checkboxId}
                        checked={isSelected(lang.value)}
                        onChangeValue={() => toggleLanguage(lang.value)}
                      />
                      <Label
                        for={checkboxId}
                        class="flex-1 cursor-pointer text-sm font-normal"
                      >
                        {lang.label}
                      </Label>
                      <span class="text-xs text-muted-foreground">
                        {lang.value}
                      </span>
                    </div>
                  );
                }}
              </For>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div class="relative">
      <Button
        id={props.id}
        ref={triggerRef}
        variant="outline"
        class="w-full justify-between font-normal"
        disabled={props.disabled}
        onClick={handleTriggerClick}
      >
        <span class="truncate text-left">{getSelectedLabels()}</span>
        <ChevronDown
          class={cn(
            "w-4 h-4 shrink-0 opacity-50 transition-transform duration-200",
            isOpen() && "rotate-180",
          )}
        />
      </Button>

      <Show when={isOpen() && triggerRect()}>
        <Show when={!props.modal} fallback={dropdownContent}>
          <Portal>{dropdownContent}</Portal>
        </Show>
      </Show>
    </div>
  );
}
