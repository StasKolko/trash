type JokeTranslationResponse = {
  id: string;
  jokeId: string;
  languageCode: string;
  segments: { role: string; text: string }[];
  plainText: string;
  uniquenessHash: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type JokeAudioResponse = {
  id: string;
  jokeTranslationId: string;
  isPlatformDefault: boolean;
  voiceConfig: Record<string, string>;
  fileKey: string;
  durationMs: number;
  createdAt: string;
};

type JokeResponse = {
  id: string;
  originalLanguageCode: string;
  status: string;
  hasExplicitContent: boolean;
  humorRating: number | null;
  createdAt: string;
  updatedAt: string;
  translations: JokeTranslationResponse[];
  tagIds: string[];
  audios: JokeAudioResponse[];
};

type CreateJokeParams = {
  originalLanguageCode: string;
  segments: { role: string; text: string }[];
  hasExplicitContent: boolean;
  humorRating?: number;
  tagIds?: string[];
};

type UpdateJokeParams = {
  status?: string;
  hasExplicitContent?: boolean;
  humorRating?: number;
  tagIds?: string[];
};

type AddTranslationParams = {
  languageCode: string;
  segments: { role: string; text: string }[];
};

type GetJokesFilters = {
  query?: string;
  languageCode?: string;
  tagIds?: string[];
  status?: string;
  hasExplicitContent?: boolean;
  limit?: number;
  offset?: number;
};

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

function buildJokeQueryString(filters: GetJokesFilters): string {
  const params = new URLSearchParams();
  if (filters.query) {
    params.set("query", filters.query);
  }
  if (filters.languageCode) {
    params.set("languageCode", filters.languageCode);
  }
  if (filters.tagIds && filters.tagIds.length > 0) {
    params.set("tagIds", filters.tagIds.join(","));
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.hasExplicitContent !== undefined) {
    params.set("hasExplicitContent", String(filters.hasExplicitContent));
  }
  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }
  if (filters.offset !== undefined) {
    params.set("offset", String(filters.offset));
  }

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const jokeApi = {
  getAll(filters: GetJokesFilters = {}): Promise<JokeResponse[]> {
    return apiFetch(`/v1/jokes${buildJokeQueryString(filters)}`);
  },

  getById(id: string): Promise<JokeResponse> {
    return apiFetch(`/v1/jokes/${id}`);
  },

  create(data: CreateJokeParams): Promise<JokeResponse> {
    return apiFetch("/v1/jokes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: UpdateJokeParams): Promise<JokeResponse> {
    return apiFetch(`/v1/jokes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  addTranslation(
    jokeId: string,
    data: AddTranslationParams,
  ): Promise<JokeTranslationResponse> {
    return apiFetch(`/v1/jokes/${jokeId}/translations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/v1/jokes/${id}`, { method: "DELETE" });
  },
};

export type {
  AddTranslationParams,
  CreateJokeParams,
  GetJokesFilters,
  JokeAudioResponse,
  JokeResponse,
  JokeTranslationResponse,
  UpdateJokeParams,
};
export { jokeApi };
