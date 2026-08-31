import type { AudioProcessingConfig } from "@packages/contract/audio-processing";
import type {
  AudioProcessingJobData,
  AudioProcessingJobResult,
} from "@packages/contract/queue";

import { mkdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, parse } from "node:path";
import { AUDIO_PROCESSING_NAME_LIMITS } from "@packages/contract/audio-processing";
import { createId } from "@packages/util/id";

import { workerStorage } from "#worker/shared/storage/storage";

import { processConcatenated } from "./_concatenation";
import { getFileDurationMs, getInputFiles } from "./_fs";
import { processFile } from "./_single-file";

type ProcessAllFilesParams = {
  files: string[];
  inputDir: string;
  outputDir: string;
  config: AudioProcessingConfig;
};

type UploadContext = {
  processedFiles: string[];
  outputPrefix: string;
  outputName: string;
  isConcatenated: boolean;
  inputFiles: string[];
  config: AudioProcessingConfig;
};

type OutputFileInfo = {
  key: string;
  fileName: string;
  sizeBytes: number;
  durationMs: number;
};

const INDEX_PREFIX_REGEX = /^\d+_/;

async function processAudio(
  data: AudioProcessingJobData,
): Promise<AudioProcessingJobResult> {
  const workDir = join(
    tmpdir(),
    `audio-processing-${data.jobId}-${createId()}`,
  );
  const inputDir = join(workDir, "input");
  const outputDir = join(workDir, "output");

  mkdirSync(inputDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });

  try {
    const result = await processInWorkDir(data, inputDir, outputDir);
    return result;
  } finally {
    cleanupWorkDir(workDir);
  }
}

async function processInWorkDir(
  data: AudioProcessingJobData,
  inputDir: string,
  outputDir: string,
): Promise<AudioProcessingJobResult> {
  const { config, inputKeys, outputPrefix, outputName, isConcatenated } = data;

  await downloadInputFiles(inputKeys, inputDir);

  const inputFiles = getInputFiles(inputDir);
  if (inputFiles.length === 0) {
    throw new Error("No audio files found after download");
  }

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(`🎵 Processing ${inputFiles.length} audio file(s)`);

  const processedFiles = isConcatenated
    ? [
        await processConcatenated({
          files: inputFiles,
          inputDir,
          outputDir,
          config,
        }),
      ]
    : await processAllFiles({ files: inputFiles, inputDir, outputDir, config });

  const ctx: UploadContext = {
    processedFiles,
    outputPrefix,
    outputName,
    isConcatenated,
    inputFiles,
    config,
  };
  const outputInfos = await uploadAllOutputFiles(ctx);

  const totalDurationMs = outputInfos.reduce((sum, f) => sum + f.durationMs, 0);

  await workerStorage.deleteObjects(inputKeys);

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(
    `✅ Audio processing complete: ${outputInfos.length} output file(s)`,
  );

  return {
    outputKeys: outputInfos.map((f) => f.key),
    outputFiles: outputInfos,
    processedCount: inputFiles.length,
    totalDurationMs,
    processedAt: Date.now(),
  };
}

function cleanupWorkDir(workDir: string): void {
  try {
    rmSync(workDir, { recursive: true, force: true });
  } catch {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.warn(`⚠️ Failed to clean up work dir: ${workDir}`);
  }
}

async function downloadInputFiles(
  keys: string[],
  inputDir: string,
): Promise<void> {
  await Promise.all(
    keys.map(async (key) => {
      const fileName = key.split("/").pop() ?? key;
      const destPath = join(inputDir, fileName);
      await workerStorage.downloadToFile(key, destPath);
    }),
  );
}

function processAllFiles(params: ProcessAllFilesParams): Promise<string[]> {
  const { files, inputDir, outputDir, config } = params;

  return Promise.all(
    files.map((fileName) => {
      const inputPath = join(inputDir, fileName);
      const { name } = parse(fileName);
      const outputPath = join(outputDir, `${name}.${config.output.format}`);

      return processFile({ inputPath, outputPath, config }).then(
        () => outputPath,
      );
    }),
  );
}

function uploadAllOutputFiles(ctx: UploadContext): Promise<OutputFileInfo[]> {
  return Promise.all(
    ctx.processedFiles.map((filePath, index) =>
      uploadSingleOutput(filePath, index, ctx),
    ),
  );
}

async function uploadSingleOutput(
  filePath: string,
  index: number,
  ctx: UploadContext,
): Promise<OutputFileInfo> {
  const outputName = buildOutputFileName(index, ctx);
  const key = `${ctx.outputPrefix}${outputName}`;
  const sizeBytes = statSync(filePath).size;
  const durationMs = await getFileDurationMs(filePath);

  await workerStorage.uploadFromFile(key, filePath);

  return { key, fileName: outputName, sizeBytes, durationMs };
}

function buildOutputFileName(index: number, ctx: UploadContext): string {
  const ext = ctx.config.output.format;
  const safeName = sanitizeOutputName(ctx.outputName);

  if (ctx.isConcatenated) {
    return `${safeName}.${ext}`;
  }

  const originalName = extractOriginalName(
    ctx.inputFiles[index] ?? `file_${index}`,
  );
  return `${safeName}_${originalName}.${ext}`;
}

function extractOriginalName(inputFileName: string): string {
  const base = basename(inputFileName);
  const { name } = parse(base);
  const cleaned = name.replace(INDEX_PREFIX_REGEX, "");
  return cleaned || name;
}

function sanitizeOutputName(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, AUDIO_PROCESSING_NAME_LIMITS.max) || "output"
  );
}

export { processAudio };
