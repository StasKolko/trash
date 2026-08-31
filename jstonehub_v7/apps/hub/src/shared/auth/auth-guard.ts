import type { RouterContext } from "#hub/app/root/root.type";

import { redirect } from "@tanstack/solid-router";

import { authContextQueryOptions } from "./auth-context.query";

async function authGuard(params: { context: RouterContext }) {
  const data = await params.context.queryClient.ensureQueryData(
    authContextQueryOptions,
  );

  if (!data) {
    throw redirect({ to: "/login" });
  }

  if (data.user.isBanned) {
    params.context.queryClient.clear();
    throw redirect({ to: "/login", search: { error: "BANNED" } });
  }

  return data;
}

export { authGuard };
