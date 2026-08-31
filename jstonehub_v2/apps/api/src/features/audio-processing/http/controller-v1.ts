import fs from "node:fs/promises";
import path from "node:path";
import { Type as t } from "@sinclair/typebox";
import { Elysia, NotFoundError } from "elysia";
import { HTTP_STATUS } from "#api/shared/config/http-status";
import {
  deleteAllCache,
  deleteProcessedAudio,
  getProcessedAudioById,
  getValidCachedAudio,
} from "../data/repository";
import type { ProcessingSettings } from "../data/types";
import { AUDIO_PROCESSING_CONSTANTS } from "../lib/constants";
import {
  deleteProcessedAudioFile,
  processFromSynthesis,
  processUploadedAudio,
  reprocessAudio,
} from "../services/processor";

const BYTES_PER_MB = 1_048_576;

const Nullable = <T extends import("@sinclair/typebox").TSchema>(schema: T) =>
  t.Union([schema, t.Null()]);

const ProcessingSettingsDto = t.Object({
  silenceThreshold: t.Optional(t.Number({ default: -40 })),
  minSilenceDuration: t.Optional(t.Number({ default: 0.5 })),
  pauseBetweenChunks: t.Optional(t.Number({ default: 0.3 })),
  pauseBetweenFiles: t.Optional(t.Number({ default: 1.0 })),
  pauseAtStart: t.Optional(t.Number({ default: 0.5 })),
  pauseAtEnd: t.Optional(t.Number({ default: 0.5 })),
  outputFormat: t.Optional(t.Union([t.Literal("mp3"), t.Literal("wav")])),
});

const ProcessFromSynthesisDto = t.Object({
  projectId: t.String(),
  storagePath: t.String(),
  settings: t.Optional(ProcessingSettingsDto),
});

const JobStatusDto = t.Object({
  id: t.String(),
  status: t.String(),
  progress: t.Number(),
  error: Nullable(t.String()),
  outputPath: Nullable(t.String()),
  outputSize: Nullable(t.Number()),
  outputDuration: Nullable(t.Number()),
  expiresAt: t.Date(),
  createdAt: t.Date(),
});

const CachedFileDto = t.Object({
  id: t.String(),
  sourceType: t.String(),
  sourceProjectId: Nullable(t.String()),
  status: t.String(),
  outputSize: Nullable(t.Number()),
  outputDuration: Nullable(t.Number()),
  expiresAt: t.Date(),
  createdAt: t.Date(),
});

function getDefaultSettings(): ProcessingSettings {
  return {
    silenceThreshold: AUDIO_PROCESSING_CONSTANTS.DEFAULT_SILENCE_THRESHOLD,
    minSilenceDuration: AUDIO_PROCESSING_CONSTANTS.DEFAULT_MIN_SILENCE_DURATION,
    pauseBetweenChunks: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_BETWEEN_CHUNKS,
    pauseBetweenFiles: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_BETWEEN_FILES,
    pauseAtStart: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_AT_START,
    pauseAtEnd: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_AT_END,
    outputFormat: AUDIO_PROCESSING_CONSTANTS.DEFAULT_OUTPUT_FORMAT,
  };
}

function mergeSettings(
  partial: Partial<ProcessingSettings> | undefined,
): ProcessingSettings {
  const defaults = getDefaultSettings();
  if (!partial) {
    return defaults;
  }

  return {
    silenceThreshold: partial.silenceThreshold ?? defaults.silenceThreshold,
    minSilenceDuration:
      partial.minSilenceDuration ?? defaults.minSilenceDuration,
    pauseBetweenChunks:
      partial.pauseBetweenChunks ?? defaults.pauseBetweenChunks,
    pauseBetweenFiles: partial.pauseBetweenFiles ?? defaults.pauseBetweenFiles,
    pauseAtStart: partial.pauseAtStart ?? defaults.pauseAtStart,
    pauseAtEnd: partial.pauseAtEnd ?? defaults.pauseAtEnd,
    outputFormat: partial.outputFormat ?? defaults.outputFormat,
  };
}

