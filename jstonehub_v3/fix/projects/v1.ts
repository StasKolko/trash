// import { Elysia, t } from "elysia";
// import { HTTP_STATUS } from "#api/shared/config/http-status";
// import { secretVoicerProjectService } from "./service";

// export const secretVoicerProjectsV1 = new Elysia({
//   prefix: "/v1/secret-voicer/projects",
// })
//   .get("/", () => secretVoicerProjectService.getAllProjectsWithStats())
//   .get("/:id", async ({ params, set }) => {
//     const project = await secretVoicerProjectService.getProjectWithDetails(
//       params.id,
//     );

//     if (!project) {
//       set.status = HTTP_STATUS.NOT_FOUND;
//       return { error: "Project not found" };
//     }

//     return project;
//   })
//   .post(
//     "/",
//     async ({ body, set }) => {
//       try {
//         const project = await secretVoicerProjectService.createAndStart(body);
//         set.status = HTTP_STATUS.CREATED;
//         return project;
//       } catch (error) {
//         set.status = HTTP_STATUS.BAD_REQUEST;
//         return {
//           error:
//             error instanceof Error ? error.message : "Failed to create project",
//         };
//       }
//     },
//     {
//       body: t.Object({
//         name: t.String({ minLength: 1 }),
//         characters: t.Array(
//           t.Object({
//             name: t.String({ minLength: 1 }),
//             voiceId: t.String({ minLength: 1 }),
//           }),
//           { minItems: 1 },
//         ),
//         items: t.Array(
//           t.Object({
//             characterName: t.String({ minLength: 1 }),
//             text: t.String({ minLength: 1 }),
//             orderIndex: t.Number({ minimum: 0 }),
//           }),
//           { minItems: 1 },
//         ),
//       }),
//     },
//   )
//   .delete("/:id", async ({ params, set }) => {
//     try {
//       await secretVoicerProjectService.deleteProject(params.id);
//       return { success: true };
//     } catch (error) {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return {
//         error:
//           error instanceof Error ? error.message : "Failed to delete project",
//       };
//     }
//   })
//   .post("/:id/stop-all", async ({ params, set }) => {
//     try {
//       await secretVoicerProjectService.stopAllItems(params.id);
//       return { success: true };
//     } catch (error) {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return {
//         error:
//           error instanceof Error ? error.message : "Failed to stop all items",
//       };
//     }
//   })
//   .delete("/:id/items/:itemId", async ({ params, set }) => {
//     try {
//       await secretVoicerProjectService.deleteItem(params.itemId);
//       return { success: true };
//     } catch (error) {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return {
//         error: error instanceof Error ? error.message : "Failed to delete item",
//       };
//     }
//   })
//   .patch(
//     "/:id/items/:itemId",
//     async ({ params, body, set }) => {
//       try {
//         await secretVoicerProjectService.updateItemText(
//           params.itemId,
//           body.text,
//         );
//         return { success: true };
//       } catch (error) {
//         set.status = HTTP_STATUS.BAD_REQUEST;
//         return {
//           error:
//             error instanceof Error ? error.message : "Failed to update item",
//         };
//       }
//     },
//     {
//       body: t.Object({
//         text: t.String({ minLength: 1 }),
//       }),
//     },
//   )
//   .post("/:id/items/:itemId/stop", async ({ params, set }) => {
//     try {
//       await secretVoicerProjectService.stopItem(params.itemId);
//       return { success: true };
//     } catch (error) {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return {
//         error: error instanceof Error ? error.message : "Failed to stop item",
//       };
//     }
//   })
//   .post("/:id/items/:itemId/retry", async ({ params, set }) => {
//     try {
//       await secretVoicerProjectService.retryItem(params.itemId);
//       return { success: true };
//     } catch (error) {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return {
//         error: error instanceof Error ? error.message : "Failed to retry item",
//       };
//     }
//   })
//   .post(
//     "/:id/items/:itemId/select",
//     async ({ params, body, set }) => {
//       try {
//         await secretVoicerProjectService.selectVersion(
//           params.itemId,
//           body.versionId,
//         );
//         return { success: true };
//       } catch (error) {
//         set.status = HTTP_STATUS.BAD_REQUEST;
//         return {
//           error:
//             error instanceof Error ? error.message : "Failed to select version",
//         };
//       }
//     },
//     {
//       body: t.Object({
//         versionId: t.String({ minLength: 1 }),
//       }),
//     },
//   )
//   .patch(
//     "/:id/characters/:characterId",
//     async ({ params, body, set }) => {
//       try {
//         await secretVoicerProjectService.updateCharacterVoice(
//           params.characterId,
//           body.voiceId,
//         );
//         return { success: true };
//       } catch (error) {
//         set.status = HTTP_STATUS.BAD_REQUEST;
//         return {
//           error:
//             error instanceof Error
//               ? error.message
//               : "Failed to update character",
//         };
//       }
//     },
//     {
//       body: t.Object({
//         voiceId: t.String({ minLength: 1 }),
//       }),
//     },
//   )
//   .post("/:id/characters/:characterId/retry-all", async ({ params, set }) => {
//     try {
//       await secretVoicerProjectService.retryAllCharacterItems(
//         params.characterId,
//       );
//       return { success: true };
//     } catch (error) {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Failed to retry character items",
//       };
//     }
//   });

export const FIX_THIS_LATER = 123;
