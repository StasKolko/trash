import { createId } from "@packages/util/id";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { sessionTable } from "#api/shared/db/schema/session.table";
import { userTable } from "#api/shared/db/schema/user.table";

const securityEventTable = pgTable(
  "security_event",
  {
    id: text("id").primaryKey().$defaultFn(createId),

    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    // Session that triggered the event — nullable for user-wide events (ban, etc.)
    sessionId: text("session_id").references(() => sessionTable.id, {
      onDelete: "set null",
    }),

    // Event type identifier: "login_success", "token_reuse_detected", etc.
    eventType: text("event_type").notNull(),

    // Severity for UI coloring and filtering: "info" | "warning" | "critical"
    severity: text("severity").notNull().default("info"),

    // IP address at the moment of event
    ipAddress: text("ip_address").notNull().default("unknown"),

    // User agent at the moment of event
    userAgent: text("user_agent").notNull().default("unknown"),

    // Event-specific context (old vs new IP, permission changes, etc.)
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // User's security feed sorted by recency — O(log n + k)
    // Used by: security.findByUserId (Settings → Security page)
    // Without composite: O(n) full scan + in-memory sort
    index("security_event_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),

    // Filter by severity for UI — O(log n + k)
    // Used by: security.findByUserIdAndSeverity
    // Without composite: filter k rows in app code after fetch
    index("security_event_user_id_severity_created_at_idx").on(
      table.userId,
      table.severity,
      table.createdAt,
    ),

    // Cron retention cleanup — O(log n + k)
    // Used by: security.deleteOld (cron removes events > 90 days)
    // Without index: O(n) full scan
    index("security_event_created_at_idx").on(table.createdAt),

    // Session FK lookup (used by CASCADE resolution)
    index("security_event_session_id_idx").on(table.sessionId),
  ],
);

export { securityEventTable };
