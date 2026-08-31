import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { Select } from "@packages/ui/select";
import { Switch } from "@packages/ui/switch";
import { Textarea } from "@packages/ui/textarea";
import { createSignal } from "solid-js";
import { safeParse } from "valibot";
import { createSecretVoicerCredentialSchema } from "../lib/validation";
import type {
  CreateSecretVoicerCredentialInput,
  SecretVoicerCredentialFingerprintOption,
} from "../model/types";

const getInitialForm = (): CreateSecretVoicerCredentialInput => ({
  name: "",
  fingerprintId: "",
  csrfToken: "",
  sessionId: "",
  isActive: true,
});

export function CreateSecretVoicerCredentialDialog(props: {
  open: boolean;
  fingerprints: SecretVoicerCredentialFingerprintOption[];
  onClose: () => void;
  onSubmit: (data: CreateSecretVoicerCredentialInput) => Promise<void>;
}) {
  const [form, setForm] = createSignal<CreateSecretVoicerCredentialInput>(
    getInitialForm(),
  );
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const fingerprintSelectOptions = () =>
    props.fingerprints.map((fp) => ({
      value: fp.id,
      label: `${fp.name}${fp.isActive ? "" : " (неактивен)"}`,
      disabled: !fp.isActive,
    }));

  const updateField = <K extends keyof CreateSecretVoicerCredentialInput>(
    field: K,
    value: CreateSecretVoicerCredentialInput[K],
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

    const result = safeParse(createSecretVoicerCredentialSchema, form());

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
      setForm(getInitialForm());
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(getInitialForm());
    setErrors({});
    props.onClose();
  };

  return (
    <Dialog
      open={props.open}
      onChange={(open) => !open && handleClose()}
      title="Новые учётные данные"
      description="Добавьте CSRF токен и Session ID для Secret Voicer API"
      class="max-w-xl"
      footer={
        <>
          <Button
            variant="outline"
            type="button"
            onClick={handleClose}
            disabled={isSubmitting()}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting()}
            onClick={handleSubmit}
          >
            {isSubmitting() ? "Сохранение..." : "Создать"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} class="grid gap-5">
        <div class="grid gap-2">
          <Label for="cred-name" required={true} error={Boolean(errors().name)}>
            Название
          </Label>
          <Input
            id="cred-name"
            placeholder="Основной аккаунт"
            value={form().name}
            onInput={(e) => updateField("name", e.currentTarget.value)}
            disabled={isSubmitting()}
            error={Boolean(errors().name)}
            errorMessage={errors().name}
          />
        </div>

        <div class="grid gap-2">
          <Label
            for="cred-fingerprint"
            required={true}
            error={Boolean(errors().fingerprintId)}
          >
            Browser Fingerprint
          </Label>
          <Select
            id="cred-fingerprint"
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
            for="cred-csrf"
            required={true}
            error={Boolean(errors().csrfToken)}
          >
            CSRF Token
          </Label>
          <Textarea
            id="cred-csrf"
            placeholder="Вставьте CSRF токен из cookies..."
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
            for="cred-session"
            required={true}
            error={Boolean(errors().sessionId)}
          >
            Session ID
          </Label>
          <Textarea
            id="cred-session"
            placeholder="Вставьте Session ID из cookies..."
            value={form().sessionId}
            onInput={(e) => updateField("sessionId", e.currentTarget.value)}
            disabled={isSubmitting()}
            error={Boolean(errors().sessionId)}
            errorMessage={errors().sessionId}
            rows={2}
          />
        </div>

        <div class="flex items-center justify-between py-2">
          <Label for="cred-active">Активен</Label>
          <Switch
            id="cred-active"
            checked={form().isActive}
            onChangeValue={(checked) => updateField("isActive", checked)}
            disabled={isSubmitting()}
          />
        </div>
      </form>
    </Dialog>
  );
}
