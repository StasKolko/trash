import { HTTP_STATUS } from "@packages/contract/http-status";
import { hasPermission } from "@packages/contract/permission/check";
import { Elysia, t } from "elysia";

import { withAuth } from "#api/service/auth/with-auth";

import { banUser, getUserDetail, listUsers } from "./user.service";

const USER_LIST_DEFAULT_LIMIT = 50;
const USER_LIST_MAX_LIMIT = 100;
const DEFAULT_SORT = "createdAt";
const DEFAULT_ORDER = "desc" as const;

const adminUserV1 = new Elysia({ prefix: "/admin/users" })
  .use(withAuth)
  .get(
    "/",
    async ({ user, set, query }) => {
      if (!hasPermission(user.permissions, "admin:user:read")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const result = await listUsers({
        query: query.query,
        sort: query.sort || DEFAULT_SORT,
        order: parseOrder(query.order),
        isBanned: parseIsBannedQuery(query.isBanned),
        cursor: query.cursor,
        limit: parseLimit(query.limit),
      });

      return result;
    },
    {
      query: t.Object({
        query: t.Optional(t.String()),
        sort: t.Optional(t.String()),
        order: t.Optional(t.String()),
        isBanned: t.Optional(t.String()),
        cursor: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/:userId",
    async ({ user, set, params }) => {
      if (!hasPermission(user.permissions, "admin:user:read")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const detail = await getUserDetail(params.userId);

      if (!detail) {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "User not found" };
      }

      return detail;
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
    },
  )
  .patch(
    "/:userId/ban",
    async ({ user, set, params, body }) => {
      if (!hasPermission(user.permissions, "admin:user:ban")) {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "INSUFFICIENT_PERMISSION" };
      }

      const result = await banUser({
        targetUserId: params.userId,
        actorId: user.id,
        input: body,
      });

      if (result.kind === "not_found") {
        set.status = HTTP_STATUS.NOT_FOUND;
        return { error: "User not found" };
      }

      if (result.kind === "cannot_ban_self") {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "Cannot ban yourself" };
      }

      if (result.kind === "cannot_ban_owner") {
        set.status = HTTP_STATUS.FORBIDDEN;
        return { error: "Cannot ban platform owner" };
      }

      return { status: "ok" };
    },
    {
      params: t.Object({
        userId: t.String(),
      }),
      body: t.Object({
        isBanned: t.Boolean(),
        reason: t.String({ minLength: 1 }),
      }),
    },
  );

function parseOrder(value?: string): "asc" | "desc" {
  if (value === "asc" || value === "desc") {
    return value;
  }

  return DEFAULT_ORDER;
}

function parseIsBannedQuery(value?: string): string[] | "all" | undefined {
  if (!value || value === "all") {
    return "all";
  }

  if (value === "true" || value === "false") {
    return [value];
  }

  return "all";
}

function parseLimit(value?: string) {
  if (!value) {
    return USER_LIST_DEFAULT_LIMIT;
  }

  const num = Number(value);

  if (Number.isNaN(num) || num < 1) {
    return USER_LIST_DEFAULT_LIMIT;
  }

  if (num > USER_LIST_MAX_LIMIT) {
    return USER_LIST_MAX_LIMIT;
  }

  return Math.floor(num);
}

export { adminUserV1 };
