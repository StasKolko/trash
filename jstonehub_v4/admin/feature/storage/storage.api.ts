type StorageObject = {
  key: string;
  size: number;
  lastModified: string;
  isPrefix: boolean;
};

type StorageDirectory = {
  name: string;
  prefix: string;
};

type StorageFile = {
  key: string;
  size: number;
  lastModified: string;
};

type StorageListResponse = {
  directories: StorageDirectory[];
  files: StorageFile[];
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

function parseStorageObjects(objects: StorageObject[]): StorageListResponse {
  const directories: StorageDirectory[] = [];
  const files: StorageFile[] = [];

  for (const obj of objects) {
    if (obj.isPrefix) {
      const name = obj.key.replace(/\/$/, "").split("/").pop() ?? obj.key;
      directories.push({ name, prefix: obj.key });
    } else {
      files.push({
        key: obj.key,
        size: obj.size,
        lastModified: obj.lastModified,
      });
    }
  }

  return { directories, files };
}

const storageApi = {
  async listObjects(prefix: string): Promise<StorageListResponse> {
    const params = new URLSearchParams();
    if (prefix) {
      params.set("prefix", prefix);
    }
    const query = params.toString();
    const objects = await apiFetch<StorageObject[]>(
      `/v1/storage/objects${query ? `?${query}` : ""}`,
    );
    return parseStorageObjects(objects);
  },

  deleteByKeys(keys: string[]): Promise<void> {
    return apiFetch("/v1/storage/objects", {
      method: "DELETE",
      body: JSON.stringify({ keys }),
    });
  },

  deleteByPrefix(prefix: string): Promise<void> {
    return apiFetch("/v1/storage/objects", {
      method: "DELETE",
      body: JSON.stringify({ prefix }),
    });
  },
};

export type { StorageDirectory, StorageFile, StorageListResponse, StorageObject };
export { storageApi };