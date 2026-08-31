import { createId } from "@packages/util/id";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { userTable } from "#api/shared/db/schema/user.table";

const auditLogTable = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    actorId: text("actor_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "set null" }),
    targetId: text("target_id"),
    targetType: text("target_type"),
    action: text("action").notNull(),
    reason: text("reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_log_actor_id_created_at_idx").on(
      table.actorId,
      table.createdAt,
    ),

    index("audit_log_target_id_target_type_created_at_idx").on(
      table.targetId,
      table.targetType,
      table.createdAt,
    ),

    index("audit_log_action_created_at_idx").on(table.action, table.createdAt),

    index("audit_log_created_at_idx").on(table.createdAt),
  ],
);

export { auditLogTable };
