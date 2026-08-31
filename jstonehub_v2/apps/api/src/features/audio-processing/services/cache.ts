import fs from "node:fs/promises";
import { cron } from "@elysiajs/cron";
import { deleteExpiredCache, getProcessedAudioById } from "../data/repository";

export async function cleanupExpiredCache(): Promise<number> {
  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log("🧹 [AudioCache] Starting cache cleanup...");

  const deleted = await deleteExpiredCache();

  // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
  console.log(`🧹 [AudioCache] Cleaned up ${deleted} expired entries`);
  return deleted;
}

export async function isCacheValid(jobId: string): Promise<boolean> {
  const job = await getProcessedAudioById(jobId);

  if (!job) {
    return false;
  }
  if (job.status !== "COMPLETED") {
    return false;
  }
  if (!job.outputPath) {
    return false;
  }
  if (new Date() > job.expiresAt) {
    return false;
  }

  try {
    await fs.access(job.outputPath);
    return true;
  } catch {
    return false;
  }
}

export function getCacheCleanupCron() {
  return cron({
    name: "audioProcessingCacheCleanup",
    pattern: "0 3 * * *",
    async run() {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.log("⏰ [Cron] Starting audio cache cleanup...");
      await cleanupExpiredCache();
    },
  });
}
