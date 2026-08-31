import { SwitchField } from "@packages/ui/form";
import { H3 } from "@packages/ui/typography";

type TtsAudioSettings = {
  enabled: boolean;
  concatenate: boolean;
  config: Record<string, unknown>;
};

type TtsAudioConfigProps = {
  settings: TtsAudioSettings;
  onSettingsChange: (settings: TtsAudioSettings) => void;
};

function TtsAudioConfig(props: TtsAudioConfigProps) {
  function update(partial: Partial<TtsAudioSettings>) {
    props.onSettingsChange({ ...props.settings, ...partial });
  }

  return (
    <div class="space-y-3">
      <H3>Audio Processing</H3>

      <SwitchField
        label="Process audio after synthesis"
        info="Remove silence, normalize loudness"
        checked={props.settings.enabled}
        onCheckedChange={(v) => update({ enabled: v as boolean })}
      />

      <SwitchField
        label="Concatenate into one file"
        info="Merge all segments into a single audio file"
        checked={props.settings.concatenate}
        onCheckedChange={(v) => update({ concatenate: v as boolean })}
        disabled={!props.settings.enabled}
      />
    </div>
  );
}

export type { TtsAudioSettings };
export { TtsAudioConfig };
