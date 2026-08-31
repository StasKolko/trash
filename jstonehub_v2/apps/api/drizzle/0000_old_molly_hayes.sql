CREATE TYPE "public"."secret_voicer_project_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL');--> statement-breakpoint
CREATE TYPE "public"."secret_voicer_task_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."secret_voice_gender" AS ENUM('MALE', 'FEMALE');--> statement-breakpoint
CREATE TABLE "browser_fingerprints" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"user_agent" text NOT NULL,
	"sec_ch_ua" text NOT NULL,
	"sec_ch_ua_mobile" text NOT NULL,
	"sec_ch_ua_platform" text NOT NULL,
	"accept_language" text DEFAULT 'en-US,en;q=0.9',
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "secret_voicer_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"fingerprint_id" text NOT NULL,
	"name" text NOT NULL,
	"csrf_token" text NOT NULL,
	"session_id" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "secret_voicer_synthesis_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"output_folder" text NOT NULL,
	"fingerprint_id" text,
	"total_tasks" integer DEFAULT 0,
	"completed_tasks" integer DEFAULT 0,
	"failed_tasks" integer DEFAULT 0,
	"status" "secret_voicer_project_status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "secret_voicer_synthesis_tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"order_index" integer NOT NULL,
	"voice_id" text NOT NULL,
	"text" text NOT NULL,
	"external_task_id" text,
	"status" "secret_voicer_task_status" DEFAULT 'PENDING',
	"status_code" text,
	"retry_count" integer DEFAULT 0,
	"started_at" timestamp,
	"audio_url" text,
	"local_file_path" text,
	"error" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "secret_voices" (
	"id" text PRIMARY KEY NOT NULL,
	"voice_id" text NOT NULL,
	"external_id" integer,
	"name" text NOT NULL,
	"description" text,
	"gender" "secret_voice_gender" NOT NULL,
	"locale" text DEFAULT 'en-US',
	"accent" text,
	"is_multilingual" boolean DEFAULT false,
	"preview_url" text,
	"avatar_url" text,
	"usage_count" integer DEFAULT 0,
	"age_group" text,
	"voice_style_tags" jsonb DEFAULT '[]'::jsonb,
	"use_cases" jsonb DEFAULT '[]'::jsonb,
	"emotional_range" real DEFAULT 0.5,
	"formality_level" real DEFAULT 0.5,
	"energy_level" real DEFAULT 0.5,
	"warmth_level" real DEFAULT 0.5,
	"authority_level" real DEFAULT 0.5,
	"ai_recommended_for" jsonb DEFAULT '[]'::jsonb,
	"ai_description" text,
	"is_active" boolean DEFAULT true,
	"is_premium" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "secret_voices_voice_id_unique" UNIQUE("voice_id")
);
--> statement-breakpoint
ALTER TABLE "secret_voicer_credentials" ADD CONSTRAINT "secret_voicer_credentials_fingerprint_id_browser_fingerprints_id_fk" FOREIGN KEY ("fingerprint_id") REFERENCES "public"."browser_fingerprints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_voicer_synthesis_projects" ADD CONSTRAINT "secret_voicer_synthesis_projects_fingerprint_id_browser_fingerprints_id_fk" FOREIGN KEY ("fingerprint_id") REFERENCES "public"."browser_fingerprints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_voicer_synthesis_tasks" ADD CONSTRAINT "secret_voicer_synthesis_tasks_project_id_secret_voicer_synthesis_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."secret_voicer_synthesis_projects"("id") ON DELETE cascade ON UPDATE no action;