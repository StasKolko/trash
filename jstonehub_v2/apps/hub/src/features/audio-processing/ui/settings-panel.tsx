import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { Select } from "@packages/ui/select";
import { RotateCcw } from "lucide-solid";
import { Show } from "solid-js";
import { AUDIO_PROCESSING_CONSTANTS } from "../lib/constants";
import type { ProcessingSettings } from "../model/types";

type SettingsPanelProps = {
  settings: ProcessingSettings;
  onChangeValue: (settings: ProcessingSettings) => void;
  onReset?: () => void;
  disabled?: boolean;
};

export function SettingsPanel(props: SettingsPanelProps) {
  const updateSetting = <K extends keyof ProcessingSettings>(
    key: K,
    value: ProcessingSettings[K],
  ) => {
    props.onChangeValue({ ...props.settings, [key]: value });
  };

  return (
    <Card
      title={
        <div class="flex items-center justify-between w-full">
          <span>Настройки обработки</span>
          <Show when={props.onReset}>
            <Button
              variant="ghost"
              size="btn-xs"
              onClick={props.onReset}
              disabled={props.disabled}
            >
              <RotateCcw class="w-3 h-3" />
              Сбросить
            </Button>
          </Show>
        </div>
      }
      description="Параметры удаления тишины и склейки файлов"
      content={
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="silenceThreshold">Порог тишины (dB)</Label>
            <Input
              id="silenceThreshold"
              type="number"
              min={-60}
              max={-20}
              step={1}
              value={props.settings.silenceThreshold}
              onInput={(e) =>
                updateSetting("silenceThreshold", Number(e.currentTarget.value))
              }
              disabled={props.disabled}
            />
            <p class="text-xs text-muted-foreground">
              Ниже — тише порог (
              {AUDIO_PROCESSING_CONSTANTS.DEFAULT_SILENCE_THRESHOLD} по
              умолчанию)
            </p>
          </div>

          <div class="space-y-2">
            <Label for="minSilenceDuration">Мин. длина паузы (сек)</Label>
            <Input
              id="minSilenceDuration"
              type="number"
              min={0.1}
              max={2}
              step={0.1}
              value={props.settings.minSilenceDuration}
              onInput={(e) =>
                updateSetting(
                  "minSilenceDuration",
                  Number(e.currentTarget.value),
                )
              }
              disabled={props.disabled}
            />
            <p class="text-xs text-muted-foreground">
              Паузы короче будут сохранены
            </p>
          </div>

          <div class="space-y-2">
            <Label for="pauseBetweenChunks">Пауза внутри файла (сек)</Label>
            <Input
              id="pauseBetweenChunks"
              type="number"
              min={0}
              max={3}
              step={0.1}
              value={props.settings.pauseBetweenChunks}
              onInput={(e) =>
                updateSetting(
                  "pauseBetweenChunks",
                  Number(e.currentTarget.value),
                )
              }
              disabled={props.disabled}
            />
          </div>

          <div class="space-y-2">
            <Label for="pauseBetweenFiles">Пауза между файлами (сек)</Label>
            <Input
              id="pauseBetweenFiles"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={props.settings.pauseBetweenFiles}
              onInput={(e) =>
                updateSetting(
                  "pauseBetweenFiles",
                  Number(e.currentTarget.value),
                )
              }
              disabled={props.disabled}
            />
          </div>

          <div class="space-y-2">
            <Label for="pauseAtStart">Пауза в начале (сек)</Label>
            <Input
              id="pauseAtStart"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={props.settings.pauseAtStart}
              onInput={(e) =>
                updateSetting("pauseAtStart", Number(e.currentTarget.value))
              }
              disabled={props.disabled}
            />
          </div>

          <div class="space-y-2">
            <Label for="pauseAtEnd">Пауза в конце (сек)</Label>
            <Input
              id="pauseAtEnd"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={props.settings.pauseAtEnd}
              onInput={(e) =>
                updateSetting("pauseAtEnd", Number(e.currentTarget.value))
              }
              disabled={props.disabled}
            />
          </div>

          <div class="space-y-2 sm:col-span-2">
            <Label for="outputFormat">Выходной формат</Label>
            <Select
              id="outputFormat"
              value={props.settings.outputFormat}
              onChangeValue={(value) =>
                updateSetting("outputFormat", value as "mp3" | "wav")
              }
              options={[
                { value: "mp3", label: "MP3 (сжатый, меньше размер)" },
                { value: "wav", label: "WAV (без сжатия, лучше качество)" },
              ]}
              disabled={props.disabled}
            />
          </div>
        </div>
      }
    />
  );
}
