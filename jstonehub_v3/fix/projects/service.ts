// import { secretVoicerCharacterRepository } from "../characters/repository";
// import { secretVoicerItemRepository } from "../items/repository";
// import type { ItemStatus } from "../items/types";
// import { synthesisOrchestrator } from "../synthesis/orchestrator";
// import { synthesisPolling } from "../synthesis/polling";
// import { secretVoicerVersionRepository } from "../versions/repository";
// import { secretVoicerProjectRepository } from "./repository";
// import type {
//   CreateProjectInput,
//   ProjectStats,
//   ProjectWithDetails,
//   ProjectWithStats,
// } from "./types";

// async function createAndStart(
//   input: CreateProjectInput,
// ): Promise<ProjectWithDetails> {
//   const project = await secretVoicerProjectRepository.create({
//     name: input.name,
//     status: "processing",
//   });

//   const characters = await secretVoicerCharacterRepository.createMany(
//     input.characters.map((c) => ({
//       projectId: project.id,
//       name: c.name,
//       voiceId: c.voiceId,
//     })),
//   );

//   const characterByName = new Map(characters.map((c) => [c.name, c]));

//   await secretVoicerItemRepository.createMany(
//     input.items.map((item) => {
//       const character = characterByName.get(item.characterName);
//       if (!character) {
//         throw new Error(`Character "${item.characterName}" not found`);
//       }
//       return {
//         projectId: project.id,
//         characterId: character.id,
//         orderIndex: item.orderIndex,
//         text: item.text,
//         status: "pending" as const,
//       };
//     }),
//   );

//   setImmediate(() => {
//     synthesisOrchestrator.startProjectSynthesis(project.id);
//   });

//   synthesisPolling.start();

//   const result = await getProjectWithDetails(project.id);
//   if (!result) {
//     throw new Error("Failed to get created project");
//   }

//   return result;
// }

// async function getProjectWithDetails(
//   projectId: string,
// ): Promise<ProjectWithDetails | null> {
//   const project = await secretVoicerProjectRepository.getById(projectId);
//   if (!project) {
//     return null;
//   }

//   const characters =
//     await secretVoicerCharacterRepository.getByProjectId(projectId);
//   const items = await secretVoicerItemRepository.getByProjectId(projectId);

//   const itemIds = items.map((i) => i.id);
//   const versions =
//     itemIds.length > 0
//       ? await secretVoicerVersionRepository.getByItemIds(itemIds)
//       : [];

//   type VersionEntry = {
//     current: (typeof versions)[0] | null;
//     candidate: (typeof versions)[0] | null;
//   };

//   const versionsByItemId = new Map<string, VersionEntry>();

//   for (const item of items) {
//     versionsByItemId.set(item.id, { current: null, candidate: null });
//   }

//   for (const version of versions) {
//     const entry = versionsByItemId.get(version.itemId);
//     if (entry) {
//       if (version.versionType === "current") {
//         entry.current = version;
//       } else {
//         entry.candidate = version;
//       }
//     }
//   }

//   const characterById = new Map(characters.map((c) => [c.id, c]));

//   const stats: ProjectStats = {
//     total: items.length,
//     pending: 0,
//     processing: 0,
//     completed: 0,
//     failed: 0,
//     comparing: 0,
//   };

//   for (const item of items) {
//     const key = item.status as ItemStatus;
//     stats[key]++;
//   }

//   return {
//     ...project,
//     stats,
//     characters: characters.map((c) => ({
//       id: c.id,
//       name: c.name,
//       voiceId: c.voiceId,
//     })),
//     items: items.map((item) => {
//       const itemVersions = versionsByItemId.get(item.id);
//       const character = characterById.get(item.characterId);

//       return {
//         id: item.id,
//         orderIndex: item.orderIndex,
//         characterId: item.characterId,
//         characterName: character?.name ?? "Unknown",
//         text: item.text,
//         status: item.status,
//         currentVersion: itemVersions?.current
//           ? {
//               id: itemVersions.current.id,
//               minioUrl: itemVersions.current.minioUrl,
//               externalStatus: itemVersions.current.externalStatus,
//               externalError: itemVersions.current.externalError,
//             }
//           : null,
//         candidateVersion: itemVersions?.candidate
//           ? {
//               id: itemVersions.candidate.id,
//               minioUrl: itemVersions.candidate.minioUrl,
//               externalStatus: itemVersions.candidate.externalStatus,
//               externalError: itemVersions.candidate.externalError,
//             }
//           : null,
//       };
//     }),
//   };
// }

