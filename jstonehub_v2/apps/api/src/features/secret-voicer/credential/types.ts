import type { secretVoicerCredentialTable } from "./table";

export type SecretVoicerCredential =
  typeof secretVoicerCredentialTable.$inferSelect;
export type NewSecretVoicerCredential =
  typeof secretVoicerCredentialTable.$inferInsert;
export type UpdateSecretVoicerCredential = Partial<
  Omit<NewSecretVoicerCredential, "id" | "createdAt" | "updatedAt">
>;
