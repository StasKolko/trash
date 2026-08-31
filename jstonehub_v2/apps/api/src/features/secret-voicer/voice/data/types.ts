import type {
  secretVoicerVoiceSyncEventTable,
  secretVoicerVoiceSyncStateTable,
  secretVoicerVoiceTable,
} from "./table";

// === Voice ===

export type SecretVoicerVoice = typeof secretVoicerVoiceTable.$inferSelect;
export type NewSecretVoicerVoice = typeof secretVoicerVoiceTable.$inferInsert;
export type UpdateSecretVoicerVoice = Partial<
  Pick<
    NewSecretVoicerVoice,
    "emotionSupport" | "testedLanguages" | "rating" | "notes" | "isHidden"
  >
>;

// === Sync Event ===

export type SecretVoicerVoiceSyncEvent =
  typeof secretVoicerVoiceSyncEventTable.$inferSelect;
export type NewSecretVoicerVoiceSyncEvent =
  typeof secretVoicerVoiceSyncEventTable.$inferInsert;

// === Sync State ===

export type SecretVoicerVoiceSyncState =
  typeof secretVoicerVoiceSyncStateTable.$inferSelect;

// === External API Response ===

export type ExternalVoice = {
  id: number;
  voice_id: string;
  name: string;
  gender: "MALE" | "FEMALE";
  locale: string | null;
  is_multilingual: boolean;
  preview_url: string | null;
  preview_url_emotional: string | null;
  usage_count: number;
  avatar_url: string | null;
  description: string | null;
  accent: string | null;
  age_group: string | null;
  voice_style_tags: string[];
  use_cases: string[];
};

export type ExternalVoicesResponse = {
  grouped_voices: {
    category: string;
    voices: ExternalVoice[];
  }[];
};
