import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { jokeTtsRepository } from "./joke-tts.repository";
import { jokeTtsService } from "./joke-tts.service";

export const jokeTtsV1 = new Elysia({ prefix: "/v1/joke-tts" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", async () => jokeTtsRepository.getAll())
  .get("/:id", async ({ params, set }) => {
    const result = await jokeTtsService.getPipelineWithDetails(params.id);
    if (!result) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Pipeline not found" };
    }
    return result;
  })
  .post("/", async ({ body, set }) => {
    const { jokeTranslationId, voiceConfig, isPlatformDefault } = body as {
      jokeTranslationId?: string;
      voiceConfig?: Record<string, string>;
      isPlatformDefault?: boolean;
    };

    if (!jokeTranslationId || typeof jokeTranslationId !== "string") {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "jokeTranslationId is required" };
    }

    if (
      !voiceConfig
      || typeof voiceConfig !== "object"
      || Object.keys(voiceConfig).length === 0
    ) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "voiceConfig is required (role → voiceId mapping)" };
    }

    try {
      const result = await jokeTtsService.startPipeline({
        jokeTranslationId,
        voiceConfig,
        isPlatformDefault,
      });

      set.status = HTTP_STATUS.CREATED;
      return result;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error ? error.message : "Failed to start pipeline",
      };
    }
  })
  .get("/by-translation/:translationId", async ({ params }) =>
    jokeTtsRepository.getByTranslationId(params.translationId),
  )
  .delete("/:id", async ({ params, set }) => {
    const deleted = await jokeTtsRepository.delete(params.id);
    if (!deleted) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Pipeline not found" };
    }
    set.status = HTTP_STATUS.NO_CONTENT;
  });
