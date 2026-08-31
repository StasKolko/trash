import type { AudioProcessingUserConfig } from "./_audio-processing-config";

import { createSignal } from "solid-js";

import {
  buildApiConfig,
  createDefaultUserConfig,
} from "./_audio-processing-config";
import { useFileUpload } from "./_use-file-upload";
import { audioProcessingApi } from "./audio-processing.api";

type PagePhase = "idle" | "uploading" | "processing" | "completed" | "error";

function useAudioProcessing() {
  const [phase, setPhase] = createSignal<PagePhase>("idle");
  const [config, setConfig] = createSignal<AudioProcessingUserConfig>(
    createDefaultUserConfig(),
  );
  const [errorMessage, setErrorMessage] = createSignal("");
  const [refreshTrigger, setRefreshTrigger] = createSignal(0);

  const upload = useFileUpload();

  const isLocked = () => phase() === "uploading" || phase() === "processing";

  const canProcess = () =>
    upload.files().length > 0
    && config().outputName.trim().length > 0
    && !isLocked();

  function triggerRefresh() {
    setRefreshTrigger((prev) => prev + 1);
  }

  return {
    phase,
    files: upload.files,
    config,
    setConfig,
    errorMessage,
    isLocked,
    canProcess,
    setPhase,
    refreshTrigger,
    handleFilesSelected: upload.addFiles,
    handleRemoveFile: upload.removeFile,
    handleUploadAndProcess: () =>
      handleUploadAndProcess({
        upload,
        config: config(),
        setPhase,
        setErrorMessage,
        triggerRefresh,
      }),
    handleReset: () =>
      handleReset({
        upload,
        setPhase,
        setConfig,
        setErrorMessage,
      }),
  };
}

type UploadAndProcessDeps = {
  upload: ReturnType<typeof useFileUpload>;
  config: AudioProcessingUserConfig;
  setPhase: (phase: PagePhase) => void;
  setErrorMessage: (msg: string) => void;
  triggerRefresh: () => void;
};

async function handleUploadAndProcess(deps: UploadAndProcessDeps) {
  const currentFiles = deps.upload.files();
  if (currentFiles.length === 0) {
    return;
  }

  deps.setPhase("uploading");
  deps.setErrorMessage("");

  try {
    const fileNames = currentFiles.map((f) => f.file.name);
    const { jobId, uploads } =
      await audioProcessingApi.getUploadUrls(fileNames);

    await deps.upload.uploadAll(uploads);

    if (!deps.upload.allUploaded()) {
      deps.setPhase("error");
      deps.setErrorMessage("Some files failed to upload");
      return;
    }

    deps.setPhase("processing");
    const apiConfig = buildApiConfig(deps.config);
    await audioProcessingApi.startProcessing(
      jobId,
      deps.config.outputName.trim(),
      apiConfig,
    );

    deps.setPhase("idle");
    deps.upload.resetFiles();
    deps.triggerRefresh();
  } catch (err) {
    deps.setPhase("error");
    deps.setErrorMessage(
      err instanceof Error ? err.message : "An unexpected error occurred",
    );
  }
}

type ResetDeps = {
  upload: ReturnType<typeof useFileUpload>;
  setPhase: (phase: PagePhase) => void;
  setConfig: (config: AudioProcessingUserConfig) => void;
  setErrorMessage: (msg: string) => void;
};

function handleReset(deps: ResetDeps) {
  deps.setPhase("idle");
  deps.upload.resetFiles();
  deps.setConfig(createDefaultUserConfig());
  deps.setErrorMessage("");
}

export { useAudioProcessing };
