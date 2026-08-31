import { Elysia } from "elysia";

import { audioProcessingV1 } from "#api/feature/audio-processing/audio-processing.v1";
import { authV1 } from "#api/feature/auth/auth.v1";
import { userV1 } from "#api/feature/auth/user.v1";
import { browserFingerprintV1 } from "#api/feature/browser-fingerprint/browser-fingerprint.v1";
import { jokeV1 } from "#api/feature/joke/joke.v1";
import { jokeTtsV1 } from "#api/feature/joke-tts/joke-tts.v1";
import { languageV1 } from "#api/feature/language/language.v1";
import { secretVoicerTaskV1 } from "#api/feature/secret-voicer/secret-voicer-task.v1";
import { secretVoicerVoiceV1 } from "#api/feature/secret-voicer/secret-voicer-voice.v1";
import { secretVoicerCredentialV1 } from "#api/feature/secret-voicer-credential/secret-voicer-credential.v1";
import { storageV1 } from "#api/feature/storage/storage.v1";
import { tagV1 } from "#api/feature/tag/tag.v1";
import { ttsProjectV1 } from "#api/feature/tts-project/tts-project.v1";
import { ttsProjectWebhookV1 } from "#api/feature/tts-project/tts-project-webhook.v1";
import { queueV1 } from "#api/shared/queue/queue.v1";
import { storageCleanupCron } from "#api/shared/storage/storage-cleanup.cron";
import { corsPlugin } from "#api/shared/web/cors";
import { healthcheckV1 } from "#api/shared/web/healthcheck.v1";

export const apiApp = new Elysia()
  .use(corsPlugin)
  .use(storageCleanupCron)
  .use(healthcheckV1)
  .use(authV1)          
  .use(userV1)          
  .use(queueV1)
  .use(browserFingerprintV1)
  .use(secretVoicerCredentialV1)
  .use(secretVoicerVoiceV1)
  .use(secretVoicerTaskV1)
  .use(ttsProjectV1)
  .use(ttsProjectWebhookV1)
  .use(languageV1)
  .use(tagV1)
  .use(jokeV1)
  .use(jokeTtsV1)
  .use(audioProcessingV1)
  .use(storageV1);
