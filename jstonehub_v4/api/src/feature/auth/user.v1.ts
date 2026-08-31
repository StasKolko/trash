import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import { ADMIN_PERMISSIONS } from "@packages/contract/permission";
import { GLOBAL_ROLES } from "@packages/contract/role";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { authPlugin, requirePermission } from "./auth.middleware";
import { authRepository } from "./auth.repository";
import { authService } from "./auth.service";

const validAdminPermissions = new Set<string>(ADMIN_PERMISSIONS);
const validGlobalRoles = new Set<string>(GLOBAL_ROLES);

export const userV1 = new Elysia({ prefix: "/v1/users" })
  .use(authPlugin)
  .onError(({ error, set }) => {
    set.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return { error: "Internal server error", message: String(error) };
  })

  // ─── List Users ─────────────────────────────────────────────────────────────
  .use(requirePermission("admin.user.read"))
  .get("/", () => authRepository.getAllUsers())

  // ─── Get User ───────────────────────────────────────────────────────────────
  .get("/:id", async ({ params, set }) => {
    const user = await authRepository.findUserById(params.id);
    if (!user) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "User not found" };
    }

    const permissions = await authRepository.getUserAdminPermissions(user.id);
    return { ...user, permissions };
  })

  // ─── Set Role ───────────────────────────────────────────────────────────────
  .patch("/:id/role", async ({ params, body, authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    const { role } = body as { role?: string };
    if (!(role && validGlobalRoles.has(role))) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "Invalid role" };
    }

    try {
      const user = await authService.setUserRole({
        actorRole: authUser.role,
        targetUserId: params.id,
        newRole: role as GlobalRole,
      });
      return user;
    } catch (error) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error: error instanceof Error ? error.message : "Failed to set role",
      };
    }
  })

  // ─── Ban User ───────────────────────────────────────────────────────────────
  .post("/:id/ban", async ({ params, body, authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    const { reason } = body as { reason?: string };

    try {
      const user = await authService.banUser({
        actorRole: authUser.role,
        targetUserId: params.id,
        reason: reason ?? "No reason provided",
      });
      return user;
    } catch (error) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error: error instanceof Error ? error.message : "Failed to ban user",
      };
    }
  })

  // ─── Unban User ─────────────────────────────────────────────────────────────
  .post("/:id/unban", async ({ params, authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    try {
      const user = await authService.unbanUser({
        actorRole: authUser.role,
        targetUserId: params.id,
      });
      return user;
    } catch (error) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error: error instanceof Error ? error.message : "Failed to unban user",
      };
    }
  })

  // ─── Get User Permissions ───────────────────────────────────────────────────
  .get("/:id/permissions", async ({ params, set }) => {
    const user = await authRepository.findUserById(params.id);
    if (!user) {
      set.status = HTTP_STATUS.NOT_FOUND;
      return { error: "User not found" };
    }

    const permissions = await authRepository.getUserAdminPermissions(user.id);
    return { userId: user.id, permissions };
  })

  // ─── Set User Permissions ──────────────────────────────────────────────────
  .put("/:id/permissions", async ({ params, body, authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED" };
    }

    const { permissions } = body as { permissions?: string[] };

    if (!Array.isArray(permissions)) {
      set.status = HTTP_STATUS.BAD_REQUEST;
      return { error: "permissions must be an array" };
    }

    for (const p of permissions) {
      if (!validAdminPermissions.has(p)) {
        set.status = HTTP_STATUS.BAD_REQUEST;
        return { error: `Invalid permission: ${p}` };
      }
    }

    try {
      const result = await authService.setUserPermissions({
        actorId: authUser.sub,
        actorRole: authUser.role,
        actorPermissions: authUser.permissions,
        targetUserId: params.id,
        permissions: permissions as AdminPermission[],
      });
      return { userId: params.id, permissions: result };
    } catch (error) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error:
          error instanceof Error ? error.message : "Failed to set permissions",
      };
    }
  });
