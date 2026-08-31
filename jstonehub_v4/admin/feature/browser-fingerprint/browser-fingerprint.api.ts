import type { BrowserFingerprintStatus } from "@packages/contract/browser-fingerprint";
import type { PaginationOrder } from "@packages/contract/pagination";

import { PAGINATION_FILTER_ALL } from "@packages/contract/pagination";

type BrowserFingerprintResponse = {
  id: string;
  label: string;
  isActive: boolean;
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  timezone: string;
  timezoneOffset: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  cookieEnabled: boolean;
  webglVendor: string;
  webglRenderer: string;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  deviceMemory: number | null;
  doNotTrack: string | null;
  pdfViewerEnabled: boolean;
  vendor: string;
  appVersion: string;
  createdAt: string;
  updatedAt: string;
};

type GetAllParams = {
  query?: string;
  sort?: string;
  order?: PaginationOrder;
  status?: typeof PAGINATION_FILTER_ALL | BrowserFingerprintStatus[];
};

type CreateParams = Omit<
  BrowserFingerprintResponse,
  "id" | "isActive" | "createdAt" | "updatedAt"
>;

type UpdateParams = Partial<CreateParams & { isActive: boolean }>;

const API_URL = import.meta.env.VITE_API_URL ?? "";

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
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
      message = body.error
        ? `${body.error}: ${JSON.stringify(body.details)}`
        : JSON.stringify(body);
    } catch {
      // use default message
    }
    throw new Error(message);
  }
  return response;
}

const browserFingerprintApi = {
  async getAll(params?: GetAllParams): Promise<BrowserFingerprintResponse[]> {
    const searchParams = new URLSearchParams();

    if (params?.query) {
      searchParams.set("query", params.query);
    }
    if (params?.sort) {
      searchParams.set("sort", params.sort);
    }
    if (params?.order) {
      searchParams.set("order", params.order);
    }

    if (
      params?.status
      && params.status !== PAGINATION_FILTER_ALL
      && Array.isArray(params.status)
    ) {
      for (const s of params.status) {
        searchParams.append("status", s);
      }
    }

    const query = searchParams.toString();
    const url = `/v1/fingerprints${query ? `?${query}` : ""}`;
    const response = await apiFetch(url);
    return response.json();
  },

  async getById(id: string): Promise<BrowserFingerprintResponse> {
    const response = await apiFetch(`/v1/fingerprints/${id}`);
    return response.json();
  },

  async create(data: CreateParams): Promise<BrowserFingerprintResponse> {
    const response = await apiFetch("/v1/fingerprints", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async update(
    id: string,
    data: UpdateParams,
  ): Promise<BrowserFingerprintResponse> {
    const response = await apiFetch(`/v1/fingerprints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/v1/fingerprints/${id}`, { method: "DELETE" });
  },
};

export type { BrowserFingerprintResponse, CreateParams, UpdateParams };
export { browserFingerprintApi };
