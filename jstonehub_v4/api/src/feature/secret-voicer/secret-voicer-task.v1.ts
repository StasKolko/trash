import { STORAGE_PREFIXES } from "@packages/contract/storage";
import { createId } from "@packages/util/id";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";
import { addJob } from "#api/shared/queue/producer";

import { secretVoicerExternalAdapter } from "./secret-voicer-external.adapter";
import { buildTtsCredentials } from "./secret-voicer-preview.service";

const TTS_RATE_MIN = 0.5;
const TTS_RATE_MAX = 2.0;
const TTS_RATE_DEFAULT = 1.0;
const TTS_TEXT_MAX_LENGTH = 5000;

export const secretVoicerTaskV1 = new Elysia({
  prefix: "/v1/secret-voicer/tasks",
})
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .post("/synthesize", async ({ body, set }) => {
    const { voiceId, text, rate } = body as {
      voiceId?: string;
      text?: string;
      rate?: number;
    };

    if (!voiceId || typeof voiceId !== "string") {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "voiceId is required" };
    }

    if (!text || typeof text !== "string" || text.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "text is required" };
    }

    if (text.length > TTS_TEXT_MAX_LENGTH) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: `text must be ${TTS_TEXT_MAX_LENGTH} characters or less`,
      };
    }

    const effectiveRate =
      typeof rate === "number"
        ? Math.min(TTS_RATE_MAX, Math.max(TTS_RATE_MIN, rate))
        : TTS_RATE_DEFAULT;

    try {
      const result = await secretVoicerExternalAdapter.createTask({
        voiceId,
        text,
        rate: effectiveRate,
      });

      const jobId = createId();
      const outputKey = `${STORAGE_PREFIXES.ttsOutput(jobId)}output.mp3`;

      const credentials = await buildTtsCredentials();

      const bullJobId = await addJob({
        queue: "tts",
        name: "tts-synthesize",
        data: {
          jobId,
          taskId: result.taskId,
          voiceId,
          text,
          rate: effectiveRate,
          outputKey,
          credentials,
        },
      });

      set.status = HTTP_STATUS.CREATED;
      return {
        jobId,
        bullJobId,
        taskId: result.taskId,
        isReused: result.isReused,
        queue: "tts",
        status: "queued",
      };
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to create synthesis task",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .get("/:taskId/status", async ({ params, set }) => {
    const taskId = Number(params.taskId);

    if (Number.isNaN(taskId)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid taskId" };
    }

    try {
      const status = await secretVoicerExternalAdapter.checkTaskStatus(taskId);
      return status;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to check task status",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
