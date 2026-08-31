import type { processedAudioTable } from "./table";

export type ProcessedAudio = typeof processedAudioTable.$inferSelect;
export type NewProcessedAudio = typeof processedAudioTable.$inferInsert;
export type UpdateProcessedAudio = Partial<
  Omit<NewProcessedAudio, "id" | "createdAt">
>;

export type ProcessingSettings = {
  silenceThreshold: number;
  minSilenceDuration: number;
  pauseBetweenChunks: number;
  pauseBetweenFiles: number;
  pauseAtStart: number;
  pauseAtEnd: number;
  outputFormat: "mp3" | "wav";
};

export type ProcessingJobStatus = ProcessedAudio["status"];

export type ProcessingJobResponse = {
  id: string;
  status: ProcessingJobStatus;
  progress: number;
  error: string | null;
  outputPath: string | null;
  outputSize: number | null;
  outputDuration: number | null;
};
