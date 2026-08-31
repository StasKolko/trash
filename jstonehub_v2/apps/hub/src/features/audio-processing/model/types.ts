export type ProcessingSettings = {
  silenceThreshold: number;
  minSilenceDuration: number;
  pauseBetweenChunks: number;
  pauseBetweenFiles: number;
  pauseAtStart: number;
  pauseAtEnd: number;
  outputFormat: "mp3" | "wav";
};

export type ProcessingJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type ProcessingJob = {
  id: string;
  status: ProcessingJobStatus;
  progress: number;
  error: string | null;
  outputPath: string | null;
  outputSize: number | null;
  outputDuration: number | null;
  expiresAt: Date;
  createdAt: Date;
};

export type CachedFile = {
  id: string;
  sourceType: string;
  sourceProjectId: string | null;
  status: string;
  outputSize: number | null;
  outputDuration: number | null;
  expiresAt: Date;
  createdAt: Date;
};

export type AudioProcessingState = {
  files: File[];
  settings: ProcessingSettings;
  currentJob: ProcessingJob | null;
  cachedFiles: CachedFile[];
  isProcessing: boolean;
  isLoadingCache: boolean;
  error: string | null;
};
