import { createId } from "@packages/utils/id";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { secretVoicerItemTable } from "../items/table";

export const versionTypeEnum = pgEnum("secret_voicer_version_type", [
  "current",
  "candidate",
]);

export const externalStatusEnum = pgEnum("secret_voicer_external_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const secretVoicerVersionTable = pgTable("secret_voicer_versions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),
  itemId: text("item_id")
    .references(() => secretVoicerItemTable.id, { onDelete: "cascade" })
    .notNull(),

  externalTaskId: integer("external_task_id"),
  externalStatus: externalStatusEnum("external_status")
    .default("pending")
    .notNull(),
  externalError: text("external_error"),
  externalAudioUrl: text("external_audio_url"),

  minioKey: text("minio_key"),
  minioUrl: text("minio_url"),
  minioUrlExpiresAt: timestamp("minio_url_expires_at"),

  versionType: versionTypeEnum("version_type").default("current").notNull(),

  retryCount: integer("retry_count").default(0).notNull(),
  lastRetryAt: timestamp("last_retry_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
