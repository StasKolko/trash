import {
  AUDIO_PROCESSING_CLEANUP_CRON,
  AUDIO_PROCESSING_TTL_MS,
} from "@packages/contract/audio-processing";
import { cron } from "@elysiajs/cron";
import { Elysia } from "elysia";

import { storage } from "./storage";

const AUDIO_PROCESSING_PREFIX = "tmp/audio-processing/";

export const storageCleanupCron = new Elysia().use(
  cron({
    name: "storage-cleanup",
    pattern: AUDIO_PROCESSING_CLEANUP_CRON,
    async run() {
      // biome-ignore lint/suspicious/noConsole: Cron logging required
      console.log("🧹 [storage-cleanup] Starting cleanup...");

      try {
        const objects = await storage.listObjects(AUDIO_PROCESSING_PREFIX);
        const now = Date.now();
        let deletedCount = 0;

        const expiredKeys: string[] = [];

        for (const obj of objects) {
          const age = now - obj.lastModified.getTime();
          if (age > AUDIO_PROCESSING_TTL_MS) {
            expiredKeys.push(obj.key);
          }
        }

        if (expiredKeys.length > 0) {
          await storage.deleteObjects(expiredKeys);
          deletedCount = expiredKeys.length;
        }

        // biome-ignore lint/suspicious/noConsole: Cron logging required
        console.log(
          `🧹 [storage-cleanup] Done: ${deletedCount} expired object(s) deleted out of ${objects.length} total`,
        );
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Cron logging required
        console.error("❌ [storage-cleanup] Error:", error);
      }
    },
  }),
);