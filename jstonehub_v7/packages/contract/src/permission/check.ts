import type { AdminPermission } from "./admin";
import type { OrgPermission } from "./org";
import type { AccountPermission, ProjectPermission } from "./resource";

type Permission =
  | AdminPermission
  | OrgPermission
  | ProjectPermission
  | AccountPermission;

import { is } from "@packages/util/guard";

type ParsedPermission = {
  scope: string;
  resourceId: string | null;
  entity: string | null;
  action: string;
};

const ADMIN_PREFIX = "admin:";
const ALL_ACTION = "all";
const SCOPE_ALL = "admin:all";

function hasPermission(userPermissions: string[], required: Permission) {
  const parsed = parsePermission(required);

  if (is.null(parsed)) {
    return false;
  }

  if (parsed.scope === "admin") {
    return hasAdminPermission(userPermissions, required, parsed);
  }

  return hasScopedPermission(userPermissions, required, parsed);
}

function parsePermission(permission: string): ParsedPermission | null {
  if (!permission) {
    return null;
  }

  if (permission.startsWith(ADMIN_PREFIX)) {
    return parseAdminPermission(permission);
  }

  return parseScopedPermission(permission);
}

function parseAdminPermission(permission: string): ParsedPermission | null {
  const withoutPrefix = permission.slice(ADMIN_PREFIX.length);

  if (withoutPrefix === ALL_ACTION) {
    return {
      scope: "admin",
      resourceId: null,
      entity: null,
      action: ALL_ACTION,
    };
  }

  const colonIndex = withoutPrefix.indexOf(":");

  if (colonIndex === -1) {
    return null;
  }

  const entity = withoutPrefix.slice(0, colonIndex);
  const action = withoutPrefix.slice(colonIndex + 1);

  if (!(entity && action)) {
    return null;
  }

  return { scope: "admin", resourceId: null, entity, action };
}

function parseScopedPermission(permission: string): ParsedPermission | null {
  const firstColon = permission.indexOf(":");

  if (firstColon === -1) {
    return null;
  }

  const scope = permission.slice(0, firstColon);
  const rest = permission.slice(firstColon + 1);
  const secondColon = rest.indexOf(":");

  if (secondColon === -1) {
    return null;
  }

  const resourceId = rest.slice(0, secondColon);
  const action = rest.slice(secondColon + 1);

  if (!(scope && resourceId && action)) {
    return null;
  }

  return { scope, resourceId, entity: null, action };
}

function hasAdminPermission(
  userPermissions: string[],
  required: string,
  parsed: ParsedPermission,
) {
  if (userPermissions.includes(required)) {
    return true;
  }

  if (parsed.entity && parsed.action !== ALL_ACTION) {
    const entityWildcard = `admin:${parsed.entity}:${ALL_ACTION}`;

    if (userPermissions.includes(entityWildcard)) {
      return true;
    }
  }

  if (userPermissions.includes(SCOPE_ALL)) {
    return true;
  }

  return false;
}

function hasScopedPermission(
  userPermissions: string[],
  required: string,
  parsed: ParsedPermission,
) {
  if (userPermissions.includes(required)) {
    return true;
  }

  if (parsed.resourceId && parsed.action !== ALL_ACTION) {
    const resourceWildcard = `${parsed.scope}:${parsed.resourceId}:${ALL_ACTION}`;

    if (userPermissions.includes(resourceWildcard)) {
      return true;
    }
  }

  return false;
}

export type { ParsedPermission, Permission };
export { hasPermission, parsePermission };
