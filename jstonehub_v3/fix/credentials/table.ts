// import { createId } from "@packages/utils/id";
// import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
// import { browserFingerprintTable } from "#api/features/browser-fingerprint/table";

// export const secretVoicerCredentialTable = pgTable(
//   "secret_voicer_credentials",
//   {
//     id: text("id")
//       .primaryKey()
//       .$defaultFn(() => createId())
//       .notNull(),
//     fingerprintId: text("fingerprint_id")
//       .references(() => browserFingerprintTable.id)
//       .notNull(),
//     name: text("name").notNull().unique(),
//     csrfToken: text("csrf_token").notNull(),
//     sessionId: text("session_id").notNull(),
//     isActive: boolean("is_active").default(true).notNull(),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     updatedAt: timestamp("updated_at")
//       .defaultNow()
//       .$onUpdate(() => new Date())
//       .notNull(),
//   },
// );

export const FIX_THIS_FILE_LATER = 123;
