import type {
  QueueJobDataMap,
  QueueJobResultMap,
  QueueName,
} from "@packages/contract/queue";

import { Worker } from "bullmq";

import { env } from "#worker/shared/config/env";

import { getRedisConnectionOptions } from "./connection";

type JobProcessor<T extends QueueName> = (
  data: QueueJobDataMap[T],
) => QueueJobResultMap[T] | Promise<QueueJobResultMap[T]>;

type RegisteredWorker = {
  name: QueueName;
  worker: Worker;
};

type RegisterWorkerOptions = {
  concurrency?: number;
};

const workers: RegisteredWorker[] = [];

function registerWorker<T extends QueueName>(
  queueName: T,
  processor: JobProcessor<T>,
  options?: RegisterWorkerOptions,
): void {
  const connection = getRedisConnectionOptions();
  const concurrency = options?.concurrency ?? env.WORKER_CONCURRENCY;

  const worker = new Worker<QueueJobDataMap[T], QueueJobResultMap[T]>(
    queueName,
    async (job) => {
      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.log(`📦 [${queueName}] Processing job ${job.id}: ${job.name}`);

      const result = await processor(job.data);

      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.log(`✅ [${queueName}] Completed job ${job.id}`);

      return result;
    },
    {
      connection,
      concurrency,
    },
  );

  worker.on("failed", (job, error) => {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(`❌ [${queueName}] Job ${job?.id} failed:`, error.message);
  });

  worker.on("error", (error) => {
    // biome-ignore lint/suspicious/noConsole: Worker logging required
    console.error(`❌ [${queueName}] Worker error:`, error.message);
  });

  workers.push({ name: queueName, worker });

  // biome-ignore lint/suspicious/noConsole: Worker logging required
  console.log(
    `🔧 [${queueName}] Worker registered (concurrency: ${concurrency})`,
  );
}

async function closeAllWorkers(): Promise<void> {
  await Promise.all(
    workers.map(async ({ name, worker }) => {
      await worker.close();
      // biome-ignore lint/suspicious/noConsole: Worker logging required
      console.log(`🛑 [${name}] Worker closed`);
    }),
  );
  workers.length = 0;
}

function getRegisteredWorkerCount(): number {
  return workers.length;
}

export type { JobProcessor, RegisterWorkerOptions };
export { closeAllWorkers, getRegisteredWorkerCount, registerWorker };
