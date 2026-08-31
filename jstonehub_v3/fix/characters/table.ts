import { createId } from "@packages/utils/id";
import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { secretVoicerProjectTable } from "../projects/table";

export const secretVoicerCharacterTable = pgTable(
  "secret_voicer_characters",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),
    projectId: text("project_id")
      .references(() => secretVoicerProjectTable.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    voiceId: text("voice_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("unique_project_voice").on(table.projectId, table.voiceId),
    unique("unique_project_character_name").on(table.projectId, table.name),
  ],
);
