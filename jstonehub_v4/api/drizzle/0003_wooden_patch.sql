CREATE TYPE "public"."joke_status" AS ENUM('draft', 'review', 'approved');--> statement-breakpoint
CREATE TYPE "public"."joke_translation_status" AS ENUM('draft', 'approved');--> statement-breakpoint
CREATE TABLE "content_usages" (
	"id" text PRIMARY KEY NOT NULL,
	"channel_identifier" text NOT NULL,
	"content_id" text NOT NULL,
	"content_type" text NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_channel_content" UNIQUE("channel_identifier","content_id","content_type")
);
--> statement-breakpoint
CREATE TABLE "joke_audios" (
	"id" text PRIMARY KEY NOT NULL,
	"joke_translation_id" text NOT NULL,
	"is_platform_default" boolean DEFAULT false NOT NULL,
	"voice_config" jsonb NOT NULL,
	"file_key" text NOT NULL,
	"duration_ms" integer NOT NULL,
	"transcription" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "joke_tags" (
	"joke_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "unique_joke_tag" UNIQUE("joke_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "joke_translations" (
	"id" text PRIMARY KEY NOT NULL,
	"joke_id" text NOT NULL,
	"language_code" text NOT NULL,
	"segments" jsonb NOT NULL,
	"plain_text" text NOT NULL,
	"uniqueness_hash" text NOT NULL,
	"status" "joke_translation_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_joke_language" UNIQUE("joke_id","language_code")
);
--> statement-breakpoint
CREATE TABLE "jokes" (
	"id" text PRIMARY KEY NOT NULL,
	"original_language_code" text NOT NULL,
	"status" "joke_status" DEFAULT 'draft' NOT NULL,
	"has_explicit_content" boolean DEFAULT false NOT NULL,
	"humor_rating" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "languages_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "joke_audios" ADD CONSTRAINT "joke_audios_joke_translation_id_joke_translations_id_fk" FOREIGN KEY ("joke_translation_id") REFERENCES "public"."joke_translations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "joke_tags" ADD CONSTRAINT "joke_tags_joke_id_jokes_id_fk" FOREIGN KEY ("joke_id") REFERENCES "public"."jokes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "joke_tags" ADD CONSTRAINT "joke_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "joke_translations" ADD CONSTRAINT "joke_translations_joke_id_jokes_id_fk" FOREIGN KEY ("joke_id") REFERENCES "public"."jokes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "joke_translations" ADD CONSTRAINT "joke_translations_language_code_languages_code_fk" FOREIGN KEY ("language_code") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jokes" ADD CONSTRAINT "jokes_original_language_code_languages_code_fk" FOREIGN KEY ("original_language_code") REFERENCES "public"."languages"("code") ON DELETE no action ON UPDATE no action;