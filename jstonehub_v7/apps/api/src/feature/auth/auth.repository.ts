import { and, eq, gt, lt } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { authAccountTable } from "#api/shared/db/schema/auth-account.table";
import { authLinkRequestTable } from "#api/shared/db/schema/auth-link-request.table";
import { userTable } from "#api/shared/db/schema/user.table";

const authRepository = {
  findUserByEmail(email: string) {
    return db.query.userTable.findFirst({
      where: eq(userTable.email, email),
    });
  },

  findUserById(userId: string) {
    return db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
    });
  },

  createUser(params: {
    email: string;
    name: string;
    avatarUrl: string | null;
  }) {
    return db
      .insert(userTable)
      .values({
        email: params.email,
        name: params.name,
        avatarUrl: params.avatarUrl,
      })
      .returning()
      .then((rows) => rows[0]);
  },

  updateUserProfile(params: {
    userId: string;
    name: string;
    avatarUrl: string | null;
  }) {
    return db
      .update(userTable)
      .set({
        name: params.name,
        avatarUrl: params.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, params.userId));
  },

  findAuthAccount(params: { provider: string; providerAccountId: string }) {
    return db
      .select()
      .from(authAccountTable)
      .where(
        and(
          eq(authAccountTable.provider, params.provider),
          eq(authAccountTable.providerAccountId, params.providerAccountId),
        ),
      )
      .then((rows) => rows[0] ?? null);
  },

  createAuthAccount(params: {
    userId: string;
    provider: string;
    providerAccountId: string;
  }) {
    return db
      .insert(authAccountTable)
      .values({
        userId: params.userId,
        provider: params.provider,
        providerAccountId: params.providerAccountId,
      })
      .returning()
      .then((rows) => rows[0]);
  },

  createAuthLinkRequest(params: {
    targetUserId: string;
    provider: string;
    providerAccountId: string;
    expiresAt: Date;
  }) {
    return db
      .insert(authLinkRequestTable)
      .values({
        targetUserId: params.targetUserId,
        provider: params.provider,
        providerAccountId: params.providerAccountId,
        expiresAt: params.expiresAt,
      })
      .onConflictDoUpdate({
        target: [
          authLinkRequestTable.provider,
          authLinkRequestTable.providerAccountId,
        ],
        set: {
          targetUserId: params.targetUserId,
          expiresAt: params.expiresAt,
        },
      })
      .returning()
      .then((rows) => rows[0]);
  },

  findAuthLinkRequest(params: { provider: string; providerAccountId: string }) {
    return db
      .select()
      .from(authLinkRequestTable)
      .where(
        and(
          eq(authLinkRequestTable.provider, params.provider),
          eq(authLinkRequestTable.providerAccountId, params.providerAccountId),
          gt(authLinkRequestTable.expiresAt, new Date()),
        ),
      )
      .then((rows) => rows[0] ?? null);
  },

  deleteAuthLinkRequest(id: string) {
    return db
      .delete(authLinkRequestTable)
      .where(eq(authLinkRequestTable.id, id));
  },

  deleteExpiredAuthLinkRequests() {
    return db
      .delete(authLinkRequestTable)
      .where(lt(authLinkRequestTable.expiresAt, new Date()));
  },
};

export { authRepository };
