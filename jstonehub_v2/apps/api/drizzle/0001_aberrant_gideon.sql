CREATE TYPE "public"."processed_audio_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."sec_ch_ua_mobile" AS ENUM('?0', '?1');--> statement-breakpoint
CREATE TYPE "public"."sec_ch_ua_platform" AS ENUM('"Windows"', '"macOS"', '"Linux"', '"Android"', '"iOS"', '"Chrome OS"');--> statement-breakpoint
CREATE TYPE "public"."synthesis_project_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED', 'PAUSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."synthesis_task_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."voice_emotion_support" AS ENUM('none', 'basic', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."voice_gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TYPE "public"."voice_sync_event_type" AS ENUM('VOICE_ADDED', 'VOICE_REMOVED', 'VOICE_UPDATED');--> statement-breakpoint
CREATE TABLE "processed_audio_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"source_type" text NOT NULL,
	"source_project_id" text,
	"source_files_hash" text,
	"settings" jsonb NOT NULL,
	"status" "processed_audio_status" DEFAULT 'PENDING' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"error" text,
	"output_path" text,
	"output_size" integer,
	"output_duration" real,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "synthesis_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "synthesis_project_status" DEFAULT 'PENDING' NOT NULL,
	"total_tasks" integer DEFAULT 0 NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	"failed_tasks" integer DEFAULT 0 NOT NULL,
	"storage_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "synthesis_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"order_index" integer NOT NULL,
	"text" text NOT NULL,
	"voice_id" text NOT NULL,
	"rate" real DEFAULT 1 NOT NULL,
	"status" "synthesis_task_status" DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"error" text,
	"external_task_id" text,
	"external_status" text,
	"audio_url" text,
	"local_file_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secret_voicer_voice_sync_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" "voice_sync_event_type" NOT NULL,
	"is_critical" boolean DEFAULT false NOT NULL,
	"voice_id" text,
	"external_voice_id" text,
	"voice_name" text,
	"changed_fields" jsonb,
	"old_values" jsonb,
	"new_values" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secret_voicer_voice_sync_state" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"block_reason" text,
	"blocked_at" timestamp,
	"last_sync_at" timestamp,
	"last_sync_success" boolean,
	"last_sync_error" text,
	"last_sync_stats" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secret_voicer_voices" (
	"id" text PRIMARY KEY NOT NULL,
	"external_id" integer NOT NULL,
	"external_voice_id" text NOT NULL,
	"external_name" text NOT NULL,
	"external_description" text,
	"external_gender" "voice_gender" NOT NULL,
	"external_locale" text,
	"external_preview_url" text,
	"external_preview_url_emotional" text,
	"external_avatar_url" text,
	"external_accent" text,
	"external_age_group" text,
	"external_is_multilingual" boolean DEFAULT false,
	"external_style_tags" jsonb DEFAULT '[]'::jsonb,
	"external_use_cases" jsonb DEFAULT '[]'::jsonb,
	"emotion_support" "voice_emotion_support" DEFAULT 'none' NOT NULL,
	"tested_languages" jsonb DEFAULT '[]'::jsonb,
	"rating" integer DEFAULT 5 NOT NULL,
	"notes" text,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "secret_voicer_voices_external_voice_id_unique" UNIQUE("external_voice_id")
);
--> statement-breakpoint
ALTER TABLE "secret_voicer_synthesis_projects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "secret_voicer_synthesis_tasks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "secret_voices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "secret_voicer_synthesis_projects" CASCADE;--> statement-breakpoint
DROP TABLE "secret_voicer_synthesis_tasks" CASCADE;--> statement-breakpoint
DROP TABLE "secret_voices" CASCADE;--> statement-breakpoint
ALTER TABLE "browser_fingerprints" ALTER COLUMN "sec_ch_ua_mobile" SET DATA TYPE "public"."sec_ch_ua_mobile" USING "sec_ch_ua_mobile"::"public"."sec_ch_ua_mobile";--> statement-breakpoint
ALTER TABLE "browser_fingerprints" ALTER COLUMN "sec_ch_ua_platform" SET DATA TYPE "public"."sec_ch_ua_platform" USING "sec_ch_ua_platform"::"public"."sec_ch_ua_platform";--> statement-breakpoint
ALTER TABLE "browser_fingerprints" ALTER COLUMN "accept_language" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "browser_fingerprints" ALTER COLUMN "is_active" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "browser_fingerprints" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "browser_fingerprints" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "browser_fingerprints" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "secret_voicer_credentials" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "secret_voicer_credentials" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "secret_voicer_credentials" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "synthesis_tasks" ADD CONSTRAINT "synthesis_tasks_project_id_synthesis_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."synthesis_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "browser_fingerprints" DROP COLUMN "is_default";--> statement-breakpoint
DROP TYPE "public"."secret_voicer_project_status";--> statement-breakpoint
DROP TYPE "public"."secret_voicer_task_status";--> statement-breakpoint
DROP TYPE "public"."secret_voice_gender";