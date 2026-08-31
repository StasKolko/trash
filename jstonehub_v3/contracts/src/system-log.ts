export type SystemLogLevel = (typeof SYSTEM_LOG_LEVELS)[number];
export type SystemLogSource = (typeof SYSTEM_LOG_SOURCES)[number];

export const SYSTEM_LOG_LEVELS = ["error", "fatal"] as const;
export const SYSTEM_LOG_SOURCES = ["api", "worker", "hub", "admin"] as const;
