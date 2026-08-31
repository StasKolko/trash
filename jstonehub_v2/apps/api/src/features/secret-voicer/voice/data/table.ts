import { secretVoicerContract } from "@packages/contracts/secret-voicer";
import { createId } from "@packages/utils/id";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { VOICE_RATING_DEFAULT } from "../lib/constants";

export const voiceGenderEnum = pgEnum(
  "voice_gender",
  secretVoicerContract.voiceGender.values() as [string, ...string[]],
);

export const voiceEmotionSupportEnum = pgEnum(
  "voice_emotion_support",
  secretVoicerContract.voiceEmotionSupport.values() as [string, ...string[]],
);

export const voiceSyncEventTypeEnum = pgEnum(
  "voice_sync_event_type",
  secretVoicerContract.voiceSyncEventType.values() as [string, ...string[]],
);

export const secretVoicerVoiceTable = pgTable("secret_voicer_voices", {
  // === Internal ===
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId())
    .notNull(),

  // === External fields (from API, read-only) ===
  externalId: integer("external_id").notNull(),
  externalVoiceId: text("external_voice_id").notNull().unique(),
  externalName: text("external_name").notNull(),
  externalDescription: text("external_description"),
  externalGender: voiceGenderEnum("external_gender").notNull(),
  externalLocale: text("external_locale"),
  externalPreviewUrl: text("external_preview_url"),
  externalPreviewUrlEmotional: text("external_preview_url_emotional"),
  externalAvatarUrl: text("external_avatar_url"),
  externalAccent: text("external_accent"),
  externalAgeGroup: text("external_age_group"),
  externalIsMultilingual: boolean("external_is_multilingual").default(false),
  externalStyleTags: jsonb("external_style_tags").$type<string[]>().default([]),
  externalUseCases: jsonb("external_use_cases").$type<string[]>().default([]),

  // === Custom fields (editable) ===
  emotionSupport: voiceEmotionSupportEnum("emotion_support")
    .default("none")
    .notNull(),
  testedLanguages: jsonb("tested_languages").$type<string[]>().default([]),
  rating: integer("rating").default(VOICE_RATING_DEFAULT).notNull(),
  notes: text("notes"),
  isHidden: boolean("is_hidden").default(false).notNull(),

  // === Timestamps ===
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// === Sync Events Table (changelog) ===

export const secretVoicerVoiceSyncEventTable = pgTable(
  "secret_voicer_voice_sync_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId())
      .notNull(),

    eventType: voiceSyncEventTypeEnum("event_type").notNull(),
    isCritical: boolean("is_critical").default(false).notNull(),

    // Voice reference (may be null if voice was deleted)
    voiceId: text("voice_id"),
    externalVoiceId: text("external_voice_id"),
    voiceName: text("voice_name"),

    // Change details
    changedFields: jsonb("changed_fields").$type<string[]>(),
    oldValues: jsonb("old_values").$type<Record<string, unknown>>(),
    newValues: jsonb("new_values").$type<Record<string, unknown>>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

// === Sync State Table (singleton) ===

export const secretVoicerVoiceSyncStateTable = pgTable(
  "secret_voicer_voice_sync_state",
  {
    id: text("id").primaryKey().default("main").notNull(),

    isBlocked: boolean("is_blocked").default(false).notNull(),
    blockReason: text("block_reason"),
    blockedAt: timestamp("blocked_at"),

    lastSyncAt: timestamp("last_sync_at"),
    lastSyncSuccess: boolean("last_sync_success"),
    lastSyncError: text("last_sync_error"),

    // Stats from last sync
    lastSyncStats: jsonb("last_sync_stats").$type<{
      totalVoices: number;
      added: number;
      removed: number;
      updated: number;
      unchanged: number;
    }>(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);
