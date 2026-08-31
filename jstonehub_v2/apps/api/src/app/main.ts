import { cron, Patterns } from "@elysiajs/cron";
import { Elysia } from "elysia";
import {
  audioProcessingControllerV1,
  getCacheCleanupCron,
} from "#api/features/audio-processing";
import { browserFingerprintControllerV1 } from "#api/features/browser-fingerprint";
import {
  secretVoicerAdminControllerV1,
  secretVoicerPublicControllerV1,
  syncVoicesFromExternalApi,
} from "#api/features/secret-voicer";

const API_PORT = 3333;

const app = new Elysia()
  .use(
    cron({
      name: "voiceSync",
      pattern: Patterns.EVERY_5_HOURS,
      async run() {
        // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
        console.log("⏰ [Cron] Starting scheduled voice sync...");
        await syncVoicesFromExternalApi();
      },
    }),
  )
  .use(getCacheCleanupCron())

  .use(browserFingerprintControllerV1)

  .use(secretVoicerPublicControllerV1)
  .use(secretVoicerAdminControllerV1)
  .use(audioProcessingControllerV1)

  .onAfterHandle(({ set }) => {
    set.headers["access-control-allow-origin"] = "*";
    set.headers["access-control-allow-methods"] =
      "GET,POST,PUT,PATCH,DELETE,OPTIONS";
    set.headers["access-control-allow-headers"] = "*";
  })
  .options("*", () => null)
  .listen(API_PORT);

// biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
console.log(`🦊 API is running at ${app.server?.hostname}:${app.server?.port}`);

export type ApiApp = typeof app;
