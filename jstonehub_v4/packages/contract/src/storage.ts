export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export const STORAGE_BUCKETS = ["jstonehub"] as const;

export const STORAGE_PREFIXES = {
  audioProcessingInput: (jobId: string) =>
    `tmp/audio-processing/${jobId}/input/`,
  audioProcessingOutput: (jobId: string) =>
    `tmp/audio-processing/${jobId}/output/`,
  audioProcessingJob: (jobId: string) => `tmp/audio-processing/${jobId}/`,
  ttsOutput: (projectId: string) => `tmp/tts/${projectId}/`,
  voicePreview: (voiceId: string) => `cache/voice-preview/${voiceId}/`,
  jokeAudio: (jokeId: string) => `content/joke/${jokeId}/audio/`,
} as const;
