export const SYNTHESIS_CONFIG = {
  /** Интервал polling в миллисекундах */
  POLLING_INTERVAL_MS: 5000,

  /** Timeout на генерацию одной задачи в минутах */
  TASK_TIMEOUT_MINUTES: 10,

  /** Максимальное количество попыток */
  MAX_RETRY_COUNT: 3,

  /** Задержка между retry в миллисекундах */
  RETRY_DELAY_MS: 30000,

  /** Интервал проверки timeout задач в минутах */
  TIMEOUT_CHECK_INTERVAL_MINUTES: 1,
} as const;

export const REDIS_QUEUES = {
  DOWNLOAD_TASKS: "secret-voicer:download-tasks",
} as const;