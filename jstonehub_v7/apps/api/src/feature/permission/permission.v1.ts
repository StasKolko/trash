import { HTTP_STATUS } from "@packages/contract/http-status";
import { hasPermission } from "@packages/contract/permission/check";
import { Elysia, t } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";

import {
  getUserPermissions,
  listAdminPermissionUsers,
  updateUserPermissions,
} from "./permission.service";

const adminPermissionV1 = new Elysia({ prefix: "/admin/permissions" })
  .use(withAuth)
  .get("/", async ({ user, set }) => {
    if (!hasPermission(user.permissions, "admin:user:read")) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return { error: "INSUFFICIENT_PERMISSION" };
    }

    const users = await listAdminPermissionUsers();

    return { users };
  })
  .get(
    "/:userId",
    async ({ user, set, params }) => {
      if (!hasPermission(user.permissions, "admin:user:read")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const result = await getUserPermissions(params.userId);

      return result;
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
    },
  )
  .put(
    "/:userId",
    async ({ user, set, params, body }) => {
      if (!hasPermission(user.permissions, "admin:user:manage")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const result = await updateUserPermissions({
        targetUserId: params.userId,
        actorId: user.id,
        actorPermissions: user.permissions,
        input: { permissions: body.permissions },
      });

      if (result.kind === "cannot_modify_self") {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "Cannot modify own permissions" };
      }

      if (result.kind === "cannot_grant_admin_all") {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "Cannot grant admin:all without having it" };
      }

      if (result.kind === "invalid_permission") {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: `Invalid permission: ${result.permission}` };
      }

      return { status: "ok" };
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      body: t.Object({
        permissions: t.Array(t.String()),
      }),
    },
  );

export { adminPermissionV1 };
