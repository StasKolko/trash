import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      // use default
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

type VoicesResponse = {
  voices: SecretVoicerVoice[];
};

type TtsJobFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

type TtsJobSegmentEntry = {
  index: number;
  role: string;
  text: string;
  voiceId: string;
  status: string;
  bullJobId: string | null;
  outputKey: string | null;
  error: string | null;
};

type TtsJobEntry = {
  jobId: string;
  bullJobId: string;
  name: string;
  status: string;
  segments: TtsJobSegmentEntry[];
  audioProcessingJobId: string | null;
  createdAt: string;
  completedAt: string | null;
  outputFiles: TtsJobFileEntry[];
  error: string | null;
};

type CreateTtsProjectParams = {
  name: string;
  segments: { role: string; text: string; voiceId: string }[];
  audioProcessing: {
    enabled: boolean;
    concatenate: boolean;
    config?: Record<string, unknown>;
  };
};

type CreateTtsProjectResponse = {
  projectId: string;
  status: string;
  segmentCount: number;
};

type PreviewResponse = {
  downloadUrl: string;
  cached: boolean;
};

type MergeSegmentsParams = {
  betweenMs: number;
  startMs: number;
  endMs: number;
};

type MergeSegmentsResponse = {
  audioProcessingJobId: string;
  status: string;
};

const ttsApi = {
  getVoices(): Promise<VoicesResponse> {
    return apiFetch("/v1/secret-voicer/voices");
  },

  getPreviewUrl(voiceId: string, url: string): Promise<PreviewResponse> {
    const params = new URLSearchParams({ voiceId, url });
    return apiFetch(`/v1/secret-voicer/voices/preview?${params}`);
  },

  createProject(
    params: CreateTtsProjectParams,
  ): Promise<CreateTtsProjectResponse> {
    return apiFetch("/v1/tts-projects", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  getProjects(): Promise<TtsJobEntry[]> {
    return apiFetch("/v1/tts-projects");
  },

  getProject(projectId: string): Promise<TtsJobEntry> {
    return apiFetch(`/v1/tts-projects/${projectId}`);
  },

  retrySegment(projectId: string, segmentIndex: number): Promise<void> {
    return apiFetch(
      `/v1/tts-projects/${projectId}/segments/${segmentIndex}/retry`,
      { method: "POST" },
    );
  },

  retryAllFailed(projectId: string): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}/retry-all-failed`, {
      method: "POST",
    });
  },

  synthesizeAllPending(projectId: string): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}/synthesize-pending`, {
      method: "POST",
    });
  },

  updateSegment(
    projectId: string,
    segmentIndex: number,
    data: { text?: string; role?: string; voiceId?: string },
  ): Promise<TtsJobEntry> {
    return apiFetch(`/v1/tts-projects/${projectId}/segments/${segmentIndex}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  addSegment(
    projectId: string,
    data: { role: string; text: string; voiceId: string; afterIndex?: number },
  ): Promise<TtsJobEntry> {
    return apiFetch(`/v1/tts-projects/${projectId}/segments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deleteSegment(projectId: string, segmentIndex: number): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}/segments/${segmentIndex}`, {
      method: "DELETE",
    });
  },

  deleteProject(projectId: string): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}`, { method: "DELETE" });
  },

  mergeSegments(
    projectId: string,
    params: MergeSegmentsParams,
  ): Promise<MergeSegmentsResponse> {
    return apiFetch(`/v1/tts-projects/${projectId}/merge`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  },
  deleteMergedAudio(projectId: string): Promise<void> {
    return apiFetch(`/v1/tts-projects/${projectId}/merge`, {
      method: "DELETE",
    });
  },
};

export type {
  CreateTtsProjectParams,
  CreateTtsProjectResponse,
  MergeSegmentsParams,
  MergeSegmentsResponse,
  PreviewResponse,
  TtsJobEntry,
  TtsJobFileEntry,
  TtsJobSegmentEntry,
  VoicesResponse,
};
export { ttsApi };
