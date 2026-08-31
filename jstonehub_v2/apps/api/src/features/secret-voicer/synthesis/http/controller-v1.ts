import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Type as t } from "@sinclair/typebox";
import { Elysia, NotFoundError } from "elysia";
import { zipSync } from "fflate";
import { HTTP_STATUS } from "#api/shared/config/http-status";
import { getSecretVoicerVoiceByExternalVoiceId } from "../../voice/data/repository";
import {
  cancelPendingTasks,
  createSynthesisProject,
  createSynthesisTasks,
  deleteSynthesisProject,
  getAllSynthesisProjects,
  getFailedTasksByProjectId,
  getSynthesisProjectById,
  getSynthesisTaskById,
  getSynthesisTasksByProjectId,
  resetAllProjectTasks,
  resetTasksForRetry,
  updateSynthesisProject,
} from "../data/repository";
import type { CreateProjectInput, NewSynthesisTask } from "../data/types";
import { SYNTHESIS_CONSTANTS } from "../lib/constants";
import { calculateProgress, validateRate } from "../lib/helpers";
import {
  cancelProject,
  isProjectProcessing,
  pauseProject,
  startProjectProcessing,
} from "../services/processor";
import {
  deleteProjectFolder,
  getProjectFiles,
  readProjectFile,
} from "../services/storage";

const Nullable = <T extends import("@sinclair/typebox").TSchema>(schema: T) =>
  t.Union([schema, t.Null()]);

const TaskInputDto = t.Object({
  text: t.String({ minLength: 1, maxLength: 5000 }),
  voiceId: t.String({ minLength: 1 }),
  rate: t.Optional(t.Number({ minimum: 0.5, maximum: 2.0 })),
});

const CreateProjectDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  tasks: t.Array(TaskInputDto, { minItems: 1 }),
});

const ProjectDto = t.Object({
  id: t.String(),
  name: t.String(),
  status: t.String(),
  totalTasks: t.Number(),
  completedTasks: t.Number(),
  failedTasks: t.Number(),
  storagePath: Nullable(t.String()),
  createdAt: t.Date(),
  startedAt: Nullable(t.Date()),
  completedAt: Nullable(t.Date()),
  updatedAt: t.Date(),
});

const TaskDto = t.Object({
  id: t.String(),
  projectId: t.String(),
  orderIndex: t.Number(),
  text: t.String(),
  voiceId: t.String(),
  rate: t.Number(),
  status: t.String(),
  retryCount: t.Number(),
  error: Nullable(t.String()),
  externalTaskId: Nullable(t.String()),
  audioUrl: Nullable(t.String()),
  localFilePath: Nullable(t.String()),
  createdAt: t.Date(),
  startedAt: Nullable(t.Date()),
  completedAt: Nullable(t.Date()),
  updatedAt: t.Date(),
});

const ProjectStatusDto = t.Object({
  id: t.String(),
  status: t.String(),
  totalTasks: t.Number(),
  completedTasks: t.Number(),
  failedTasks: t.Number(),
  progress: t.Number(),
  isProcessing: t.Boolean(),
});

function handleBackgroundError(error: unknown): void {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.error("[Synthesis] Background processing failed:", error);
}

