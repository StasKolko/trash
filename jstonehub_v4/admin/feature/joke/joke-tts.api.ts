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
      // default
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

type PipelineEntry = {
  id: string;
  status: string;
  voiceConfig: Record<string, string>;
  ttsProjectId: string | null;
  jokeAudioId: string | null;
  audioDownloadUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
};

type PipelineDetails = PipelineEntry & {
  ttsProject: unknown;
};

type StartPipelineParams = {
  jokeTranslationId: string;
  voiceConfig: Record<string, string>;
  isPlatformDefault?: boolean;
};

type StartPipelineResult = {
  pipelineId: string;
  status: string;
  ttsProjectId: string | null;
};

const jokeTtsApi = {
  getAll(): Promise<PipelineEntry[]> {
    return apiFetch("/v1/joke-tts");
  },

  getById(id: string): Promise<PipelineDetails> {
    return apiFetch(`/v1/joke-tts/${id}`);
  },

  getByTranslation(translationId: string): Promise<PipelineEntry[]> {
    return apiFetch(`/v1/joke-tts/by-translation/${translationId}`);
  },

  start(params: StartPipelineParams): Promise<StartPipelineResult> {
    return apiFetch("/v1/joke-tts", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/v1/joke-tts/${id}`, { method: "DELETE" });
  },
};

export type {
  PipelineDetails,
  PipelineEntry,
  StartPipelineParams,
  StartPipelineResult,
};
export { jokeTtsApi };
