import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";
import type { QueryClient } from "@tanstack/solid-query";

import type { SessionData } from "./session";

import { hasAdminPermission } from "@packages/contract/permission";
import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";
import { redirect } from "@tanstack/solid-router";

import { fetchSessionWithRefresh, SESSION_QUERY_KEY } from "./session";

type GuardOptions = {
  minRole?: GlobalRole;
  permission?: AdminPermission;
};

export async function ensureSession(
  queryClient: QueryClient,
): Promise<SessionData> {
  return queryClient.ensureQueryData({
    queryKey: [...SESSION_QUERY_KEY],
    queryFn: fetchSessionWithRefresh,
    staleTime: 5 * 60 * 1000,
  });
}

export function guardAuth(
  session: SessionData,
  locationHref: string,
  options: GuardOptions = {},
): void {
  if (!session.user) {
    throw redirect({
      to: "/login",
      search: { redirect: locationHref, error: "UNAUTHORIZED" },
    });
  }

  if (session.user.isBanned) {
    throw redirect({
      to: "/login",
      search: { error: "BANNED" },
    });
  }

  // Admin app requires at least moderator
  const minRole = options.minRole ?? "moderator";
  if (
    GLOBAL_ROLE_HIERARCHY[session.user.globalRole as GlobalRole]
    < GLOBAL_ROLE_HIERARCHY[minRole]
  ) {
    throw redirect({
      to: "/login",
      search: { error: "INSUFFICIENT_ROLE" },
    });
  }

  if (
    options.permission
    && !hasAdminPermission(session.user.permissions, options.permission)
  ) {
    throw redirect({
      to: "/login",
      search: { error: "INSUFFICIENT_ROLE" },
    });
  }
}