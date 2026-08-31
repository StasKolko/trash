import type { SQL } from "drizzle-orm";

import { and, eq, ilike, or, sql } from "drizzle-orm";

import { authRepository } from "#api/service/auth/auth.repository";
import { db } from "#api/shared/db/instance";
import { permissionTable } from "#api/shared/db/schema/permission.table";
import { userTable } from "#api/shared/db/schema/user.table";

// ─── list users (cursor pagination) ───────────────────

type ListUsersParams = {
  query?: string;
  sort: string;
  order: "asc" | "desc";
  isBanned?: boolean;
  cursor?: { sortValue: string; id: string } | null;
  limit: number;
};

function listUsers(params: ListUsersParams) {
  const conditions = buildFilterConditions(params);
  const orderBy = buildOrderBy(params.sort, params.order);
  const cursorCondition = buildCursorCondition(params);
  const whereClause = buildWhereClause(conditions, cursorCondition);

  return db
    .select({
      id: userTable.id,
      email: userTable.email,
      name: userTable.name,
      avatarUrl: userTable.avatarUrl,
      isBanned: userTable.isBanned,
      energyBalance: userTable.energyBalance,
      loginStreak: userTable.loginStreak,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(whereClause)
    .orderBy(...orderBy)
    .limit(params.limit + 1);
}

// ─── get user detail ───────────────────────────────────

async function getUserDetail(userId: string) {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .then((rows) => rows[0] ?? null);

  if (!user) {
    return null;
  }

  const permissions = await db
    .select({ permission: permissionTable.permission })
    .from(permissionTable)
    .where(eq(permissionTable.userId, userId));

  const sessionCountResult =
    await authRepository.session.findActive.countByUserId(userId);

  return {
    user,
    permissions: permissions.map((p) => p.permission),
    activeSessionCount: sessionCountResult,
  };
}

// ─── ban / unban ───────────────────────────────────────

function updateBanStatus(params: { userId: string; isBanned: boolean }) {
  return db
    .update(userTable)
    .set({
      isBanned: params.isBanned,
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, params.userId));
}

function findUserById(userId: string) {
  return db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .then((rows) => rows[0] ?? null);
}

function hasAdminAllPermission(userId: string) {
  return db
    .select({ id: permissionTable.id })
    .from(permissionTable)
    .where(
      and(
        eq(permissionTable.userId, userId),
        eq(permissionTable.permission, "admin:all"),
      ),
    )
    .then((rows) => rows.length > 0);
}

// ─── query building helpers ────────────────────────────

function buildFilterConditions(params: ListUsersParams) {
  const conditions: SQL[] = [];

  if (params.query) {
    const pattern = `%${params.query}%`;
    const searchCondition = or(
      ilike(userTable.name, pattern),
      ilike(userTable.email, pattern),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (params.isBanned !== undefined) {
    conditions.push(eq(userTable.isBanned, params.isBanned));
  }

  return conditions;
}

function buildWhereClause(conditions: SQL[], cursorCondition: SQL | null) {
  if (cursorCondition && conditions.length > 0) {
    return and(...conditions, cursorCondition);
  }

  if (cursorCondition) {
    return cursorCondition;
  }

  if (conditions.length > 0) {
    return and(...conditions);
  }

  return;
}

function buildOrderBy(sort: string, order: "asc" | "desc") {
  const direction = order === "desc" ? sql`DESC` : sql`ASC`;
  const sortColumn = getSortColumn(sort);

  return [sql`${sortColumn} ${direction}`, sql`${userTable.id} ${direction}`];
}

function getSortColumn(sort: string) {
  const sortMap = {
    createdAt: userTable.createdAt,
    name: userTable.name,
    email: userTable.email,
    energyBalance: userTable.energyBalance,
    loginStreak: userTable.loginStreak,
  } as const;

  type SortKey = keyof typeof sortMap;

  if (sort in sortMap) {
    return sortMap[sort as SortKey];
  }

  return userTable.createdAt;
}

function buildCursorCondition(params: ListUsersParams) {
  if (!params.cursor) {
    return null;
  }

  const sortColumn = getSortColumn(params.sort);
  const { sortValue, id } = params.cursor;

  if (params.order === "desc") {
    return sql`(${sortColumn}, ${userTable.id}) < (${sortValue}, ${id})`;
  }

  return sql`(${sortColumn}, ${userTable.id}) > (${sortValue}, ${id})`;
}

export {
  findUserById,
  getUserDetail,
  hasAdminAllPermission,
  listUsers,
  updateBanStatus,
};
