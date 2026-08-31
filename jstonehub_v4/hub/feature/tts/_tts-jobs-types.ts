export type TtsJobSegmentEntry = {
  index: number;
  role: string;
  text: string;
  voiceId: string;
  status: string;
  bullJobId: string | null;
  outputKey: string | null;
  error: string | null;
};

export type TtsJobFileEntry = {
  fileName: string;
  sizeBytes: number;
  durationMs: number;
  downloadUrl: string;
};

export type TtsJobEntry = {
  jobId: string;
  bullJobId: string;
  name: string;
  status: string;
  segments: TtsJobSegmentEntry[];
  audioProcessingJobId: string | null;
  createdAt: string;
  completedAt: string | null;
  outputFiles: TtsJobFileEntry[];
  error: string | null;
};

export const PROCESSING_STATUSES = new Set(["queued", "processing", "pending"]);
export const DONE_STATUSES = new Set(["completed"]);
export const FAILED_STATUSES = new Set(["failed", "error"]);
export const SEGMENT_INDEX_PAD_LENGTH = 4;
