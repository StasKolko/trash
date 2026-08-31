import type { secretVoicerVersionTable } from "./table";

export type SecretVoicerVersion = typeof secretVoicerVersionTable.$inferSelect;

export type NewSecretVoicerVersion =
  typeof secretVoicerVersionTable.$inferInsert;

export type VersionType = "current" | "candidate";

export type ExternalStatus = "pending" | "processing" | "completed" | "failed";

export type UpdateSecretVoicerVersion = {
  externalTaskId?: number;
  externalStatus?: ExternalStatus;
  externalError?: string | null;
  externalAudioUrl?: string | null;
  minioKey?: string | null;
  minioUrl?: string | null;
  minioUrlExpiresAt?: Date | null;
  versionType?: VersionType;
  retryCount?: number;
  lastRetryAt?: Date | null;
};
