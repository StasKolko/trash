import { createId } from "@packages/util/id";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const ttsProjectStatusEnum = pgEnum("tts_project_status", [
  "pending",
  "processing",
  "completed",
  "partial",
  "failed",
]);

export const ttsSegmentStatusEnum = pgEnum("tts_segment_status", [
  "pending",
  "queued",
  "processing",
  "completed",
  "failed",
]);

export const ttsProjectsTable = pgTable("tts_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  status: ttsProjectStatusEnum("status").notNull().default("pending"),
  audioProcessingEnabled: integer("audio_processing_enabled")
    .notNull()
    .default(1),
  audioProcessingConcatenate: integer("audio_processing_concatenate")
    .notNull()
    .default(1),
  audioProcessingConfig: jsonb("audio_processing_config").default({}),
  audioProcessingJobId: text("audio_processing_job_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const ttsSegmentsTable = pgTable("tts_segments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  projectId: text("project_id")
    .references(() => ttsProjectsTable.id, { onDelete: "cascade" })
    .notNull(),
  index: integer("index").notNull(),
  role: text("role").notNull(),
  text: text("text").notNull(),
  voiceId: text("voice_id").notNull(),
  status: ttsSegmentStatusEnum("status").notNull().default("pending"),
  externalTaskId: integer("external_task_id"),
  bullJobId: text("bull_job_id"),
  outputKey: text("output_key"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
