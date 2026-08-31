import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import { existsSync, unlinkSync } from "node:fs";
import { dirname, join, parse } from "node:path";

import { buildOutputArgs } from "./_ffmpeg-args";
import { buildFilterChain } from "./_ffmpeg-filter";
import { runFfmpeg } from "./_ffmpeg-runner";
import { analyzeLoudness } from "./_loudness";
import { removeSilence } from "./_silence-remove";

type ProcessFileParams = {
  inputPath: string;
  outputPath: string;
  config: AudioProcessingConfig;
};

async function processFile(params: ProcessFileParams): Promise<void> {
  const { inputPath, outputPath, config } = params;
  const tempPaths: string[] = [];

  try {
    // Step 1: Remove TTS click artifacts
    const declickedPath = buildTempPath(outputPath, "_declicked.wav");
    await declick(inputPath, declickedPath);
    tempPaths.push(declickedPath);

    // Step 2: Remove silence
    const silenceRemovedPath = buildTempPath(outputPath, "_no_silence.wav");
    const afterSilence = await removeSilence(
      declickedPath,
      silenceRemovedPath,
      config,
    );
    if (afterSilence !== declickedPath) {
      tempPaths.push(silenceRemovedPath);
    }

    // Step 3: Normalize + limiter + highpass
    if (config.normalization.enabled) {
      const loudnessData = await analyzeLoudness(afterSilence, config);
      const filterChain = buildFilterChain(config, loudnessData);
      const args = buildOutputArgs({
        inputPath: afterSilence,
        outputPath,
        filterChain,
        config,
      });
      await runFfmpeg(args);
    } else {
      const filterChain = buildFilterChain(config, null);
      const args = buildOutputArgs({
        inputPath: afterSilence,
        outputPath,
        filterChain,
        config,
      });
      await runFfmpeg(args);
    }
  } finally {
    for (const tempPath of tempPaths) {
      if (existsSync(tempPath)) {
        try {
          unlinkSync(tempPath);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

// adeclick detects and interpolates over short impulsive artifacts
// typical of TTS engines (1-10ms high-frequency spikes at segment
// boundaries). Window 55 samples ≈ 1.25ms at 44.1kHz — catches
// TTS clicks without affecting speech.
async function declick(inputPath: string, outputPath: string): Promise<void> {
  await runFfmpeg([
    "-i",
    inputPath,
    "-af",
    "adeclick=window=55:overlap=75:arorder=8:threshold=2",
    "-c:a",
    "pcm_s16le",
    "-y",
    outputPath,
  ]);
}

function buildTempPath(outputPath: string, suffix: string): string {
  const dir = dirname(outputPath);
  const { name } = parse(outputPath);
  return join(dir, `${name}${suffix}`);
}

export type { ProcessFileParams };
export { processFile };
