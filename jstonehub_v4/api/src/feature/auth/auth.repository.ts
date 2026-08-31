import type { AdminPermission } from "@packages/contract/permission";
import type { GlobalRole } from "@packages/contract/role";
import type { InferSelectModel } from "drizzle-orm";

import { is } from "@packages/util/guard";
import { and, eq, lt } from "drizzle-orm";

import { db } from "#api/shared/db/instance";

import {
  oauthAccountsTable,
  sessionsTable,
  userAdminPermissionsTable,
  usersTable,
} from "./auth.table";

type User = InferSelectModel<typeof usersTable>;
type Session = InferSelectModel<typeof sessionsTable>;
type UserAdminPermission = InferSelectModel<typeof userAdminPermissionsTable>;

const authRepo = {
  async getUserByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return row ?? null;
  },

  async getUserById(id: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return row ?? null;
  },

  getAllUsers(): Promise<User[]> {
    return db.select().from(usersTable).orderBy(usersTable.createdAt);
  },

  async createUser(data: {
    email: string;
    name: string;
    avatarUrl: string | null;
    globalRole: GlobalRole;
  }): Promise<User> {
    const [row] = await db.insert(usersTable).values(data).returning();
    if (is.undefined(row)) {
      throw new Error("Failed to create user");
    }
    return row;
  },

  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      avatarUrl: string | null;
      globalRole: GlobalRole;
      isBanned: boolean;
      bannedAt: Date | null;
      bannedReason: string | null;
    }>,
  ): Promise<User | null> {
    const [row] = await db
      .update(usersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    return row ?? null;
  },

  async getOauthAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<{
    provider: string;
    providerAccountId: string;
    userId: string;
  } | null> {
    const [row] = await db
      .select()
      .from(oauthAccountsTable)
      .where(
        and(
          eq(oauthAccountsTable.provider, provider),
          eq(oauthAccountsTable.providerAccountId, providerAccountId),
        ),
      )
      .limit(1);
    return row ?? null;
  },

  async createOauthAccount(data: {
    provider: string;
    providerAccountId: string;
    userId: string;
  }): Promise<void> {
    await db.insert(oauthAccountsTable).values(data);
  },

  async createSession(data: {
    userId: string;
    expiresAt: Date;
  }): Promise<Session> {
    const [row] = await db.insert(sessionsTable).values(data).returning();
    if (is.undefined(row)) {
      throw new Error("Failed to create session");
    }
    return row;
  },

  async getSessionById(id: string): Promise<Session | null> {
    const [row] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .limit(1);
    return row ?? null;
  },

  async deleteSession(id: string): Promise<boolean> {
    const rows = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, id))
      .returning({ id: sessionsTable.id });
    return rows.length > 0;
  },

  async deleteAllUserSessions(userId: string): Promise<number> {
    const rows = await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.userId, userId))
      .returning({ id: sessionsTable.id });
    return rows.length;
  },

  async deleteExpiredSessions(): Promise<number> {
    const rows = await db
      .delete(sessionsTable)
      .where(lt(sessionsTable.expiresAt, new Date()))
      .returning({ id: sessionsTable.id });
    return rows.length;
  },

  // ─── Admin Permissions ──────────────────────────────────────────────────────

  async getUserAdminPermissions(userId: string): Promise<AdminPermission[]> {
    const rows = await db
      .select({ permission: userAdminPermissionsTable.permission })
      .from(userAdminPermissionsTable)
      .where(eq(userAdminPermissionsTable.userId, userId));
    return rows.map((r) => r.permission as AdminPermission);
  },

  async setUserAdminPermissions(
    userId: string,
    permissions: AdminPermission[],
    grantedBy: string,
  ): Promise<void> {
    await db
      .delete(userAdminPermissionsTable)
      .where(eq(userAdminPermissionsTable.userId, userId));

    if (permissions.length > 0) {
      await db.insert(userAdminPermissionsTable).values(
        permissions.map((permission) => ({
          userId,
          permission,
          grantedBy,
        })),
      );
    }
  },

  async deleteUserAdminPermissions(userId: string): Promise<void> {
    await db
      .delete(userAdminPermissionsTable)
      .where(eq(userAdminPermissionsTable.userId, userId));
  },
};

export type { UserAdminPermission };
export { authRepo };
