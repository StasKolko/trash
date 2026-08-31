import { createId } from "@packages/util/id";
import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { jokeTranslationsTable } from "#api/feature/joke/joke.table";

export const jokeTtsPipelineStatusEnum = pgEnum("joke_tts_pipeline_status", [
  "pending",
  "creating_tasks",
  "synthesizing",
  "processing_audio",
  "saving",
  "completed",
  "failed",
]);

export const jokeTtsPipelinesTable = pgTable("joke_tts_pipelines", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  jokeTranslationId: text("joke_translation_id")
    .references(() => jokeTranslationsTable.id, { onDelete: "cascade" })
    .notNull(),
  status: jokeTtsPipelineStatusEnum("status").notNull().default("pending"),
  voiceConfig: jsonb("voice_config").notNull().$type<Record<string, string>>(),
  ttsProjectId: text("tts_project_id"),
  jokeAudioId: text("joke_audio_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
