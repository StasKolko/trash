import type { BrowserFingerprintStatus } from "@packages/contract/browser-fingerprint";
import type { PaginationOrder } from "@packages/contract/pagination";
import type { CreateQueryResult } from "@tanstack/solid-query";

import type {
  BrowserFingerprintResponse,
  CreateParams,
  UpdateParams,
} from "./browser-fingerprint.api";

import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { browserFingerprintApi } from "./browser-fingerprint.api";

type ListParams = {
  query: string;
  sort: string;
  order: PaginationOrder;
  status: "all" | BrowserFingerprintStatus[];
};

const QUERY_KEY = "browser-fingerprints";

function createBrowserFingerprintsQuery(
  params: () => ListParams,
): CreateQueryResult<BrowserFingerprintResponse[]> {
  return createQuery(() => ({
    queryKey: [QUERY_KEY, params()],
    queryFn: () => browserFingerprintApi.getAll(params()),
  }));
}

function createBrowserFingerprintCreateMutation() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: (data: CreateParams) => browserFingerprintApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createBrowserFingerprintUpdateMutation() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ id, data }: { id: string; data: UpdateParams }) =>
      browserFingerprintApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createBrowserFingerprintDeleteMutation() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: (id: string) => browserFingerprintApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createBrowserFingerprintCreateMutation,
  createBrowserFingerprintDeleteMutation,
  createBrowserFingerprintsQuery,
  createBrowserFingerprintUpdateMutation,
};
