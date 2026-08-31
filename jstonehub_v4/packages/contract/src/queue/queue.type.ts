import type { AudioProcessingConfig } from "../audio-processing";
import type { QUEUE_NAMES } from "./queue.constant";

export type QueueName = (typeof QUEUE_NAMES)[number];

export type PingJobData = {
  message: string;
  timestamp: number;
};

export type PingJobResult = {
  echo: string;
  processedAt: number;
  workerUptime: number;
};

export type AudioProcessingJobData = {
  jobId: string;
  config: AudioProcessingConfig;
  inputKeys: string[];
  outputPrefix: string;
  outputName: string;
  isConcatenated: boolean;
};

export type AudioProcessingOutputFile = {
  key: string;
  fileName: string;
  sizeBytes: number;
  durationMs: number;
};

export type AudioProcessingJobResult = {
  outputKeys: string[];
  outputFiles: AudioProcessingOutputFile[];
  processedCount: number;
  totalDurationMs: number;
  processedAt: number;
};

export type TtsJobData = {
  jobId: string;
  taskId: number;
  voiceId: string;
  text: string;
  rate: number;
  outputKey: string;
  credentials: TtsCredentials;
};

export type TtsCredentials = {
  csrfToken: string;
  sessionId: string;
  userAgent: string;
  acceptLanguage: string;
};

export type TtsJobResult = {
  outputKey: string;
  sizeBytes: number;
  durationMs: number;
  processedAt: number;
};

export type QueueJobDataMap = {
  ping: PingJobData;
  tts: TtsJobData;
  "audio-processing": AudioProcessingJobData;
  transcription: Record<string, unknown>;
  "video-compose": Record<string, unknown>;
  "media-download": Record<string, unknown>;
};

export type QueueJobResultMap = {
  ping: PingJobResult;
  tts: TtsJobResult;
  "audio-processing": AudioProcessingJobResult;
  transcription: Record<string, unknown>;
  "video-compose": Record<string, unknown>;
  "media-download": Record<string, unknown>;
};
