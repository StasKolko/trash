type LanguageResponse = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

const HTTP_NO_CONTENT = 204;

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      message = body.error ?? JSON.stringify(body);
    } catch {
      /* use default */
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

const languageApi = {
  getAll: (): Promise<LanguageResponse[]> => apiFetch("/v1/languages"),
  create: (data: { code: string; name: string }): Promise<LanguageResponse> =>
    apiFetch("/v1/languages", { method: "POST", body: JSON.stringify(data) }),
  update: (
    id: string,
    data: Partial<{ name: string; isActive: boolean }>,
  ): Promise<LanguageResponse> =>
    apiFetch(`/v1/languages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string): Promise<void> =>
    apiFetch(`/v1/languages/${id}`, { method: "DELETE" }),
};

export type { LanguageResponse };
export { languageApi };
