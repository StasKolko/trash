import { queryOptions } from "@tanstack/solid-query";

import { client } from "#admin/shared/api/client";

const AUTH_CONTEXT_QUERY_KEY = ["auth-context"] as const;

function createAuthContextQueryOptions() {
  return queryOptions({
    queryKey: AUTH_CONTEXT_QUERY_KEY,
    queryFn: fetchAuthContext,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}

async function fetchAuthContext() {
  const result = await tryFetchContext();

  if (result) {
    return result;
  }

  const refreshed = await tryRefreshTokens();

  if (!refreshed) {
    return null;
  }

  return tryFetchContext();
}

async function tryFetchContext() {
  const { data, error } = await client.v1.auth.context.get();

  if (error || !data || "error" in data) {
    return null;
  }

  return data as {
    user: {
      id: string;
      email: string;
      name: string;
      avatarUrl: string | null;
      isBanned: boolean;
    };
    permissions: string[];
    energyBalance: string;
    loginStreak: number;
  };
}

async function tryRefreshTokens() {
  try {
    const { data, error } = await client.v1.auth.refresh.post();

    if (error || !data) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

const authContextQueryOptions = createAuthContextQueryOptions();

export { AUTH_CONTEXT_QUERY_KEY, authContextQueryOptions };
