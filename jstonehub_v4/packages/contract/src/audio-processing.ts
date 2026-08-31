// packages/contract/src/audio-processing.ts

export type AudioOutputFormat = (typeof AUDIO_OUTPUT_FORMATS)[number];

export type SilenceRemovalConfig = {
  enabled: boolean;
  thresholdDb: number;
  minDurationMs: number;
  keepGapMs: number;
};

export type NormalizationConfig = {
  enabled: boolean;
  targetLufs: number;
  truePeakDb: number;
};

export type HighPassFilterConfig = {
  enabled: boolean;
  frequencyHz: number;
};

export type LimiterConfig = {
  enabled: boolean;
  limitDb: number;
};

export type FadeConfig = {
  inMs: number;
  outMs: number;
};

export type GapsConfig = {
  innerMs: number;
  betweenMs: number;
  startMs: number;
  endMs: number;
};

export type ConcatenationConfig = {
  enabled: boolean;
};

export type OutputConfig = {
  format: AudioOutputFormat;
  bitrate: string;
  sampleRate: number;
};

export type AudioProcessingConfig = {
  silenceRemoval: SilenceRemovalConfig;
  normalization: NormalizationConfig;
  highPassFilter: HighPassFilterConfig;
  limiter: LimiterConfig;
  fade: FadeConfig;
  gaps: GapsConfig;
  concatenation: ConcatenationConfig;
  output: OutputConfig;
};

export const AUDIO_OUTPUT_FORMATS = ["mp3", "wav", "ogg"] as const;

export const AUDIO_PROCESSING_LIMITS = {
  silenceRemoval: {
    thresholdDb: { min: -60, max: -10 },
    minDurationMs: { min: 50, max: 2000 },
    keepGapMs: { min: 0, max: 1000 },
  },
  normalization: {
    targetLufs: { min: -30, max: -5 },
    truePeakDb: { min: -6, max: 0 },
  },
  highPassFilter: {
    frequencyHz: { min: 20, max: 500 },
  },
  limiter: {
    limitDb: { min: -6, max: 0 },
  },
  fade: {
    inMs: { min: 0, max: 5000 },
    outMs: { min: 0, max: 5000 },
  },
  gaps: {
    innerMs: { min: 0, max: 2000 },
    betweenMs: { min: 0, max: 5000 },
    startMs: { min: 0, max: 5000 },
    endMs: { min: 0, max: 5000 },
  },
  output: {
    sampleRate: { min: 8000, max: 96_000 },
  },
} as const;

export const AUDIO_OUTPUT_BITRATES = [
  "64k",
  "96k",
  "128k",
  "192k",
  "256k",
  "320k",
] as const;

export const AUDIO_PROCESSING_DEFAULTS: AudioProcessingConfig = {
  silenceRemoval: {
    enabled: true,
    thresholdDb: -30,
    minDurationMs: 200,
    keepGapMs: 30,
  },
  normalization: {
    enabled: true,
    targetLufs: -16,
    truePeakDb: -1.5,
  },
  highPassFilter: {
    enabled: true,
    frequencyHz: 80,
  },
  limiter: {
    enabled: true,
    limitDb: -1.0,
  },
  fade: {
    inMs: 0,
    outMs: 0,
  },
  gaps: {
    innerMs: 0,
    betweenMs: 50,
    startMs: 0,
    endMs: 0,
  },
  concatenation: {
    enabled: true,
  },
  output: {
    format: "mp3",
    bitrate: "192k",
    sampleRate: 44_100,
  },
};

export const AUDIO_PROCESSING_UPLOAD_LIMITS = {
  maxFiles: 50,
  maxFileSizeBytes: 100 * 1024 * 1024,
  presignedUrlExpirySeconds: 3600,
  downloadUrlExpirySeconds: 86_400,
} as const;

export const AUDIO_PROCESSING_TTL_MS = 3 * 24 * 60 * 60 * 1000;
export const AUDIO_PROCESSING_CLEANUP_CRON = "0 * * * *";

export const AUDIO_PROCESSING_NAME_LIMITS = {
  min: 1,
  max: 100,
} as const;
