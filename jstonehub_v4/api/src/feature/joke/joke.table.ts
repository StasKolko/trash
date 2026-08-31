import { createId } from "@packages/util/id";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { languagesTable } from "#api/feature/language/language.table";
import { tagsTable } from "#api/feature/tag/tag.table";

export const jokeStatusEnum = pgEnum("joke_status", [
  "draft",
  "review",
  "approved",
]);

export const jokeTranslationStatusEnum = pgEnum("joke_translation_status", [
  "draft",
  "approved",
]);

export const jokesTable = pgTable("jokes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  originalLanguageCode: text("original_language_code")
    .references(() => languagesTable.code)
    .notNull(),
  status: jokeStatusEnum("status").notNull().default("draft"),
  hasExplicitContent: boolean("has_explicit_content").notNull().default(false),
  humorRating: integer("humor_rating"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jokeTranslationsTable = pgTable(
  "joke_translations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    jokeId: text("joke_id")
      .references(() => jokesTable.id, { onDelete: "cascade" })
      .notNull(),
    languageCode: text("language_code")
      .references(() => languagesTable.code)
      .notNull(),
    segments: jsonb("segments")
      .notNull()
      .$type<{ role: string; text: string }[]>(),
    plainText: text("plain_text").notNull(),
    uniquenessHash: text("uniqueness_hash").notNull(),
    status: jokeTranslationStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("unique_joke_language").on(table.jokeId, table.languageCode),
  ],
);

export const jokeAudiosTable = pgTable("joke_audios", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  jokeTranslationId: text("joke_translation_id")
    .references(() => jokeTranslationsTable.id, { onDelete: "cascade" })
    .notNull(),
  isPlatformDefault: boolean("is_platform_default").notNull().default(false),
  voiceConfig: jsonb("voice_config").notNull().$type<Record<string, string>>(),
  fileKey: text("file_key").notNull(),
  durationMs: integer("duration_ms").notNull(),
  transcription: jsonb("transcription").$type<
    { start: number; end: number; text: string }[] | null
  >(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const jokeTagsTable = pgTable(
  "joke_tags",
  {
    jokeId: text("joke_id")
      .references(() => jokesTable.id, { onDelete: "cascade" })
      .notNull(),
    tagId: text("tag_id")
      .references(() => tagsTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [unique("unique_joke_tag").on(table.jokeId, table.tagId)],
);

export const contentUsagesTable = pgTable(
  "content_usages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    channelIdentifier: text("channel_identifier").notNull(),
    contentId: text("content_id").notNull(),
    contentType: text("content_type").notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("unique_channel_content").on(
      table.channelIdentifier,
      table.contentId,
      table.contentType,
    ),
  ],
);
