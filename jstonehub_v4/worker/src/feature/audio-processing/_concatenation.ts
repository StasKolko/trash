import type { AudioProcessingConfig } from "@packages/contract/audio-processing";

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { MS_IN_SECOND, PART_INDEX_PAD_LENGTH } from "./_constant";
import { runFfmpeg } from "./_ffmpeg-runner";
import { removeTempDir } from "./_fs";
import { processFile } from "./_single-file";

type ConcatenateParams = {
  files: string[];
  inputDir: string;
  outputDir: string;
  config: AudioProcessingConfig;
};

type BuildAllPartsParams = {
  files: string[];
  inputDir: string;
  tempDir: string;
  config: AudioProcessingConfig;
};

type ConcatInputsResult = {
  inputs: string[];
  filters: string[];
};

async function processConcatenated(params: ConcatenateParams): Promise<string> {
  const { files, inputDir, outputDir, config } = params;

  const tempDir = join(outputDir, "_temp");
  mkdirSync(tempDir, { recursive: true });

  try {
    const partConfig = buildPartConfig(config);
    const parts = await buildAllParts({
      files,
      inputDir,
      tempDir,
      config: partConfig,
    });

    const outputPath = join(outputDir, `concatenated.${config.output.format}`);
    await concatAndFinalize(parts, outputPath, config);

    return outputPath;
  } finally {
    removeTempDir(tempDir);
  }
}

function buildPartConfig(config: AudioProcessingConfig): AudioProcessingConfig {
  return {
    ...config,
    fade: { inMs: 0, outMs: 0 },
    gaps: { innerMs: config.gaps.innerMs, betweenMs: 0, startMs: 0, endMs: 0 },
    concatenation: { enabled: false },
  };
}

function buildAllParts(params: BuildAllPartsParams): Promise<string[]> {
  const { files, inputDir, tempDir, config } = params;

  return Promise.all(
    files.map((file, index) => {
      const inputPath = join(inputDir, file);
      const padded = String(index).padStart(PART_INDEX_PAD_LENGTH, "0");
      const outputPath = join(tempDir, `part_${padded}.wav`);

      return processFile({ inputPath, outputPath, config }).then(
        () => outputPath,
      );
    }),
  );
}

async function concatAndFinalize(
  files: string[],
  outputPath: string,
  config: AudioProcessingConfig,
): Promise<void> {
  if (files.length === 0) {
    return;
  }

  const firstFile = files[0];
  if (files.length === 1 && firstFile) {
    await encodeSingleFile(firstFile, outputPath, config);
    return;
  }

  const args: string[] = [];
  const filterParts: string[] = [];
  const sampleRate = config.output.sampleRate;

  for (const file of files) {
    args.push("-i", file);
  }

  for (let i = 0; i < files.length; i++) {
    filterParts.push(
      `[${i}:a]aformat=sample_fmts=fltp:sample_rates=${sampleRate}:channel_layouts=stereo[a${i}]`,
    );
  }

  const concatInputs = buildConcatInputs({
    fileCount: files.length,
    betweenMs: config.gaps.betweenMs,
    sampleRate,
  });

  filterParts.push(...concatInputs.filters);

  const postFilters = buildPostFilters(config);
  const concatExpr = `${concatInputs.inputs.join("")}concat=n=${concatInputs.inputs.length}:v=0:a=1`;

  if (postFilters.length > 0) {
    filterParts.push(`${concatExpr}[merged]`);
    filterParts.push(`[merged]${postFilters.join(",")}[final]`);
    args.push("-filter_complex", filterParts.join(";"), "-map", "[final]");
  } else {
    filterParts.push(`${concatExpr}[merged]`);
    args.push("-filter_complex", filterParts.join(";"), "-map", "[merged]");
  }

  args.push("-ar", String(sampleRate));
  addCodecArgs(args, config);
  args.push("-y", outputPath);

  await runFfmpeg(args);
}

function buildPostFilters(config: AudioProcessingConfig): string[] {
  const filters: string[] = [];

  if (config.gaps.startMs > 0) {
    filters.push(`adelay=${config.gaps.startMs}|${config.gaps.startMs}`);
  }
  if (config.gaps.endMs > 0) {
    filters.push(`apad=pad_dur=${config.gaps.endMs / MS_IN_SECOND}`);
  }
  if (config.fade.inMs > 0) {
    filters.push(`afade=t=in:d=${config.fade.inMs / MS_IN_SECOND}`);
  }
  if (config.fade.outMs > 0) {
    const sec = config.fade.outMs / MS_IN_SECOND;
    filters.push(`areverse,afade=t=in:d=${sec},areverse`);
  }

  return filters;
}

async function encodeSingleFile(
  inputPath: string,
  outputPath: string,
  config: AudioProcessingConfig,
): Promise<void> {
  const filters = buildPostFilters(config);
  const args = ["-i", inputPath];

  if (filters.length > 0) {
    args.push("-af", filters.join(","));
  }

  args.push("-ar", String(config.output.sampleRate));
  addCodecArgs(args, config);
  args.push("-y", outputPath);

  await runFfmpeg(args);
}

type BuildConcatInputsParams = {
  fileCount: number;
  betweenMs: number;
  sampleRate: number;
};

function buildConcatInputs(
  params: BuildConcatInputsParams,
): ConcatInputsResult {
  const { fileCount, betweenMs, sampleRate } = params;
  const inputs: string[] = [];
  const filters: string[] = [];

  for (let i = 0; i < fileCount; i++) {
    if (i > 0 && betweenMs > 0) {
      const label = `silence${i}`;
      filters.push(
        `aevalsrc=0:d=${betweenMs / MS_IN_SECOND}:s=${sampleRate}:c=stereo[${label}]`,
      );
      inputs.push(`[${label}]`);
    }
    inputs.push(`[a${i}]`);
  }

  return { inputs, filters };
}

function addCodecArgs(args: string[], config: AudioProcessingConfig): void {
  const { format, bitrate } = config.output;
  if (format === "mp3") {
    args.push("-codec:a", "libmp3lame", "-b:a", bitrate);
  } else if (format === "ogg") {
    args.push("-codec:a", "libvorbis", "-b:a", bitrate);
  } else if (format === "wav") {
    args.push("-codec:a", "pcm_s16le");
  }
}

export { processConcatenated };
