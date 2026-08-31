import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import {
  ADMIN_PERMISSIONS,
  DEFAULT_ROLE_ADMIN_PERMISSIONS,
} from "@packages/contract/permission";
import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";

export function resolveAdminPermissions(
  globalRole: GlobalRole,
  customPermissions: AdminPermission[],
): AdminPermission[] {
  if (globalRole === "owner") {
    return [...ADMIN_PERMISSIONS];
  }

  const defaults = DEFAULT_ROLE_ADMIN_PERMISSIONS[globalRole];
  const merged = new Set<AdminPermission>([...defaults, ...customPermissions]);
  return [...merged];
}

export function canManageUser(
  actorRole: GlobalRole,
  targetRole: GlobalRole,
): boolean {
  return GLOBAL_ROLE_HIERARCHY[actorRole] > GLOBAL_ROLE_HIERARCHY[targetRole];
}

export function canGrantPermission(
  actorPermissions: AdminPermission[],
  permission: AdminPermission,
): boolean {
  return actorPermissions.includes(permission);
}