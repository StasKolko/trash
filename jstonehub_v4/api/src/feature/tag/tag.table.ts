import { createId } from "@packages/util/id";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const tagsTable = pgTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
