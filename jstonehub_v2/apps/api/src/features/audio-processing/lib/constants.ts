export const AUDIO_PROCESSING_CONSTANTS = {
  // Storage paths
  UPLOADS_PATH: "storage/audio-processing/uploads",
  PROCESSED_PATH: "storage/audio-processing/processed",

  // Limits
  MAX_FILE_SIZE_MB: 500,
  MAX_TOTAL_SIZE_MB: 2000,
  MAX_FILES_COUNT: 100,

  // Cache
  CACHE_RETENTION_DAYS: 7,

  // Processing defaults
  DEFAULT_SILENCE_THRESHOLD: -40, // dB
  DEFAULT_MIN_SILENCE_DURATION: 0.5, // seconds
  DEFAULT_PAUSE_BETWEEN_CHUNKS: 0.3, // seconds
  DEFAULT_PAUSE_BETWEEN_FILES: 1.0, // seconds
  DEFAULT_PAUSE_AT_START: 0.5, // seconds
  DEFAULT_PAUSE_AT_END: 0.5, // seconds
  DEFAULT_OUTPUT_FORMAT: "mp3" as const,

  // Supported formats
  SUPPORTED_INPUT_FORMATS: ["mp3", "wav"] as const,
  SUPPORTED_OUTPUT_FORMATS: ["mp3", "wav"] as const,
} as const;
