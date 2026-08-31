const MS_IN_SECOND = 1000;
const PART_INDEX_PAD_LENGTH = 4;
const FFMPEG_TIMEOUT_MS = 300_000;

const DB_BASE = 10;
const DB_DIVISOR = 20;
const DB_PRECISION = 6;

const LIMITER_ATTACK = 5;
const LIMITER_RELEASE = 50;
const LOUDNORM_LRA = 11;

// Each voiced segment is extended by this amount on both sides
// before trimming, creating overlap for clean crossfade splicing.
const SEGMENT_OVERLAP_SEC = 0.004;

// Crossfade duration for splicing voiced segments.
// Equals 2x overlap so the extended edges fully overlap.
const SPLICE_CROSSFADE_SEC = 0.008;

const LOUDNORM_FALLBACK = {
  inputI: "-24.0",
  inputTp: "-2.0",
  inputLra: "7.0",
  inputThresh: "-34.0",
  targetOffset: "0.0",
} as const;

const SUPPORTED_EXTENSIONS = new Set([
  ".mp3",
  ".wav",
  ".ogg",
  ".flac",
  ".m4a",
  ".aac",
  ".wma",
  ".opus",
]);

const LOUDNORM_JSON_REGEX = /\{[\s\S]*"input_i"[\s\S]*\}/;

export {
  DB_BASE,
  DB_DIVISOR,
  DB_PRECISION,
  FFMPEG_TIMEOUT_MS,
  LIMITER_ATTACK,
  LIMITER_RELEASE,
  LOUDNORM_FALLBACK,
  LOUDNORM_JSON_REGEX,
  LOUDNORM_LRA,
  MS_IN_SECOND,
  PART_INDEX_PAD_LENGTH,
  SEGMENT_OVERLAP_SEC,
  SPLICE_CROSSFADE_SEC,
  SUPPORTED_EXTENSIONS,
};
