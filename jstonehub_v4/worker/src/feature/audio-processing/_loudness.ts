import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import { LOUDNORM_FALLBACK, LOUDNORM_JSON_REGEX } from "./_constant";
import { runFfmpeg } from "./_ffmpeg-runner";

type LoudnessData = {
  inputI: string;
  inputTp: string;
  inputLra: string;
  inputThresh: string;
  targetOffset: string;
};

async function analyzeLoudness(
  inputPath: string,
  config: AudioProcessingConfig,
): Promise<LoudnessData> {
  const preFilters: string[] = [];
  if (config.highPassFilter.enabled) {
    preFilters.push(`highpass=f=${config.highPassFilter.frequencyHz}`);
  }

  const filterChain =
    preFilters.length > 0
      ? `${preFilters.join(",")},loudnorm=print_format=json`
      : "loudnorm=print_format=json";

  const stderr = await runFfmpeg([
    "-i",
    inputPath,
    "-af",
    filterChain,
    "-f",
    "null",
    "-",
  ]);
  return parseLoudnessOutput(stderr);
}

function parseLoudnessOutput(stderr: string): LoudnessData {
  const jsonMatch = stderr.match(LOUDNORM_JSON_REGEX);
  if (!jsonMatch) {
    throw new Error("Failed to parse loudnorm analysis output");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;
    return {
      inputI: parsed.input_i ?? LOUDNORM_FALLBACK.inputI,
      inputTp: parsed.input_tp ?? LOUDNORM_FALLBACK.inputTp,
      inputLra: parsed.input_lra ?? LOUDNORM_FALLBACK.inputLra,
      inputThresh: parsed.input_thresh ?? LOUDNORM_FALLBACK.inputThresh,
      targetOffset: parsed.target_offset ?? LOUDNORM_FALLBACK.targetOffset,
    };
  } catch {
    throw new Error("Failed to parse loudnorm JSON data");
  }
}

export type { LoudnessData };
export { analyzeLoudness };
