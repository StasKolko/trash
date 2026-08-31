import {
  AUDIO_PROCESSING_DEFAULTS,
  AUDIO_PROCESSING_LIMITS,
  AUDIO_PROCESSING_NAME_LIMITS,
} from "@packages/contract/audio-processing";
import {
  NumberInputField,
  SwitchField,
  TextInputField,
} from "@packages/ui/form";
import { Show } from "solid-js";

type AudioProcessingUserConfig = {
  concatenationEnabled: boolean;
  normalizationEnabled: boolean;
  keepGapMs: number;
  thresholdDb: number;
  minDurationMs: number;
  betweenMs: number;
  startMs: number;
  endMs: number;
  outputName: string;
};

type AudioProcessingConfigPanelProps = {
  config: AudioProcessingUserConfig;
  onConfigChange: (config: AudioProcessingUserConfig) => void;
  showNameField?: boolean;
};

const L = AUDIO_PROCESSING_LIMITS;

function createDefaultUserConfig(): AudioProcessingUserConfig {
  const d = AUDIO_PROCESSING_DEFAULTS;
  return {
    concatenationEnabled: d.concatenation.enabled,
    normalizationEnabled: d.normalization.enabled,
    keepGapMs: d.silenceRemoval.keepGapMs,
    thresholdDb: d.silenceRemoval.thresholdDb,
    minDurationMs: d.silenceRemoval.minDurationMs,
    betweenMs: d.gaps.betweenMs,
    startMs: d.gaps.startMs,
    endMs: d.gaps.endMs,
    outputName: "",
  };
}

function buildApiConfig(
  userConfig: AudioProcessingUserConfig,
): Record<string, unknown> {
  return {
    concatenation: { enabled: userConfig.concatenationEnabled },
    normalization: { enabled: userConfig.normalizationEnabled },
    silenceRemoval: {
      keepGapMs: userConfig.keepGapMs,
      thresholdDb: userConfig.thresholdDb,
      minDurationMs: userConfig.minDurationMs,
    },
    gaps: {
      betweenMs: userConfig.concatenationEnabled ? userConfig.betweenMs : 0,
      startMs: userConfig.concatenationEnabled ? userConfig.startMs : 0,
      endMs: userConfig.concatenationEnabled ? userConfig.endMs : 0,
    },
  };
}

function AudioProcessingConfigPanel(props: AudioProcessingConfigPanelProps) {
  const showName = () => props.showNameField ?? true;

  function update(partial: Partial<AudioProcessingUserConfig>) {
    props.onConfigChange({ ...props.config, ...partial });
  }

  return (
    <div class="space-y-4">
      <Show when={showName()}>
        <TextInputField
          type="text"
          label={props.config.concatenationEnabled ? "Name" : "Prefix"}
          value={props.config.outputName}
          onValueChange={(v) => update({ outputName: v })}
          required={true}
          placeholder={
            props.config.concatenationEnabled
              ? "e.g. funny-joke-01"
              : "e.g. joke-parts"
          }
          maxLength={AUDIO_PROCESSING_NAME_LIMITS.max}
        />
      </Show>

      <SwitchField
        label="Concatenate into one file"
        checked={props.config.concatenationEnabled}
        onCheckedChange={(v) => update({ concatenationEnabled: v as boolean })}
      />

      <SwitchField
        label="Loudness normalization"
        checked={props.config.normalizationEnabled}
        onCheckedChange={(v) => update({ normalizationEnabled: v as boolean })}
      />

      <NumberInputField
        label="Inner gap (ms)"
        info="Silence kept between voiced segments within a file"
        value={props.config.keepGapMs}
        onValueChange={(v) =>
          update({
            keepGapMs: clampInt(v as number, L.silenceRemoval.keepGapMs),
          })
        }
      />

      <NumberInputField
        label="Silence threshold (dB)"
        value={props.config.thresholdDb}
        onValueChange={(v) =>
          update({
            thresholdDb: clampNum(v as number, L.silenceRemoval.thresholdDb),
          })
        }
      />

      <NumberInputField
        label="Min silence duration (ms)"
        value={props.config.minDurationMs}
        onValueChange={(v) =>
          update({
            minDurationMs: clampInt(
              v as number,
              L.silenceRemoval.minDurationMs,
            ),
          })
        }
      />

      <NumberInputField
        label="Gap between files (ms)"
        info="Only when concatenation is on"
        value={props.config.betweenMs}
        onValueChange={(v) =>
          update({ betweenMs: clampInt(v as number, L.gaps.betweenMs) })
        }
        disabled={!props.config.concatenationEnabled}
      />

      <NumberInputField
        label="Start padding (ms)"
        value={props.config.startMs}
        onValueChange={(v) =>
          update({ startMs: clampInt(v as number, L.gaps.startMs) })
        }
        disabled={!props.config.concatenationEnabled}
      />

      <NumberInputField
        label="End padding (ms)"
        value={props.config.endMs}
        onValueChange={(v) =>
          update({ endMs: clampInt(v as number, L.gaps.endMs) })
        }
        disabled={!props.config.concatenationEnabled}
      />
    </div>
  );
}

function clampInt(value: number, range: { min: number; max: number }): number {
  if (Number.isNaN(value)) {
    return range.min;
  }
  return Math.round(Math.min(Math.max(value, range.min), range.max));
}

function clampNum(value: number, range: { min: number; max: number }): number {
  if (Number.isNaN(value)) {
    return range.min;
  }
  return Math.min(Math.max(value, range.min), range.max);
}

export type { AudioProcessingUserConfig };
export { AudioProcessingConfigPanel, buildApiConfig, createDefaultUserConfig };
