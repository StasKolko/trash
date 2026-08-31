import { createSignal, onMount } from "solid-js";
import { secretVoicerVoiceApi } from "./api";
import type {
  SecretVoicerVoiceDialogType,
  SecretVoicerVoicesState,
  UpdateSecretVoicerVoiceInput,
} from "./types";

export type VoiceGenderFilter = "all" | "MALE" | "FEMALE";

export function useSecretVoicerVoices() {
  const [state, setState] = createSignal<SecretVoicerVoicesState>({
    voices: [],
    syncEvents: [],
    syncState: null,
    isLoading: true,
    error: null,
    searchQuery: "",
    showHidden: false,
    activeDialog: null,
    selectedId: null,
  });

  const [genderFilter, setGenderFilter] =
    createSignal<VoiceGenderFilter>("all");

  // === Computed ===
  const filteredVoices = () => {
    let result = state().voices;

    if (!state().showHidden) {
      result = result.filter((v) => !v.isHidden);
    }

    const gender = genderFilter();
    if (gender !== "all") {
      result = result.filter((v) => v.externalGender === gender);
    }

    if (state().searchQuery) {
      const query = state().searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.externalName.toLowerCase().includes(query)
          || v.externalVoiceId.toLowerCase().includes(query),
      );
    }

    return result;
  };

  const selectedVoice = () =>
    state().voices.find((v) => v.id === state().selectedId) ?? null;

  const criticalEvents = () => state().syncEvents.filter((e) => e.isCritical);

  const nonCriticalEvents = () =>
    state().syncEvents.filter((e) => !e.isCritical);

  const isBlocked = () => state().syncState?.isBlocked ?? false;

  // === Actions ===
  const setSearchQuery = (query: string) =>
    setState((s) => ({ ...s, searchQuery: query }));

  const setShowHidden = (show: boolean) =>
    setState((s) => ({ ...s, showHidden: show }));

  const openDialog = (
    type: SecretVoicerVoiceDialogType,
    id: string | null = null,
  ) => setState((s) => ({ ...s, activeDialog: type, selectedId: id }));

  const closeDialog = () =>
    setState((s) => ({ ...s, activeDialog: null, selectedId: null }));

  // === API Actions ===
  const fetchData = async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const [voices, syncEvents, syncState] = await Promise.all([
        secretVoicerVoiceApi.getAll(),
        secretVoicerVoiceApi.getSyncEvents(),
        secretVoicerVoiceApi.getSyncState(),
      ]);
      setState((s) => ({
        ...s,
        voices,
        syncEvents,
        syncState,
        isLoading: false,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      setState((s) => ({ ...s, error: msg, isLoading: false }));
    }
  };

  const updateVoice = async (
    id: string,
    input: UpdateSecretVoicerVoiceInput,
  ) => {
    const updated = await secretVoicerVoiceApi.update(id, input);
    setState((s) => ({
      ...s,
      voices: s.voices.map((v) => (v.id === id ? updated : v)),
    }));
    closeDialog();
  };

  const deleteSyncEvent = async (id: string) => {
    await secretVoicerVoiceApi.deleteSyncEvent(id);
    setState((s) => ({
      ...s,
      syncEvents: s.syncEvents.filter((e) => e.id !== id),
    }));
  };

  const deleteAllSyncEvents = async () => {
    await secretVoicerVoiceApi.deleteAllSyncEvents();
    setState((s) => ({ ...s, syncEvents: [] }));
  };

  const unblock = async () => {
    await secretVoicerVoiceApi.unblock();
    setState((s) => ({
      ...s,
      syncState: s.syncState
        ? { ...s.syncState, isBlocked: false, blockReason: null }
        : null,
    }));
  };

  const triggerSync = async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      await secretVoicerVoiceApi.triggerSync();
      await fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sync failed";
      setState((s) => ({ ...s, error: msg, isLoading: false }));
    }
  };

  // === Init ===
  onMount(fetchData);

  return {
    state,
    genderFilter,
    setGenderFilter,
    filteredVoices,
    selectedVoice,
    criticalEvents,
    nonCriticalEvents,
    isBlocked,
    setSearchQuery,
    setShowHidden,
    openDialog,
    closeDialog,
    updateVoice,
    deleteSyncEvent,
    deleteAllSyncEvents,
    unblock,
    triggerSync,
    refetch: fetchData,
  };
}
