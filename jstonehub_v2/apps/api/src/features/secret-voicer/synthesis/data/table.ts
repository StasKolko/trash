import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { createId } from "@packages/utils/id";
import {
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// === Enums (из контракта) ===

export const synthesisProjectStatusEnum = pgEnum(
  "synthesis_project_status",
  secretVoicerContract.synthesisProjectStatus.values() as [string, ...string[]],
);

export const synthesisTaskStatusEnum = pgEnum(
  "synthesis_task_status",
  secretVoicerContract.synthesisTaskStatus.values() as [string, ...string[]],
);

// === Projects Table ===

export const synthesisProjectTable = pgTable("synthesis_projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  name: text("name").notNull(),
  status: synthesisProjectStatusEnum("status").default("PENDING").notNull(),

  // Stats
  totalTasks: integer("total_tasks").default(0).notNull(),
  completedTasks: integer("completed_tasks").default(0).notNull(),
  failedTasks: integer("failed_tasks").default(0).notNull(),

  // Storage
  storagePath: text("storage_path"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// === Tasks Table ===

export const synthesisTaskTable = pgTable("synthesis_tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  projectId: text("project_id")
    .references(() => synthesisProjectTable.id, { onDelete: "cascade" })
    .notNull(),

  orderIndex: integer("order_index").notNull(),

  // Input
  text: text("text").notNull(),
  voiceId: text("voice_id").notNull(),
  rate: real("rate").default(1).notNull(),

  // Status
  status: synthesisTaskStatusEnum("status").default("PENDING").notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  error: text("error"),

  // External API
  externalTaskId: text("external_task_id"),
  externalStatus: text("external_status"),

  // Output
  audioUrl: text("audio_url"),
  localFilePath: text("local_file_path"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
