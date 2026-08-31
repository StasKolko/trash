// // apps/api/src/features/secret-voicer/internal/v1.ts
// import { Elysia, t } from "elysia";
// import { env } from "#api/shared/config/env";
// import { HTTP_STATUS } from "#api/shared/config/http-status";
// import { secretVoicerApi } from "../external-api";
// import { synthesisOrchestrator } from "../synthesis/orchestrator";

// export const secretVoicerInternalV1 = new Elysia({
//   prefix: "/internal/secret-voicer",
// })
//   .onBeforeHandle(({ headers, set }) => {
//     const secret = headers["x-internal-secret"];

//     if (secret !== env.INTERNAL_SECRET) {
//       set.status = HTTP_STATUS.UNAUTHORIZED;
//       return { error: "Unauthorized" };
//     }
//   })
//   .get("/audio-headers", async () => {
//     const headers = await secretVoicerApi.getAudioHeaders();
//     return { headers };
//   })
//   .get("/download-audio", async ({ query, set }) => {
//     const audioUrl = query.url;

//     if (!audioUrl || typeof audioUrl !== "string") {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return { error: "Missing url parameter" };
//     }

//     try {
//       // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//       console.log("[INTERNAL] Downloading audio:", audioUrl);

//       const downloadPayload =
//         await secretVoicerApi.buildAudioDownload(audioUrl);

//       const response = await fetch(downloadPayload.url, {
//         headers: downloadPayload.headers,
//       });

//       if (!response.ok) {
//         // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//         console.error("[INTERNAL] Download failed:", response.status);
//         set.status = HTTP_STATUS.BAD_GATEWAY;
//         return { error: `Upstream error: ${response.status}` };
//       }

//       const arrayBuffer = await response.arrayBuffer();
//       // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//       console.log("[INTERNAL] Downloaded audio, size:", arrayBuffer.byteLength);

//       return new Response(arrayBuffer, {
//         headers: {
//           "content-type": "audio/mpeg",
//           "content-length": String(arrayBuffer.byteLength),
//         },
//       });
//     } catch (error) {
//       // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//       console.error("[INTERNAL] Download error:", error);
//       set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
//       return {
//         error: error instanceof Error ? error.message : "Download failed",
//       };
//     }
//   })
//   .post(
//     "/versions/:versionId/complete",
//     async ({ params, body }) => {
//       await synthesisOrchestrator.handleWorkerCallback(
//         params.versionId,
//         body.success,
//         body.minioKey,
//         body.error,
//       );

//       return { success: true };
//     },
//     {
//       body: t.Object({
//         success: t.Boolean(),
//         minioKey: t.Optional(t.String()),
//         error: t.Optional(t.String()),
//       }),
//     },
//   );

export const FIX_THIS_FILE_LATER = 123;
