import { client } from "#admin/shared/api/client";
import { createApiError } from "#admin/shared/api/error";
import type {
  SecretVoicerVoice,
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
  UpdateSecretVoicerVoiceInput,
} from "./types";

export const secretVoicerVoiceApi = {
  getAll: async (): Promise<SecretVoicerVoice[]> => {
    const response = await client.v1.admin["secret-voicer"].voices.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data ?? []) as SecretVoicerVoice[];
  },

  update: async (
    id: string,
    payload: UpdateSecretVoicerVoiceInput,
  ): Promise<SecretVoicerVoice> => {
    const response = await client.v1.admin["secret-voicer"]
      .voices({ id })
      .put(payload);
    if (response.error) {
      throw createApiError(response.error);
    }
    if (!response.data) {
      throw new Error("No data returned");
    }
    return response.data as SecretVoicerVoice;
  },

  // === Sync Events ===
  getSyncEvents: async (): Promise<SecretVoicerVoiceSyncEvent[]> => {
    const response =
      await client.v1.admin["secret-voicer"].voices["sync-events"].get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data ?? []) as SecretVoicerVoiceSyncEvent[];
  },

  deleteSyncEvent: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].voices[
      "sync-events"
    ]({ id }).delete();
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  deleteAllSyncEvents: async (): Promise<number> => {
    const response =
      await client.v1.admin["secret-voicer"].voices["sync-events"].delete();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data as { deletedCount: number })?.deletedCount ?? 0;
  },

  // === Sync State ===
  getSyncState: async (): Promise<SecretVoicerVoiceSyncState> => {
    const response =
      await client.v1.admin["secret-voicer"].voices["sync-state"].get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as SecretVoicerVoiceSyncState;
  },

  unblock: async (): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].voices[
      "sync-state"
    ].unblock.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  // === Manual Sync ===
  triggerSync: async () => {
    const response = await client.v1.admin["secret-voicer"].voices.sync.post(
      {},
    );
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data;
  },
};
