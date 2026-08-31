import { SEGMENT_ROLE_MAX_LENGTH } from "@packages/contract/segment";
import { Button } from "@packages/ui/action";
import { Popover } from "@packages/ui/overlay";
import { ChevronDown, Plus } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

type RoleSelectorProps = {
  value: string;
  existingRoles: string[];
  onChange: (role: string) => void;
  disabled: boolean;
};

function RoleSelector(props: RoleSelectorProps) {
  const [open, setOpen] = createSignal(false);
  const [customInput, setCustomInput] = createSignal("");
  const [showCustomInput, setShowCustomInput] = createSignal(false);

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let triggerRef!: HTMLButtonElement;

  const displayValue = () => props.value || "Select role...";
  const hasValue = () => props.value.trim().length > 0;

  function handleSelectRole(role: string) {
    props.onChange(role);
    setOpen(false);
    setShowCustomInput(false);
    setCustomInput("");
  }

  function handleCreateCustom() {
    const value = customInput().trim();
    if (value.length > 0 && value.length <= SEGMENT_ROLE_MAX_LENGTH) {
      props.onChange(value);
      setOpen(false);
      setShowCustomInput(false);
      setCustomInput("");
    }
  }

  function handleCustomKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateCustom();
    }
    if (e.key === "Escape") {
      setShowCustomInput(false);
      setCustomInput("");
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant={hasValue() ? "secondary" : "outline"}
        size="sm"
        class="min-w-[120px] justify-between gap-2"
        disabled={props.disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span class={hasValue() ? "font-medium" : "text-subtle"}>
          {displayValue()}
        </span>
        <ChevronDown size={12} />
      </Button>

      <Popover
        open={open()}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        side="bottom"
      >
        <div class="py-1 min-w-[180px]">
          <Show when={props.existingRoles.length > 0}>
            <div class="px-3 py-1.5 text-xs font-medium text-subtle uppercase">
              Existing Roles
            </div>
            <For each={props.existingRoles}>
              {(role) => (
                <Button
                  variant="ghost"
                  size="sm"
                  class="w-full justify-start px-3 py-2 h-auto text-sm"
                  onClick={() => handleSelectRole(role)}
                >
                  {role}
                </Button>
              )}
            </For>
            <div class="my-1 border-t border-border" />
          </Show>

          <Show
            when={showCustomInput()}
            fallback={
              <Button
                variant="ghost"
                size="sm"
                class="w-full justify-start px-3 py-2 h-auto text-sm gap-2"
                onClick={() => setShowCustomInput(true)}
              >
                <Plus size={12} />
                New role
              </Button>
            }
          >
            <div class="px-3 py-2 space-y-2">
              {/* biome-ignore lint/correctness/noRestrictedElements: native input inside popover */}
              <input
                type="text"
                class="w-full h-[32px] px-[10px] bg-control rounded-md border border-control-border text-[13px] text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="Role name..."
                value={customInput()}
                maxLength={SEGMENT_ROLE_MAX_LENGTH}
                onInput={(e) => setCustomInput(e.currentTarget.value)}
                onKeyDown={handleCustomKeyDown}
                autofocus={true}
              />
              <div class="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  class="flex-1"
                  disabled={customInput().trim().length === 0}
                  onClick={handleCreateCustom}
                >
                  Create
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomInput("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Show>
        </div>
      </Popover>
    </>
  );
}

export { RoleSelector };
