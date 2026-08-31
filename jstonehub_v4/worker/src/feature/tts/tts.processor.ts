import type { TtsJobData, TtsJobResult } from "@packages/contract/queue";

import { SECRET_VOICER_BASE_URL } from "@packages/contract/secret-voicer";

import { env } from "#worker/shared/config/env";
import { workerStorage } from "#worker/shared/storage/storage";

import { downloadToBuffer } from "./_download";

const POLL_INITIAL_DELAY_MS = 5000;
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 300_000;
const API_URL = `${SECRET_VOICER_BASE_URL}/api`;

const REDIRECT_MIN = 300;
const REDIRECT_MAX = 400;

const MP3_BITRATE_KBPS = 128;
const BITS_PER_BYTE = 8;
const MS_IN_SECOND = 1000;

const FETCH_TIMEOUT_MS = 15_000;

type ExternalTaskStatus = {
  status_code: "LOCAL_PROCESSING" | "COMPLETED" | "FAILED";
  audio_url: string | null;
  error: string | null;
};

async function processTts(data: TtsJobData): Promise<TtsJobResult> {
  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(`🎤 [tts] Starting TTS job ${data.jobId}, taskId=${data.taskId}`);

  try {
    const audioUrl = await pollUntilComplete(data);

    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.log(`🎤 [tts] Task ${data.taskId} completed, downloading audio`);

    const fullUrl = audioUrl.startsWith("http")
      ? audioUrl
      : `${SECRET_VOICER_BASE_URL}${audioUrl}`;

    const headers = buildAudioHeaders(data.credentials);
    const buffer = await downloadToBuffer(fullUrl, headers);

    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.log(
      `🎤 [tts] Downloaded ${buffer.length} bytes, uploading to MinIO`,
    );

    await workerStorage.uploadBuffer(data.outputKey, buffer);

    const durationMs = getAudioDurationMs(buffer);

    await safeNotifyCompleted(data.outputKey);

    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.log(`✅ [tts] Job ${data.jobId} complete → ${data.outputKey}`);

    return {
      outputKey: data.outputKey,
      sizeBytes: buffer.length,
      durationMs,
      processedAt: Date.now(),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(
      `❌ [tts] Job ${data.jobId} (taskId=${data.taskId}) error: ${errorMsg}`,
    );

    await safeNotifyFailed(data.outputKey, errorMsg);

    throw error;
  }
}

async function safeNotifyCompleted(outputKey: string): Promise<void> {
  try {
    const response = await fetch(
      `${env.API_URL}/internal/tts/segment-completed`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": env.INTERNAL_SECRET,
        },
        body: JSON.stringify({ outputKey }),
      },
    );
    if (!response.ok) {
      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.warn(
        `⚠️ [tts] segment-completed notify failed: HTTP ${response.status}`,
      );
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(
      "⚠️ [tts] Failed to notify segment-completed (non-fatal):",
      error instanceof Error ? error.message : error,
    );
  }
}

