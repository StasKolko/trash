import type { AnyElysia } from "elysia";

import process from "node:process";

import { env } from "#api/shared/config/env";
import { closeRedisConnection } from "#api/shared/queue/connection";
import { closeAllQueues } from "#api/shared/queue/producer";
import { storage } from "#api/shared/storage/storage";

async function startServer(app: AnyElysia) {
  await storage.ensureBucket();

  app.listen({
    port: env.PORT,
    hostname: "0.0.0.0",
  });

  setupGracefulShutdown(app);
}

function setupGracefulShutdown(app: AnyElysia) {
  const shutdown = async (signal: string) => {
    // biome-ignore lint/suspicious/noConsole: Shutdown logging required
    console.log(`\n⏳ API: Received ${signal}, shutting down...`);

    try {
      await closeAllQueues();
      await closeRedisConnection();
      await app.stop();

      // biome-ignore lint/suspicious/noConsole: Shutdown logging required
      console.log("✅ API: Shutdown complete");
      process.exit(0);
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: Shutdown logging required
      console.error("❌ API: Shutdown error:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

export { startServer };
