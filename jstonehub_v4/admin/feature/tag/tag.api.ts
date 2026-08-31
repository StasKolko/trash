type TagResponse = {
  id: string;
  slug: string;
  name: string;
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
      /* default */
    }
    throw new Error(message);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }
  return response.json();
}

const tagApi = {
  getAll: (): Promise<TagResponse[]> => apiFetch("/v1/tags"),
  create: (data: { slug: string; name: string }): Promise<TagResponse> =>
    apiFetch("/v1/tags", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string): Promise<void> =>
    apiFetch(`/v1/tags/${id}`, { method: "DELETE" }),
};

export type { TagResponse };
export { tagApi };
