import type { secretVoicerItemTable } from "./table";

export type SecretVoicerItem = typeof secretVoicerItemTable.$inferSelect;

export type NewSecretVoicerItem = typeof secretVoicerItemTable.$inferInsert;

export type ItemStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "comparing";

export type UpdateSecretVoicerItem = {
  text?: string;
  characterId?: string;
  status?: ItemStatus;
};
