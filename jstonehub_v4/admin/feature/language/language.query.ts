import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { languageApi } from "./language.api";

const QUERY_KEY = "languages";

function createLanguagesQuery() {
  return createQuery(() => ({
    queryKey: [QUERY_KEY],
    queryFn: () => languageApi.getAll(),
  }));
}

function createLanguageCreateMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: { code: string; name: string }) =>
      languageApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createLanguageDeleteMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => languageApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createLanguageCreateMutation,
  createLanguageDeleteMutation,
  createLanguagesQuery,
};
