import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { ttsProjectsTable, ttsSegmentsTable } from "./tts-project.table";

export type TtsProject = InferSelectModel<typeof ttsProjectsTable>;
export type TtsProjectInsert = InferInsertModel<typeof ttsProjectsTable>;

export type TtsSegment = InferSelectModel<typeof ttsSegmentsTable>;
export type TtsSegmentInsert = InferInsertModel<typeof ttsSegmentsTable>;

export type TtsProjectStatus =
  | "pending"
  | "processing"
  | "completed"
  | "partial"
  | "failed";

export type TtsSegmentStatus =
  | "pending"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export type TtsProjectWithSegments = TtsProject & {
  segments: TtsSegment[];
};
