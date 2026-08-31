import { STORAGE_PREFIXES } from "@packages/contract/storage";

import { storage } from "#api/shared/storage/storage";

import {
  markCredentialError,
  resolveConfig,
} from "./secret-voicer-config.service";

const PREVIEW_DOWNLOAD_EXPIRY_SECONDS = 86_400;
const ACCEPT_LANGUAGE_QUALITY_MIN = 0.1;
const ACCEPT_LANGUAGE_QUALITY_STEP = 0.1;
const BODY_PREVIEW_LENGTH = 500;
const REDIRECT_MIN = 300;
const REDIRECT_MAX = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;

type PreviewResult = {
  downloadUrl: string;
  cached: boolean;
};

async function getOrCachePreview(
  voiceId: string,
  previewUrl: string,
): Promise<PreviewResult> {
  const key = `${STORAGE_PREFIXES.voicePreview(voiceId)}preview.mp3`;
  const exists = await storage.objectExists(key);

  if (exists) {
    const downloadUrl = await storage.getPresignedDownloadUrl(
      key,
      PREVIEW_DOWNLOAD_EXPIRY_SECONDS,
    );
    return { downloadUrl, cached: true };
  }

  const config = await resolveConfig();
  const fullUrl = previewUrl.startsWith("http")
    ? previewUrl
    : `https://secret-voicer.ru${previewUrl}`;

  const response = await fetch(fullUrl, {
    headers: {
      accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
      cookie: `csrftoken=${config.csrfToken}; sessionid=${config.sessionId}`,
      referer: "https://secret-voicer.ru/app/",
      "user-agent": config.userAgent,
    },
  });

  if (!response.ok || response.status >= REDIRECT_MIN) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {
      bodyText = "";
    }

    const isAuthErr =
      (response.status >= REDIRECT_MIN && response.status < REDIRECT_MAX)
      || response.status === HTTP_UNAUTHORIZED
      || response.status === HTTP_FORBIDDEN
      || bodyText.trimStart().startsWith("<");

    if (isAuthErr) {
      await markCredentialError(config.credentialId, {
        action: "downloadVoicePreview",
        statusCode: response.status,
        message: `Auth error on downloadVoicePreview: HTTP ${response.status}`,
        responseBody: bodyText.slice(0, BODY_PREVIEW_LENGTH),
        occurredAt: new Date().toISOString(),
      });
    }

    throw new Error(`Failed to download preview: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await storage.uploadBuffer(key, buffer);

  const downloadUrl = await storage.getPresignedDownloadUrl(
    key,
    PREVIEW_DOWNLOAD_EXPIRY_SECONDS,
  );

  return { downloadUrl, cached: false };
}

async function buildTtsCredentials() {
  const config = await resolveConfig();

  const acceptLanguage =
    config.languages.length > 0
      ? config.languages
          .map((lang, i) => {
            if (i === 0) {
              return lang;
            }
            const q = Math.max(
              ACCEPT_LANGUAGE_QUALITY_MIN,
              1 - i * ACCEPT_LANGUAGE_QUALITY_STEP,
            ).toFixed(1);
            return `${lang};q=${q}`;
          })
          .join(",")
      : config.language;

  return {
    credentialId: config.credentialId,
    csrfToken: config.csrfToken,
    sessionId: config.sessionId,
    userAgent: config.userAgent,
    acceptLanguage,
  };
}

export { buildTtsCredentials, getOrCachePreview };
