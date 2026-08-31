import { audioProcessingContract } from "@packages/contracts/audio-processing";
import { createId } from "@packages/utils/id";
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { ProcessingSettings } from "./types";

export const processedAudioStatusEnum = pgEnum(
  "processed_audio_status",
  audioProcessingContract.status.values() as [string, ...string[]],
);

export const processedAudioTable = pgTable("processed_audio_cache", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  // Source identification
  sourceType: text("source_type").notNull(), // "synthesis" | "upload"
  sourceProjectId: text("source_project_id"),
  sourceFilesHash: text("source_files_hash"),

  // Processing settings
  settings: jsonb("settings").$type<ProcessingSettings>().notNull(),

  // Status
  status: processedAudioStatusEnum("status").default("PENDING").notNull(),
  progress: integer("progress").default(0).notNull(),
  error: text("error"),

  // Output
  outputPath: text("output_path"),
  outputSize: integer("output_size"),
  outputDuration: real("output_duration"),

  // Cache management
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
