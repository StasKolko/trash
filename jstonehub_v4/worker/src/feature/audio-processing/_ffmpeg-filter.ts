import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import type { LoudnessData } from "./_loudness";

import {
  DB_BASE,
  DB_DIVISOR,
  DB_PRECISION,
  LIMITER_ATTACK,
  LIMITER_RELEASE,
  LOUDNORM_LRA,
} from "./_constant";

function buildFilterChain(
  config: AudioProcessingConfig,
  loudnessData: LoudnessData | null,
): string {
  const filters: string[] = [];

  if (config.highPassFilter.enabled) {
    filters.push(`highpass=f=${config.highPassFilter.frequencyHz}`);
  }

  if (config.normalization.enabled) {
    if (loudnessData) {
      const { targetLufs, truePeakDb } = config.normalization;
      filters.push(
        [
          `loudnorm=I=${targetLufs}`,
          `TP=${truePeakDb}`,
          `LRA=${LOUDNORM_LRA}`,
          `measured_I=${loudnessData.inputI}`,
          `measured_TP=${loudnessData.inputTp}`,
          `measured_LRA=${loudnessData.inputLra}`,
          `measured_thresh=${loudnessData.inputThresh}`,
          `offset=${loudnessData.targetOffset}`,
          "linear=true",
          "print_format=summary",
        ].join(":"),
      );
    } else {
      const { targetLufs, truePeakDb } = config.normalization;
      filters.push(
        `loudnorm=I=${targetLufs}:TP=${truePeakDb}:LRA=${LOUDNORM_LRA}`,
      );
    }
  }

  if (config.limiter.enabled) {
    const amplitude = Number.parseFloat(
      (DB_BASE ** (config.limiter.limitDb / DB_DIVISOR)).toFixed(DB_PRECISION),
    );
    filters.push(
      `alimiter=limit=${amplitude}:attack=${LIMITER_ATTACK}:release=${LIMITER_RELEASE}:level=disabled`,
    );
  }

  return filters.join(",");
}

export { buildFilterChain };
