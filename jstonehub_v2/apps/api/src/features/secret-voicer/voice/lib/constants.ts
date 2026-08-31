// apps/api/src/features/secret-voicer/voice/lib/constants.ts

export const VOICE_SYNC_INTERVAL_HOURS = 5;
export const VOICE_SYNC_CRON = `0 */${VOICE_SYNC_INTERVAL_HOURS} * * *`;

export const VOICE_SYNC_LOG_RETENTION_DAYS = 7;

export const EXTERNAL_VOICES_API_URL = "https://secret-voicer.ru/api/voices/";

// Fields that should NOT trigger changelog (too noisy)
export const IGNORED_EXTERNAL_FIELDS = ["usage_count"] as const;

// Fields that are critical - if changed/removed, block synthesis
export const CRITICAL_EXTERNAL_FIELDS = ["voice_id"] as const;

export const VOICE_RATING_MIN = 1;
export const VOICE_RATING_MAX = 10;
export const VOICE_RATING_DEFAULT = 5;

// Development mode - use mock data if external API fails or no credentials
export const USE_MOCK_DATA_ON_ERROR = true;
