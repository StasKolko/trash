import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";

import type { JwtPayload } from "./auth.jwt";

import { GLOBAL_ROLE_HIERARCHY } from "@packages/contract/role";
import { Elysia } from "elysia";

import { HTTP_STATUS } from "#api/shared/config/http-status";

import { verifyAccessToken } from "./auth.jwt";
import { resolveAdminPermissions } from "./auth.permission";
import { authRepository } from "./auth.repository";

type AuthUser = JwtPayload & {
  permissions: AdminPermission[];
};

// ─── Derive: Parse JWT from cookie ────────────────────────────────────────────

const authPlugin = new Elysia({ name: "auth" }).derive(
  async ({ cookie }): Promise<{ authUser: AuthUser | null }> => {
    const token = cookie.access_token?.value;
    if (!token) {
      return { authUser: null };
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return { authUser: null };
    }

    // Owner fast-path: skip DB
    if (payload.role === "owner") {
      const { ADMIN_PERMISSIONS } = await import(
        "@packages/contract/permission"
      );
      return {
        authUser: {
          ...payload,
          permissions: [...ADMIN_PERMISSIONS],
        },
      };
    }

    const customPermissions = await authRepository.getUserAdminPermissions(
      payload.sub,
    );
    const permissions = resolveAdminPermissions(
      payload.role,
      customPermissions,
    );

    return { authUser: { ...payload, permissions } };
  },
);

// ─── Guards ───────────────────────────────────────────────────────────────────

function requireAuth() {
  return new Elysia({ name: "require-auth" }).onBeforeHandle(
    ({ authUser, set }) => {
      if (!authUser) {
        set.status = HTTP_STATUS.UNAUTHORIZED;
        return { error: "UNAUTHORIZED", message: "Authentication required" };
      }
    },
  );
}

function requireRole(minRole: GlobalRole) {
  return new Elysia({ name: `require-role-${minRole}` }).onBeforeHandle(
    ({ authUser, set }) => {
      if (!authUser) {
        set.status = HTTP_STATUS.UNAUTHORIZED;
        return { error: "UNAUTHORIZED", message: "Authentication required" };
      }

      if (
        GLOBAL_ROLE_HIERARCHY[authUser.role]
        < GLOBAL_ROLE_HIERARCHY[minRole]
      ) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return {
          error: "INSUFFICIENT_ROLE",
          message: `Requires ${minRole} role or higher`,
        };
      }
    },
  );
}

function requirePermission(permission: AdminPermission) {
  return new Elysia({
    name: `require-permission-${permission}`,
  }).onBeforeHandle(({ authUser, set }) => {
    if (!authUser) {
      set.status = HTTP_STATUS.UNAUTHORIZED;
      return { error: "UNAUTHORIZED", message: "Authentication required" };
    }

    if (!authUser.permissions.includes(permission)) {
      set.status = HTTP_STATUS.FORBIDDEN;
      return {
        error: "INSUFFICIENT_ROLE",
        message: `Missing permission: ${permission}`,
      };
    }
  });
}

export type { AuthUser };
export { authPlugin, requireAuth, requirePermission, requireRole };