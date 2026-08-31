// // apps/api/src/features/secret-voicer/external-api.ts
// import { and, eq } from "drizzle-orm";
// import { browserFingerprintTable } from "#api/features/browser-fingerprint/table";
// import { db } from "#api/shared/db/instance";
// import { secretVoicerCredentialTable } from "./credentials/table";

// const BASE_URL = "https://secret-voicer.ru";
// const API_URL = `${BASE_URL}/api`;
// const CACHE_TTL_MS = 3_600_000;
// const REDIRECT_MIN = 300;
// const REDIRECT_MAX = 400;
// const MAX_ERROR_LENGTH = 200;

// type AudioDownloadPayload = {
//   url: string;
//   headers: Record<string, string>;
// };

// type ExternalVoice = {
//   id: number;
//   voice_id: string;
//   name: string;
//   gender: "MALE" | "FEMALE";
//   locale: string | null;
//   is_multilingual: boolean;
//   preview_url: string | null;
//   preview_url_emotional: string | null;
//   usage_count: number;
//   avatar_url: string | null;
//   description: string | null;
//   accent: string | null;
//   age_group: string | null;
//   voice_style_tags: string[];
//   use_cases: string[];
// };

// type Config = {
//   csrfToken: string;
//   sessionId: string;
//   userAgent: string;
//   secChUa: string;
//   secChUaMobile: string;
//   secChUaPlatform: string;
//   acceptLanguage: string;
// };

// type ConfigCache = { config: Config; cachedAt: number } | null;
// type VoicesCache = { voices: ExternalVoice[]; cachedAt: number } | null;

// let configCache: ConfigCache = null;
// let voicesCache: VoicesCache = null;

// function isConfigExpired(): boolean {
//   return !configCache || Date.now() - configCache.cachedAt > CACHE_TTL_MS;
// }

// function isVoicesExpired(): boolean {
//   return !voicesCache || Date.now() - voicesCache.cachedAt > CACHE_TTL_MS;
// }

// function buildHeaders(config: Config): Record<string, string> {
//   return {
//     accept: "*/*",
//     "accept-language": config.acceptLanguage,
//     "content-type": "application/json",
//     cookie: `csrftoken=${config.csrfToken}; sessionid=${config.sessionId}`,
//     origin: BASE_URL,
//     referer: `${BASE_URL}/app/`,
//     "sec-ch-ua": config.secChUa,
//     "sec-ch-ua-mobile": config.secChUaMobile,
//     "sec-ch-ua-platform": config.secChUaPlatform,
//     "user-agent": config.userAgent,
//     "x-csrftoken": config.csrfToken,
//   };
// }

// function buildAudioHeaders(config: Config): Record<string, string> {
//   return {
//     accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
//     "accept-language": config.acceptLanguage,
//     cookie: `csrftoken=${config.csrfToken}; sessionid=${config.sessionId}`,
//     referer: `${BASE_URL}/app/`,
//     "sec-ch-ua": config.secChUa,
//     "sec-ch-ua-mobile": config.secChUaMobile,
//     "sec-ch-ua-platform": config.secChUaPlatform,
//     "user-agent": config.userAgent,
//   };
// }

// function checkResponse(response: Response, text: string): void {
//   if (response.status >= REDIRECT_MIN && response.status < REDIRECT_MAX) {
//     throw new Error(`Auth redirect (${response.status}). Session expired.`);
//   }
//   if (text.trimStart().startsWith("<")) {
//     throw new Error(`Auth failed - HTML response (${response.status}).`);
//   }
// }

// async function getConfig(): Promise<Config> {
//   if (!isConfigExpired() && configCache) {
//     // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//     console.log("[CONFIG] Using cached config");
//     return configCache.config;
//   }

//   // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//   console.log("[CONFIG] Fetching config from database...");

//   const [row] = await db
//     .select({
//       csrfToken: secretVoicerCredentialTable.csrfToken,
//       sessionId: secretVoicerCredentialTable.sessionId,
//       userAgent: browserFingerprintTable.userAgent,
//       secChUa: browserFingerprintTable.secChUa,
//       secChUaMobile: browserFingerprintTable.secChUaMobile,
//       secChUaPlatform: browserFingerprintTable.secChUaPlatform,
//       acceptLanguage: browserFingerprintTable.acceptLanguage,
//     })
//     .from(secretVoicerCredentialTable)
//     .innerJoin(
//       browserFingerprintTable,
//       eq(secretVoicerCredentialTable.fingerprintId, browserFingerprintTable.id),
//     )
//     .where(
//       and(
//         eq(secretVoicerCredentialTable.isActive, true),
//         eq(browserFingerprintTable.isActive, true),
//       ),
//     )
//     .limit(1);

//   if (!row) {
//     // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//     console.error("[CONFIG] No active credentials found!");
//     throw new Error("No active SecretVoicer credentials");
//   }

