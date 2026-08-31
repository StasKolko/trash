import { db } from "#api/shared/db/instance";
import { auditLogTable } from "#api/shared/db/schema/audit.table";

function createAuditLog(params: {
  actorId: string;
  targetId: string | null;
  targetType: string | null;
  action: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
}) {
  return db.insert(auditLogTable).values({
    actorId: params.actorId,
    targetId: params.targetId,
    targetType: params.targetType,
    action: params.action,
    reason: params.reason,
    metadata: params.metadata,
  });
}

export { createAuditLog };
