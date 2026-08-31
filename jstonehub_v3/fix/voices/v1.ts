// // apps/api/src/features/secret-voicer/voices/v1.ts
// import { Elysia } from "elysia";
// import { HTTP_STATUS } from "#api/shared/config/http-status";
// import { secretVoicerApi } from "../external-api";

// type Voice = {
//   voiceId: string;
//   name: string;
//   gender: "MALE" | "FEMALE";
//   locale: string | null;
//   isMultilingual: boolean;
//   previewUrl: string | null;
//   previewUrlEmotional: string | null;
//   usageCount: number;
//   avatarUrl: string | null;
//   description: string | null;
//   accent: string | null;
//   ageGroup: string | null;
//   voiceStyleTags: string[];
//   useCases: string[];
// };

// const BASE_URL = "https://secret-voicer.ru";

// function normalizeUrl(url: string | null): string | null {
//   if (!url) {
//     return null;
//   }
//   if (url.startsWith("http")) {
//     return url;
//   }
//   return `${BASE_URL}${url}`;
// }

// export const secretVoicerVoicesV1 = new Elysia({
//   prefix: "/v1/secret-voicer/voices",
// })
//   .get("/", async ({ set }) => {
//     try {
//       // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//       console.log("[VOICES] Fetching voices from external API...");

//       const externalVoices = await secretVoicerApi.getVoices();

//       // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//       console.log("[VOICES] Got", externalVoices.length, "voices");

//       const voices: Voice[] = externalVoices.map((v) => ({
//         voiceId: v.voice_id,
//         name: v.name,
//         gender: v.gender,
//         locale: v.locale,
//         isMultilingual: v.is_multilingual,
//         previewUrl: normalizeUrl(v.preview_url),
//         previewUrlEmotional: normalizeUrl(v.preview_url_emotional),
//         usageCount: v.usage_count,
//         avatarUrl: normalizeUrl(v.avatar_url),
//         description: v.description,
//         accent: v.accent,
//         ageGroup: v.age_group,
//         voiceStyleTags: v.voice_style_tags,
//         useCases: v.use_cases,
//       }));

//       voices.sort((a, b) => b.usageCount - a.usageCount);

//       return { voices };
//     } catch (error) {
//       // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//       console.error("[VOICES] Error fetching voices:", error);

//       set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
//       return {
//         error: "Failed to fetch voices",
//         details: error instanceof Error ? error.message : "Unknown error",
//       };
//     }
//   })
//   .get("/preview", async ({ query, set }) => {
//     const url = query.url;

//     if (!url || typeof url !== "string") {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return { error: "Missing url parameter" };
//     }

//     if (!url.includes("secret-voicer.ru")) {
//       set.status = HTTP_STATUS.BAD_REQUEST;
//       return { error: "Invalid audio URL" };
//     }

//     try {
//       const downloadPayload = await secretVoicerApi.buildAudioDownload(url);

//       const response = await fetch(downloadPayload.url, {
//         headers: downloadPayload.headers,
//       });

//       if (!response.ok) {
//         set.status = HTTP_STATUS.BAD_GATEWAY;
//         return { error: `Upstream error: ${response.status}` };
//       }

//       const arrayBuffer = await response.arrayBuffer();
//       const contentType = response.headers.get("content-type") || "audio/mpeg";

//       return new Response(arrayBuffer, {
//         headers: {
//           "content-type": contentType,
//           "content-length": String(arrayBuffer.byteLength),
//           "cache-control": "public, max-age=3600",
//         },
//       });
//     } catch {
//       set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
//       return { error: "Failed to fetch audio preview" };
//     }
//   });

export const FIX_THIS_FILE_LATER = 123;
