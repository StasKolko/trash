// import { secretVoicerCharacterRepository } from "../characters/repository";
// import { secretVoicerApi } from "../external-api";
// import { secretVoicerItemRepository } from "../items/repository";
// import type { ItemStatus } from "../items/types";
// import { minioService } from "../minio/service";
// import { secretVoicerProjectRepository } from "../projects/repository";
// import type { ProjectStatus } from "../projects/types";
// import { secretVoicerVersionRepository } from "../versions/repository";
// import type { NewSecretVoicerVersion, VersionType } from "../versions/types";
// import { MAX_RETRY_COUNT, TASK_TIMEOUT_MINUTES } from "./constants";
// import { synthesisQueue } from "./queue";

// async function updateProjectStatus(projectId: string): Promise<void> {
//   const counts =
//     await secretVoicerItemRepository.countByProjectAndStatus(projectId);

//   const total = Object.values(counts).reduce((a, b) => a + b, 0);

//   let status: ProjectStatus;

//   if (counts.pending > 0 || counts.processing > 0 || counts.comparing > 0) {
//     status = "processing";
//   } else if (counts.failed === total) {
//     status = "failed";
//   } else if (counts.failed > 0) {
//     status = "partial";
//   } else {
//     status = "completed";
//   }

//   const completedAt = status === "completed" ? new Date() : undefined;

//   await secretVoicerProjectRepository.updateStatus(
//     projectId,
//     status,
//     completedAt,
//   );
// }

// type VersionWithItem = {
//   version: NewSecretVoicerVersion & { id: string };
//   item: { id: string; text: string; characterId: string };
//   character: { voiceId: string };
// };

// async function sendTaskToExternalApi(data: VersionWithItem): Promise<void> {
//   try {
//     const result = await secretVoicerApi.createTask({
//       voiceId: data.character.voiceId,
//       text: data.item.text,
//       rate: 1.0,
//     });

//     await secretVoicerVersionRepository.update(data.version.id, {
//       externalTaskId: result.taskId,
//       externalStatus: "processing",
//     });
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";

//     await secretVoicerVersionRepository.update(data.version.id, {
//       externalStatus: "failed",
//       externalError: errorMessage,
//     });

//     await secretVoicerItemRepository.updateStatus(data.item.id, "failed");
//   }
// }

// async function startProjectSynthesis(projectId: string): Promise<void> {
//   const items = await secretVoicerItemRepository.getByProjectId(projectId);
//   const pendingItems = items.filter((item) => item.status === "pending");

//   if (pendingItems.length === 0) {
//     return;
//   }

//   const versionsToCreate: NewSecretVoicerVersion[] = pendingItems.map(
//     (item) => ({
//       itemId: item.id,
//       versionType: "current" as const,
//       externalStatus: "pending" as const,
//       retryCount: 0,
//     }),
//   );

//   const versions =
//     await secretVoicerVersionRepository.createMany(versionsToCreate);

//   const itemIds = pendingItems.map((item) => item.id);
//   await secretVoicerItemRepository.updateManyStatus(itemIds, "processing");

//   const characters =
//     await secretVoicerCharacterRepository.getByProjectId(projectId);
//   const characterMap = new Map(characters.map((c) => [c.id, c]));

//   const tasksToSend: VersionWithItem[] = [];

//   for (const version of versions) {
//     const item = pendingItems.find((i) => i.id === version.itemId);
//     if (!item) {
//       continue;
//     }

//     const character = characterMap.get(item.characterId);
//     if (!character) {
//       continue;
//     }

//     tasksToSend.push({
//       version: version as VersionWithItem["version"],
//       item: { id: item.id, text: item.text, characterId: item.characterId },
//       character: { voiceId: character.voiceId },
//     });
//   }

//   for (const task of tasksToSend) {
//     // biome-ignore lint/performance/noAwaitInLoops: Sequential API calls to avoid rate limiting
//     await sendTaskToExternalApi(task);
//   }
// }

// async function startItemSynthesis(
//   itemId: string,
//   versionType: VersionType,
// ): Promise<void> {
//   const item = await secretVoicerItemRepository.getById(itemId);
//   if (!item) {
//     throw new Error(`Item ${itemId} not found`);
//   }

//   const character = await secretVoicerCharacterRepository.getById(
//     item.characterId,
//   );
//   if (!character) {
//     throw new Error(`Character ${item.characterId} not found`);
//   }

