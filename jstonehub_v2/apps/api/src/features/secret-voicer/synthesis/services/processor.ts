import { and, eq } from "drizzle-orm";
import { browserFingerprintTable } from "#api/features/browser-fingerprint";
import { db } from "#api/shared/db";
import { secretVoicerCredentialTable } from "../../credential/table";
import { externalApiService } from "../../services/external-api";
import type { VoiceRequestConfig } from "../../services/types";
import {
  getSynthesisProjectById,
  getSynthesisTasksByProjectId,
  incrementTaskRetryCount,
  updateProjectStats,
  updateSynthesisProject,
  updateSynthesisTask,
  updateTaskStatus,
} from "../data/repository";
import type { SynthesisProject, SynthesisTask } from "../data/types";
import { SYNTHESIS_CONSTANTS } from "../lib/constants";
import { createProjectFolder, saveTaskAudio } from "./storage";

type ProcessingState = {
  isRunning: boolean;
  activeProjects: Set<string>;
};

const state: ProcessingState = {
  isRunning: false,
  activeProjects: new Set(),
};

async function getActiveCredential(): Promise<VoiceRequestConfig | null> {
  const result = await db
    .select({
      csrfToken: secretVoicerCredentialTable.csrfToken,
      sessionId: secretVoicerCredentialTable.sessionId,
      userAgent: browserFingerprintTable.userAgent,
      secChUa: browserFingerprintTable.secChUa,
      secChUaMobile: browserFingerprintTable.secChUaMobile,
      secChUaPlatform: browserFingerprintTable.secChUaPlatform,
    })
    .from(secretVoicerCredentialTable)
    .innerJoin(
      browserFingerprintTable,
      eq(secretVoicerCredentialTable.fingerprintId, browserFingerprintTable.id),
    )
    .where(
      and(
        eq(secretVoicerCredentialTable.isActive, true),
        eq(browserFingerprintTable.isActive, true),
      ),
    )
    .limit(1);

  const cred = result[0];
  if (!cred) {
    return null;
  }

  return {
    csrfToken: cred.csrfToken.trim(),
    sessionId: cred.sessionId.trim(),
    userAgent: cred.userAgent,
    secChUa: cred.secChUa,
    secChUaMobile: cred.secChUaMobile,
    secChUaPlatform: cred.secChUaPlatform,
  };
}

async function pollForCompletion(
  config: VoiceRequestConfig,
  externalTaskId: string,
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < SYNTHESIS_CONSTANTS.TASK_TIMEOUT_MS) {
    // biome-ignore lint/performance/noAwaitInLoops: REFACTOR_LATER polling requires sequential checks
    const status = await externalApiService.checkTaskStatus(
      config,
      externalTaskId,
    );

    if (status.status_code === "COMPLETED" && status.audio_url) {
      return status.audio_url;
    }

    if (status.status_code === "FAILED" || status.error) {
      throw new Error(
        status.error ?? `External task failed: ${status.status_code}`,
      );
    }

    await new Promise((resolve) =>
      setTimeout(resolve, SYNTHESIS_CONSTANTS.POLLING_INTERVAL_MS),
    );
  }

  throw new Error("Task timeout (3 minutes)");
}

async function processTask(
  task: SynthesisTask,
  project: SynthesisProject,
  config: VoiceRequestConfig,
  totalTasks: number,
): Promise<void> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(
    `⏳ [Synthesis] Processing task ${task.orderIndex}/${totalTasks}`,
  );

  try {
    await updateTaskStatus(task.id, "PROCESSING");

    const { task_id } = await externalApiService.createTask(config, {
      text: task.text,
      voice_id: task.voiceId,
      rate: task.rate,
    });

    const externalTaskId = String(task_id);

    await updateSynthesisTask(task.id, { externalTaskId });

    const audioUrl = await pollForCompletion(config, externalTaskId);

    const audioBuffer = await externalApiService.downloadAudio(
      config,
      audioUrl,
    );

    const filename = await saveTaskAudio(
      project.storagePath ?? "",
      task.orderIndex,
      totalTasks,
      audioBuffer,
    );

    await updateSynthesisTask(task.id, {
      status: "COMPLETED",
      audioUrl,
      localFilePath: filename,
      completedAt: new Date(),
    });

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `✅ [Synthesis] Task ${task.orderIndex} completed: ${filename}`,
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`❌ [Synthesis] Task ${task.orderIndex} failed:`, errorMsg);

    const retryCount = await incrementTaskRetryCount(task.id);

    if (retryCount < SYNTHESIS_CONSTANTS.MAX_RETRIES) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log(
        `🔄 [Synthesis] Task ${task.orderIndex} will retry (${retryCount}/${SYNTHESIS_CONSTANTS.MAX_RETRIES})`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, SYNTHESIS_CONSTANTS.RETRY_DELAY_MS),
      );

      await processTask(task, project, config, totalTasks);
    } else {
      await updateTaskStatus(task.id, "FAILED", errorMsg);
    }
  }
}

export async function startProjectProcessing(projectId: string): Promise<void> {
  if (state.activeProjects.has(projectId)) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`⚠️ [Synthesis] Project ${projectId} is already processing`);
    return;
  }

  const project = await getSynthesisProjectById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.status === "CANCELLED" || project.status === "PAUSED") {
    throw new Error(`Project is ${project.status.toLowerCase()}`);
  }

  const config = await getActiveCredential();
  if (!config) {
    throw new Error("No active credentials available");
  }

  state.activeProjects.add(projectId);

  try {
    if (!project.storagePath) {
      const folderName = await createProjectFolder(project.name, project.id);
      await updateSynthesisProject(project.id, { storagePath: folderName });
      project.storagePath = folderName;
    }

    await updateSynthesisProject(project.id, {
      status: "PROCESSING",
      startedAt: new Date(),
    });

    const tasks = await getSynthesisTasksByProjectId(projectId);
    const pendingTasks = tasks.filter(
      (t) => t.status === "PENDING" || t.status === "FAILED",
    );

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(
      `🚀 [Synthesis] Starting project "${project.name}" with ${pendingTasks.length} tasks`,
    );

    await Promise.all(
      pendingTasks.map((task) =>
        processTask(task, project, config, tasks.length),
      ),
    );

    await updateProjectStats(projectId);

    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.log(`🏁 [Synthesis] Project "${project.name}" processing complete`);
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
    console.error(`❌ [Synthesis] Project ${projectId} failed:`, error);
    await updateProjectStats(projectId);
  } finally {
    state.activeProjects.delete(projectId);
  }
}

export async function pauseProject(projectId: string): Promise<void> {
  await updateSynthesisProject(projectId, { status: "PAUSED" });
}

export async function cancelProject(projectId: string): Promise<void> {
  await updateSynthesisProject(projectId, { status: "CANCELLED" });
  state.activeProjects.delete(projectId);
}

export function isProjectProcessing(projectId: string): boolean {
  return state.activeProjects.has(projectId);
}
