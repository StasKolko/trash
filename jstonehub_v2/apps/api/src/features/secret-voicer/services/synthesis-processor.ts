// import fs from "node:fs/promises";
// import path from "node:path";
// import process from "node:process";
// import { write } from "bun";
// import { and, asc, eq, lt } from "drizzle-orm";
// import { browserFingerprintsTable } from "#api/features/browser-fingerprint/data/table";
// import { secretVoicerCredentialsTable } from "#api/features/secret-voicer/schemas/credentials-table";
// import {
//   secretVoicerSynthesisProjects,
//   secretVoicerSynthesisTasks,
// } from "#api/features/secret-voicer/schemas/synthesis-projects";
// import { db } from "#api/shared/db";
// import { externalApiService } from "./external-api";
// import type { VoiceRequestConfig } from "./types";

// const STORAGE_ROOT = "storage";
// const MAX_RETRIES = 3;
// const POLLING_INTERVAL = 3000;
// const MAX_WAIT_TIME = 300_000; // 5 минут

// export class SynthesisProcessor {
//   public async processProject(projectId: string, retryFailed = false) {
//     console.log(`🔄 [Processor] Starting project: ${projectId}`);

//     await this.cleanupStaleTasks(projectId);

//     const project = await db.query.secretVoicerSynthesisProjects.findFirst({
//       where: eq(secretVoicerSynthesisProjects.id, projectId),
//     });

//     if (!project?.fingerprintId) {
//       console.error(`❌ [Processor] Project ${projectId} missing fingerprint`);
//       await this.failProject(projectId, "Missing fingerprint configuration");
//       return;
//     }

//     const credential = await db.query.secretVoicerCredentialsTable.findFirst({
//       where: and(
//         eq(secretVoicerCredentialsTable.fingerprintId, project.fingerprintId),
//         eq(secretVoicerCredentialsTable.isActive, true),
//       ),
//     });

//     const fingerprint = await db.query.browserFingerprintsTable.findFirst({
//       where: eq(browserFingerprintsTable.id, project.fingerprintId),
//     });

//     if (!(credential && fingerprint)) {
//       const msg = `Missing active credentials or fingerprint for Project ${projectId}`;
//       console.error(`❌ [Processor] ${msg}`);
//       await this.failProject(projectId, msg);
//       return;
//     }

//     console.log(
//       `✅ [Processor] Using Credential: ${credential.name} | FP: ${fingerprint.name}`,
//     );

//     const config: VoiceRequestConfig = {
//       csrfToken: credential.csrfToken,
//       sessionId: credential.sessionId,
//       userAgent: fingerprint.userAgent,
//       secChUa: fingerprint.secChUa,
//       secChUaMobile: fingerprint.secChUaMobile,
//       secChUaPlatform: fingerprint.secChUaPlatform,
//     };

//     const allTasks = await db
//       .select()
//       .from(secretVoicerSynthesisTasks)
//       .where(eq(secretVoicerSynthesisTasks.projectId, projectId))
//       .orderBy(asc(secretVoicerSynthesisTasks.orderIndex));

//     const tasksToProcess = allTasks.filter((t) => {
//       if (t.status === "PENDING") {
//         return true;
//       }
//       if (retryFailed && t.status === "FAILED") {
//         return true;
//       }
//       if (t.status === "FAILED" && (t.retryCount || 0) < MAX_RETRIES) {
//         return true;
//       }
//       return false;
//     });

//     console.log(
//       `📊 [Processor] Found ${tasksToProcess.length} tasks to process`,
//     );

//     if (tasksToProcess.length === 0) {
//       await this.updateProjectStats(projectId);
//       return;
//     }

//     await Promise.allSettled(
//       tasksToProcess.map((task) =>
//         this.processSingleTask(task, config, project),
//       ),
//     );

//     await this.updateProjectStats(projectId);
//     console.log(`🏁 [Processor] Finished cycle for project: ${projectId}`);
//   }

//   private async processSingleTask(
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//     config: VoiceRequestConfig,
//     project: typeof secretVoicerSynthesisProjects.$inferSelect,
//   ) {
//     try {
//       console.log(`⏳ [Task ${task.orderIndex}] Processing...`);
//       await this.markTaskAsProcessing(task.id);

//       const metadata = task.metadata as { rate?: number } | null;
//       const rate = metadata?.rate ?? 1;

//       const { task_id } = await externalApiService.createTask(config, {
//         text: task.text,
//         voice_id: task.voiceId,
//         rate,
//       });
//       const externalTaskId = String(task_id);
//       console.log(`➡ [Task ${task.orderIndex}] External ID: ${externalTaskId}`);

//       await db
//         .update(secretVoicerSynthesisTasks)
//         .set({ externalTaskId })
//         .where(eq(secretVoicerSynthesisTasks.id, task.id));

//       const audioUrl = await this.pollForCompletion(config, externalTaskId);
//       console.log(`⬇ [Task ${task.orderIndex}] Downloading audio...`);

//       const localFilePath = await this.downloadAndSaveAudio(
//         config,
//         audioUrl,
//         project,
//         task,
//       );

//       await this.markTaskAsCompleted(task.id, audioUrl, localFilePath);
//       console.log(
//         `✅ [Task ${task.orderIndex}] Completed! Saved to: ${localFilePath}`,
//       );
//     } catch (e) {
//       console.error(`❌ [Task ${task.orderIndex}] Failed:`, e);
//       await this.handleTaskFailure(task, e);
//     }
//   }

//   private async pollForCompletion(
//     config: VoiceRequestConfig,
//     externalTaskId: string,
//   ): Promise<string> {
//     const startTime = Date.now();

