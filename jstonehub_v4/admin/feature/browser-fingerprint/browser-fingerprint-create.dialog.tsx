import type { FingerprintPresetData } from "./_preset-fingerprint";
import type { CreateParams } from "./browser-fingerprint.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { TextInputField } from "@packages/ui/form";
import { Dialog, Popover, toast } from "@packages/ui/overlay";
import { ListRestart, ScanLine } from "lucide-solid";
import { createSignal, For } from "solid-js";

import { captureCurrentFingerprint } from "./_capture-fingerprint";
import { FieldRenderer } from "./_field-renderer";
import { FINGERPRINT_FIELDS } from "./_fingerprint-field";
import { FINGERPRINT_PRESETS } from "./_preset-fingerprint";
import { createBrowserFingerprintCreateMutation } from "./browser-fingerprint.query";

type BrowserFingerprintCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const ISO_DATETIME_LENGTH = 19;

function createEmptyFormData(): Record<string, unknown> {
  const data: Record<string, unknown> = { label: "" };
  for (const field of FINGERPRINT_FIELDS) {
    if (field.type === "boolean") {
      data[field.key] = false;
    } else if (field.type === "multi-text") {
      data[field.key] = [];
    } else if (field.type === "number") {
      data[field.key] = 0;
    } else {
      data[field.key] = "";
    }
  }
  return data;
}

function presetToFormData(
  label: string,
  preset: FingerprintPresetData,
): Record<string, unknown> {
  return { label, ...preset };
}

function BrowserFingerprintCreateDialog(
  props: BrowserFingerprintCreateDialogProps,
) {
  const [formData, setFormData] = createSignal<Record<string, unknown>>(
    createEmptyFormData(),
  );
  const [languagesText, setLanguagesText] = createSignal("");
  const [presetPopoverOpen, setPresetPopoverOpen] = createSignal(false);

  // biome-ignore lint/suspicious/noUnassignedVariables: SolidJS ref pattern
  let presetButtonRef!: HTMLButtonElement;
  const createMutation = createBrowserFingerprintCreateMutation();

  function handleApplyPreset(presetIndex: number) {
    const preset = FINGERPRINT_PRESETS[presetIndex];
    if (!preset) {
      return;
    }
    const data = presetToFormData(preset.label, preset.data);
    setFormData(data);
    setLanguagesText(preset.data.languages.join(", "));
    setPresetPopoverOpen(false);
  }

  function handleCapture() {
    const captured = captureCurrentFingerprint();
    const label = `Captured ${new Date().toISOString().slice(0, ISO_DATETIME_LENGTH)}`;
    setFormData({ label, ...captured });
    setLanguagesText(captured.languages.join(", "));
  }

  function updateField(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handleLanguagesChange(value: string) {
    setLanguagesText(value);
    const parsed = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateField("languages", parsed);
  }

  function handleSubmit() {
    const data = formData() as unknown as CreateParams;
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Fingerprint created");
        handleClose();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create fingerprint",
        );
      },
    });
  }

  function handleClose() {
    setFormData(createEmptyFormData());
    setLanguagesText("");
    setPresetPopoverOpen(false);
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={handleClose}
      title={
        <CreateDialogTitle
          presetButtonRef={presetButtonRef}
          presetPopoverOpen={presetPopoverOpen()}
          onPresetPopoverToggle={() => setPresetPopoverOpen((prev) => !prev)}
          onPresetPopoverChange={setPresetPopoverOpen}
          onApplyPreset={handleApplyPreset}
          onCapture={handleCapture}
        />
      }
      description="Fill in all fingerprint fields manually, use a preset, or capture from current browser."
      content={() => (
        <CreateDialogContent
          formData={formData()}
          languagesText={languagesText()}
          onFieldChange={updateField}
          onLanguagesChange={handleLanguagesChange}
        />
      )}
      footer={() => (
        <div class="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={createMutation.isPending}
            onClick={handleSubmit}
          >
            Create
          </LoadingButton>
        </div>
      )}
    />
  );
}

function CreateDialogTitle(props: {
  presetButtonRef: HTMLButtonElement;
  presetPopoverOpen: boolean;
  onPresetPopoverToggle: () => void;
  onPresetPopoverChange: (open: boolean) => void;
  onApplyPreset: (index: number) => void;
  onCapture: () => void;
}) {
  return (
    <div class="flex items-center justify-between w-full">
      <span>Create Browser Fingerprint</span>
      <div class="flex items-center gap-2">
        <IconButton
          ref={props.presetButtonRef}
          variant="outline"
          size="sm"
          aria-label="Fill from preset"
          onClick={props.onPresetPopoverToggle}
        >
          <ListRestart size={16} />
        </IconButton>
        <Popover
          open={props.presetPopoverOpen}
          onOpenChange={props.onPresetPopoverChange}
          triggerRef={props.presetButtonRef}
          side="bottom"
        >
          <div class="py-1">
            <For each={FINGERPRINT_PRESETS}>
              {(preset, index) => (
                <Button
                  variant="ghost"
                  size="sm"
                  class="w-full text-left px-3 py-2 h-auto justify-start"
                  onClick={() => props.onApplyPreset(index())}
                >
                  <div class="flex flex-col items-start">
                    <div class="text-sm font-medium">{preset.label}</div>
                    <div class="text-xs text-subtle">
                      {preset.data.screenWidth}×{preset.data.screenHeight} •{" "}
                      {preset.data.timezone}
                    </div>
                  </div>
                </Button>
              )}
            </For>
          </div>
        </Popover>
        <IconButton
          variant="outline"
          size="sm"
          aria-label="Capture current browser fingerprint"
          onClick={props.onCapture}
        >
          <ScanLine size={16} />
        </IconButton>
      </div>
    </div>
  );
}

function CreateDialogContent(props: {
  formData: Record<string, unknown>;
  languagesText: string;
  onFieldChange: (key: string, value: unknown) => void;
  onLanguagesChange: (value: string) => void;
}) {
  return (
    <div class="space-y-4">
      <TextInputField
        type="text"
        label="Label"
        value={(props.formData.label as string) ?? ""}
        onValueChange={(v) => props.onFieldChange("label", v)}
        required={true}
        placeholder="e.g. Chrome 120 — Windows 10"
      />

      <For each={FINGERPRINT_FIELDS}>
        {(field) => (
          <FieldRenderer
            field={field}
            value={props.formData[field.key]}
            onValueChange={(v) => props.onFieldChange(field.key, v)}
            languagesText={props.languagesText}
            onLanguagesChange={props.onLanguagesChange}
          />
        )}
      </For>
    </div>
  );
}

export { BrowserFingerprintCreateDialog };
