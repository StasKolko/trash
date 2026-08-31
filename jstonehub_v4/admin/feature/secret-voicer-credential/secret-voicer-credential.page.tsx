import type { SecretVoicerCredentialResponse } from "./secret-voicer-credential.api";

import { Button } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { toast } from "@packages/ui/overlay";
import { H1, P } from "@packages/ui/typography";
import { Plus } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import {
  createSecretVoicerCredentialClearErrorMutation,
  createSecretVoicerCredentialDeleteMutation,
  createSecretVoicerCredentialsQuery,
  createSecretVoicerCredentialUpdateMutation,
} from "./secret-voicer-credential.query";
import { SecretVoicerCredentialCreateDialog } from "./secret-voicer-credential-create.dialog";
import { SecretVoicerCredentialDetailDialog } from "./secret-voicer-credential-detail.dialog";

const MASKED_TOKEN_VISIBLE_CHARS = 8;
const MASKED_DOTS_COUNT = 8;
const ERROR_MESSAGE_PREVIEW_LENGTH = 40;

function maskTokenShort(token: string): string {
  if (token.length <= MASKED_TOKEN_VISIBLE_CHARS) {
    return token;
  }
  return `${token.slice(0, MASKED_TOKEN_VISIBLE_CHARS)}${"•".repeat(MASKED_DOTS_COUNT)}`;
}

function SecretVoicerCredentialPage() {
  const [selectedCredential, setSelectedCredential] =
    createSignal<SecretVoicerCredentialResponse | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = createSignal(false);

  const query = createSecretVoicerCredentialsQuery();
  const updateMutation = createSecretVoicerCredentialUpdateMutation();
  const deleteMutation = createSecretVoicerCredentialDeleteMutation();
  const clearErrorMutation = createSecretVoicerCredentialClearErrorMutation();

  function handleUpdate(id: string, data: Record<string, unknown>) {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Credential updated");
          setSelectedCredential(null);
        },
        onError: () => toast.error("Failed to update credential"),
      },
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Credential deleted");
        setSelectedCredential(null);
      },
      onError: () => toast.error("Failed to delete credential"),
    });
  }

  function handleClearError(id: string) {
    clearErrorMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Credential reactivated");
        setSelectedCredential(null);
      },
      onError: () => toast.error("Failed to reactivate credential"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <H1>Secret Voicer Credentials</H1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus size={16} />
          Add Credential
        </Button>
      </div>

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>
      <Show when={query.isError}>
        <div class="text-error-foreground text-sm">
          Failed to load credentials
        </div>
      </Show>

      <Show when={query.data}>
        {(credentials) => (
          <CredentialTable
            credentials={credentials()}
            onSelect={setSelectedCredential}
          />
        )}
      </Show>

      <SecretVoicerCredentialCreateDialog
        open={createDialogOpen()}
        onClose={() => setCreateDialogOpen(false)}
      />
      <SecretVoicerCredentialDetailDialog
        credential={selectedCredential()}
        onClose={() => setSelectedCredential(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClearError={handleClearError}
        updating={updateMutation.isPending}
        deleting={deleteMutation.isPending}
        clearingError={clearErrorMutation.isPending}
      />
    </div>
  );
}

function CredentialTable(props: {
  credentials: SecretVoicerCredentialResponse[];
  onSelect: (cred: SecretVoicerCredentialResponse) => void;
}) {
  return (
    <div class="border border-border rounded-md overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-secondary/50">
            <th class="text-left p-3 font-medium">Fingerprint</th>
            <th class="text-left p-3 font-medium">CSRF Token</th>
            <th class="text-left p-3 font-medium">Session ID</th>
            <th class="text-left p-3 font-medium">Status</th>
            <th class="text-left p-3 font-medium">Last Error</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.credentials}>
            {(cred) => (
              <CredentialRow credential={cred} onSelect={props.onSelect} />
            )}
          </For>
        </tbody>
      </table>
      <Show when={props.credentials.length === 0}>
        <div class="p-8 text-center text-subtle text-sm">
          No credentials found. Add one to get started.
        </div>
      </Show>
    </div>
  );
}

function CredentialRow(props: {
  credential: SecretVoicerCredentialResponse;
  onSelect: (cred: SecretVoicerCredentialResponse) => void;
}) {
  const cred = props.credential;
  const hasError = () =>
    cred.lastError !== null && cred.lastError !== undefined;

  const buttonClass = () =>
    hasError()
      ? "text-left font-medium p-0 h-auto text-error-foreground"
      : "text-left font-medium p-0 h-auto text-primary";

  return (
    <tr
      class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
      style={hasError() ? { "background-color": "var(--error)" } : {}}
    >
      <td class="p-3">
        <Button
          variant="ghost"
          size="sm"
          class={buttonClass()}
          onClick={() => props.onSelect(cred)}
        >
          {cred.fingerprintLabel}
        </Button>
      </td>
      <td class="p-3 text-subtle font-mono text-xs">
        {maskTokenShort(cred.csrfToken)}
      </td>
      <td class="p-3 text-subtle font-mono text-xs">
        {maskTokenShort(cred.sessionId)}
      </td>
      <td class="p-3">
        <Badge
          variant={cred.isActive ? "success" : "error"}
          size="sm"
          aria-label={cred.isActive ? "Active" : "Inactive"}
        >
          {cred.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td class="p-3">
        <Show when={cred.lastError}>
          {(err) => (
            <P level={3} variant="error" class="truncate max-w-[200px]">
              {err().action}:{" "}
              {err().message.slice(0, ERROR_MESSAGE_PREVIEW_LENGTH)}…
            </P>
          )}
        </Show>
      </td>
    </tr>
  );
}

export { SecretVoicerCredentialPage };
