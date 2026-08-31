type CredentialError = {
  action: string;
  statusCode: number | null;
  message: string;
  responseBody: string | null;
  occurredAt: string;
};

type SecretVoicerCredentialResponse = {
  id: string;
  fingerprintId: string;
  csrfToken: string;
  sessionId: string;
  isActive: boolean;
  lastError: CredentialError | null;
  lastErrorAt: string | null;
  createdAt: string;
  updatedAt: string;
  fingerprintLabel: string;
};

type CreateSecretVoicerCredentialParams = {
  fingerprintId: string;
  csrfToken: string;
  sessionId: string;
};

type UpdateSecretVoicerCredentialParams = Partial<{
  csrfToken: string;
  sessionId: string;
  isActive: boolean;
}>;

type FingerprintOption = {
  id: string;
  label: string;
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

const secretVoicerCredentialApi = {
  getAll(): Promise<SecretVoicerCredentialResponse[]> {
    return apiFetch("/v1/secret-voicer-credentials");
  },

  getById(id: string): Promise<SecretVoicerCredentialResponse> {
    return apiFetch(`/v1/secret-voicer-credentials/${id}`);
  },

  create(
    data: CreateSecretVoicerCredentialParams,
  ): Promise<SecretVoicerCredentialResponse> {
    return apiFetch("/v1/secret-voicer-credentials", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(
    id: string,
    data: UpdateSecretVoicerCredentialParams,
  ): Promise<SecretVoicerCredentialResponse> {
    return apiFetch(`/v1/secret-voicer-credentials/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  clearError(id: string): Promise<SecretVoicerCredentialResponse> {
    return apiFetch(`/v1/secret-voicer-credentials/${id}/clear-error`, {
      method: "POST",
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/v1/secret-voicer-credentials/${id}`, {
      method: "DELETE",
    });
  },

  async getAvailableFingerprints(): Promise<FingerprintOption[]> {
    const fingerprints =
      await apiFetch<{ id: string; label: string; isActive: boolean }[]>(
        "/v1/fingerprints",
      );
    return fingerprints.map((fp) => ({ id: fp.id, label: fp.label }));
  },
};

export type {
  CreateSecretVoicerCredentialParams,
  CredentialError,
  FingerprintOption,
  SecretVoicerCredentialResponse,
  UpdateSecretVoicerCredentialParams,
};
export { secretVoicerCredentialApi };
