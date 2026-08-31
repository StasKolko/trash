import type { AudioProcessingUserConfig } from "#hub/feature/audio-processing/_audio-processing-config";

import { createSignal } from "solid-js";

import { createDefaultUserConfig } from "#hub/feature/audio-processing/_audio-processing-config";

function useTtsAudio() {
  const [processingEnabled, setProcessingEnabled] = createSignal(true);
  const [detailConfig, setDetailConfig] =
    createSignal<AudioProcessingUserConfig>(createDefaultUserConfig());

  function buildAudioProcessingPayload() {
    const cfg = detailConfig();
    if (!processingEnabled()) {
      return { enabled: false, concatenate: false, config: {} };
    }
    return {
      enabled: true,
      concatenate: cfg.concatenationEnabled,
      config: {
        concatenation: { enabled: cfg.concatenationEnabled },
        normalization: { enabled: cfg.normalizationEnabled },
        silenceRemoval: {
          keepGapMs: cfg.keepGapMs,
          thresholdDb: cfg.thresholdDb,
          minDurationMs: cfg.minDurationMs,
        },
        gaps: {
          betweenMs: cfg.concatenationEnabled ? cfg.betweenMs : 0,
          startMs: cfg.concatenationEnabled ? cfg.startMs : 0,
          endMs: cfg.concatenationEnabled ? cfg.endMs : 0,
        },
      },
    };
  }

  return {
    processingEnabled,
    setProcessingEnabled,
    detailConfig,
    setDetailConfig,
    buildAudioProcessingPayload,
  };
}

export { useTtsAudio };
