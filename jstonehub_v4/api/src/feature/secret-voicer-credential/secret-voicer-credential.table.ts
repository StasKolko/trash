import { createId } from "@packages/util/id";
import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { browserFingerprintsTable } from "#api/feature/browser-fingerprint/browser-fingerprint.table";

export const secretVoicerCredentialsTable = pgTable(
  "secret_voicer_credentials",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    fingerprintId: text("fingerprint_id")
      .references(() => browserFingerprintsTable.id, { onDelete: "cascade" })
      .notNull(),
    csrfToken: text("csrf_token").notNull(),
    sessionId: text("session_id").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    lastError: jsonb("last_error").$type<{
      action: string;
      statusCode: number | null;
      message: string;
      responseBody: string | null;
      occurredAt: string;
    } | null>(),
    lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);
