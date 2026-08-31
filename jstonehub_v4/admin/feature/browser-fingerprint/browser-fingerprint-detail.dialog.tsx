import type { BrowserFingerprintResponse } from "./browser-fingerprint.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SwitchField, TextInputField } from "@packages/ui/form";
import { Dialog } from "@packages/ui/overlay";
import { P } from "@packages/ui/typography";
import { Pencil, Trash2 } from "lucide-solid";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";

import { FieldRow } from "./_field-row";
import { FINGERPRINT_FIELDS } from "./_fingerprint-field";

type BrowserFingerprintDetailDialogProps = {
  fingerprint: BrowserFingerprintResponse | null;
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  updating: boolean;
  deleting: boolean;
};

function computeChangedFields(
  fp: BrowserFingerprintResponse,
  current: Record<string, unknown>,
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};

  if (current.label !== fp.label) {
    changes.label = current.label;
  }
  if (current.isActive !== fp.isActive) {
    changes.isActive = current.isActive;
  }

  for (const field of FINGERPRINT_FIELDS) {
    const key = field.key as keyof BrowserFingerprintResponse;
    const original = fp[key];
    const updated = current[field.key];

    if (field.type === "multi-text") {
      if (JSON.stringify(original) !== JSON.stringify(updated)) {
        changes[field.key] = updated;
      }
    } else if (original !== updated) {
      changes[field.key] = updated;
    }
  }

  return changes;
}

function buildFormDataFromFingerprint(
  fp: BrowserFingerprintResponse,
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  data.label = fp.label;
  data.isActive = fp.isActive;
  for (const field of FINGERPRINT_FIELDS) {
    data[field.key] = fp[field.key as keyof BrowserFingerprintResponse];
  }
  return data;
}

function BrowserFingerprintDetailDialog(
  props: BrowserFingerprintDetailDialogProps,
) {
  const [editing, setEditing] = createSignal(false);
  const [formData, setFormData] = createSignal<Record<string, unknown>>({});
  const [languagesText, setLanguagesText] = createSignal("");
  const [confirmDelete, setConfirmDelete] = createSignal(false);

  createEffect(() => {
    const fp = props.fingerprint;
    if (fp) {
      setFormData(buildFormDataFromFingerprint(fp));
      setLanguagesText(fp.languages.join(", "));
      setEditing(false);
      setConfirmDelete(false);
    }
  });

  const changedFields = createMemo(() => {
    const fp = props.fingerprint;
    if (!fp) {
      return {};
    }
    return computeChangedFields(fp, formData());
  });

  const hasChanges = createMemo(() => Object.keys(changedFields()).length > 0);

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

  function handleSave() {
    const fp = props.fingerprint;
    if (!(fp && hasChanges())) {
      return;
    }
    props.onUpdate(fp.id, changedFields());
  }

  function handleDelete() {
    const fp = props.fingerprint;
    if (!fp) {
      return;
    }
    props.onDelete(fp.id);
  }

  function handleCancelEdit() {
    const fp = props.fingerprint;
    if (!fp) {
      return;
    }
    setFormData(buildFormDataFromFingerprint(fp));
    setLanguagesText(fp.languages.join(", "));
    setEditing(false);
  }

  function handleClose() {
    setEditing(false);
    setConfirmDelete(false);
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.fingerprint !== null}
      onClose={handleClose}
      title={<DetailTitle fingerprint={props.fingerprint} />}
      description={props.fingerprint?.label ?? ""}
      content={() => (
        <div class="space-y-4">
          <Show when={!editing()}>
            <ActionButtons
              onStartEdit={() => setEditing(true)}
              onConfirmDelete={() => setConfirmDelete(true)}
            />
          </Show>

          <Show when={confirmDelete()}>
            <DeleteConfirmation
              deleting={props.deleting}
              onDelete={handleDelete}
              onCancel={() => setConfirmDelete(false)}
            />
          </Show>

          <Show when={editing()}>
            <TextInputField
              type="text"
              label="Label"
              value={(formData().label as string) ?? ""}
              onValueChange={(v) => updateField("label", v)}
              required={true}
            />
            <SwitchField
              label="Active"
              checked={(formData().isActive as boolean) ?? true}
              onCheckedChange={(v) => updateField("isActive", v)}
            />
          </Show>

          <For each={FINGERPRINT_FIELDS}>
            {(field) => (
              <FieldRow
                field={field}
                editing={editing()}
                value={formData()[field.key]}
                languagesText={languagesText()}
                onFieldChange={updateField}
                onLanguagesChange={handleLanguagesChange}
              />
            )}
          </For>
        </div>
      )}
      footer={(close) => (
        <Show
          when={editing()}
          fallback={
            <div class="flex justify-end">
              <Button variant="ghost" size="sm" onClick={close}>
                Close
              </Button>
            </div>
          }
        >
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <LoadingButton
              variant="primary"
              size="sm"
              loading={props.updating}
              disabled={!hasChanges()}
              onClick={handleSave}
            >
              Save Changes
            </LoadingButton>
          </div>
        </Show>
      )}
    />
  );
}

function DetailTitle(props: {
  fingerprint: BrowserFingerprintResponse | null;
}) {
  return (
    <div class="flex items-center gap-3">
      <span>Fingerprint Details</span>
      <Show when={props.fingerprint}>
        {(fp) => (
          <Badge
            variant={fp().isActive ? "success" : "warning"}
            size="sm"
            aria-label={fp().isActive ? "Active status" : "Inactive status"}
          >
            {fp().isActive ? "Active" : "Inactive"}
          </Badge>
        )}
      </Show>
    </div>
  );
}

function ActionButtons(props: {
  onStartEdit: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <div class="flex gap-2 justify-end">
      <IconButton
        variant="outline"
        size="sm"
        aria-label="Edit fingerprint"
        onClick={props.onStartEdit}
      >
        <Pencil size={14} />
      </IconButton>
      <IconButton
        variant="destructive"
        size="sm"
        aria-label="Delete fingerprint"
        onClick={props.onConfirmDelete}
      >
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
}

function DeleteConfirmation(props: {
  deleting: boolean;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <div class="p-4 rounded-md bg-error/20 border border-error-border space-y-3">
      <P level={2} variant="error">
        Are you sure you want to delete this fingerprint?
      </P>
      <div class="flex gap-2">
        <LoadingButton
          variant="destructive"
          size="sm"
          loading={props.deleting}
          onClick={props.onDelete}
        >
          Delete
        </LoadingButton>
        <Button variant="ghost" size="sm" onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export { BrowserFingerprintDetailDialog };
