import { createId } from "@packages/util/id";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { userTable } from "#api/shared/db/schema/user.table";

const sessionTable = pgTable(
  "session",
  {
    id: text("id").primaryKey().$defaultFn(createId),

    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    // SHA-256 hash of refresh token — raw token never stored in DB
    token: text("token").notNull(),

    // User agent on last activity — updated on refresh rotation
    userAgent: text("user_agent").notNull().default("unknown"),

    // IP address on last activity — updated on refresh rotation
    ipAddress: text("ip_address").notNull().default("unknown"),

    // Original UA at session creation — baseline for fingerprint detection
    createdUserAgent: text("created_user_agent").notNull().default("unknown"),

    // Original IP at session creation — baseline for fingerprint detection
    createdIpAddress: text("created_ip_address").notNull().default("unknown"),

    // Soft security flag: raised when UA or IP changes significantly
    // Shown to user in UI (never auto-blocks)
    isSuspicious: boolean("is_suspicious").notNull().default(false),

    // Last time session was used for refresh — drives sliding idle window
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Idle timeout — extended to (lastActiveAt + 7 days) on each refresh
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    // Absolute timeout — hard limit (createdAt + 14 days), never extended
    absoluteExpiresAt: timestamp("absolute_expires_at", {
      withTimezone: true,
    }).notNull(),

    // Set when session is rotated — not physically deleted immediately
    // If refresh comes in with revoked token -> REUSE ATTACK
    // Cleaned up by cron after 24h retention window
    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // Token hash lookup — O(log n)
    // Used by: findActive.byTokenHash, detectReuse.byTokenHash
    // Without index: O(n) full scan on every refresh
    uniqueIndex("session_token_idx").on(table.token),

    // User's sessions lookup — O(log n + k)
    // Used by: findActive.allByUserId, countByUserId, delete.allByUserId
    // Without index: O(n) full table scan
    index("session_user_id_idx").on(table.userId),

    // Oldest session lookup when enforcing limit — O(log n + limit)
    // Used by: _enforceSessionLimit (ORDER BY last_active_at ASC LIMIT N)
    // Without composite: O(k log k) in-memory sort
    index("session_user_id_last_active_at_idx").on(
      table.userId,
      table.lastActiveAt,
    ),

    // Suspicious-first UI ordering — O(log n + k) sorted scan
    // Used by: findActive.allByUserIdSuspiciousFirst
    // Without composite: sort in app code after fetch (O(k log k))
    index("session_user_id_suspicious_last_active_idx").on(
      table.userId,
      table.isSuspicious,
      table.lastActiveAt,
    ),

    // Expired sessions range scan — O(log n + k)
    // Used by: delete.allExpiredAndStale (cron at 03:00 UTC)
    // Without index: O(n) full scan every cron run
    index("session_expires_at_idx").on(table.expiresAt),

    // Absolute-expired range scan — O(log n + k)
    // Used by: delete.allExpiredAndStale (cron)
    // Without index: O(n) full scan
    index("session_absolute_expires_at_idx").on(table.absoluteExpiresAt),

    // Revoked-retention cleanup — O(log n + k)
    // Used by: delete.allExpiredAndStale (cron removes revoked after 24h)
    // Without index: O(n) full scan
    index("session_revoked_at_idx").on(table.revokedAt),
  ],
);

export { sessionTable };
