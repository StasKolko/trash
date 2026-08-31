import IoRedis from "ioredis";

import { env } from "#api/shared/config/env";

let connection: IoRedis | null = null;

function getRedisConnection(): IoRedis {
  if (!connection) {
    connection = new IoRedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
}

function getRedisConnectionOptions() {
  return { url: env.REDIS_URL, maxRetriesPerRequest: null as null };
}

async function closeRedisConnection(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}

export { closeRedisConnection, getRedisConnection, getRedisConnectionOptions };
