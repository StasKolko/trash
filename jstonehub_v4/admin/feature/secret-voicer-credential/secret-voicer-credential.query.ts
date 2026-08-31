import type { CreateQueryResult } from "@tanstack/solid-query";

import type {
  CreateSecretVoicerCredentialParams,
  FingerprintOption,
  SecretVoicerCredentialResponse,
  UpdateSecretVoicerCredentialParams,
} from "./secret-voicer-credential.api";

import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { secretVoicerCredentialApi } from "./secret-voicer-credential.api";

const QUERY_KEY = "secret-voicer-credentials";
const FINGERPRINTS_KEY = "available-fingerprints";

function createSecretVoicerCredentialsQuery(): CreateQueryResult<
  SecretVoicerCredentialResponse[]
> {
  return createQuery(() => ({
    queryKey: [QUERY_KEY],
    queryFn: () => secretVoicerCredentialApi.getAll(),
  }));
}

function createAvailableFingerprintsQuery(): CreateQueryResult<
  FingerprintOption[]
> {
  return createQuery(() => ({
    queryKey: [FINGERPRINTS_KEY],
    queryFn: () => secretVoicerCredentialApi.getAvailableFingerprints(),
  }));
}

function createSecretVoicerCredentialCreateMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: CreateSecretVoicerCredentialParams) =>
      secretVoicerCredentialApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createSecretVoicerCredentialUpdateMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSecretVoicerCredentialParams;
    }) => secretVoicerCredentialApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createSecretVoicerCredentialClearErrorMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => secretVoicerCredentialApi.clearError(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createSecretVoicerCredentialDeleteMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => secretVoicerCredentialApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createAvailableFingerprintsQuery,
  createSecretVoicerCredentialClearErrorMutation,
  createSecretVoicerCredentialCreateMutation,
  createSecretVoicerCredentialDeleteMutation,
  createSecretVoicerCredentialsQuery,
  createSecretVoicerCredentialUpdateMutation,
};
