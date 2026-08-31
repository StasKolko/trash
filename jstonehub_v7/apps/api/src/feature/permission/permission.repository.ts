import { eq, like, sql } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { permissionTable } from "#api/shared/db/schema/permission.table";
import { userTable } from "#api/shared/db/schema/user.table";

function findAdminPermissionUsers() {
  return db
    .select({
      userId: permissionTable.userId,
      permission: permissionTable.permission,
      userName: userTable.name,
      userEmail: userTable.email,
      userAvatarUrl: userTable.avatarUrl,
    })
    .from(permissionTable)
    .innerJoin(userTable, eq(permissionTable.userId, userTable.id))
    .where(like(permissionTable.permission, "admin:%"));
}

function countUserPermissions(userId: string) {
  return db
    .select({ count: sql<number>`count(*)::int` })
    .from(permissionTable)
    .where(eq(permissionTable.userId, userId))
    .then((rows) => rows[0]?.count ?? 0);
}

export { countUserPermissions, findAdminPermissionUsers };
