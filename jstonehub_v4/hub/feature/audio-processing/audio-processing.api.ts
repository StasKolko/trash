type UploadUrlEntry = {
  fileName: string;
  key: string;
  uploadUrl: string;
};

type UploadUrlsResponse = {
  jobId: string;
  uploads: UploadUrlEntry[];
};

type ProcessResponse = {
  jobId: string;
  bullJobId: string;
  queue: string;
  status: string;
  inputFileCount: number;
};

type JobFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

type JobListEntry = {
  jobId: string;
  status: string;
  name: string;
  isConcatenated: boolean;
  fileCount: number;
  createdAt: string;
  expiresAt: string;
  files?: JobFileEntry[];
  error?: string;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

const HTTP_NO_CONTENT = 204;
const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 300;
const PERCENT_MULTIPLIER = 100;

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

function uploadFileViaXhr(
  url: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * PERCENT_MULTIPLIER));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= HTTP_OK_MIN && xhr.status < HTTP_OK_MAX) {
        resolve();
      } else {
        reject(new Error(`Upload failed: HTTP ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.send(file);
  });
}

const audioProcessingApi = {
  getUploadUrls(fileNames: string[]): Promise<UploadUrlsResponse> {
    return apiFetch("/v1/audio-processing/upload-urls", {
      method: "POST",
      body: JSON.stringify({ fileNames }),
    });
  },

  uploadFileToPresignedUrl(
    url: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> {
    return uploadFileViaXhr(url, file, onProgress);
  },

  startProcessing(
    jobId: string,
    name: string,
    config?: Record<string, unknown>,
  ): Promise<ProcessResponse> {
    return apiFetch("/v1/audio-processing/process", {
      method: "POST",
      body: JSON.stringify({ jobId, name, config }),
    });
  },

  getJobs(): Promise<JobListEntry[]> {
    return apiFetch("/v1/audio-processing/jobs");
  },

  getJobStatus(jobId: string): Promise<JobListEntry> {
    return apiFetch(`/v1/audio-processing/jobs/${jobId}`);
  },

  deleteJob(jobId: string): Promise<void> {
    return apiFetch(`/v1/audio-processing/jobs/${jobId}`, {
      method: "DELETE",
    });
  },
};

export type {
  JobFileEntry,
  JobListEntry,
  ProcessResponse,
  UploadUrlEntry,
  UploadUrlsResponse,
};
export { audioProcessingApi };
