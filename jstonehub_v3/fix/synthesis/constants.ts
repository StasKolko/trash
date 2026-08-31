export const POLLING_INTERVAL_MS = 5000;
export const TASK_TIMEOUT_MINUTES = 10;
export const MAX_RETRY_COUNT = 3;
export const RETRY_DELAY_MS = 30_000;
export const TIMEOUT_CHECK_INTERVAL_MINUTES = 1;
export const MS_PER_MINUTE = 60_000;

export const REDIS_QUEUES = {
  DOWNLOAD_TASKS: "secret-voicer:download-tasks",
} as const;
