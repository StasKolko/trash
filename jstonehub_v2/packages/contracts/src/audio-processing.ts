import { createContract } from "./utils/create-contract";

export const audioProcessingContract = createContract({
  outputFormat: [
    { value: "mp3", label: "MP3" },
    { value: "wav", label: "WAV" },
  ] as const,

  status: [
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "COMPLETED", label: "Completed" },
    { value: "FAILED", label: "Failed" },
  ] as const,
});

export const AUDIO_PROCESSING_DEFAULTS = {
  silenceThreshold: -40,
  minSilenceDuration: 0.5,
  pauseBetweenChunks: 0.3,
  pauseBetweenFiles: 1.0,
  pauseAtStart: 0.5,
  pauseAtEnd: 0.5,
  outputFormat: "mp3" as const,
  maxFileSizeMb: 500,
  maxTotalSizeMb: 2000,
  cacheRetentionDays: 7,
} as const;