// async function getAllProjectsWithStats(): Promise<ProjectWithStats[]> {
//   const projects = await secretVoicerProjectRepository.getAll();

//   const getProjectStats = async (
//     project: (typeof projects)[0],
//   ): Promise<ProjectWithStats> => {
//     const counts = await secretVoicerItemRepository.countByProjectAndStatus(
//       project.id,
//     );

//     return {
//       id: project.id,
//       name: project.name,
//       status: project.status,
//       stats: {
//         total: Object.values(counts).reduce((a, b) => a + b, 0),
//         ...counts,
//       },
//       createdAt: project.createdAt,
//       updatedAt: project.updatedAt,
//     };
//   };

//   return Promise.all(projects.map(getProjectStats));
// }

// async function deleteProject(projectId: string): Promise<void> {
//   const project = await secretVoicerProjectRepository.getById(projectId);
//   if (!project) {
//     throw new Error(`Project ${projectId} not found`);
//   }

//   await secretVoicerProjectRepository.delete(projectId);
// }

// async function stopAllItems(projectId: string): Promise<void> {
//   const items = await secretVoicerItemRepository.getByProjectId(projectId);
//   const activeItems = items.filter(
//     (i) => i.status === "pending" || i.status === "processing",
//   );

//   if (activeItems.length === 0) {
//     return;
//   }

//   const itemIds = activeItems.map((i) => i.id);
//   await secretVoicerItemRepository.updateManyStatus(itemIds, "failed");

//   const versionsByItem = await Promise.all(
//     activeItems.map((item) =>
//       secretVoicerVersionRepository.getByItemId(item.id),
//     ),
//   );

//   const updatePromises: Promise<unknown>[] = [];
//   for (const versions of versionsByItem) {
//     for (const version of versions) {
//       if (
//         version.externalStatus === "pending"
//         || version.externalStatus === "processing"
//       ) {
//         updatePromises.push(
//           secretVoicerVersionRepository.update(version.id, {
//             externalStatus: "failed",
//             externalError: "Stopped by user",
//           }),
//         );
//       }
//     }
//   }
//   await Promise.all(updatePromises);

//   await updateProjectStatus(projectId);
// }

// async function deleteItem(itemId: string): Promise<void> {
//   const item = await secretVoicerItemRepository.getById(itemId);
//   if (!item) {
//     throw new Error(`Item ${itemId} not found`);
//   }

//   const orderIndex = item.orderIndex;
//   const projectId = item.projectId;

//   await secretVoicerItemRepository.delete(itemId);
//   await secretVoicerItemRepository.reorderAfterDelete(projectId, orderIndex);
//   await updateProjectStatus(projectId);
// }

// async function updateItemText(itemId: string, newText: string): Promise<void> {
//   const item = await secretVoicerItemRepository.getById(itemId);
//   if (!item) {
//     throw new Error(`Item ${itemId} not found`);
//   }

//   await secretVoicerItemRepository.update(itemId, { text: newText });

//   if (item.status !== "pending") {
//     const versions = await secretVoicerVersionRepository.getByItemId(itemId);
//     await Promise.all(
//       versions.map((version) =>
//         secretVoicerVersionRepository.delete(version.id),
//       ),
//     );

//     await secretVoicerItemRepository.updateStatus(itemId, "pending");
//     await updateProjectStatus(item.projectId);
//   }
// }

// async function stopItem(itemId: string): Promise<void> {
//   const item = await secretVoicerItemRepository.getById(itemId);
//   if (!item) {
//     throw new Error(`Item ${itemId} not found`);
//   }

//   if (item.status !== "pending" && item.status !== "processing") {
//     throw new Error("Item is not in active state");
//   }

