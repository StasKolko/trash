import type { TtsCredentials } from "@packages/contract/queue";

export type VoicePreviewJobData = {
  voiceId: string;
  previewUrl: string;
  outputKey: string;
  credentials: TtsCredentials;
};

export type VoicePreviewJobResult = {
  outputKey: string;
  sizeBytes: number;
  processedAt: number;
};