//     while (Date.now() - startTime <= MAX_WAIT_TIME) {
//       // biome-ignore lint/performance/noAwaitInLoops: рефакторинг позже
//       const status = await externalApiService.checkTaskStatus(
//         config,
//         externalTaskId,
//       );

//       if (status.status_code === "COMPLETED" && status.audio_url) {
//         return status.audio_url;
//       }

//       if (status.status_code === "FAILED" || status.error) {
//         throw new Error(
//           status.error
//             || `External task failed with status: ${status.status_code}`,
//         );
//       }

//       await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
//     }

//     throw new Error("Polling timeout (5 minutes)");
//   }

//   private async downloadAndSaveAudio(
//     config: VoiceRequestConfig,
//     audioUrl: string,
//     project: typeof secretVoicerSynthesisProjects.$inferSelect,
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//   ) {
//     const buffer = await externalApiService.downloadAudio(config, audioUrl);

//     const maxPrefixLengthSafeName = 50;
//     const safeName = project.name
//       .replace(/[^a-z0-9а-яё\s_-]/gi, "")
//       .trim()
//       .replace(/\s+/g, "_")
//       .slice(0, maxPrefixLengthSafeName);

//     const maxPrefixLengthPrefixId = 5;
//     const prefixId = project.id.slice(0, maxPrefixLengthPrefixId);
//     const folderName = `${safeName}-${prefixId}`;

//     const folderPath = path.join(process.cwd(), STORAGE_ROOT, folderName);
//     const fileName = `${task.orderIndex}.mp3`;
//     const fullPath = path.join(folderPath, fileName);

//     await fs.mkdir(folderPath, { recursive: true });
//     await write(fullPath, buffer);

//     return fullPath;
//   }

//   private async cleanupStaleTasks(projectId: string) {
//     const fiveMinutesAgo = new Date(Date.now() - MAX_WAIT_TIME);
//     const staleTasks = await db
//       .select()
//       .from(secretVoicerSynthesisTasks)
//       .where(
//         and(
//           eq(secretVoicerSynthesisTasks.projectId, projectId),
//           eq(secretVoicerSynthesisTasks.status, "PROCESSING"),
//           lt(secretVoicerSynthesisTasks.startedAt, fiveMinutesAgo),
//         ),
//       );

//     if (staleTasks.length > 0) {
//       console.warn(
//         `⚠ [Processor] Found ${staleTasks.length} stale tasks. Marking as failed.`,
//       );
//     }

//     for (const task of staleTasks) {
//       // biome-ignore lint/performance/noAwaitInLoops: рефакторинг позже
//       await this.handleTaskFailure(
//         task,
//         new Error("Timeout (5 minutes stale)"),
//       );
//     }
//   }

//   private async markTaskAsProcessing(taskId: string) {
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "PROCESSING",
//         startedAt: new Date(),
//         error: null,
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, taskId));
//   }

//   private async markTaskAsCompleted(
//     taskId: string,
//     audioUrl: string,
//     localFilePath: string,
//   ) {
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "COMPLETED",
//         statusCode: "COMPLETED",
//         audioUrl,
//         localFilePath,
//         updatedAt: new Date(),
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, taskId));
//   }

//   private async handleTaskFailure(
//     task: typeof secretVoicerSynthesisTasks.$inferSelect,
//     error: unknown,
//   ) {
//     const msg = error instanceof Error ? error.message : String(error);
//     await db
//       .update(secretVoicerSynthesisTasks)
//       .set({
//         status: "FAILED",
//         error: msg,
//         retryCount: (task.retryCount || 0) + 1,
//         updatedAt: new Date(),
//       })
//       .where(eq(secretVoicerSynthesisTasks.id, task.id));
//   }

//   private async updateProjectStats(projectId: string) {
//     const tasks = await db
//       .select({ status: secretVoicerSynthesisTasks.status })
//       .from(secretVoicerSynthesisTasks)
//       .where(eq(secretVoicerSynthesisTasks.projectId, projectId));

//     const total = tasks.length;
//     const completed = tasks.filter((t) => t.status === "COMPLETED").length;
//     const failed = tasks.filter((t) => t.status === "FAILED").length;
//     const processing = tasks.filter((t) => t.status === "PROCESSING").length;

//     let newStatus:
//       | "PENDING"
//       | "PROCESSING"
//       | "COMPLETED"
//       | "FAILED"
//       | "PARTIAL";

//     if (processing > 0) {
//       newStatus = "PROCESSING";
//     } else if (failed === total) {
//       newStatus = "FAILED";
//     } else if (completed === total) {
//       newStatus = "COMPLETED";
//     } else if (completed > 0) {
//       newStatus = "PARTIAL";
//     } else if (failed > 0) {
//       newStatus = "FAILED";
//     } else {
//       newStatus = "PENDING";
//     }

//     await db
//       .update(secretVoicerSynthesisProjects)
//       .set({
//         status: newStatus,
//         totalTasks: total,
//         completedTasks: completed,
//         failedTasks: failed,
//         completedAt: newStatus === "COMPLETED" ? new Date() : null,
//       })
//       .where(eq(secretVoicerSynthesisProjects.id, projectId));
//   }

//   private async failProject(projectId: string, error: string) {
//     await db
//       .update(secretVoicerSynthesisProjects)
//       .set({ status: "FAILED", description: error })
//       .where(eq(secretVoicerSynthesisProjects.id, projectId));
//   }
// }

// export const synthesisProcessor = new SynthesisProcessor();
