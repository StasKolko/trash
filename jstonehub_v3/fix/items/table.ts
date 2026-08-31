import { createId } from "@packages/utils/id";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { secretVoicerCharacterTable } from "../characters/table";
import { secretVoicerProjectTable } from "../projects/table";

export const itemStatusEnum = pgEnum("secret_voicer_item_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "comparing",
]);

export const secretVoicerItemTable = pgTable("secret_voicer_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  projectId: text("project_id")
    .references(() => secretVoicerProjectTable.id, { onDelete: "cascade" })
    .notNull(),
  characterId: text("character_id")
    .references(() => secretVoicerCharacterTable.id, { onDelete: "cascade" })
    .notNull(),
  orderIndex: integer("order_index").notNull(),
  text: text("text").notNull(),
  status: itemStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
