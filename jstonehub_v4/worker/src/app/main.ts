import process from "node:process";

import { registerAudioProcessingWorker } from "#worker/feature/audio-processing/audio-processing.worker";
import { registerPingWorker } from "#worker/feature/ping/ping.worker";
import { registerTtsWorker } from "#worker/feature/tts/tts.worker";
import { env } from "#worker/shared/config/env";
import { closeRedisConnection } from "#worker/shared/queue/connection";
import {
  closeAllWorkers,
  getRegisteredWorkerCount,
} from "#worker/shared/queue/registry";

function registerAllWorkers(): void {
  registerPingWorker();
  registerAudioProcessingWorker();
  registerTtsWorker();
}

function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    // biome-ignore lint/suspicious/noConsole: Shutdown logging required
    console.log(`\n⏳ Worker: Received ${signal}, shutting down...`);

    try {
      await closeAllWorkers();
      await closeRedisConnection();

      // biome-ignore lint/suspicious/noConsole: Shutdown logging required
      console.log("✅ Worker: Shutdown complete");
      process.exit(0);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Shutdown logging required
      console.error("❌ Worker: Shutdown error:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

function main(): void {
  // biome-ignore lint/suspicious/noConsole: Startup logging required
  console.log(
    `🚀 Worker starting (${env.NODE_ENV}, concurrency: ${env.WORKER_CONCURRENCY})`,
  );

  registerAllWorkers();
  setupGracefulShutdown();

  const count = getRegisteredWorkerCount();
  // biome-ignore lint/suspicious/noConsole: Startup logging required
  console.log(`✅ Worker ready: ${count} queue(s) registered`);
}

main();
