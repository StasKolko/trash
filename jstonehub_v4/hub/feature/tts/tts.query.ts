import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";
import type { CreateQueryResult } from "@tanstack/solid-query";

import type {
  CreateTtsProjectParams,
  MergeSegmentsParams,
  TtsJobEntry,
} from "./tts.api";

import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { ttsApi } from "./tts.api";

const VOICES_KEY = "tts-voices";
const PROJECTS_KEY = "tts-projects";

function createVoicesQuery(): CreateQueryResult<SecretVoicerVoice[]> {
  return createQuery(() => ({
    queryKey: [VOICES_KEY],
    queryFn: async () => {
      const response = await ttsApi.getVoices();
      return response.voices;
    },
    staleTime: 3_600_000,
  }));
}

function createTtsProjectsQuery(): CreateQueryResult<TtsJobEntry[]> {
  return createQuery(() => ({
    queryKey: [PROJECTS_KEY],
    queryFn: () => ttsApi.getProjects(),
  }));
}

function createTtsProjectMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: CreateTtsProjectParams) => ttsApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createRetrySegmentMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      segmentIndex,
    }: {
      projectId: string;
      segmentIndex: number;
    }) => ttsApi.retrySegment(projectId, segmentIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createRetryAllFailedMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (projectId: string) => ttsApi.retryAllFailed(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createSynthesizeAllPendingMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (projectId: string) => ttsApi.synthesizeAllPending(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createUpdateSegmentMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      segmentIndex,
      data,
    }: {
      projectId: string;
      segmentIndex: number;
      data: { text?: string; role?: string; voiceId?: string };
    }) => ttsApi.updateSegment(projectId, segmentIndex, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createDeleteSegmentMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      segmentIndex,
    }: {
      projectId: string;
      segmentIndex: number;
    }) => ttsApi.deleteSegment(projectId, segmentIndex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createAddSegmentMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      ...data
    }: {
      projectId: string;
      role: string;
      text: string;
      voiceId: string;
      afterIndex?: number;
    }) => ttsApi.addSegment(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createDeleteProjectMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (projectId: string) => ttsApi.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

function createMergeSegmentsMutation() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      projectId,
      params,
    }: {
      projectId: string;
      params: MergeSegmentsParams;
    }) => ttsApi.mergeSegments(projectId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
  }));
}

export {
  createAddSegmentMutation,
  createDeleteProjectMutation,
  createDeleteSegmentMutation,
  createMergeSegmentsMutation,
  createRetryAllFailedMutation,
  createRetrySegmentMutation,
  createSynthesizeAllPendingMutation,
  createTtsProjectMutation,
  createTtsProjectsQuery,
  createUpdateSegmentMutation,
  createVoicesQuery,
};
