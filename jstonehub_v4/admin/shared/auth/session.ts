import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import {
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";

import { env } from "#admin/shared/config/env";

export const SESSION_QUERY_KEY = ["session"] as const;

const SESSION_STALE_TIME = 5 * 60 * 1000;
const SESSION_GC_TIME = 10 * 60 * 1000;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  globalRole: GlobalRole;
  isBanned: boolean;
  bannedReason: string | null;
  permissions: AdminPermission[];
};

export type SessionData =
  | { user: SessionUser }
  | { user: null };

async function fetchSession(): Promise<SessionData> {
  const response = await fetch(`${env.API_URL}/v1/auth/session`, {
    credentials: "include",
  });

  if (!response.ok) {
    return { user: null };
  }

  return response.json();
}

async function refreshToken(): Promise<boolean> {
  const response = await fetch(`${env.API_URL}/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function fetchSessionWithRefresh(): Promise<SessionData> {
  const session = await fetchSession();

  if (session.user) {
    return session;
  }

  // Access token expired — try refresh
  const refreshed = await refreshToken();
  if (!refreshed) {
    return { user: null };
  }

  return fetchSession();
}

export function createSessionQuery() {
  return createQuery(() => ({
    queryKey: [...SESSION_QUERY_KEY],
    queryFn: fetchSessionWithRefresh,
    staleTime: SESSION_STALE_TIME,
    gcTime: SESSION_GC_TIME,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  }));
}

export function useLogout() {
  const queryClient = useQueryClient();

  return async () => {
    try {
      await fetch(`${env.API_URL}/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore — we clear everything regardless
    }

    queryClient.clear();
    window.location.href = "/login";
  };
}