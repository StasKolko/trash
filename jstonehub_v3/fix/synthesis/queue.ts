import type { DownloadTaskPayload } from "./types";

import { RedisClient } from "bun";

import { env } from "#api/shared/config/env";

import { REDIS_QUEUES } from "./constants";

const redis = new RedisClient(env.REDIS_URL);

async function addDownloadTask(payload: DownloadTaskPayload): Promise<void> {
  // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
  console.log(
    "[QUEUE] Adding download task to queue:",
    JSON.stringify(payload),
  );

  try {
    await redis.send("LPUSH", [
      REDIS_QUEUES.DOWNLOAD_TASKS,
      JSON.stringify(payload),
    ]);
    // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
    console.log("[QUEUE] Task added successfully");
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: DIAGNOSTIC
    console.error("[QUEUE] Failed to add task:", error);
    throw error;
  }
}

export const synthesisQueue = {
  addDownloadTask,
};
