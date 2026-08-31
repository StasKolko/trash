ALTER TABLE "secret_voicer_credentials" ADD COLUMN "last_error" jsonb;--> statement-breakpoint
ALTER TABLE "secret_voicer_credentials" ADD COLUMN "last_error_at" timestamp with time zone;