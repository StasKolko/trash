import type {
  VoicePreviewJobData,
  VoicePreviewJobResult,
} from "./_voice-preview.type";

import { SECRET_VOICER_BASE_URL } from "@packages/contract/secret-voicer";

import { workerStorage } from "#worker/shared/storage/storage";

import { downloadToBuffer } from "./_download";

async function processVoicePreview(
  data: VoicePreviewJobData,
): Promise<VoicePreviewJobResult> {
  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(`🔊 [voice-preview] Caching preview for voice ${data.voiceId}`);

  const fullUrl = data.previewUrl.startsWith("http")
    ? data.previewUrl
    : `${SECRET_VOICER_BASE_URL}${data.previewUrl}`;

  const headers = buildHeaders(data.credentials);
  const buffer = await downloadToBuffer(fullUrl, headers);

  await workerStorage.uploadBuffer(data.outputKey, buffer);

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(
    `✅ [voice-preview] Cached ${buffer.length} bytes → ${data.outputKey}`,
  );

  return {
    outputKey: data.outputKey,
    sizeBytes: buffer.length,
    processedAt: Date.now(),
  };
}

function buildHeaders(
  creds: VoicePreviewJobData["credentials"],
): Record<string, string> {
  return {
    accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
    "accept-language": creds.acceptLanguage,
    cookie: `csrftoken=${creds.csrfToken}; sessionid=${creds.sessionId}`,
    referer: `${SECRET_VOICER_BASE_URL}/app/`,
    "user-agent": creds.userAgent,
  };
}

export { processVoicePreview };
