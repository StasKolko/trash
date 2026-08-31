import type { InferInput } from "valibot";
import type { BrowserFingerprint } from "#api/features/browser-fingerprint/types";
import type { SecretVoicerCredential } from "#api/features/secret-voicer/credential/types";
import type {
  createSecretVoicerCredentialSchema,
  updateSecretVoicerCredentialSchema,
} from "../lib/validation";

export type {
  NewSecretVoicerCredential,
  SecretVoicerCredential,
  UpdateSecretVoicerCredential,
} from "#api/features/secret-voicer/credential/types";

export type SecretVoicerCredentialStatusFilter = "all" | "active" | "inactive";

export type SecretVoicerCredentialDialogType =
  | "view"
  | "create"
  | "update"
  | "delete"
  | null;

export type SecretVoicerCredentialsState = {
  credentials: SecretVoicerCredential[];
  fingerprints: BrowserFingerprint[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: SecretVoicerCredentialStatusFilter;
  activeDialog: SecretVoicerCredentialDialogType;
  selectedId: string | null;
};

export type SecretVoicerCredentialFingerprintOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type CreateSecretVoicerCredentialInput = InferInput<
  typeof createSecretVoicerCredentialSchema
>;

export type UpdateSecretVoicerCredentialInput = InferInput<
  typeof updateSecretVoicerCredentialSchema
>;
