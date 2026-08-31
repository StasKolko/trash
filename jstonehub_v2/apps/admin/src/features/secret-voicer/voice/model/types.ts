import type { InferInput } from "valibot";
import type {
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
} from "#api/features/secret-voicer/voice/types";
import type { updateSecretVoicerVoiceSchema } from "../lib/validation";

export type {
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
} from "#api/features/secret-voicer/voice/types";

export type SecretVoicerVoiceDialogType = "view" | "update" | null;

export type SecretVoicerVoicesState = {
  voices: SecretVoicerVoice[];
  syncEvents: SecretVoicerVoiceSyncEvent[];
  syncState: SecretVoicerVoiceSyncState | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  showHidden: boolean;
  activeDialog: SecretVoicerVoiceDialogType;
  selectedId: string | null;
};

export type UpdateSecretVoicerVoiceInput = InferInput<
  typeof updateSecretVoicerVoiceSchema
>;
