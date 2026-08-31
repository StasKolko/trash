import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import type { Accessor } from "solid-js";

import { storageApi } from "./storage.api";

const QUERY_KEY = "storage-objects";

function createStorageObjectsQuery(prefix: Accessor<string>) {
  return createQuery(() => ({
    queryKey: [QUERY_KEY, prefix()],
    queryFn: () => storageApi.listObjects(prefix()),
  }));
}

function createStorageDeleteKeysMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (keys: string[]) => storageApi.deleteByKeys(keys),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createStorageDeletePrefixMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (prefix: string) => storageApi.deleteByPrefix(prefix),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createStorageDeleteKeysMutation,
  createStorageDeletePrefixMutation,
  createStorageObjectsQuery,
};