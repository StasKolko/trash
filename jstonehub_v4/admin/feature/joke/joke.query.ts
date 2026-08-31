import type {
  AddTranslationParams,
  CreateJokeParams,
  GetJokesFilters,
  UpdateJokeParams,
} from "./joke.api";

import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { jokeApi } from "./joke.api";

const QUERY_KEY = "jokes";

function createJokesQuery(filters: () => GetJokesFilters) {
  return createQuery(() => ({
    queryKey: [QUERY_KEY, filters()],
    queryFn: () => jokeApi.getAll(filters()),
  }));
}

function createJokeQuery(id: () => string | null) {
  return createQuery(() => ({
    queryKey: [QUERY_KEY, id()],
    queryFn: () => {
      const jokeId = id();
      if (!jokeId) {
        return null;
      }
      return jokeApi.getById(jokeId);
    },
    enabled: id() !== null,
  }));
}

function createJokeCreateMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (data: CreateJokeParams) => jokeApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createJokeUpdateMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({ id, data }: { id: string; data: UpdateJokeParams }) =>
      jokeApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createJokeDeleteMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => jokeApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

function createAddTranslationMutation() {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({
      jokeId,
      data,
    }: {
      jokeId: string;
      data: AddTranslationParams;
    }) => jokeApi.addTranslation(jokeId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  }));
}

export {
  createAddTranslationMutation,
  createJokeCreateMutation,
  createJokeDeleteMutation,
  createJokeQuery,
  createJokesQuery,
  createJokeUpdateMutation,
};
