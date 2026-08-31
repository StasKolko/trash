// import { secretVoicerApi } from "../external-api";
// import { secretVoicerItemRepository } from "../items/repository";
// import { secretVoicerProjectRepository } from "../projects/repository";
// import type { ProjectStatus } from "../projects/types";
// import { secretVoicerVersionRepository } from "../versions/repository";
// import {
//   MS_PER_MINUTE,
//   POLLING_INTERVAL_MS,
//   TIMEOUT_CHECK_INTERVAL_MINUTES,
// } from "./constants";
// import { synthesisOrchestrator } from "./orchestrator";

// let pollingInterval: ReturnType<typeof setInterval> | null = null;
// let timeoutCheckInterval: ReturnType<typeof setInterval> | null = null;

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

// async function pollPendingTasks(): Promise<void> {
//   try {
//     const pendingVersions =
//       await secretVoicerVersionRepository.getPendingForPolling();

//     if (pendingVersions.length === 0) {
//       return;
//     }

//     const projectsToUpdate = new Set<string>();

//     const pollVersion = async (
//       version: (typeof pendingVersions)[0],
//     ): Promise<void> => {
//       if (!version.externalTaskId) {
//         return;
//       }

//       try {
//         const status = await secretVoicerApi.getTaskStatus(
//           version.externalTaskId,
//         );

//         if (status.status === "COMPLETED" && status.audioUrl) {
//           await synthesisOrchestrator.handleTaskCompleted(
//             version.id,
//             status.audioUrl,
//           );
//         } else if (status.status === "FAILED") {
//           await secretVoicerVersionRepository.update(version.id, {
//             externalStatus: "failed",
//             externalError: status.error ?? "External API returned FAILED",
//           });

//           if (version.versionType === "current") {
//             await secretVoicerItemRepository.updateStatus(
//               version.itemId,
//               "failed",
//             );

//             const item = await secretVoicerItemRepository.getById(
//               version.itemId,
//             );
//             if (item) {
//               projectsToUpdate.add(item.projectId);
//             }
//           }
//         }
//       } catch {
//         // Silent catch - polling will retry
//       }
//     };

//     await Promise.all(pendingVersions.map(pollVersion));

//     for (const projectId of projectsToUpdate) {
//       // biome-ignore lint/performance/noAwaitInLoops: Sequential project status updates
//       await updateProjectStatus(projectId);
//     }
//   } catch {
//     // Silent catch - polling will retry
//   }
// }

// function start(): void {
//   if (pollingInterval) {
//     return;
//   }

//   pollPendingTasks();

//   pollingInterval = setInterval(() => {
//     pollPendingTasks();
//   }, POLLING_INTERVAL_MS);

//   const timeoutCheckIntervalMs = TIMEOUT_CHECK_INTERVAL_MINUTES * MS_PER_MINUTE;
//   timeoutCheckInterval = setInterval(() => {
//     synthesisOrchestrator.handleTimeouts();
//   }, timeoutCheckIntervalMs);
// }

// function stop(): void {
//   if (pollingInterval) {
//     clearInterval(pollingInterval);
//     pollingInterval = null;
//   }

//   if (timeoutCheckInterval) {
//     clearInterval(timeoutCheckInterval);
//     timeoutCheckInterval = null;
//   }
// }

// export const synthesisPolling = {
//   start,
//   stop,
// };

export const FIX_THIS_FILE_LATER = 123;
