import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createProcessedAudio, updateProcessedAudio } from "../data/repository";
import type { ProcessingSettings } from "../data/types";
import { AUDIO_PROCESSING_CONSTANTS } from "../lib/constants";
import {
  concatenateAudioFiles,
  removeSilence,
  sortFilesNaturally,
} from "../lib/ffmpeg";

const SILENCE_REMOVAL_PROGRESS_WEIGHT = 40;
const CONCAT_PROGRESS_WEIGHT = 0.6;
const BYTES_PER_KB = 1024;
const FULL_PROGRESS = 100;

type ProcessFromUploadInput = {
  files: { path: string; name: string }[];
  settings: ProcessingSettings;
};

type ProcessFromSynthesisInput = {
  projectId: string;
  storagePath: string;
  settings: ProcessingSettings;
};

function generateFilesHash(filenames: string[]): string {
  const sorted = [...filenames].sort();
  return crypto.createHash("md5").update(sorted.join("|")).digest("hex");
}

function getExpirationDate(): Date {
  const date = new Date();
  date.setDate(
    date.getDate() + AUDIO_PROCESSING_CONSTANTS.CACHE_RETENTION_DAYS,
  );
  return date;
}

async function processAudioJob(
  jobId: string,
  inputFiles: string[],
  settings: ProcessingSettings,
): Promise<void> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`🎵 [AudioProcessing] Starting job ${jobId}`);

  try {
    await updateProcessedAudio(jobId, {
      status: "PROCESSING",
      progress: 0,
    });

    const sortedFiles = sortFilesNaturally(inputFiles);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`📁 [AudioProcessing] Processing ${sortedFiles.length} files`);

    for (const file of sortedFiles) {
      try {
        // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER sequential file validation needed before processing
        await fs.access(file);
      } catch {
        throw new Error(`File not found: ${file}`);
      }
    }

    const tempDir = path.join(AUDIO_PROCESSING_CONSTANTS.UPLOADS_PATH, jobId);
    await fs.mkdir(tempDir, { recursive: true });

    const processedChunks: string[] = [];
    for (let i = 0; i < sortedFiles.length; i++) {
      const inputFile = sortedFiles[i];
      if (!inputFile) {
        throw new Error(`File at index ${i} is undefined`);
      }
      const outputFile = path.join(tempDir, `chunk_${i}.wav`);

      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔇 [AudioProcessing] Removing silence from file ${i + 1}/${sortedFiles.length}`,
      );
      // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER sequential processing needed for ordered audio chunks
      await removeSilence(inputFile, outputFile, settings);
      processedChunks.push(outputFile);

      const progress = Math.round(
        ((i + 1) / sortedFiles.length) * SILENCE_REMOVAL_PROGRESS_WEIGHT,
      );
      await updateProcessedAudio(jobId, { progress });
    }

    const outputExt = settings.outputFormat;
    const outputPath = path.join(
      AUDIO_PROCESSING_CONSTANTS.PROCESSED_PATH,
      `${jobId}.${outputExt}`,
    );

    await fs.mkdir(AUDIO_PROCESSING_CONSTANTS.PROCESSED_PATH, {
      recursive: true,
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `🔗 [AudioProcessing] Concatenating ${processedChunks.length} chunks`,
    );
    const result = await concatenateAudioFiles(
      processedChunks,
      outputPath,
      settings,
      (concatProgress) => {
        const totalProgress =
          SILENCE_REMOVAL_PROGRESS_WEIGHT
          + Math.round(concatProgress * CONCAT_PROGRESS_WEIGHT);
        updateProcessedAudio(jobId, { progress: totalProgress }).catch(() => {
          // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
          console.warn(
            `[AudioProcessing] Failed to update progress for job ${jobId}`,
          );
        });
      },
    );

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log("🧹 [AudioProcessing] Cleaning up temp files");
    await fs.rm(tempDir, { recursive: true, force: true });

    await updateProcessedAudio(jobId, {
      status: "COMPLETED",
      progress: FULL_PROGRESS,
      outputPath: result.outputPath,
      outputSize: result.size,
      outputDuration: result.duration,
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`✅ [AudioProcessing] Job ${jobId} completed`);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`   📁 Output: ${result.outputPath}`);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `   📊 Size: ${(result.size / BYTES_PER_KB / BYTES_PER_KB).toFixed(2)} MB`,
    );
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`   ⏱️ Duration: ${result.duration.toFixed(2)} seconds`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`❌ [AudioProcessing] Job ${jobId} failed:`, errorMsg);

    await updateProcessedAudio(jobId, {
      status: "FAILED",
      error: errorMsg,
    });

    const tempDir = path.join(AUDIO_PROCESSING_CONSTANTS.UPLOADS_PATH, jobId);
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.warn(
        `[AudioProcessing] Failed to cleanup temp dir for job ${jobId}`,
      );
    });
  }
}

export async function processUploadedAudio(
  input: ProcessFromUploadInput,
): Promise<string> {
  const { files, settings } = input;

  const filesHash = generateFilesHash(files.map((f) => f.name));
  const job = await createProcessedAudio({
    sourceType: "upload",
    sourceFilesHash: filesHash,
    settings,
    status: "PENDING",
    expiresAt: getExpirationDate(),
  });

  processAudioJob(
    job.id,
    files.map((f) => f.path),
    settings,
  ).catch((error) => {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("[AudioProcessing] Background processing failed:", error);
  });

  return job.id;
}

export async function processFromSynthesis(
  input: ProcessFromSynthesisInput,
): Promise<string> {
  const { projectId, storagePath, settings } = input;

  const job = await createProcessedAudio({
    sourceType: "synthesis",
    sourceProjectId: projectId,
    settings,
    status: "PENDING",
    expiresAt: getExpirationDate(),
  });

  const projectPath = path.join("storage/secret-voicer/projects", storagePath);
  const files = await fs.readdir(projectPath);
  const audioFiles = files
    .filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"))
    .map((f) => path.join(projectPath, f));

  processAudioJob(job.id, audioFiles, settings).catch((error) => {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("[AudioProcessing] Background processing failed:", error);
  });

  return job.id;
}

export async function reprocessAudio(
  jobId: string,
  inputFiles: string[],
  settings: ProcessingSettings,
): Promise<void> {
  await updateProcessedAudio(jobId, {
    status: "PENDING",
    progress: 0,
    error: null,
    outputPath: null,
    outputSize: null,
    outputDuration: null,
    settings,
    expiresAt: getExpirationDate(),
  });

  processAudioJob(jobId, inputFiles, settings).catch((error) => {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error("[AudioProcessing] Background processing failed:", error);
  });
}

export async function deleteProcessedAudioFile(
  outputPath: string,
): Promise<void> {
  try {
    await fs.unlink(outputPath);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`🗑️ [AudioProcessing] Deleted: ${outputPath}`);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.warn(
      `⚠️ [AudioProcessing] Could not delete file: ${outputPath}`,
      error,
    );
  }
}
