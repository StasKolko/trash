import type { Permission } from "@packages/contract/permission/check";

import { hasPermission } from "@packages/contract/permission/check";

import { useAuthContext } from "./use-auth-context";

function usePermission() {
  const { authContext } = useAuthContext();

  function can(required: string) {
    const ctx = authContext();

    if (!ctx) {
      return false;
    }

    return hasPermission(ctx.permissions, required as Permission);
  }

  function canAny(required: string[]) {
    return required.some((p) => can(p));
  }

  function canAll(required: string[]) {
    return required.every((p) => can(p));
  }

  return { can, canAny, canAll };
}

export { usePermission };
