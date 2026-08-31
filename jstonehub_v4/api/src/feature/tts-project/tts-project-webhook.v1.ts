import { Elysia } from "elysia";

import { env } from "#api/shared/config/env";
import { HTTP_STATUS } from "#api/shared/config/http-status";

import {
  handleTtsJobCompleted,
  handleTtsJobFailed,
} from "./tts-project.callback";

export const ttsProjectWebhookV1 = new Elysia({
  prefix: "/internal/tts",
})
  .onBeforeHandle(({ headers, set }) => {
    const secret = headers["x-internal-secret"];
    if (secret !== env.INTERNAL_SECRET) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "Unauthorized" };
    }
  })
  .post("/segment-completed", async ({ body }) => {
    const { outputKey } = body as { outputKey?: string };

    if (!outputKey) {
      return { error: "outputKey is required" };
    }

    await handleTtsJobCompleted(outputKey);
    return { success: true };
  })
  .post("/segment-failed", async ({ body }) => {
    const { outputKey, error } = body as {
      outputKey?: string;
      error?: string;
    };

    if (!outputKey) {
      return { error: "outputKey is required" };
    }

    await handleTtsJobFailed(outputKey, error ?? "Unknown error");
    return { success: true };
  });