async function safeNotifyFailed(
  outputKey: string,
  errorMsg: string,
): Promise<void> {
  try {
    const response = await fetch(`${env.API_URL}/internal/tts/segment-failed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SECRET,
      },
      body: JSON.stringify({ outputKey, error: errorMsg }),
    });
    if (!response.ok) {
      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.warn(
        `⚠️ [tts] segment-failed notify failed: HTTP ${response.status}`,
      );
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(
      "⚠️ [tts] Failed to notify segment-failed (non-fatal):",
      error instanceof Error ? error.message : error,
    );
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: REFACTOR
async function pollUntilComplete(data: TtsJobData): Promise<string> {
  const headers = buildApiHeaders(data.credentials);
  const startTime = Date.now();
  const statusUrl = `${API_URL}/task/${data.taskId}/`;

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(`🎤 [tts] Polling task status at: ${statusUrl}`);

  // Wait before first poll — give secret-voicer.ru time to process
  // and avoid hammering the server with 5 concurrent requests immediately
  // biome-ignore lint/style/noMagicNumbers: REFACTOR
  const jitter = Math.floor(Math.random() * 2000);
  await sleep(POLL_INITIAL_DELAY_MS + jitter);

  let consecutiveNetworkErrors = 0;
  const MaxConsecutiveNetworkErrors = 30;

  while (Date.now() - startTime < POLL_TIMEOUT_MS) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: sequential polling required
      const status = await fetchTaskStatus(data.taskId, headers);
      consecutiveNetworkErrors = 0;

      if (status.status_code === "COMPLETED" && status.audio_url) {
        return status.audio_url;
      }

      if (status.status_code === "FAILED") {
        throw new Error(
          `TTS task ${data.taskId} failed: ${status.error ?? "Unknown error"}`,
        );
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const isNetworkError =
        msg.includes("Unable to connect")
        || msg.includes("ECONNREFUSED")
        || msg.includes("ENOTFOUND")
        || msg.includes("ETIMEDOUT")
        || msg.includes("ECONNRESET")
        || msg.includes("fetch failed")
        || msg.includes("aborted");

      if (isNetworkError) {
        consecutiveNetworkErrors++;

        if (consecutiveNetworkErrors >= MaxConsecutiveNetworkErrors) {
          throw new Error(
            `TTS task ${data.taskId}: ${MaxConsecutiveNetworkErrors} consecutive network errors. Giving up. Last error: ${msg}`,
          );
        }

        // biome-ignore lint/suspicious/noConsole: Worker logging required
        console.warn(
          `⚠️ [tts] Network error polling task ${data.taskId} (${consecutiveNetworkErrors}/${MaxConsecutiveNetworkErrors}): ${msg}`,
        );
      } else {
        throw error;
      }
    }

    // Add jitter to prevent all workers polling at the exact same moment
    const pollJitter = Math.floor(Math.random() * MS_IN_SECOND);
    await sleep(POLL_INTERVAL_MS + pollJitter);
  }

  throw new Error(
    `TTS task ${data.taskId} timed out after ${POLL_TIMEOUT_MS}ms`,
  );
}

async function fetchTaskStatus(
  taskId: number,
  headers: Record<string, string>,
): Promise<ExternalTaskStatus> {
  const response = await fetchWithTimeout(
    `${API_URL}/task/${taskId}/`,
    {
      method: "GET",
      headers,
      redirect: "manual",
    },
    FETCH_TIMEOUT_MS,
  );

  const text = await response.text();
  checkResponse(response, text);

  if (!response.ok) {
    throw new Error(`Task status check failed (${response.status})`);
  }

  return JSON.parse(text) as ExternalTaskStatus;
}

function buildApiHeaders(
  creds: TtsJobData["credentials"],
): Record<string, string> {
  return {
    accept: "*/*",
    "accept-language": creds.acceptLanguage,
    "content-type": "application/json",
    cookie: `csrftoken=${creds.csrfToken}; sessionid=${creds.sessionId}`,
    origin: SECRET_VOICER_BASE_URL,
    referer: `${SECRET_VOICER_BASE_URL}/app/`,
    "user-agent": creds.userAgent,
    "x-csrftoken": creds.csrfToken,
  };
}

function buildAudioHeaders(
  creds: TtsJobData["credentials"],
): Record<string, string> {
  return {
    accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
    "accept-language": creds.acceptLanguage,
    cookie: `csrftoken=${creds.csrfToken}; sessionid=${creds.sessionId}`,
    referer: `${SECRET_VOICER_BASE_URL}/app/`,
    "user-agent": creds.userAgent,
  };
}

function checkResponse(response: Response, text: string): void {
  if (response.status >= REDIRECT_MIN && response.status < REDIRECT_MAX) {
    throw new Error(`Auth redirect (${response.status}). Session expired.`);
  }
  if (text.trimStart().startsWith("<")) {
    throw new Error(`Auth failed — HTML response (${response.status}).`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getAudioDurationMs(buffer: Buffer): number {
  const bits = buffer.length * BITS_PER_BYTE;
  const seconds = bits / (MP3_BITRATE_KBPS * MS_IN_SECOND);
  return Math.round(seconds * MS_IN_SECOND);
}

export { processTts };
