import { createSignal, onMount } from "solid-js";
import { browserFingerprintApi } from "#admin/features/browser-fingerprint";
import { filterSecretVoicerCredentials } from "../lib/helpers";
import { secretVoicerCredentialApi } from "./api";
import type {
  CreateSecretVoicerCredentialInput,
  SecretVoicerCredentialDialogType,
  SecretVoicerCredentialStatusFilter,
  SecretVoicerCredentialsState,
  UpdateSecretVoicerCredentialInput,
} from "./types";

export function useSecretVoicerCredentials() {
  const [state, setState] = createSignal<SecretVoicerCredentialsState>({
    credentials: [],
    fingerprints: [],
    isLoading: true,
    error: null,
    searchQuery: "",
    statusFilter: "all",
    activeDialog: null,
    selectedId: null,
  });

  // Computed
  const filteredCredentials = () =>
    filterSecretVoicerCredentials(
      state().credentials,
      state().searchQuery,
      state().statusFilter,
    );

  const selectedCredential = () =>
    state().credentials.find((c) => c.id === state().selectedId) ?? null;

  const fingerprintOptions = () =>
    state().fingerprints.map((fp) => ({
      id: fp.id,
      name: fp.name,
      isActive: fp.isActive,
    }));

  const getFingerprintName = (id: string) =>
    state().fingerprints.find((fp) => fp.id === id)?.name ?? "Unknown";

  // Actions
  const setSearchQuery = (query: string) =>
    setState((s) => ({ ...s, searchQuery: query }));

  const setStatusFilter = (filter: SecretVoicerCredentialStatusFilter) =>
    setState((s) => ({ ...s, statusFilter: filter }));

  const openDialog = (
    type: SecretVoicerCredentialDialogType,
    id: string | null = null,
  ) => setState((s) => ({ ...s, activeDialog: type, selectedId: id }));

  const closeDialog = () =>
    setState((s) => ({ ...s, activeDialog: null, selectedId: null }));

  // API Actions
  const fetchData = async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const [credentials, fingerprints] = await Promise.all([
        secretVoicerCredentialApi.getAll(),
        browserFingerprintApi.getAll(),
      ]);
      setState((s) => ({
        ...s,
        credentials,
        fingerprints,
        isLoading: false,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      setState((s) => ({ ...s, error: msg, isLoading: false }));
    }
  };

  const createCredential = async (input: CreateSecretVoicerCredentialInput) => {
    const payload = {
      name: input.name,
      fingerprintId: input.fingerprintId,
      csrfToken: input.csrfToken,
      sessionId: input.sessionId,
      isActive: input.isActive,
    };

    const created = await secretVoicerCredentialApi.create(payload);
    setState((s) => ({
      ...s,
      credentials: [created, ...s.credentials],
    }));
    closeDialog();
  };

  const updateCredential = async (
    id: string,
    input: UpdateSecretVoicerCredentialInput,
  ) => {
    const updated = await secretVoicerCredentialApi.update(id, {
      name: input.name,
      fingerprintId: input.fingerprintId,
      csrfToken: input.csrfToken,
      sessionId: input.sessionId,
      isActive: input.isActive,
    });

    setState((s) => ({
      ...s,
      credentials: s.credentials.map((c) => (c.id === id ? updated : c)),
    }));
    closeDialog();
  };

  const deleteCredential = async (id: string) => {
    await secretVoicerCredentialApi.delete(id);
    setState((s) => ({
      ...s,
      credentials: s.credentials.filter((c) => c.id !== id),
    }));
    closeDialog();
  };

  const toggleCredentialStatus = async (id: string) => {
    const credential = state().credentials.find((c) => c.id === id);
    if (!credential) {
      return;
    }

    const updated = await secretVoicerCredentialApi.update(id, {
      isActive: !credential.isActive,
    });
    setState((s) => ({
      ...s,
      credentials: s.credentials.map((c) => (c.id === id ? updated : c)),
    }));
  };

  // Init
  onMount(fetchData);

  return {
    state,
    filteredCredentials,
    selectedCredential,
    fingerprintOptions,
    getFingerprintName,
    setSearchQuery,
    setStatusFilter,
    openDialog,
    closeDialog,
    createCredential,
    updateCredential,
    deleteCredential,
    toggleCredentialStatus,
    refetch: fetchData,
  };
}
