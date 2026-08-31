CREATE TYPE "public"."tts_project_status" AS ENUM('pending', 'processing', 'completed', 'partial', 'failed');--> statement-breakpoint
CREATE TYPE "public"."tts_segment_status" AS ENUM('pending', 'queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "tts_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "tts_project_status" DEFAULT 'pending' NOT NULL,
	"audio_processing_enabled" integer DEFAULT 1 NOT NULL,
	"audio_processing_concatenate" integer DEFAULT 1 NOT NULL,
	"audio_processing_config" jsonb DEFAULT '{}'::jsonb,
	"audio_processing_job_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tts_segments" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"index" integer NOT NULL,
	"role" text NOT NULL,
	"text" text NOT NULL,
	"voice_id" text NOT NULL,
	"status" "tts_segment_status" DEFAULT 'pending' NOT NULL,
	"external_task_id" integer,
	"bull_job_id" text,
	"output_key" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tts_segments" ADD CONSTRAINT "tts_segments_project_id_tts_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."tts_projects"("id") ON DELETE cascade ON UPDATE no action;