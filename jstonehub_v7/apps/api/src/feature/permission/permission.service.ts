import type {
  AdminPermissionUser,
  UpdatePermissionsInput,
  UserPermissions,
} from "./permission.type";

import { isValidAdminPermission } from "@packages/contract/permission/admin";

import { createAuditLog } from "#api/service/audit/audit.repository";
import {
  deletePermission,
  findPermissionsByUserId,
  insertPermission,
} from "#api/service/permission/permission.repository";

import { findAdminPermissionUsers } from "./permission.repository";

// ─── list admin permission users ───────────────────────

async function listAdminPermissionUsers(): Promise<AdminPermissionUser[]> {
  const rows = await findAdminPermissionUsers();
  return groupPermissionsByUser(rows);
}

function groupPermissionsByUser(
  rows: Array<{
    userId: string;
    permission: string;
    userName: string;
    userEmail: string;
    userAvatarUrl: string | null;
  }>,
): AdminPermissionUser[] {
  const userMap = new Map<string, AdminPermissionUser>();

  for (const row of rows) {
    const existing = userMap.get(row.userId);

    if (existing) {
      existing.permissions.push(row.permission);
    } else {
      userMap.set(row.userId, {
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        userAvatarUrl: row.userAvatarUrl,
        permissions: [row.permission],
      });
    }
  }

  return Array.from(userMap.values());
}

// ─── get user permissions ──────────────────────────────

async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const rows = await findPermissionsByUserId(userId);
  return { permissions: rows.map((r) => r.permission) };
}

// ─── update user permissions ───────────────────────────

type UpdateResult =
  | { kind: "success" }
  | { kind: "cannot_modify_self" }
  | { kind: "cannot_grant_admin_all" }
  | { kind: "invalid_permission"; permission: string };

async function updateUserPermissions(params: {
  targetUserId: string;
  actorId: string;
  actorPermissions: string[];
  input: UpdatePermissionsInput;
}): Promise<UpdateResult> {
  if (params.targetUserId === params.actorId) {
    return { kind: "cannot_modify_self" };
  }

  const validationError = validatePermissions(params);

  if (validationError) {
    return validationError;
  }

  const currentRows = await findPermissionsByUserId(params.targetUserId);
  const currentPerms = new Set(currentRows.map((r) => r.permission));
  const desiredPerms = new Set(params.input.permissions);

  const toAdd = params.input.permissions.filter((p) => !currentPerms.has(p));
  const toRemove = currentRows
    .map((r) => r.permission)
    .filter((p) => !desiredPerms.has(p));

  await applyPermissionChanges({
    targetUserId: params.targetUserId,
    actorId: params.actorId,
    toAdd,
    toRemove,
  });

  return { kind: "success" };
}

function validatePermissions(params: {
  actorPermissions: string[];
  input: UpdatePermissionsInput;
}): UpdateResult | null {
  const actorHasAdminAll = params.actorPermissions.includes("admin:all");

  for (const perm of params.input.permissions) {
    if (!isValidAdminPermission(perm)) {
      return { kind: "invalid_permission", permission: perm };
    }

    if (perm === "admin:all" && !actorHasAdminAll) {
      return { kind: "cannot_grant_admin_all" };
    }
  }

  return null;
}

async function applyPermissionChanges(params: {
  targetUserId: string;
  actorId: string;
  toAdd: string[];
  toRemove: string[];
}) {
  const removeOperations = params.toRemove.map((perm) =>
    removePermissionWithAudit({
      targetUserId: params.targetUserId,
      actorId: params.actorId,
      permission: perm,
    }),
  );

  await Promise.all(removeOperations);

  const addOperations = params.toAdd.map((perm) =>
    addPermissionWithAudit({
      targetUserId: params.targetUserId,
      actorId: params.actorId,
      permission: perm,
    }),
  );

  await Promise.all(addOperations);
}

async function removePermissionWithAudit(params: {
  targetUserId: string;
  actorId: string;
  permission: string;
}) {
  await deletePermission({
    userId: params.targetUserId,
    permission: params.permission,
  });

  await createAuditLog({
    actorId: params.actorId,
    targetId: params.targetUserId,
    targetType: "user",
    action: "revoke_permission",
    reason: null,
    metadata: { permission: params.permission },
  });
}

async function addPermissionWithAudit(params: {
  targetUserId: string;
  actorId: string;
  permission: string;
}) {
  await insertPermission({
    userId: params.targetUserId,
    permission: params.permission,
    grantedBy: params.actorId,
  });

  await createAuditLog({
    actorId: params.actorId,
    targetId: params.targetUserId,
    targetType: "user",
    action: "grant_permission",
    reason: null,
    metadata: { permission: params.permission },
  });
}

export { getUserPermissions, listAdminPermissionUsers, updateUserPermissions };
