import type { FingerprintOption } from "./secret-voicer-credential.api";

import { Button, LoadingButton } from "@packages/ui/action";
import { SelectField, TextInputField } from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { P } from "@packages/ui/typography";
import { Link } from "@tanstack/solid-router";
import { createMemo, createSignal, Show } from "solid-js";

import {
  createAvailableFingerprintsQuery,
  createSecretVoicerCredentialCreateMutation,
} from "./secret-voicer-credential.query";

type SecretVoicerCredentialCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const CSRF_TOKEN_REGEX = /csrftoken=([^;]+)/;
const SESSION_ID_REGEX = /sessionid=([^;]+)/;

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

function SecretVoicerCredentialCreateDialog(
  props: SecretVoicerCredentialCreateDialogProps,
) {
  const [fingerprintId, setFingerprintId] = createSignal("");
  const [csrfToken, setCsrfToken] = createSignal("");
  const [sessionId, setSessionId] = createSignal("");

  const fingerprintsQuery = createAvailableFingerprintsQuery();
  const createMutation = createSecretVoicerCredentialCreateMutation();

  const fingerprints = () => fingerprintsQuery.data ?? [];
  const hasFingerprints = () => fingerprints().length > 0;

  const fingerprintOptions = createMemo(() =>
    fingerprints().map((fp: FingerprintOption) => ({
      value: fp.id,
      label: fp.label,
    })),
  );

  const canSubmit = () =>
    fingerprintId().length > 0
    && csrfToken().trim().length > 0
    && sessionId().trim().length > 0;

  function handleCsrfTokenChange(value: string) {
    const parsed = parseCookieString(value);
    if (parsed) {
      setCsrfToken(parsed.csrfToken);
      setSessionId(parsed.sessionId);
    } else {
      setCsrfToken(value);
    }
  }

  function handleSubmit() {
    if (!canSubmit()) {
      return;
    }

    createMutation.mutate(
      {
        fingerprintId: fingerprintId(),
        csrfToken: csrfToken().trim(),
        sessionId: sessionId().trim(),
      },
      {
        onSuccess: () => {
          toast.success("Credential created");
          handleClose();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to create credential",
          );
        },
      },
    );
  }

  function handleClose() {
    setFingerprintId("");
    setCsrfToken("");
    setSessionId("");
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={handleClose}
      title="Add Secret Voicer Credential"
      description="Link a browser fingerprint with Secret Voicer session data."
      content={() => (
        <div class="space-y-4">
          <Show
            when={hasFingerprints()}
            fallback={<NoFingerprintsMessage onClose={handleClose} />}
          >
            <SelectField
              label="Browser Fingerprint"
              value={fingerprintId()}
              onValueChange={(v) => setFingerprintId(v ?? "")}
              options={fingerprintOptions()}
              required={true}
              placeholder="Select fingerprint..."
            />

            <TextInputField
              type="text"
              label="CSRF Token"
              info="Можно вставить всю строку cookie: csrftoken=xxx; sessionid=yyy — поля заполнятся автоматически"
              value={csrfToken()}
              onValueChange={handleCsrfTokenChange}
              required={true}
              placeholder="csrftoken value или полная строка cookie"
            />

            <TextInputField
              type="text"
              label="Session ID"
              value={sessionId()}
              onValueChange={setSessionId}
              required={true}
              placeholder="sessionid value"
            />
          </Show>
        </div>
      )}
      footer={() => (
        <Show when={hasFingerprints()}>
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <LoadingButton
              variant="primary"
              size="sm"
              loading={createMutation.isPending}
              disabled={!canSubmit()}
              onClick={handleSubmit}
            >
              Create
            </LoadingButton>
          </div>
        </Show>
      )}
    />
  );
}

function NoFingerprintsMessage(props: { onClose: () => void }) {
  return (
    <div class="space-y-4 text-center py-4">
      <P level={2}>
        No browser fingerprints found. Create a fingerprint first.
      </P>
      <Link
        to="/infrastructure/browser-fingerprint"
        search={{}}
        class="inline-block"
        onClick={props.onClose}
      >
        <Button variant="primary" size="sm">
          Go to Fingerprints
        </Button>
      </Link>
    </div>
  );
}

export { SecretVoicerCredentialCreateDialog };
