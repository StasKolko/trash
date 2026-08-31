export type VoiceGender = (typeof VOICE_GENDERS)[number];
export type SecretVoicerVoicesResponse = {
  voices: SecretVoicerVoice[];
};
export type SecretVoicerVoice = {
  voiceId: string;
  name: string;
  gender: VoiceGender;
  locale: string | null;
  isMultilingual: boolean;
  previewUrl: string | null;
  previewUrlEmotional: string | null;
  usageCount: number;
  avatarUrl: string | null;
  description: string | null;
  accent: string | null;
  ageGroup: string | null;
  voiceStyleTags: string[];
  useCases: string[];
};

export const VOICE_GENDERS = ["MALE", "FEMALE"] as const;
export const SECRET_VOICER_CACHE_TTL_MS = 3_600_000;
export const SECRET_VOICER_BASE_URL = "https://secret-voicer.ru";
export const SECRET_VOICER_API_URL = `${SECRET_VOICER_BASE_URL}/api`;
