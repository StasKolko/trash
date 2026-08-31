import type { FileEntry } from "./_file-list";

import { createSignal } from "solid-js";

import { audioProcessingApi } from "./audio-processing.api";

function useFileUpload() {
  const [files, setFiles] = createSignal<FileEntry[]>([]);

  function addFiles(newFiles: File[]) {
    const entries: FileEntry[] = newFiles.map((f) => ({
      file: f,
      uploadProgress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFileAt(index: number, partial: Partial<FileEntry>) {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...partial } : f)),
    );
  }

  function resetFiles() {
    setFiles([]);
  }

  function allUploaded(): boolean {
    return files().every((f) => f.status === "uploaded");
  }

  async function uploadAll(
    uploads: { fileName: string; key: string; uploadUrl: string }[],
  ): Promise<void> {
    const currentFiles = files();
    const promises = currentFiles.map(async (entry, index) => {
      const upload = uploads[index];
      if (!upload) {
        return;
      }

      updateFileAt(index, { status: "uploading" });

      try {
        await audioProcessingApi.uploadFileToPresignedUrl(
          upload.uploadUrl,
          entry.file,
          (percent) => updateFileAt(index, { uploadProgress: percent }),
        );
        updateFileAt(index, { status: "uploaded", uploadProgress: 100 });
      } catch (err) {
        updateFileAt(index, {
          status: "error",
          errorMessage: err instanceof Error ? err.message : "Upload failed",
        });
      }
    });

    await Promise.all(promises);
  }

  return { files, addFiles, removeFile, resetFiles, allUploaded, uploadAll };
}

export { useFileUpload };
