import type {
  QueueJobDataMap,
  QueueJobResultMap,
  QueueName,
} from "@packages/contract/queue";
import type { JobsOptions, Queue as QueueType } from "bullmq";

import { QUEUE_NAMES } from "@packages/contract/queue";
import { Queue } from "bullmq";

import { getRedisConnectionOptions } from "./connection";

type QueueRegistry = {
  [K in QueueName]: Queue<QueueJobDataMap[K], QueueJobResultMap[K]>;
};

type AddJobParams<T extends QueueName> = {
  queue: T;
  name: string;
  data: QueueJobDataMap[T];
  options?: JobsOptions;
};

let registry: QueueRegistry | null = null;

function getRegistry(): QueueRegistry {
  if (!registry) {
    const connection = getRedisConnectionOptions();

    registry = Object.fromEntries(
      QUEUE_NAMES.map((name) => [name, new Queue(name, { connection })]),
    ) as QueueRegistry;
  }
  return registry;
}

function getQueue<T extends QueueName>(
  name: T,
): Queue<QueueJobDataMap[T], QueueJobResultMap[T]> {
  return getRegistry()[name];
}

async function addJob<T extends QueueName>(
  params: AddJobParams<T>,
): Promise<string> {
  const queue = getRegistry()[params.queue] as QueueType;
  const job = await queue.add(params.name, params.data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
    ...params.options,
  });

  if (!job.id) {
    throw new Error(`Failed to create job in queue "${params.queue}"`);
  }

  return job.id;
}

async function closeAllQueues(): Promise<void> {
  if (!registry) {
    return;
  }

  const queues = Object.values(registry) as QueueType[];
  await Promise.all(queues.map((q) => q.close()));
  registry = null;
}

export type { AddJobParams };
export { addJob, closeAllQueues, getQueue };
