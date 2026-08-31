import type { SecretVoicerCredentialResponse } from "./secret-voicer-credential.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SwitchField, TextInputField } from "@packages/ui/form";
import { Dialog } from "@packages/ui/overlay";
import { P } from "@packages/ui/typography";
import { Pencil, RefreshCw, Trash2 } from "lucide-solid";
import { createEffect, createMemo, createSignal, Show } from "solid-js";

type SecretVoicerCredentialDetailDialogProps = {
  credential: SecretVoicerCredentialResponse | null;
  onClose: () => void;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onClearError: (id: string) => void;
  updating: boolean;
  deleting: boolean;
  clearingError: boolean;
};

const MASKED_TOKEN_VISIBLE_CHARS = 8;
const MASKED_DOTS_MAX = 20;
const CSRF_TOKEN_REGEX = /csrftoken=([^;]+)/;
const SESSION_ID_REGEX = /sessionid=([^;]+)/;

function maskToken(token: string): string {
  if (token.length <= MASKED_TOKEN_VISIBLE_CHARS) {
    return token;
  }
  const visible = token.slice(0, MASKED_TOKEN_VISIBLE_CHARS);
  const dots = Math.min(
    token.length - MASKED_TOKEN_VISIBLE_CHARS,
    MASKED_DOTS_MAX,
  );
  return `${visible}${"•".repeat(dots)}`;
}

function parseCookieString(
  value: string,
): { csrfToken: string; sessionId: string } | null {
  const csrfMatch = value.match(CSRF_TOKEN_REGEX);
  const sessionMatch = value.match(SESSION_ID_REGEX);

  if (csrfMatch && sessionMatch) {
    return {
      csrfToken: csrfMatch[1]?.trim() ?? "",
      sessionId: sessionMatch[1]?.trim() ?? "",
    };
  }
  return null;
}

function resolveBadgeVariant(
  hasError: boolean,
  isActive: boolean,
): "error" | "success" | "warning" {
  if (hasError) {
    return "error";
  }
  if (isActive) {
    return "success";
  }
  return "warning";
}

function resolveBadgeLabel(hasError: boolean, isActive: boolean): string {
  if (hasError) {
    return "Error";
  }
  if (isActive) {
    return "Active";
  }
  return "Inactive";
}

function useCredentialForm(props: SecretVoicerCredentialDetailDialogProps) {
  const [editing, setEditing] = createSignal(false);
  const [csrfToken, setCsrfToken] = createSignal("");
  const [sessionId, setSessionId] = createSignal("");
  const [isActive, setIsActive] = createSignal(true);
  const [confirmDelete, setConfirmDelete] = createSignal(false);

  createEffect(() => {
    const cred = props.credential;
    if (cred) {
      setCsrfToken(cred.csrfToken);
      setSessionId(cred.sessionId);
      setIsActive(cred.isActive);
      setEditing(false);
      setConfirmDelete(false);
    }
  });

  const changedFields = createMemo(() => {
    const cred = props.credential;
    if (!cred) {
      return {};
    }
    const changes: Record<string, unknown> = {};
    if (csrfToken() !== cred.csrfToken) {
      changes.csrfToken = csrfToken();
    }
    if (sessionId() !== cred.sessionId) {
      changes.sessionId = sessionId();
    }
    if (isActive() !== cred.isActive) {
      changes.isActive = isActive();
    }
    return changes;
  });

  const hasChanges = createMemo(() => Object.keys(changedFields()).length > 0);

  function handleCsrfTokenChange(value: string) {
    const parsed = parseCookieString(value);
    if (parsed) {
      setCsrfToken(parsed.csrfToken);
      setSessionId(parsed.sessionId);
    } else {
      setCsrfToken(value);
    }
  }

  function handleSave() {
    const cred = props.credential;
    if (!(cred && hasChanges())) {
      return;
    }
    props.onUpdate(cred.id, changedFields());
  }

  function handleDelete() {
    const cred = props.credential;
    if (!cred) {
      return;
    }
    props.onDelete(cred.id);
  }

  function handleCancelEdit() {
    const cred = props.credential;
    if (!cred) {
      return;
    }
    setCsrfToken(cred.csrfToken);
    setSessionId(cred.sessionId);
    setIsActive(cred.isActive);
    setEditing(false);
  }

  function handleClose() {
    setEditing(false);
    setConfirmDelete(false);
    props.onClose();
  }

  return {
    editing,
    setEditing,
    csrfToken,
    setCsrfToken,
    sessionId,
    setSessionId,
    isActive,
    setIsActive,
    confirmDelete,
    setConfirmDelete,
    hasChanges,
    handleCsrfTokenChange,
    handleSave,
    handleDelete,
    handleCancelEdit,
    handleClose,
  };
}