//   // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//   console.log("[CONFIG] Config loaded successfully");

//   configCache = {
//     config: {
//       csrfToken: row.csrfToken.trim(),
//       sessionId: row.sessionId.trim(),
//       userAgent: row.userAgent,
//       secChUa: row.secChUa,
//       secChUaMobile: row.secChUaMobile,
//       secChUaPlatform: row.secChUaPlatform,
//       acceptLanguage: row.acceptLanguage,
//     },
//     cachedAt: Date.now(),
//   };

//   return configCache.config;
// }

// async function fetchVoicesFromApi(): Promise<ExternalVoice[]> {
//   const config = await getConfig();

//   // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//   console.log("[EXTERNAL_API] Fetching voices from:", `${API_URL}/voices/`);

//   const response = await fetch(`${API_URL}/voices/`, {
//     method: "GET",
//     headers: buildHeaders(config),
//     redirect: "manual",
//   });

//   // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//   console.log("[EXTERNAL_API] Response status:", response.status);

//   const text = await response.text();

//   // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//   console.log("[EXTERNAL_API] Response length:", text.length);

//   checkResponse(response, text);

//   const ErrorPreviewLength = 500;

//   if (!response.ok) {
//     // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//     console.error(
//       "[EXTERNAL_API] Error response:",
//       text.slice(0, ErrorPreviewLength),
//     );
//     throw new Error(`Voices fetch failed (${response.status})`);
//   }

//   const data = JSON.parse(text) as {
//     grouped_voices: { voices: ExternalVoice[] }[];
//   };

//   return data.grouped_voices.flatMap((g) => g.voices);
// }

// export const secretVoicerApi = {
//   invalidateCache(): void {
//     configCache = null;
//     voicesCache = null;
//   },

//   invalidateConfigCache(): void {
//     configCache = null;
//   },

//   invalidateVoicesCache(): void {
//     voicesCache = null;
//   },

//   async getAudioHeaders(): Promise<Record<string, string>> {
//     const config = await getConfig();
//     return buildAudioHeaders(config);
//   },

//   async createTask(payload: {
//     voiceId: string;
//     text: string;
//     rate: number;
//   }): Promise<{ taskId: number; isReused: boolean }> {
//     const config = await getConfig();

//     const response = await fetch(`${API_URL}/synthesize/`, {
//       method: "POST",
//       headers: buildHeaders(config),
//       body: JSON.stringify({
//         model_id: "eleven_multilingual_v2",
//         provider: "default",
//         rate: payload.rate,
//         similarity_boost: 0.75,
//         stability: 0.5,
//         style: 0,
//         text: payload.text,
//         voice_id: payload.voiceId,
//       }),
//       redirect: "manual",
//     });

//     const text = await response.text();
//     checkResponse(response, text);

//     if (!response.ok) {
//       throw new Error(
//         `Synthesis failed (${response.status}): ${text.slice(0, MAX_ERROR_LENGTH)}`,
//       );
//     }

//     const data = JSON.parse(text) as { task_id: number; is_reused: boolean };
//     return { taskId: data.task_id, isReused: data.is_reused };
//   },

//   async getTaskStatus(taskId: number): Promise<{
//     status: "LOCAL_PROCESSING" | "COMPLETED" | "FAILED";
//     audioUrl: string | null;
//     error: string | null;
//   }> {
//     const config = await getConfig();

//     const response = await fetch(`${API_URL}/task/${taskId}/`, {
//       method: "GET",
//       headers: buildHeaders(config),
//       redirect: "manual",
//     });

//     const text = await response.text();
//     checkResponse(response, text);

//     if (!response.ok) {
//       throw new Error(`Task status failed (${response.status})`);
//     }

//     const data = JSON.parse(text) as {
//       status_code: "LOCAL_PROCESSING" | "COMPLETED" | "FAILED";
//       audio_url: string | null;
//       error: string | null;
//     };

//     return {
//       status: data.status_code,
//       audioUrl: data.audio_url,
//       error: data.error,
//     };
//   },

//   async getVoices(): Promise<ExternalVoice[]> {
//     if (!isVoicesExpired() && voicesCache) {
//       // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
//       console.log("[EXTERNAL_API] Using cached voices");
//       return voicesCache.voices;
//     }

//     const voices = await fetchVoicesFromApi();

//     voicesCache = {
//       voices,
//       cachedAt: Date.now(),
//     };

//     return voices;
//   },

//   async buildAudioDownload(audioPath: string): Promise<AudioDownloadPayload> {
//     const config = await getConfig();

//     return {
//       url: audioPath.startsWith("http") ? audioPath : `${BASE_URL}${audioPath}`,
//       headers: buildHeaders(config),
//     };
//   },
// };

export const FIX_THIS_FILE_LATER = 123;
