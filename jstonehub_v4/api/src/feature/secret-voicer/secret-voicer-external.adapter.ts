import type { SecretVoicerConfig } from "./secret-voicer-config.service";

import {
  SECRET_VOICER_API_URL,
  SECRET_VOICER_BASE_URL,
} from "@packages/contract/secret-voicer";

import {
  markCredentialError,
  resolveConfig,
  resolveConfigById,
} from "./secret-voicer-config.service";

type CreateTaskInput = {
  voiceId: string;
  text: string;
  rate: number;
};

type CreateTaskResult = {
  taskId: number;
  isReused: boolean;
  credentialId: string;
};

type TaskStatusResult = {
  statusCode: string;
  audioUrl: string | null;
  error: string | null;
};

type AudioDownloadPayload = {
  url: string;
  headers: Record<string, string>;
};

type GroupedVoicesResponse = {
  grouped_voices: {
    category: string;
    voices: unknown[];
  }[];
};

type FetchVoicesResult = {
  voices: unknown[];
  credentialId: string;
};

const REDIRECT_MIN = 300;
const REDIRECT_MAX = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const BODY_PREVIEW_LENGTH = 500;

function isAuthError(status: number, body: string): boolean {
  if (status === HTTP_NOT_FOUND) {
    return false;
  }
  if (status >= REDIRECT_MIN && status < REDIRECT_MAX) {
    return true;
  }
  if (status === HTTP_UNAUTHORIZED || status === HTTP_FORBIDDEN) {
    return true;
  }
  if (body.trimStart().startsWith("<")) {
    return true;
  }
  return false;
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
  const config = await resolveConfig();

  const response = await fetch(`${SECRET_VOICER_API_URL}/synthesize/`, {
    method: "POST",
    headers: buildApiHeaders(config),
    body: JSON.stringify({
      voice_id: input.voiceId,
      text: input.text,
      rate: input.rate,
    }),
  });

  const body = await safeReadBody(response);

  if (isAuthError(response.status, body)) {
    await markCredentialError(config.credentialId, {
      action: "createTask",
      statusCode: response.status,
      message: `Auth error on createTask: HTTP ${response.status}`,
      responseBody: body.slice(0, BODY_PREVIEW_LENGTH),
      occurredAt: new Date().toISOString(),
    });
    throw new Error(
      `Secret Voicer createTask auth error (${response.status}): credential ${config.credentialId} deactivated`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Secret Voicer createTask failed: HTTP ${response.status} — ${body.slice(0, BODY_PREVIEW_LENGTH)}`,
    );
  }

  const data = JSON.parse(body) as {
    task_id: number;
    is_reused: boolean;
  };

  return {
    taskId: data.task_id,
    isReused: data.is_reused,
    credentialId: config.credentialId,
  };
}

async function checkTaskStatus(
  taskId: number,
  credentialId?: string,
): Promise<TaskStatusResult> {
  const config = credentialId
    ? await resolveConfigById(credentialId)
    : await resolveConfig();

  const response = await fetch(`${SECRET_VOICER_API_URL}/task/${taskId}/`, {
    method: "GET",
    headers: buildApiHeaders(config),
    redirect: "manual",
  });

  const body = await safeReadBody(response);

  if (isAuthError(response.status, body)) {
    await markCredentialError(config.credentialId, {
      action: "checkTaskStatus",
      statusCode: response.status,
      message: `Auth error on checkTaskStatus: HTTP ${response.status}`,
      responseBody: body.slice(0, BODY_PREVIEW_LENGTH),
      occurredAt: new Date().toISOString(),
    });
    throw new Error(
      `Secret Voicer checkTaskStatus auth error (${response.status}): credential ${config.credentialId} deactivated`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Secret Voicer checkTaskStatus failed: HTTP ${response.status}`,
    );
  }

  const data = JSON.parse(body) as {
    status_code: string;
    audio_url: string | null;
    error: string | null;
  };

  return {
    statusCode: data.status_code,
    audioUrl: data.audio_url,
    error: data.error,
  };
}

async function buildAudioDownload(
  audioPath: string,
  credentialId?: string,
): Promise<AudioDownloadPayload> {
  const config = credentialId
    ? await resolveConfigById(credentialId)
    : await resolveConfig();

  const fullUrl = audioPath.startsWith("http")
    ? audioPath
    : `${SECRET_VOICER_BASE_URL}${audioPath}`;

  return {
    url: fullUrl,
    headers: {
      accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
      cookie: `csrftoken=${config.csrfToken}; sessionid=${config.sessionId}`,
      referer: `${SECRET_VOICER_BASE_URL}/app/`,
      "user-agent": config.userAgent,
    },
  };
}

async function fetchVoices(): Promise<FetchVoicesResult> {
  const config = await resolveConfig();

  const response = await fetch(`${SECRET_VOICER_API_URL}/voices/`, {
    headers: buildApiHeaders(config),
  });

  const body = await safeReadBody(response);

  if (isAuthError(response.status, body)) {
    await markCredentialError(config.credentialId, {
      action: "fetchVoices",
      statusCode: response.status,
      message: `Auth error on fetchVoices: HTTP ${response.status}`,
      responseBody: body.slice(0, BODY_PREVIEW_LENGTH),
      occurredAt: new Date().toISOString(),
    });
    throw new Error(
      `Secret Voicer fetchVoices auth error (${response.status}): credential ${config.credentialId} deactivated`,
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: HTTP ${response.status}`);
  }

  const data = JSON.parse(body) as GroupedVoicesResponse;

  const voices = data.grouped_voices.flatMap((group) => group.voices);

  return { voices, credentialId: config.credentialId };
}

function buildApiHeaders(config: SecretVoicerConfig): Record<string, string> {
  return {
    accept: "*/*",
    "accept-language": config.language,
    "content-type": "application/json",
    cookie: `csrftoken=${config.csrfToken}; sessionid=${config.sessionId}`,
    origin: SECRET_VOICER_BASE_URL,
    referer: `${SECRET_VOICER_BASE_URL}/app/`,
    "user-agent": config.userAgent,
    "x-csrftoken": config.csrfToken,
  };
}

const secretVoicerExternalAdapter = {
  createTask,
  checkTaskStatus,
  buildAudioDownload,
  fetchVoices,
};

export { secretVoicerExternalAdapter };
