import { createId } from "@packages/utils/id";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("secret_voicer_project_status", [
  "draft",
  "processing",
  "completed",
  "partial",
  "failed",
]);

export const secretVoicerProjectTable = pgTable("secret_voicer_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  name: text("name").notNull(),
  status: projectStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  completedAt: timestamp("completed_at"),
});
