import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Typography } from "@packages/ui/typography";
import { Edit, Eye, EyeOff, Star } from "lucide-solid";
import { For, Show } from "solid-js";
import type { SecretVoicerVoice } from "../model/types";

type EmotionSupportValue = "none" | "basic" | "advanced";
type SupportedLanguageValue =
  (typeof secretVoicerContract.supportedLanguage.options)[number]["value"];

function getEmotionSupportVariant(
  emotionSupport: string,
): "success" | "warning" | "muted" {
  if (emotionSupport === "advanced") {
    return "success";
  }
  if (emotionSupport === "basic") {
    return "warning";
  }
  return "muted";
}

function getEmotionSupportLabel(emotionSupport: string): string {
  const values = secretVoicerContract.voiceEmotionSupport.values();
  if (values.includes(emotionSupport as EmotionSupportValue)) {
    return secretVoicerContract.voiceEmotionSupport.getLabel(
      emotionSupport as EmotionSupportValue,
    );
  }
  return emotionSupport;
}

function getLanguageLabel(langCode: string): string {
  const values = secretVoicerContract.supportedLanguage.values();
  if (values.includes(langCode as SupportedLanguageValue)) {
    return secretVoicerContract.supportedLanguage.getLabel(
      langCode as SupportedLanguageValue,
    );
  }
  return langCode;
}

export function ViewSecretVoicerVoiceDialog(props: {
  open: boolean;
  voice: SecretVoicerVoice;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const voice = () => props.voice;

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
      title={voice().externalName}
      description={`ID: ${voice().externalVoiceId}`}
      class="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={props.onClose}>
            Закрыть
          </Button>
          <Button onClick={props.onUpdate}>
            <Edit class="w-4 h-4" />
            Редактировать
          </Button>
        </>
      }
    >
      <div class="space-y-6">
        {/* Status badges */}
        <div class="flex flex-wrap items-center gap-2">
          <Badge
            variant={voice().externalGender === "MALE" ? "info" : "warning"}
          >
            {voice().externalGender === "MALE" ? "Мужской" : "Женский"}
          </Badge>
          <Badge variant={getEmotionSupportVariant(voice().emotionSupport)}>
            Эмоции: {getEmotionSupportLabel(voice().emotionSupport)}
          </Badge>
          <Show
            when={!voice().isHidden}
            fallback={
              <Badge variant="muted">
                <EyeOff class="w-3 h-3" />
                Скрыт
              </Badge>
            }
          >
            <Badge variant="success">
              <Eye class="w-3 h-3" />
              Видимый
            </Badge>
          </Show>
        </div>

        {/* Rating */}
        <div class="flex items-center gap-2">
          <Star class="w-5 h-5 text-warning-foreground" />
          <Typography type="title" level={4}>
            {voice().rating}/10
          </Typography>
        </div>

        {/* External info */}
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Typography level={5} color="muted">
              Локаль
            </Typography>
            <Typography level={4}>{voice().externalLocale ?? "—"}</Typography>
          </div>
          <div>
            <Typography level={5} color="muted">
              Акцент
            </Typography>
            <Typography level={4}>{voice().externalAccent ?? "—"}</Typography>
          </div>
          <div>
            <Typography level={5} color="muted">
              Возраст
            </Typography>
            <Typography level={4}>{voice().externalAgeGroup ?? "—"}</Typography>
          </div>
          <div>
            <Typography level={5} color="muted">
              Мультиязычный
            </Typography>
            <Typography level={4}>
              {voice().externalIsMultilingual ? "Да" : "Нет"}
            </Typography>
          </div>
        </div>

        {/* Tested languages */}
        <Show
          when={
            voice().testedLanguages
            && (voice().testedLanguages?.length ?? 0) > 0
          }
        >
          <div>
            <Typography level={5} color="muted" class="mb-2">
              Проверенные языки
            </Typography>
            <div class="flex flex-wrap gap-1">
              <For each={voice().testedLanguages}>
                {(lang) => (
                  <Badge variant="secondary" size="sm">
                    {getLanguageLabel(lang)}
                  </Badge>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Notes */}
        <Show when={voice().notes}>
          <div>
            <Typography level={5} color="muted" class="mb-1">
              Заметки
            </Typography>
            <Typography level={4}>{voice().notes}</Typography>
          </div>
        </Show>

        {/* Description */}
        <Show when={voice().externalDescription}>
          <div>
            <Typography level={5} color="muted" class="mb-1">
              Описание (внешнее)
            </Typography>
            <Typography level={4} color="muted">
              {voice().externalDescription}
            </Typography>
          </div>
        </Show>
      </div>
    </Dialog>
  );
}
