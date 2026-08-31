CREATE TYPE "public"."joke_tts_pipeline_status" AS ENUM('pending', 'creating_tasks', 'synthesizing', 'processing_audio', 'saving', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "joke_tts_pipelines" (
	"id" text PRIMARY KEY NOT NULL,
	"joke_translation_id" text NOT NULL,
	"status" "joke_tts_pipeline_status" DEFAULT 'pending' NOT NULL,
	"voice_config" jsonb NOT NULL,
	"tts_project_id" text,
	"joke_audio_id" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "joke_tts_pipelines" ADD CONSTRAINT "joke_tts_pipelines_joke_translation_id_joke_translations_id_fk" FOREIGN KEY ("joke_translation_id") REFERENCES "public"."joke_translations"("id") ON DELETE cascade ON UPDATE no action;