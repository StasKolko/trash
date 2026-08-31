import { client } from "#hub/shared/api/client";
import type { CachedFile, ProcessingJob, ProcessingSettings } from "./types";

function createApiError(error: unknown): Error {
  if (error && typeof error === "object" && "value" in error) {
    const value = error.value as Record<string, unknown>;
    if (typeof value.message === "string") {
      return new Error(value.message);
    }
    if (typeof value.error === "string") {
      return new Error(value.error);
    }
  }
  return new Error("Request failed");
}

export const audioProcessingApi = {
  process: async (
    files: File[],
    settings: ProcessingSettings,
  ): Promise<{ jobId: string }> => {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    formData.append("settings", JSON.stringify(settings));

    const response = await fetch("/api/v1/admin/audio-processing/process", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Processing failed");
    }

    return response.json();
  },

  getJobStatus: async (id: string): Promise<ProcessingJob> => {
    const response = await client.v1.admin["audio-processing"]
      .jobs({ id })
      .status.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as ProcessingJob;
  },

  getJob: async (id: string): Promise<ProcessingJob> => {
    const response = await client.v1.admin["audio-processing"]
      .jobs({ id })
      .get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as ProcessingJob;
  },

  downloadUrl: (id: string): string =>
    `/api/v1/admin/audio-processing/jobs/${id}/download`,

  getCache: async (): Promise<CachedFile[]> => {
    const response = await client.v1.admin["audio-processing"].cache.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data ?? []) as CachedFile[];
  },

  deleteFromCache: async (id: string): Promise<void> => {
    const response = await client.v1.admin["audio-processing"]
      .cache({ id })
      .delete();
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  clearCache: async (): Promise<{ deletedCount: number }> => {
    const response = await client.v1.admin["audio-processing"].cache.delete();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as { deletedCount: number };
  },
};