export const audioProcessingControllerV1 = new Elysia({
  prefix: "/v1/admin/audio-processing",
})
  .post("/process", async ({ body, set }) => {
    const formData = body as {
      files: File[];
      settings?: string;
    };

    if (!formData.files || formData.files.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No files provided" };
    }

    let settings: ProcessingSettings;
    try {
      const parsed = formData.settings ? JSON.parse(formData.settings) : {};
      settings = mergeSettings(parsed);
    } catch {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid settings JSON" };
    }

    const maxFileSizeBytes =
      AUDIO_PROCESSING_CONSTANTS.MAX_FILE_SIZE_MB * BYTES_PER_MB;
    const maxTotalSizeBytes =
      AUDIO_PROCESSING_CONSTANTS.MAX_TOTAL_SIZE_MB * BYTES_PER_MB;

    let totalSize = 0;
    for (const file of formData.files) {
      if (file.size > maxFileSizeBytes) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return {
          error: `File ${file.name} exceeds max size of ${AUDIO_PROCESSING_CONSTANTS.MAX_FILE_SIZE_MB}MB`,
        };
      }
      totalSize += file.size;
    }

    if (totalSize > maxTotalSizeBytes) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: `Total size exceeds max of ${AUDIO_PROCESSING_CONSTANTS.MAX_TOTAL_SIZE_MB}MB`,
      };
    }

    const uploadDir = path.join(
      AUDIO_PROCESSING_CONSTANTS.UPLOADS_PATH,
      `upload_${Date.now()}`,
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles: { path: string; name: string }[] = [];

    try {
      for (const file of formData.files) {
        const filePath = path.join(uploadDir, file.name);
        // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER sequential file save needed for ordering
        const buffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(buffer));
        savedFiles.push({ path: filePath, name: file.name });
      }

      const jobId = await processUploadedAudio({
        files: savedFiles,
        settings,
      });

      set.status = HTTP_STATUS.CREATED;
      return { jobId, message: "Processing started" };
    } catch (error) {
      await fs
        .rm(uploadDir, { recursive: true, force: true })
        // biome-ignore lint/suspicious/noEmptyBlockStatements: REFACTOR_LATER <WAITING_FOR_LOGGER> intentional ignore on cleanup failure
        .catch(() => {});
      throw error;
    }
  })

  .post(
    "/process/from-synthesis",
    async ({ body, set }) => {
      const input = body as {
        projectId: string;
        storagePath: string;
        settings?: Partial<ProcessingSettings>;
      };

      const settings = mergeSettings(input.settings);

      const jobId = await processFromSynthesis({
        projectId: input.projectId,
        storagePath: input.storagePath,
        settings,
      });

      set.status = HTTP_STATUS.CREATED;
      return { jobId, message: "Processing started" };
    },
    {
      body: ProcessFromSynthesisDto,
    },
  )

  .get(
    "/jobs/:id",
    async ({ params: { id } }) => {
      const job = await getProcessedAudioById(id);
      if (!job) {
        throw new NotFoundError("Job not found");
      }

      return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        outputPath: job.outputPath,
        outputSize: job.outputSize,
        outputDuration: job.outputDuration,
        expiresAt: job.expiresAt,
        createdAt: job.createdAt,
      };
    },
    {
      response: JobStatusDto,
    },
  )

  .get(
    "/jobs/:id/status",
    async ({ params: { id } }) => {
      const job = await getProcessedAudioById(id);
      if (!job) {
        throw new NotFoundError("Job not found");
      }

      return {
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
      };
    },
    {
      response: t.Object({
        id: t.String(),
        status: t.String(),
        progress: t.Number(),
        error: Nullable(t.String()),
      }),
    },
  )

  .post(
    "/jobs/:id/reprocess",
    async ({ params: { id }, body }) => {
      const job = await getProcessedAudioById(id);
      if (!job) {
        throw new NotFoundError("Job not found");
      }

      const settings = mergeSettings(body?.settings);

      let inputFiles: string[] = [];

      if (job.sourceType === "synthesis" && job.sourceProjectId) {
        const projectPath = path.join(
          "storage/secret-voicer/projects",
          job.sourceProjectId,
        );
        try {
          const files = await fs.readdir(projectPath);
          inputFiles = files
            .filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"))
            .map((f) => path.join(projectPath, f));
        } catch {
          return { error: "Source project files not found" };
        }
      } else {
        return {
          error: "Cannot reprocess upload-based jobs (files are temporary)",
        };
      }

      if (job.outputPath) {
        await deleteProcessedAudioFile(job.outputPath);
      }

      await reprocessAudio(id, inputFiles, settings);

      return { success: true, message: "Reprocessing started" };
    },
    {
      body: t.Optional(
        t.Object({
          settings: t.Optional(ProcessingSettingsDto),
        }),
      ),
    },
  )

  .get("/jobs/:id/download", async ({ params: { id }, set }) => {
    const job = await getProcessedAudioById(id);
    if (!job) {
      throw new NotFoundError("Job not found");
    }

    if (job.status !== "COMPLETED" || !job.outputPath) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Job is not completed or has no output" };
    }

    try {
      await fs.access(job.outputPath);
    } catch {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Output file not found (may have expired)" };
    }

    const fileBuffer = await fs.readFile(job.outputPath);
    const ext = path.extname(job.outputPath);
    const contentType = ext === ".wav" ? "audio/wav" : "audio/mpeg";
    const filename = `processed_${job.id}${ext}`;

    set.headers["content-type"] = contentType;
    set.headers["content-disposition"] = `attachment; filename="${filename}"`;
    set.headers["content-length"] = String(fileBuffer.length);

    return fileBuffer;
  })

  .get(
    "/cache",
    async () => {
      const cached = await getValidCachedAudio();
      return cached.map((job) => ({
        id: job.id,
        sourceType: job.sourceType,
        sourceProjectId: job.sourceProjectId,
        status: job.status,
        outputSize: job.outputSize,
        outputDuration: job.outputDuration,
        expiresAt: job.expiresAt,
        createdAt: job.createdAt,
      }));
    },
    {
      response: t.Array(CachedFileDto),
    },
  )

  .delete("/cache/:id", async ({ params: { id } }) => {
    const job = await getProcessedAudioById(id);
    if (!job) {
      throw new NotFoundError("Cached file not found");
    }

    if (job.outputPath) {
      await deleteProcessedAudioFile(job.outputPath);
    }

    await deleteProcessedAudio(id);

    return { success: true, id };
  })

  .delete("/cache", async () => {
    const cached = await getValidCachedAudio();

    for (const job of cached) {
      if (job.outputPath) {
        // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER sequential deletion needed
        await deleteProcessedAudioFile(job.outputPath);
      }
    }

    const count = await deleteAllCache();

    return { success: true, deletedCount: count };
  });
