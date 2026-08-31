import { is } from "@packages/util/guard";
import { and, asc, eq, gt, inArray, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { sessionTable } from "#api/shared/db/schema/session.table";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

const SESSION_IDLE_LIFETIME_DAYS = 7;
const SESSION_ABSOLUTE_LIFETIME_DAYS = 14;
const SESSION_REVOKED_RETENTION_DAYS = 1;

const SESSION_IDLE_LIFETIME_MS = SESSION_IDLE_LIFETIME_DAYS * MS_PER_DAY;
const SESSION_ABSOLUTE_LIFETIME_MS =
  SESSION_ABSOLUTE_LIFETIME_DAYS * MS_PER_DAY;
const SESSION_REVOKED_RETENTION_MS =
  SESSION_REVOKED_RETENTION_DAYS * MS_PER_DAY;

const MAX_SESSIONS_PER_USER = 10;

const sessionRepository = {
  findActive: {
    allByUserId(userId: string) {
      const now = new Date();

      return db
        .select()
        .from(sessionTable)
        .where(_buildActiveCondition(userId, now));
    },

    allByUserIdSuspiciousFirst(userId: string) {
      const now = new Date();

      return db
        .select()
        .from(sessionTable)
        .where(_buildActiveCondition(userId, now))
        .orderBy(
          sql`${sessionTable.isSuspicious} DESC`,
          sql`${sessionTable.lastActiveAt} DESC`,
        );
    },

    async byTokenHash(tokenHash: string) {
      const now = new Date();

      const [session] = await db
        .select()
        .from(sessionTable)
        .where(
          and(
            eq(sessionTable.token, tokenHash),
            isNull(sessionTable.revokedAt),
            gt(sessionTable.expiresAt, now),
            gt(sessionTable.absoluteExpiresAt, now),
          ),
        );

      if (is.undefined(session)) {
        return null;
      }

      return session;
    },

    async countByUserId(userId: string): Promise<number> {
      const now = new Date();

      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(sessionTable)
        .where(_buildActiveCondition(userId, now));

      return result[0]?.count ?? 0;
    },
  },

  detectReuse: {
    async byTokenHash(tokenHash: string) {
      const [session] = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.token, tokenHash));

      if (is.undefined(session)) {
        return null;
      }

      if (session.revokedAt) {
        return session;
      }

      return null;
    },
  },

  create: {
    async one(params: {
      userId: string;
      tokenHash: string;
      userAgent: string;
      ipAddress: string;
    }) {
      const removedOldestId = await _enforceSessionLimit(params.userId);

      const now = new Date();
      const idleExpiresAt = new Date(now.getTime() + SESSION_IDLE_LIFETIME_MS);
      const absoluteExpiresAt = new Date(
        now.getTime() + SESSION_ABSOLUTE_LIFETIME_MS,
      );

      const [session] = await db
        .insert(sessionTable)
        .values({
          userId: params.userId,
          token: params.tokenHash,
          userAgent: params.userAgent,
          ipAddress: params.ipAddress,
          createdUserAgent: params.userAgent,
          createdIpAddress: params.ipAddress,
          expiresAt: idleExpiresAt,
          absoluteExpiresAt,
        })
        .returning({ id: sessionTable.id });

      return { sessionId: session?.id ?? null, removedOldestId };
    },
  },

  update: {
    async markRevoked(sessionId: string) {
      const now = new Date();

      await db
        .update(sessionTable)
        .set({ revokedAt: now, updatedAt: now })
        .where(eq(sessionTable.id, sessionId));
    },

    async markSuspicious(sessionId: string) {
      const now = new Date();

      await db
        .update(sessionTable)
        .set({ isSuspicious: true, updatedAt: now })
        .where(eq(sessionTable.id, sessionId));
    },
  },

  delete: {
    async allByUserId(userId: string): Promise<number> {
      const deleted = await db
        .delete(sessionTable)
        .where(eq(sessionTable.userId, userId))
        .returning({ id: sessionTable.id });

      return deleted.length;
    },

    async byId(sessionId: string): Promise<boolean> {
      const deleted = await db
        .delete(sessionTable)
        .where(eq(sessionTable.id, sessionId))
        .returning({ id: sessionTable.id });

      return deleted.length > 0;
    },

    async byIdAndUserId(params: {
      sessionId: string;
      userId: string;
    }): Promise<boolean> {
      const deleted = await db
        .delete(sessionTable)
        .where(
          and(
            eq(sessionTable.id, params.sessionId),
            eq(sessionTable.userId, params.userId),
          ),
        )
        .returning({ id: sessionTable.id });

      return deleted.length > 0;
    },

    async byTokenHash(tokenHash: string): Promise<boolean> {
      const deleted = await db
        .delete(sessionTable)
        .where(eq(sessionTable.token, tokenHash))
        .returning({ id: sessionTable.id });

      return deleted.length > 0;
    },

    async allExpiredAndStale(): Promise<number> {
      const now = new Date();
      const revokedCutoff = new Date(
        now.getTime() - SESSION_REVOKED_RETENTION_MS,
      );

      const deleted = await db
        .delete(sessionTable)
        .where(
          or(
            lt(sessionTable.expiresAt, now),
            lt(sessionTable.absoluteExpiresAt, now),
            and(
              sql`${sessionTable.revokedAt} IS NOT NULL`,
              lt(sessionTable.revokedAt, revokedCutoff),
            ),
          ),
        )
        .returning({ id: sessionTable.id });

      return deleted.length;
    },
  },
} as const;

function _buildActiveCondition(userId: string, now: Date) {
  return and(
    eq(sessionTable.userId, userId),
    isNull(sessionTable.revokedAt),
    gt(sessionTable.expiresAt, now),
    gt(sessionTable.absoluteExpiresAt, now),
  );
}

async function _enforceSessionLimit(userId: string): Promise<string | null> {
  const activeCount = await sessionRepository.findActive.countByUserId(userId);

  if (activeCount < MAX_SESSIONS_PER_USER) {
    return null;
  }

  const sessionsToRemove = activeCount - MAX_SESSIONS_PER_USER + 1;
  const now = new Date();

  const oldestSessions = await db
    .select({ id: sessionTable.id })
    .from(sessionTable)
    .where(_buildActiveCondition(userId, now))
    .orderBy(asc(sessionTable.lastActiveAt))
    .limit(sessionsToRemove);

  const idsToDelete = oldestSessions.map((s) => s.id);

  if (idsToDelete.length === 0) {
    return null;
  }

  await db.delete(sessionTable).where(inArray(sessionTable.id, idsToDelete));

  return idsToDelete[0] ?? null;
}

export {
  MAX_SESSIONS_PER_USER,
  SESSION_ABSOLUTE_LIFETIME_MS,
  SESSION_IDLE_LIFETIME_MS,
  SESSION_REVOKED_RETENTION_MS,
  sessionRepository,
};
