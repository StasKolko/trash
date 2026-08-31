import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { ttsProjectRepository } from "./tts-project.repository";
import { ttsProjectService } from "./tts-project.service";

const MERGE_DEFAULT_BETWEEN_MS = 50;

export const ttsProjectV1 = new Elysia({ prefix: "/v1/tts-projects" })
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })
  .get("/", async () => {
    const projects = await ttsProjectRepository.getAll();
    const responses = await Promise.all(
      projects.map((p) => ttsProjectService.getProjectResponse(p)),
    );
    return responses;
  })
  .get("/:id", async ({ params, set }) => {
    const project = await ttsProjectRepository.getById(params.id);
    if (!project) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Project not found" };
    }
    return ttsProjectService.getProjectResponse(project);
  })
  .post("/", async ({ body, set }) => {
    const { name, segments, audioProcessing } = body as {
      name?: string;
      segments?: { role: string; text: string; voiceId: string }[];
      audioProcessing?: {
        enabled?: boolean;
        concatenate?: boolean;
        config?: Record<string, unknown>;
      };
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "name is required" };
    }

    if (!Array.isArray(segments) || segments.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "segments array is required and must not be empty" };
    }

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!(seg?.role && seg.text && seg.voiceId)) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: `Segment ${i}: role, text, and voiceId are required` };
      }
    }

    try {
      const result = await ttsProjectService.createProject({
        name: name.trim(),
        segments: segments.map((s) => ({
          role: s.role.trim(),
          text: s.text.trim(),
          voiceId: s.voiceId,
        })),
        audioProcessing: {
          enabled: audioProcessing?.enabled ?? true,
          concatenate: audioProcessing?.concatenate ?? true,
          config: audioProcessing?.config ?? {},
        },
      });

      set.status = HTTP_STATUS.CREATED;
      return result;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_GATEWAY;
      return {
        error: "Failed to create project",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/:id/segments/:segmentIndex/retry", async ({ params, set }) => {
    const segmentIndex = Number(params.segmentIndex);
    if (Number.isNaN(segmentIndex)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid segment index" };
    }

    try {
      await ttsProjectService.retrySegment(params.id, segmentIndex);
      return { success: true };
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error ? error.message : "Failed to retry segment",
      };
    }
  })
  .post("/:id/retry-all-failed", async ({ params, set }) => {
    try {
      await ttsProjectService.retryAllFailed(params.id);
      return { success: true };
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: error instanceof Error ? error.message : "Failed to retry",
      };
    }
  })
  .post("/:id/synthesize-pending", async ({ params, set }) => {
    try {
      await ttsProjectService.synthesizeAllPending(params.id);
      return { success: true };
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: error instanceof Error ? error.message : "Failed to synthesize",
      };
    }
  })
  .post("/:id/merge", async ({ params, body, set }) => {
    const { betweenMs, startMs, endMs } = body as {
      betweenMs?: number;
      startMs?: number;
      endMs?: number;
    };

    try {
      const result = await ttsProjectService.mergeSegments(params.id, {
        betweenMs: betweenMs ?? MERGE_DEFAULT_BETWEEN_MS,
        startMs: startMs ?? 0,
        endMs: endMs ?? 0,
      });
      set.status = HTTP_STATUS.CREATED;
      return result;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: error instanceof Error ? error.message : "Failed to merge",
      };
    }
  })
  .delete("/:id/merge", async ({ params, set }) => {
    try {
      await ttsProjectService.deleteMergedAudio(params.id);
      set.status = HTTP_STATUS.NO_CONTENT;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete merged audio",
      };
    }
  })
  .patch("/:id/segments/:segmentIndex", async ({ params, body, set }) => {
    const segmentIndex = Number(params.segmentIndex);
    if (Number.isNaN(segmentIndex)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid segment index" };
    }

    const { text, role, voiceId } = body as {
      text?: string;
      role?: string;
      voiceId?: string;
    };

    try {
      await ttsProjectService.updateSegment(params.id, segmentIndex, {
        text,
        role,
        voiceId,
      });
      const project = await ttsProjectRepository.getById(params.id);
      if (!project) {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "Project not found" };
      }
      return ttsProjectService.getProjectResponse(project);
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error ? error.message : "Failed to update segment",
      };
    }
  })
  .post("/:id/segments", async ({ params, body, set }) => {
    const { role, text, voiceId, afterIndex } = body as {
      role?: string;
      text?: string;
      voiceId?: string;
      afterIndex?: number;
    };

    if (!(role && text && voiceId)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "role, text, voiceId are required" };
    }

    try {
      await ttsProjectService.addSegment(params.id, {
        role,
        text,
        voiceId,
        afterIndex,
      });
      const project = await ttsProjectRepository.getById(params.id);
      if (!project) {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "Project not found" };
      }
      return ttsProjectService.getProjectResponse(project);
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error: error instanceof Error ? error.message : "Failed to add segment",
      };
    }
  })
  .delete("/:id/segments/:segmentIndex", async ({ params, set }) => {
    const segmentIndex = Number(params.segmentIndex);
    if (Number.isNaN(segmentIndex)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid segment index" };
    }

    try {
      await ttsProjectService.deleteSegment(params.id, segmentIndex);
      set.status = HTTP_STATUS.NO_CONTENT;
    } catch (error) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return {
        error:
          error instanceof Error ? error.message : "Failed to delete segment",
      };
    }
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      await ttsProjectService.deleteProject(params.id);
      set.status = HTTP_STATUS.NO_CONTENT;
    } catch (error) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return {
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      };
    }
  });
