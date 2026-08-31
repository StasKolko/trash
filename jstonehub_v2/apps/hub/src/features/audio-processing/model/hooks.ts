import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { AUDIO_PROCESSING_CONSTANTS } from "../lib/constants";
import { audioProcessingApi } from "./api";
import type { AudioProcessingState, ProcessingSettings } from "./types";

const POLLING_INTERVAL_MS = 2000;

function getDefaultSettings(): ProcessingSettings {
  return {
    silenceThreshold: AUDIO_PROCESSING_CONSTANTS.DEFAULT_SILENCE_THRESHOLD,
    minSilenceDuration: AUDIO_PROCESSING_CONSTANTS.DEFAULT_MIN_SILENCE_DURATION,
    pauseBetweenChunks: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_BETWEEN_CHUNKS,
    pauseBetweenFiles: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_BETWEEN_FILES,
    pauseAtStart: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_AT_START,
    pauseAtEnd: AUDIO_PROCESSING_CONSTANTS.DEFAULT_PAUSE_AT_END,
    outputFormat: AUDIO_PROCESSING_CONSTANTS.DEFAULT_OUTPUT_FORMAT,
  };
}

export function useAudioProcessing() {
  const [state, setState] = createSignal<AudioProcessingState>({
    files: [],
    settings: getDefaultSettings(),
    currentJob: null,
    cachedFiles: [],
    isProcessing: false,
    isLoadingCache: true,
    error: null,
  });

  // === Files Management ===

  const addFiles = (newFiles: File[]) => {
    setState((s) => ({
      ...s,
      files: [...s.files, ...newFiles],
      error: null,
    }));
  };

  const removeFile = (index: number) => {
    setState((s) => ({
      ...s,
      files: s.files.filter((_, i) => i !== index),
    }));
  };

  const clearFiles = () => {
    setState((s) => ({ ...s, files: [], error: null }));
  };

  // === Settings ===

  const setSettings = (settings: ProcessingSettings) => {
    setState((s) => ({ ...s, settings }));
  };

  const resetSettings = () => {
    setState((s) => ({ ...s, settings: getDefaultSettings() }));
  };

  // === Processing ===

  const startProcessing = async () => {
    const { files, settings } = state();

    if (files.length === 0) {
      setState((s) => ({ ...s, error: "Выберите файлы для обработки" }));
      return;
    }

    setState((s) => ({
      ...s,
      isProcessing: true,
      error: null,
      currentJob: null,
    }));

    try {
      const { jobId } = await audioProcessingApi.process(files, settings);

      // Получить начальный статус
      const job = await audioProcessingApi.getJob(jobId);
      setState((s) => ({ ...s, currentJob: job }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка обработки";
      setState((s) => ({ ...s, error: msg, isProcessing: false }));
    }
  };

  const cancelProcessing = () => {
    setState((s) => ({
      ...s,
      isProcessing: false,
      currentJob: null,
    }));
  };

  // === Polling for Job Status ===

  createEffect(() => {
    const job = state().currentJob;

    if (!job || job.status === "COMPLETED" || job.status === "FAILED") {
      if (job?.status === "COMPLETED" || job?.status === "FAILED") {
        setState((s) => ({ ...s, isProcessing: false }));
        // Refresh cache after completion
        fetchCache();
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const updatedJob = await audioProcessingApi.getJob(job.id);
        setState((s) => ({ ...s, currentJob: updatedJob }));
      } catch (e) {
        // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
        console.error("Polling error:", e);
      }
    };

    const intervalId = setInterval(pollStatus, POLLING_INTERVAL_MS);

    onCleanup(() => {
      clearInterval(intervalId);
    });
  });

  // === Cache Management ===

  const fetchCache = async () => {
    setState((s) => ({ ...s, isLoadingCache: true }));
    try {
      const cachedFiles = await audioProcessingApi.getCache();
      setState((s) => ({ ...s, cachedFiles, isLoadingCache: false }));
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to fetch cache:", e);
      setState((s) => ({ ...s, isLoadingCache: false }));
    }
  };

  const deleteCachedFile = async (id: string) => {
    try {
      await audioProcessingApi.deleteFromCache(id);
      setState((s) => ({
        ...s,
        cachedFiles: s.cachedFiles.filter((f) => f.id !== id),
      }));
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to delete cached file:", e);
    }
  };

  const clearCache = async () => {
    try {
      await audioProcessingApi.clearCache();
      setState((s) => ({ ...s, cachedFiles: [] }));
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: DEVELOP_LATER <WAITING_FOR_LOGGER>
      console.error("Failed to clear cache:", e);
    }
  };

  // === Computed ===

  const files = () => state().files;
  const settings = () => state().settings;
  const currentJob = () => state().currentJob;
  const cachedFiles = () => state().cachedFiles;
  const isProcessing = () => state().isProcessing;
  const isLoadingCache = () => state().isLoadingCache;
  const error = () => state().error;

  const canProcess = () => files().length > 0 && !isProcessing();

  const downloadUrl = () => {
    const job = currentJob();
    if (job?.status === "COMPLETED") {
      return audioProcessingApi.downloadUrl(job.id);
    }
    return null;
  };

  // === Init ===

  onMount(() => {
    fetchCache();
  });

  return {
    // State
    state,
    files,
    settings,
    currentJob,
    cachedFiles,
    isProcessing,
    isLoadingCache,
    error,

    // Computed
    canProcess,
    downloadUrl,

    // Files
    addFiles,
    removeFile,
    clearFiles,

    // Settings
    setSettings,
    resetSettings,

    // Processing
    startProcessing,
    cancelProcessing,

    // Cache
    fetchCache,
    deleteCachedFile,
    clearCache,
  };
}