function SecretVoicerCredentialDetailDialog(
  props: SecretVoicerCredentialDetailDialogProps,
) {
  const form = useCredentialForm(props);

  const hasError = () =>
    props.credential?.lastError !== null
    && props.credential?.lastError !== undefined;

  return (
    <Dialog
      alert={false}
      open={props.credential !== null}
      onClose={form.handleClose}
      title={<DetailTitle credential={props.credential} />}
      description={props.credential?.fingerprintLabel ?? ""}
      content={() => (
        <div class="space-y-4">
          {/* Action buttons */}
          <Show when={!form.editing()}>
            <div class="flex gap-2 justify-end">
              <IconButton
                variant="outline"
                size="sm"
                aria-label="Edit credential"
                onClick={() => form.setEditing(true)}
              >
                <Pencil size={14} />
              </IconButton>
              <IconButton
                variant="destructive"
                size="sm"
                aria-label="Delete credential"
                onClick={() => form.setConfirmDelete(true)}
              >
                <Trash2 size={14} />
              </IconButton>
            </div>
          </Show>

          {/* Error banner */}
          <Show when={hasError() && props.credential?.lastError}>
            {(err) => (
              <div class="rounded-md border border-error-border bg-error/10 p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <P level={2} variant="error" class="font-medium">
                    ⚠️ Credential Error
                  </P>
                  <LoadingButton
                    variant="outline"
                    size="sm"
                    loading={props.clearingError}
                    onClick={() =>
                      props.credential
                      && props.onClearError(props.credential.id)
                    }
                  >
                    <RefreshCw size={14} />
                    Reactivate
                  </LoadingButton>
                </div>

                <div class="space-y-2">
                  <ErrorRow label="Action" value={err().action} />
                  <ErrorRow
                    label="HTTP Status"
                    value={
                      err().statusCode === null ? "—" : String(err().statusCode)
                    }
                  />
                  <ErrorRow label="Message" value={err().message} />
                  <ErrorRow
                    label="Occurred At"
                    value={new Date(err().occurredAt).toLocaleString()}
                  />
                  <Show when={err().responseBody}>
                    <div class="space-y-1">
                      <div class="text-xs font-medium text-subtle">
                        Response Body (preview)
                      </div>
                      <pre class="text-xs text-error-foreground bg-error/20 rounded p-2 overflow-auto max-h-[120px] whitespace-pre-wrap break-all font-mono">
                        {err().responseBody}
                      </pre>
                    </div>
                  </Show>
                </div>
              </div>
            )}
          </Show>

          {/* Delete confirmation */}
          <Show when={form.confirmDelete()}>
            <div class="p-4 rounded-md bg-error/20 border border-error-border space-y-3">
              <P level={2} variant="error">
                Are you sure you want to delete this credential?
              </P>
              <div class="flex gap-2">
                <LoadingButton
                  variant="destructive"
                  size="sm"
                  loading={props.deleting}
                  onClick={form.handleDelete}
                >
                  Delete
                </LoadingButton>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => form.setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Show>

          {/* Fields */}
          <ReadOnlyField
            label="Fingerprint"
            value={props.credential?.fingerprintLabel ?? "—"}
          />

          <Show
            when={form.editing()}
            fallback={
              <>
                <ReadOnlyField
                  label="CSRF Token"
                  value={maskToken(props.credential?.csrfToken ?? "")}
                />
                <ReadOnlyField
                  label="Session ID"
                  value={maskToken(props.credential?.sessionId ?? "")}
                />
                <ReadOnlyField
                  label="Status"
                  value={props.credential?.isActive ? "Active" : "Inactive"}
                />
              </>
            }
          >
            <TextInputField
              type="text"
              label="CSRF Token"
              info="Можно вставить всю строку cookie: csrftoken=xxx; sessionid=yyy — поля заполнятся автоматически"
              value={form.csrfToken()}
              onValueChange={form.handleCsrfTokenChange}
              required={true}
            />
            <TextInputField
              type="text"
              label="Session ID"
              value={form.sessionId()}
              onValueChange={form.setSessionId}
              required={true}
            />
            <SwitchField
              label="Active"
              checked={form.isActive()}
              onCheckedChange={(v) => form.setIsActive(v as boolean)}
            />
          </Show>
        </div>
      )}
      footer={(close) => (
        <Show
          when={form.editing()}
          fallback={
            <div class="flex justify-end">
              <Button variant="ghost" size="sm" onClick={close}>
                Close
              </Button>
            </div>
          }
        >
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={form.handleCancelEdit}>
              Cancel
            </Button>
            <LoadingButton
              variant="primary"
              size="sm"
              loading={props.updating}
              disabled={!form.hasChanges()}
              onClick={form.handleSave}
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
  credential: SecretVoicerCredentialResponse | null;
}) {
  const hasError = () =>
    props.credential?.lastError !== null
    && props.credential?.lastError !== undefined;

  return (
    <div class="flex items-center gap-3">
      <span>Credential Details</span>
      <Show when={props.credential}>
        {(cred) => (
          <Badge
            variant={resolveBadgeVariant(hasError(), cred().isActive)}
            size="sm"
            aria-label={resolveBadgeLabel(hasError(), cred().isActive)}
          >
            {resolveBadgeLabel(hasError(), cred().isActive)}
          </Badge>
        )}
      </Show>
    </div>
  );
}

function ErrorRow(props: { label: string; value: string }) {
  return (
    <div class="flex gap-3 text-sm">
      <span class="text-subtle shrink-0 w-[100px]">{props.label}:</span>
      <span class="text-error-foreground break-all">{props.value}</span>
    </div>
  );
}

function ReadOnlyField(props: { label: string; value: string }) {
  return (
    <div class="space-y-1">
      <div class="text-xs font-medium text-subtle">{props.label}</div>
      <div class="text-sm text-foreground break-all">{props.value}</div>
    </div>
  );
}

export { SecretVoicerCredentialDetailDialog };
