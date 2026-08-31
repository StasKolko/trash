import type { AudioProcessingConfig } from "@packages/contract/audio-processing";
import type {
  AudioProcessingJobData,
  AudioProcessingJobResult,
} from "@packages/contract/queue";

import {
  AUDIO_PROCESSING_DEFAULTS,
  AUDIO_PROCESSING_NAME_LIMITS,
  AUDIO_PROCESSING_TTL_MS,
  AUDIO_PROCESSING_UPLOAD_LIMITS,
} from "@packages/contract/audio-processing";
import { STORAGE_PREFIXES } from "@packages/contract/storage";
import { createId } from "@packages/util/id";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";
import { addJob, getQueue } from "#api/shared/queue/producer";
import { storage } from "#api/shared/storage/storage";

import { audioProcessingConfigValidator } from "./audio-processing.schema";

const FILE_INDEX_PAD_LENGTH = 4;
const FILE_NAME_MAX_LENGTH = 200;
const JOB_FETCH_LIMIT = 200;
const JOB_LIST_STATES = [
  "completed",
  "failed",
  "active",
  "waiting",
  "delayed",
] as const;

type ProcessBody = {
  jobId?: string;
  config?: Record<string, unknown>;
  name?: string;
};

type JobFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

type JobListEntry = {
  jobId: string;
  status: string;
  name: string;
  isConcatenated: boolean;
  fileCount: number;
  createdAt: string;
  expiresAt: string;
  files?: JobFileEntry[];
  error?: string;
};

function buildFileEntries(
  result: AudioProcessingJobResult,
): Promise<JobFileEntry[]> {
  return Promise.all(
    (result.outputFiles ?? []).map(async (fileInfo) => {
      const url = await storage.getPresignedDownloadUrl(
        fileInfo.key,
        AUDIO_PROCESSING_UPLOAD_LIMITS.downloadUrlExpirySeconds,
      );
      return {
        fileName: fileInfo.fileName,
        sizeBytes: fileInfo.sizeBytes,
        durationMs: fileInfo.durationMs,
        downloadUrl: url,
      };
    }),
  );
}

async function findJobByCustomId(jobId: string) {
  const queue = getQueue("audio-processing");
  const jobs = await queue.getJobs([...JOB_LIST_STATES], 0, JOB_FETCH_LIMIT);
  return (
    jobs.find(
      (j) => (j.data as AudioProcessingJobData | undefined)?.jobId === jobId,
    ) ?? null
  );
}

