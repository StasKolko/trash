import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { Select } from "@packages/ui/select";
import { Switch } from "@packages/ui/switch";
import { Textarea } from "@packages/ui/textarea";
import { createEffect, createSignal } from "solid-js";
import { safeParse } from "valibot";
import { updateSecretVoicerVoiceSchema } from "../lib/validation";
import type {
  SecretVoicerVoice,
  UpdateSecretVoicerVoiceInput,
} from "../model/types";
import { LanguageSelector } from "./language-selector";

type EmotionSupportValue = "none" | "basic" | "advanced";

export function UpdateSecretVoicerVoiceDialog(props: {
  open: boolean;
  voice: SecretVoicerVoice;
  onClose: () => void;
  onSubmit: (data: UpdateSecretVoicerVoiceInput) => Promise<void>;
}) {
  const [form, setForm] = createSignal<UpdateSecretVoicerVoiceInput>({
    emotionSupport: "none",
    testedLanguages: [],
    rating: 5,
    notes: null,
    isHidden: false,
  });
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const emotionOptions = secretVoicerContract.voiceEmotionSupport.options.map(
    (o) => ({
      value: o.value,
      label: o.label,
    }),
  );

  createEffect(() => {
    if (props.open) {
      const v = props.voice;
      setForm({
        emotionSupport: v.emotionSupport as EmotionSupportValue,
        testedLanguages: v.testedLanguages ?? [],
        rating: v.rating,
        notes: v.notes,
        isHidden: v.isHidden,
      });
      setErrors({});
    }
  });

  const updateField = <K extends keyof UpdateSecretVoicerVoiceInput>(
    field: K,
    value: UpdateSecretVoicerVoiceInput[K],
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

    const result = safeParse(updateSecretVoicerVoiceSchema, form());

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
      title={`Редактировать: ${props.voice.externalName}`}
      description="Изменение кастомных полей голоса"
      class="max-w-xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={props.onClose}
            disabled={isSubmitting()}
          >
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting()}>
            {isSubmitting() ? "Сохранение..." : "Сохранить"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} class="space-y-5">
        {/* Emotion Support */}
        <div class="space-y-2">
          <Label for="emotion-support">Поддержка эмоций</Label>
          <Select
            id="emotion-support"
            value={form().emotionSupport}
            onChangeValue={(v) =>
              updateField("emotionSupport", v as EmotionSupportValue)
            }
            options={emotionOptions}
            placeholder="Выберите уровень эмоций..."
            disabled={isSubmitting()}
            modal={true}
          />
        </div>

        {/* Rating */}
        <div class="space-y-2">
          <Label for="rating" error={Boolean(errors().rating)}>
            Рейтинг (1-10)
          </Label>
          <Input
            id="rating"
            type="number"
            min={1}
            max={10}
            value={form().rating}
            onInput={(e) =>
              updateField("rating", Number(e.currentTarget.value))
            }
            disabled={isSubmitting()}
            error={Boolean(errors().rating)}
            errorMessage={errors().rating}
          />
        </div>

        {/* Tested Languages */}
        <div class="space-y-2">
          <Label for="tested-languages">Проверенные языки</Label>
          <LanguageSelector
            id="tested-languages"
            value={form().testedLanguages ?? []}
            onChangeValue={(langs) => updateField("testedLanguages", langs)}
            disabled={isSubmitting()}
            modal={true}
          />
        </div>

        {/* Notes */}
        <div class="space-y-2">
          <Label for="notes">Заметки</Label>
          <Textarea
            id="notes"
            placeholder="Заметки для себя или ИИ..."
            value={form().notes ?? ""}
            onInput={(e) => updateField("notes", e.currentTarget.value || null)}
            disabled={isSubmitting()}
            rows={3}
          />
        </div>

        {/* Hidden */}
        <div class="flex items-center justify-between py-2">
          <Label for="is-hidden">Скрыть голос</Label>
          <Switch
            id="is-hidden"
            checked={form().isHidden}
            onChangeValue={(checked) => updateField("isHidden", checked)}
            disabled={isSubmitting()}
          />
        </div>
      </form>
    </Dialog>
  );
}
