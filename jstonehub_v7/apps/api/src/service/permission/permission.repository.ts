import { and, eq, like } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { permissionTable } from "#api/shared/db/schema/permission.table";

function findPermissionsByUserId(userId: string) {
  return db
    .select({
      id: permissionTable.id,
      permission: permissionTable.permission,
      grantedBy: permissionTable.grantedBy,
      grantedAt: permissionTable.grantedAt,
    })
    .from(permissionTable)
    .where(eq(permissionTable.userId, userId));
}

function insertPermission(params: {
  userId: string;
  permission: string;
  grantedBy: string | null;
}) {
  return db
    .insert(permissionTable)
    .values({
      userId: params.userId,
      permission: params.permission,
      grantedBy: params.grantedBy,
    })
    .onConflictDoNothing({
      target: [permissionTable.userId, permissionTable.permission],
    });
}

function deletePermission(params: { userId: string; permission: string }) {
  return db
    .delete(permissionTable)
    .where(
      and(
        eq(permissionTable.userId, params.userId),
        eq(permissionTable.permission, params.permission),
      ),
    );
}

function deleteAdminPermissionsByUserId(userId: string) {
  return db
    .delete(permissionTable)
    .where(
      and(
        eq(permissionTable.userId, userId),
        like(permissionTable.permission, "admin:%"),
      ),
    );
}

export {
  deleteAdminPermissionsByUserId,
  deletePermission,
  findPermissionsByUserId,
  insertPermission,
};
