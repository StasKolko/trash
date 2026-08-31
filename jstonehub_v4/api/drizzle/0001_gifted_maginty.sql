CREATE TABLE "secret_voicer_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"fingerprint_id" text NOT NULL,
	"csrf_token" text NOT NULL,
	"session_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "secret_voicer_credentials" ADD CONSTRAINT "secret_voicer_credentials_fingerprint_id_browser_fingerprints_id_fk" FOREIGN KEY ("fingerprint_id") REFERENCES "public"."browser_fingerprints"("id") ON DELETE cascade ON UPDATE no action;