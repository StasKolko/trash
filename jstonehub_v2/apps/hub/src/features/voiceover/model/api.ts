// apps/hub/src/features/voiceover/model/api.ts
import { client } from "#hub/shared/api/client";
import type {
  CreateProjectInput,
  ProjectWithTasks,
  SynthesisProject,
} from "./types";

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

export const synthesisApi = {
  getAll: async (): Promise<SynthesisProject[]> => {
    const response =
      await client.v1.admin["secret-voicer"].synthesis.projects.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return (response.data ?? []) as SynthesisProject[];
  },

  getById: async (id: string): Promise<ProjectWithTasks> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .get();
    // const response = await client.v1.admin["secret-voicer"].synthesis.projects[
    //   ":id"
    // ]({ id }).get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as ProjectWithTasks;
  },

  create: async (
    input: CreateProjectInput,
  ): Promise<{ project: SynthesisProject }> => {
    const response =
      await client.v1.admin["secret-voicer"].synthesis.projects.post(input);
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data as { project: SynthesisProject };
  },

  delete: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .delete();
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  start: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .start.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  pause: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .pause.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  cancel: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .cancel.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  retryFailed: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .retryFailed.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  restart: async (id: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .restart.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  getStatus: async (id: string) => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .status.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data;
  },

  getTasks: async (id: string) => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .projects({ id })
      .tasks.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data;
  },

  retryTask: async (taskId: string): Promise<void> => {
    const response = await client.v1.admin["secret-voicer"].synthesis
      .tasks({ taskId })
      .retry.post({});
    if (response.error) {
      throw createApiError(response.error);
    }
  },

  downloadZipUrl: (id: string) =>
    `/api/v1/admin/secret-voicer/synthesis/projects/${id}/download`,
};

// Voices API (public)
export const voicesApi = {
  getAll: async () => {
    const response = await client.v1.public["secret-voicer"].voices.get();
    if (response.error) {
      throw createApiError(response.error);
    }
    return response.data ?? [];
  },
};