async function buildJobListEntries(): Promise<JobListEntry[]> {
  const queue = getQueue("audio-processing");
  const jobs = await queue.getJobs([...JOB_LIST_STATES], 0, JOB_FETCH_LIMIT);

  const entries = await Promise.all(
    jobs.map(async (job): Promise<JobListEntry | null> => {
      const data = job.data as AudioProcessingJobData | undefined;
      if (!data?.jobId) {
        return null;
      }

      const state = await job.getState();
      const createdAt = new Date(job.timestamp).toISOString();
      const expiresAt = new Date(
        job.timestamp + AUDIO_PROCESSING_TTL_MS,
      ).toISOString();

      const entry: JobListEntry = {
        jobId: data.jobId,
        status: state,
        name: data.outputName ?? "Untitled",
        isConcatenated: data.isConcatenated ?? false,
        fileCount: data.inputKeys?.length ?? 0,
        createdAt,
        expiresAt,
      };

      if (state === "completed" && job.returnvalue) {
        const result = job.returnvalue as AudioProcessingJobResult;
        entry.files = await buildFileEntries(result);
      }

      if (state === "failed") {
        entry.error = job.failedReason ?? "Unknown error";
      }

      return entry;
    }),
  );

  return entries
    .filter((e): e is JobListEntry => e !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

const audioProcessingV1 = new Elysia({
  prefix: "/v1/audio-processing",
})
  .onError(({ error, set }) => {
    // biome-ignore lint/suspicious/noConsole: Error logging required for debugging
    console.error("❌ [audio-processing] Route error:", error);
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .post("/upload-urls", async ({ body, set }) => {
    const { fileNames } = body as { fileNames?: string[] };

    if (
      !Array.isArray(fileNames)
      || fileNames.length === 0
      || fileNames.length > AUDIO_PROCESSING_UPLOAD_LIMITS.maxFiles
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: `Provide 1–${AUDIO_PROCESSING_UPLOAD_LIMITS.maxFiles} file names`,
      };
    }

    const jobId = createId();
    const prefix = STORAGE_PREFIXES.audioProcessingInput(jobId);

    const uploads = await Promise.all(
      fileNames.map(async (fileName, index) => {
        const paddedIndex = String(index).padStart(FILE_INDEX_PAD_LENGTH, "0");
        const key = `${prefix}${paddedIndex}_${sanitizeFileName(fileName)}`;
        const url = await storage.getPresignedUploadUrl(
          key,
          AUDIO_PROCESSING_UPLOAD_LIMITS.presignedUrlExpirySeconds,
        );
        return { fileName, key, uploadUrl: url };
      }),
    );

    return { jobId, uploads };
  })
  .post("/process", async ({ body, set }) => {
    const { jobId, config: rawConfig, name } = body as ProcessBody;

    if (!jobId || typeof jobId !== "string") {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "jobId is required" };
    }

    if (
      !name
      || typeof name !== "string"
      || name.length < AUDIO_PROCESSING_NAME_LIMITS.min
      || name.length > AUDIO_PROCESSING_NAME_LIMITS.max
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: `name is required (${AUDIO_PROCESSING_NAME_LIMITS.min}–${AUDIO_PROCESSING_NAME_LIMITS.max} characters)`,
      };
    }

    const configInput = rawConfig ?? {};
    if (
      Object.keys(configInput).length > 0
      && !audioProcessingConfigValidator.Check(configInput)
    ) {
      const errors = [...audioProcessingConfigValidator.Errors(configInput)];
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Validation failed", details: errors };
    }

    const config = mergeWithDefaults(configInput);
    const prefix = STORAGE_PREFIXES.audioProcessingInput(jobId);
    const inputObjects = await storage.listObjects(prefix);

    if (inputObjects.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No input files found. Upload files first." };
    }

    const inputKeys = inputObjects.map((o) => o.key).sort();
    const outputPrefix = STORAGE_PREFIXES.audioProcessingOutput(jobId);
    const isConcatenated = config.concatenation.enabled;

    const bullJobId = await addJob({
      queue: "audio-processing",
      name: "process-audio",
      data: {
        jobId,
        config,
        inputKeys,
        outputPrefix,
        outputName: name,
        isConcatenated,
      },
    });

    set.status = HTTP_STATUS.CREATED;
    return {
      jobId,
      bullJobId,
      queue: "audio-processing",
      status: "queued",
      inputFileCount: inputKeys.length,
    };
  })
  .get("/jobs", () => buildJobListEntries())
  .get("/jobs/:jobId", async ({ params, set }) => {
    const job = await findJobByCustomId(params.jobId);

    if (!job) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Job not found" };
    }

    const state = await job.getState();
    const data = job.data as AudioProcessingJobData;
    const createdAt = new Date(job.timestamp).toISOString();
    const expiresAt = new Date(
      job.timestamp + AUDIO_PROCESSING_TTL_MS,
    ).toISOString();

    const entry: JobListEntry = {
      jobId: params.jobId,
      status: state,
      name: data.outputName ?? "Untitled",
      isConcatenated: data.isConcatenated ?? false,
      fileCount: data.inputKeys?.length ?? 0,
      createdAt,
      expiresAt,
    };

    if (state === "completed" && job.returnvalue) {
      const result = job.returnvalue as AudioProcessingJobResult;
      entry.files = await buildFileEntries(result);
    }

    if (state === "failed") {
      entry.error = job.failedReason ?? "Unknown error";
    }

    return entry;
  })
  .delete("/jobs/:jobId", async ({ params, set }) => {
    const prefix = STORAGE_PREFIXES.audioProcessingJob(params.jobId);
    await storage.deletePrefix(prefix);

    const job = await findJobByCustomId(params.jobId);
    if (job) {
      try {
        await job.remove();
      } catch {
        // job may already be removed
      }
    }

    set.status = HTTP_STATUS.NO_CONTENT;
  })
  .get("/defaults", () => AUDIO_PROCESSING_DEFAULTS);

function mergeWithDefaults(
  partial: Record<string, unknown>,
): AudioProcessingConfig {
  const d = AUDIO_PROCESSING_DEFAULTS;
  const p = partial as Partial<{
    [K in keyof AudioProcessingConfig]: Partial<AudioProcessingConfig[K]>;
  }>;

  return {
    silenceRemoval: { ...d.silenceRemoval, ...p.silenceRemoval },
    normalization: { ...d.normalization, ...p.normalization },
    highPassFilter: { ...d.highPassFilter, ...p.highPassFilter },
    limiter: { ...d.limiter, ...p.limiter },
    fade: { ...d.fade, ...p.fade },
    gaps: { ...d.gaps, ...p.gaps },
    concatenation: { ...d.concatenation, ...p.concatenation },
    output: { ...d.output, ...p.output },
  };
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, FILE_NAME_MAX_LENGTH);
}

export { audioProcessingV1 };
