import type { RouterContext } from "#admin/app/root/root.type";

import { hasPermission } from "@packages/contract/permission/check";
import { redirect } from "@tanstack/solid-router";

import { authContextQueryOptions } from "./auth-context.query";

async function adminAuthGuard(params: { context: RouterContext }) {
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

  const hasAccess =
    hasPermission(data.permissions, "admin:access:read")
    || data.permissions.includes("admin:all");

  if (!hasAccess) {
    params.context.queryClient.clear();
    throw redirect({
      to: "/login",
      search: { error: "INSUFFICIENT_PERMISSION" },
    });
  }

  return data;
}

export { adminAuthGuard };
