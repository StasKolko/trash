import type { RecordEventInput, SecuritySeverity } from "./security.type";

import { and, desc, eq, lt, sql } from "drizzle-orm";

import { db } from "#api/shared/db/instance";
import { securityEventTable } from "#api/shared/db/schema/security-event.table";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

const SECURITY_EVENT_RETENTION_DAYS = 90;
const SECURITY_EVENT_RETENTION_MS = SECURITY_EVENT_RETENTION_DAYS * MS_PER_DAY;

const securityRepository = {
  async insert(input: RecordEventInput) {
    await db.insert(securityEventTable).values({
      userId: input.userId,
      sessionId: input.sessionId,
      eventType: input.eventType,
      severity: input.severity,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata ?? null,
    });
  },

  findByUserId(params: {
    userId: string;
    limit: number;
    beforeCreatedAt?: Date;
    severity?: SecuritySeverity;
  }) {
    const conditions = [eq(securityEventTable.userId, params.userId)];

    if (params.beforeCreatedAt) {
      conditions.push(lt(securityEventTable.createdAt, params.beforeCreatedAt));
    }

    if (params.severity) {
      conditions.push(eq(securityEventTable.severity, params.severity));
    }

    return db
      .select()
      .from(securityEventTable)
      .where(and(...conditions))
      .orderBy(desc(securityEventTable.createdAt))
      .limit(params.limit + 1);
  },

  async countByUserId(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(securityEventTable)
      .where(eq(securityEventTable.userId, userId));

    return result[0]?.count ?? 0;
  },

  async deleteOld(): Promise<number> {
    const cutoff = new Date(Date.now() - SECURITY_EVENT_RETENTION_MS);

    const deleted = await db
      .delete(securityEventTable)
      .where(lt(securityEventTable.createdAt, cutoff))
      .returning({ id: securityEventTable.id });

    return deleted.length;
  },
} as const;

export { SECURITY_EVENT_RETENTION_MS, securityRepository };
