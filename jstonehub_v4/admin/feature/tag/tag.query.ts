import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { tagApi } from "./tag.api";

const QUERY_KEY = "tags";

function createTagsQuery() {
  return createQuery(() => ({
    queryKey: [QUERY_KEY],
    queryFn: () => tagApi.getAll(),
  }));
}

function createTagCreateMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: { slug: string; name: string }) => tagApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createTagDeleteMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => tagApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export { createTagCreateMutation, createTagDeleteMutation, createTagsQuery };
