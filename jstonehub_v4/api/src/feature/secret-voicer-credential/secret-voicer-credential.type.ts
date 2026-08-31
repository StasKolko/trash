import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { secretVoicerCredentialsTable } from "./secret-voicer-credential.table";

export type SecretVoicerCredential = InferSelectModel<
  typeof secretVoicerCredentialsTable
>;

export type SecretVoicerCredentialInsert = InferInsertModel<
  typeof secretVoicerCredentialsTable
>;

export type SecretVoicerCredentialWithFingerprint = SecretVoicerCredential & {
  fingerprintLabel: string;
};

export type CredentialError = {
  action: string;
  statusCode: number | null;
  message: string;
  responseBody: string | null;
  occurredAt: string;
};
