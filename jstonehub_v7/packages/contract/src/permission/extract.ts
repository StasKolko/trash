import type { PermissionScope } from "./scope";

import { PERMISSION_SCOPE } from "./scope";

const ADMIN_PREFIX = "admin:";
const SCOPE_SET = new Set<string>(PERMISSION_SCOPE);

function extractScope(permission: string): PermissionScope | null {
  const colonIndex = permission.indexOf(":");

  if (colonIndex === -1) {
    return null;
  }

  const scope = permission.slice(0, colonIndex);

  if (!SCOPE_SET.has(scope)) {
    return null;
  }

  return scope as PermissionScope;
}

function extractEntityId(permission: string): string | null {
  if (permission.startsWith(ADMIN_PREFIX)) {
    return null;
  }

  const firstColon = permission.indexOf(":");

  if (firstColon === -1) {
    return null;
  }

  const rest = permission.slice(firstColon + 1);
  const secondColon = rest.indexOf(":");

  if (secondColon === -1) {
    return null;
  }

  const entityId = rest.slice(0, secondColon);

  return entityId || null;
}

function isAdminPermission(permission: string) {
  return permission.startsWith(ADMIN_PREFIX);
}

function isOrgPermission(permission: string) {
  return permission.startsWith("org:");
}

function isProjectPermission(permission: string) {
  return permission.startsWith("project:");
}

function isAccountPermission(permission: string) {
  return permission.startsWith("account:");
}

export {
  extractEntityId,
  extractScope,
  isAccountPermission,
  isAdminPermission,
  isOrgPermission,
  isProjectPermission,
};