//   const versions = await secretVoicerVersionRepository.getByItemId(itemId);
//   await Promise.all(
//     versions
//       .filter(
//         (version) =>
//           version.externalStatus === "pending"
//           || version.externalStatus === "processing",
//       )
//       .map((version) =>
//         secretVoicerVersionRepository.update(version.id, {
//           externalStatus: "failed",
//           externalError: "Stopped by user",
//         }),
//       ),
//   );

//   await secretVoicerItemRepository.updateStatus(itemId, "failed");
//   await updateProjectStatus(item.projectId);
// }

// async function updateProjectStatus(projectId: string): Promise<void> {
//   const counts =
//     await secretVoicerItemRepository.countByProjectAndStatus(projectId);

//   const total = Object.values(counts).reduce((a, b) => a + b, 0);

//   if (total === 0) {
//     await secretVoicerProjectRepository.updateStatus(projectId, "draft");
//     return;
//   }

//   let status: "processing" | "completed" | "partial" | "failed";

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

// async function retryItem(itemId: string): Promise<void> {
//   const item = await secretVoicerItemRepository.getById(itemId);
//   if (!item) {
//     throw new Error(`Item ${itemId} not found`);
//   }

//   if (item.status === "comparing") {
//     throw new Error("Cannot retry item in comparing state");
//   }

//   const existingCurrent =
//     await secretVoicerVersionRepository.getByItemIdAndType(itemId, "current");

//   if (existingCurrent && item.status === "completed") {
//     await synthesisOrchestrator.startItemSynthesis(itemId, "candidate");
//   } else {
//     await synthesisOrchestrator.startItemSynthesis(itemId, "current");
//   }
// }

// async function selectVersion(
//   itemId: string,
//   selectedVersionId: string,
// ): Promise<void> {
//   const item = await secretVoicerItemRepository.getById(itemId);
//   if (!item) {
//     throw new Error(`Item ${itemId} not found`);
//   }

//   if (item.status !== "comparing") {
//     throw new Error("Item is not in comparing state");
//   }

//   const versions = await secretVoicerVersionRepository.getByItemId(itemId);
//   const selectedVersion = versions.find((v) => v.id === selectedVersionId);

//   if (!selectedVersion) {
//     throw new Error(`Version ${selectedVersionId} not found`);
//   }

//   const otherVersion = versions.find((v) => v.id !== selectedVersionId);

//   if (otherVersion) {
//     await secretVoicerVersionRepository.delete(otherVersion.id);
//   }

//   await secretVoicerVersionRepository.update(selectedVersionId, {
//     versionType: "current",
//   });

//   await secretVoicerItemRepository.updateStatus(itemId, "completed");
//   await updateProjectStatus(item.projectId);
// }

// async function updateCharacterVoice(
//   characterId: string,
//   newVoiceId: string,
// ): Promise<void> {
//   const character = await secretVoicerCharacterRepository.getById(characterId);
//   if (!character) {
//     throw new Error(`Character ${characterId} not found`);
//   }

//   await secretVoicerCharacterRepository.update(characterId, {
//     voiceId: newVoiceId,
//   });

//   const items = await secretVoicerItemRepository.getByCharacterId(characterId);
//   const completedItems = items.filter((i) => i.status === "completed");

//   if (completedItems.length > 0) {
//     const itemIds = completedItems.map((i) => i.id);
//     await secretVoicerItemRepository.updateManyStatus(itemIds, "pending");
//   }
// }

// async function retryAllCharacterItems(characterId: string): Promise<void> {
//   const items = await secretVoicerItemRepository.getByCharacterId(characterId);
//   const pendingItems = items.filter((i) => i.status === "pending");

//   const startSynthesis = (item: (typeof pendingItems)[0]): Promise<void> =>
//     synthesisOrchestrator.startItemSynthesis(item.id, "current");

//   await Promise.all(pendingItems.map(startSynthesis));
// }

// export const secretVoicerProjectService = {
//   createAndStart,
//   getProjectWithDetails,
//   getAllProjectsWithStats,
//   deleteProject,
//   stopAllItems,
//   deleteItem,
//   updateItemText,
//   stopItem,
//   retryItem,
//   selectVersion,
//   updateCharacterVoice,
//   retryAllCharacterItems,
// };

export const FIX_THIS_LATER = 123;
