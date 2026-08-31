import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { Select } from "@packages/ui/select";
import { Switch } from "@packages/ui/switch";
import { Textarea } from "@packages/ui/textarea";
import { createEffect, createSignal } from "solid-js";
import { safeParse } from "valibot";
import { updateSecretVoicerCredentialSchema } from "../lib/validation";
import type {
  SecretVoicerCredential,
  SecretVoicerCredentialFingerprintOption,
  UpdateSecretVoicerCredentialInput,
} from "../model/types";

export function UpdateSecretVoicerCredentialDialog(props: {
  open: boolean;
  credential: SecretVoicerCredential;
  fingerprints: SecretVoicerCredentialFingerprintOption[];
  onClose: () => void;
  onSubmit: (data: UpdateSecretVoicerCredentialInput) => Promise<void>;
}) {
  const [form, setForm] = createSignal<UpdateSecretVoicerCredentialInput>({
    name: "",
    fingerprintId: "",
    csrfToken: "",
    sessionId: "",
    isActive: true,
  });
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const fingerprintSelectOptions = () =>
    props.fingerprints.map((fp) => ({
      value: fp.id,
      label: `${fp.name}${fp.isActive ? "" : " (неактивен)"}`,
      disabled: !fp.isActive,
    }));

  // Синхронизация формы при открытии
  createEffect(() => {
    if (props.open) {
      const cred = props.credential;
      setForm({
        name: cred.name,
        fingerprintId: cred.fingerprintId,
        csrfToken: cred.csrfToken,
        sessionId: cred.sessionId,
        isActive: cred.isActive,
      });
      setErrors({});
    }
  });

  const updateField = <K extends keyof UpdateSecretVoicerCredentialInput>(
    field: K,
    value: UpdateSecretVoicerCredentialInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors()[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = safeParse(updateSecretVoicerCredentialSchema, form());

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.issues) {
        const key = issue.path?.[0]?.key as string;
        if (key) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await props.onSubmit(result.output);
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={props.open}
      onChange={(open) => !open && props.onClose()}
      title="Редактировать учётные данные"
      description="Измените параметры доступа к Secret Voicer API"
      class="max-w-xl"
      footer={
        <>
          <Button
            variant="outline"
            type="button"
            onClick={props.onClose}
            disabled={isSubmitting()}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting()}
            onClick={handleSubmit}
          >
            {isSubmitting() ? "Сохранение..." : "Сохранить"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} class="grid gap-5">
        <div class="grid gap-2">
          <Label
            for="update-cred-name"
            required={true}
            error={Boolean(errors().name)}
          >
            Название
          </Label>
          <Input
            id="update-cred-name"
            value={form().name}
            onInput={(e) => updateField("name", e.currentTarget.value)}
            disabled={isSubmitting()}
            error={Boolean(errors().name)}
            errorMessage={errors().name}
          />
        </div>

        <div class="grid gap-2">
          <Label
            for="update-cred-fingerprint"
            required={true}
            error={Boolean(errors().fingerprintId)}
          >
            Browser Fingerprint
          </Label>
          <Select
            id="update-cred-fingerprint"
            value={form().fingerprintId}
            onChangeValue={(v) => updateField("fingerprintId", v)}
            options={fingerprintSelectOptions()}
            placeholder="Выберите fingerprint..."
            disabled={isSubmitting()}
            error={Boolean(errors().fingerprintId)}
            errorMessage={errors().fingerprintId}
          />
        </div>

        <div class="grid gap-2">
          <Label
            for="update-cred-csrf"
            required={true}
            error={Boolean(errors().csrfToken)}
          >
            CSRF Token
          </Label>
          <Textarea
            id="update-cred-csrf"
            value={form().csrfToken}
            onInput={(e) => updateField("csrfToken", e.currentTarget.value)}
            disabled={isSubmitting()}
            error={Boolean(errors().csrfToken)}
            errorMessage={errors().csrfToken}
            rows={2}
          />
        </div>

        <div class="grid gap-2">
          <Label
            for="update-cred-session"
            required={true}
            error={Boolean(errors().sessionId)}
          >
            Session ID
          </Label>
          <Textarea
            id="update-cred-session"
            value={form().sessionId}
            onInput={(e) => updateField("sessionId", e.currentTarget.value)}
            disabled={isSubmitting()}
            error={Boolean(errors().sessionId)}
            errorMessage={errors().sessionId}
            rows={2}
          />
        </div>

        <div class="flex items-center justify-between py-2">
          <Label for="update-cred-active">Активен</Label>
          <Switch
            id="update-cred-active"
            checked={form().isActive}
            onChangeValue={(checked) => updateField("isActive", checked)}
            disabled={isSubmitting()}
          />
        </div>
      </form>
    </Dialog>
  );
}