export const synthesisControllerV1 = new Elysia({ prefix: "/synthesis" })
  .post(
    "/projects",
    async ({ body, set }) => {
      const input = body as CreateProjectInput;

      const voiceIds = [...new Set(input.tasks.map((t) => t.voiceId))];

      const voiceValidationResults = await Promise.all(
        voiceIds.map(async (voiceId) => ({
          voiceId,
          exists: Boolean(await getSecretVoicerVoiceByExternalVoiceId(voiceId)),
        })),
      );

      const invalidVoices = voiceValidationResults
        .filter((result) => !result.exists)
        .map((result) => result.voiceId);

      if (invalidVoices.length > 0) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return {
          error: "Invalid voice IDs",
          invalidVoices,
        };
      }

      const project = await createSynthesisProject({
        name: input.name,
        status: "PENDING",
        totalTasks: input.tasks.length,
      });

      const tasksToCreate: NewSynthesisTask[] = input.tasks.map(
        (task, index) => ({
          projectId: project.id,
          orderIndex: index + 1,
          text: task.text,
          voiceId: task.voiceId,
          rate: validateRate(task.rate),
          status: "PENDING",
        }),
      );

      const tasks = await createSynthesisTasks(tasksToCreate);

      set.status = HTTP_STATUS.CREATED;
      return { project, tasks };
    },
    {
      body: CreateProjectDto,
    },
  )

  .get(
    "/projects",
    () => {
      return getAllSynthesisProjects();
    },
    {
      response: t.Array(ProjectDto),
    },
  )

  .get("/projects/:id", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const tasks = await getSynthesisTasksByProjectId(id);
    return { ...project, tasks };
  })

  .delete("/projects/:id", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.storagePath) {
      await deleteProjectFolder(project.storagePath);
    }

    await deleteSynthesisProject(id);

    return { success: true, id };
  })

  .get(
    "/projects/:id/status",
    async ({ params: { id } }) => {
      const project = await getSynthesisProjectById(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      return {
        id: project.id,
        status: project.status,
        totalTasks: project.totalTasks,
        completedTasks: project.completedTasks,
        failedTasks: project.failedTasks,
        progress: calculateProgress(project.completedTasks, project.totalTasks),
        isProcessing: isProjectProcessing(id),
      };
    },
    {
      response: ProjectStatusDto,
    },
  )

  .post("/projects/:id/start", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    startProjectProcessing(id).catch(handleBackgroundError);

    return { success: true, message: "Processing started" };
  })

  .post("/projects/:id/pause", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    await pauseProject(id);
    return { success: true, message: "Project paused" };
  })

  .post("/projects/:id/cancel", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    await cancelProject(id);
    await cancelPendingTasks(id);
    return { success: true, message: "Project cancelled" };
  })

  .post("/projects/:id/retryFailed", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const failedTasks = await getFailedTasksByProjectId(id);
    if (failedTasks.length === 0) {
      return { success: true, message: "No failed tasks to retry", count: 0 };
    }

    await resetTasksForRetry(failedTasks.map((t) => t.id));
    await updateSynthesisProject(id, { status: "PENDING" });

    startProjectProcessing(id).catch(handleBackgroundError);

    return {
      success: true,
      message: `Retrying ${failedTasks.length} failed tasks`,
      count: failedTasks.length,
    };
  })

  .post("/projects/:id/restart", async ({ params: { id } }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (project.storagePath) {
      await deleteProjectFolder(project.storagePath);
    }

    await resetAllProjectTasks(id);
    await updateSynthesisProject(id, {
      status: "PENDING",
      storagePath: null,
      completedTasks: 0,
      failedTasks: 0,
      startedAt: null,
      completedAt: null,
    });

    startProjectProcessing(id).catch(handleBackgroundError);

    return { success: true, message: "Project restarted" };
  })

  .get(
    "/projects/:id/tasks",
    async ({ params: { id } }) => {
      const project = await getSynthesisProjectById(id);
      if (!project) {
        throw new NotFoundError("Project not found");
      }

      return getSynthesisTasksByProjectId(id);
    },
    {
      response: t.Array(TaskDto),
    },
  )

  .post("/tasks/:taskId/retry", async ({ params: { taskId } }) => {
    const task = await getSynthesisTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    await resetTasksForRetry([taskId]);
    startProjectProcessing(task.projectId).catch(handleBackgroundError);

    return { success: true, message: "Task retry started" };
  })

  .get("/projects/:id/download", async ({ params: { id }, set }) => {
    const project = await getSynthesisProjectById(id);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    if (!project.storagePath) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No files to download" };
    }

    const files = await getProjectFiles(project.storagePath);
    if (files.length === 0) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "No files to download" };
    }

    const fileEntries = await Promise.all(
      files.map(async (filename) => {
        const fileBuffer = await readProjectFile(
          project.storagePath ?? "",
          filename,
        );
        return [filename, new Uint8Array(fileBuffer)] as const;
      }),
    );

    const zipData: Record<string, Uint8Array> = Object.fromEntries(fileEntries);

    const ZipCompressionLevel = 9;
    const zipped = zipSync(zipData, { level: ZipCompressionLevel });
    const zipBuffer = Buffer.from(zipped);

    const maxPrefixLengthSafeName = 50;
    const safeFilename =
      project.name
        .replace(/[^\w\s\u0400-\u04FF-]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, maxPrefixLengthSafeName) || "project";

    set.headers["content-type"] = "application/zip";
    set.headers["content-disposition"] =
      `attachment; filename*=UTF-8''${encodeURIComponent(safeFilename)}.zip`;

    return zipBuffer;
  })
  .get("/tasks/:taskId/download", async ({ params: { taskId }, set }) => {
    const task = await getSynthesisTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (task.status !== "COMPLETED" || !task.localFilePath) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Task is not completed" };
    }

    const project = await getSynthesisProjectById(task.projectId);
    if (!project?.storagePath) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "Project storage not found" };
    }

    const filePath = join(
      SYNTHESIS_CONSTANTS.STORAGE_BASE_PATH,
      project.storagePath,
      task.localFilePath,
    );

    try {
      const fileBuffer = await readFile(filePath);
      set.headers["content-type"] = "audio/mpeg";
      set.headers["content-disposition"] =
        `attachment; filename="${task.orderIndex}.mp3"`;
      return fileBuffer;
    } catch {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "File not found" };
    }
  })

  // Добавить endpoint для получения аудио URL (для прослушивания)
  .get("/tasks/:taskId/audio-url", async ({ params: { taskId } }) => {
    const task = await getSynthesisTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (task.status !== "COMPLETED" || !task.localFilePath) {
      return { url: null };
    }

    const project = await getSynthesisProjectById(task.projectId);
    if (!project?.storagePath) {
      return { url: null };
    }

    return {
      url: `/api/v1/admin/secret-voicer/synthesis/tasks/${taskId}/download`,
    };
  });
