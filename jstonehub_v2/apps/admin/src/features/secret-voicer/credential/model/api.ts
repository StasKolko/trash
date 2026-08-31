import { client } from "#admin/shared/api/client";
import { createApiError } from "#admin/shared/api/error";
import type {
  NewSecretVoicerCredential,
  SecretVoicerCredential,
  UpdateSecretVoicerCredential,
} from "./types";

export const secretVoicerCredentialApi = {
  getAll: async (): Promise<SecretVoicerCredential[]> => {
    const response = await client.v1.admin["secret-voicer"].credentials.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data ?? []) as SecretVoicerCredential[];
  },

  create: async (
    payload: NewSecretVoicerCredential,
  ): Promise<SecretVoicerCredential> => {
    const response =
      await client.v1.admin["secret-voicer"].credentials.post(payload);
    if (response.error) {
      throw createApiError(response.error);
    }
    if (!response.data) {
      throw new Error("No data returned from server");
    }
    return response.data as SecretVoicerCredential;
  },

  update: async (
    id: string,
    payload: UpdateSecretVoicerCredential,
  ): Promise<SecretVoicerCredential> => {
    const response = await client.v1.admin["secret-voicer"]
      .credentials({ id })
      .put(payload);
    if (response.error) {
      throw createApiError(response.error);
    }
    if (!response.data) {
      throw new Error("No data returned from server");
    }
    return response.data as SecretVoicerCredential;
  },

  delete: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"]
      .credentials({ id })
      .delete();
    if (response.error) {
      throw createApiError(response.error);
    }
  },
};