//   const existingVersion =
//     await secretVoicerVersionRepository.getByItemIdAndType(itemId, versionType);

//   if (existingVersion && versionType === "candidate") {
//     throw new Error("Candidate version already exists");
//   }

//   const version = await secretVoicerVersionRepository.create({
//     itemId,
//     versionType,
//     externalStatus: "pending",
//     retryCount: existingVersion ? existingVersion.retryCount + 1 : 0,
//   });

//   if (existingVersion && versionType === "current") {
//     await secretVoicerVersionRepository.delete(existingVersion.id);
//   }

//   const newStatus: ItemStatus =
//     versionType === "candidate" ? "comparing" : "processing";
//   await secretVoicerItemRepository.updateStatus(itemId, newStatus);

//   try {
//     const result = await secretVoicerApi.createTask({
//       voiceId: character.voiceId,
//       text: item.text,
//       rate: 1.0,
//     });

//     await secretVoicerVersionRepository.update(version.id, {
//       externalTaskId: result.taskId,
//       externalStatus: "processing",
//     });
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";

//     await secretVoicerVersionRepository.update(version.id, {
//       externalStatus: "failed",
//       externalError: errorMessage,
//     });

//     if (versionType === "current") {
//       await secretVoicerItemRepository.updateStatus(itemId, "failed");
//     }
//   }
// }

// async function handleTaskCompleted(
//   versionId: string,
//   audioUrl: string,
// ): Promise<void> {
//   const version = await secretVoicerVersionRepository.getById(versionId);
//   if (!version) {
//     return;
//   }

//   await secretVoicerVersionRepository.update(versionId, {
//     externalStatus: "completed",
//     externalAudioUrl: audioUrl,
//   });

//   const item = await secretVoicerItemRepository.getById(version.itemId);
//   if (!item) {
//     return;
//   }

//   await synthesisQueue.addDownloadTask({
//     versionId: version.id,
//     itemId: version.itemId,
//     projectId: item.projectId,
//     audioUrl,
//   });
// }

// async function handleWorkerCallback(
//   versionId: string,
//   success: boolean,
//   minioKey?: string,
//   error?: string,
// ): Promise<void> {
//   const version = await secretVoicerVersionRepository.getById(versionId);
//   if (!version) {
//     return;
//   }

//   const item = await secretVoicerItemRepository.getById(version.itemId);
//   if (!item) {
//     return;
//   }

//   if (success && minioKey) {
//     const minioUrl = await minioService.getPresignedUrl(minioKey);

//     await secretVoicerVersionRepository.update(versionId, {
//       minioKey,
//       minioUrl,
//       minioUrlExpiresAt: minioService.getUrlExpiry(),
//       externalStatus: "completed",
//     });

//     if (version.versionType === "current") {
//       await secretVoicerItemRepository.updateStatus(item.id, "completed");
//     } else if (
//       version.versionType === "candidate"
//       && item.status !== "comparing"
//     ) {
//       await secretVoicerItemRepository.updateStatus(item.id, "comparing");
//     }

//     await updateProjectStatus(item.projectId);
//   } else {
//     await secretVoicerVersionRepository.update(versionId, {
//       externalStatus: "failed",
//       externalError: error ?? "Worker processing failed",
//     });

//     if (version.versionType === "current") {
//       await secretVoicerItemRepository.updateStatus(version.itemId, "failed");
//       await updateProjectStatus(item.projectId);
//     }
//   }
// }

// async function handleTimeouts(): Promise<void> {
//   const timedOutVersions =
//     await secretVoicerVersionRepository.getTimedOut(TASK_TIMEOUT_MINUTES);

//   const processVersion = async (
//     version: (typeof timedOutVersions)[0],
//   ): Promise<void> => {
//     if (version.retryCount >= MAX_RETRY_COUNT) {
//       await secretVoicerVersionRepository.update(version.id, {
//         externalStatus: "failed",
//         externalError: "Max retries exceeded",
//       });

//       if (version.versionType === "current") {
//         await secretVoicerItemRepository.updateStatus(version.itemId, "failed");
//       }
//     } else {
//       await startItemSynthesis(version.itemId, version.versionType);
//     }
//   };

//   await Promise.all(timedOutVersions.map(processVersion));
// }

// export const synthesisOrchestrator = {
//   startProjectSynthesis,
//   startItemSynthesis,
//   handleTaskCompleted,
//   handleWorkerCallback,
//   handleTimeouts,
// };

export const FIX_THIS_FILE_LATER = 123;
