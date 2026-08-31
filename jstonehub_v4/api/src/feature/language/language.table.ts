import { createId } from "@packages/util/id";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const languagesTable = pgTable("languages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
