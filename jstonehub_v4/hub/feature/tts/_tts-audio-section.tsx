import type { AudioProcessingUserConfig } from "#hub/feature/audio-processing/_audio-processing-config";

import { Button } from "@packages/ui/action";
import { SwitchField } from "@packages/ui/form";
import { Settings2 } from "lucide-solid";
import { createSignal, Show } from "solid-js";

import { TtsAudioSettingsDialog } from "./_tts-audio-settings-dialog";

type TtsAudioSectionProps = {
  processingEnabled: boolean;
  onProcessingEnabledChange: (v: boolean) => void;
  detailConfig: AudioProcessingUserConfig;
  onDetailConfigChange: (config: AudioProcessingUserConfig) => void;
};

function TtsAudioSection(props: TtsAudioSectionProps) {
  const [detailOpen, setDetailOpen] = createSignal(false);

  return (
    <div class="rounded-lg border border-border p-4 space-y-3 bg-card">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Audio Processing</span>
        <Show when={props.processingEnabled}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailOpen(true)}
          >
            <Settings2 size={14} />
            Details
          </Button>
        </Show>
      </div>

      <SwitchField
        label="Process audio after synthesis"
        info="Remove silence, normalize loudness, concatenate segments"
        checked={props.processingEnabled}
        onCheckedChange={(v) => props.onProcessingEnabledChange(v as boolean)}
      />

      <TtsAudioSettingsDialog
        open={detailOpen()}
        onClose={() => setDetailOpen(false)}
        config={props.detailConfig}
        onConfigChange={props.onDetailConfigChange}
      />
    </div>
  );
}

export type { TtsAudioSectionProps };
export { TtsAudioSection };
