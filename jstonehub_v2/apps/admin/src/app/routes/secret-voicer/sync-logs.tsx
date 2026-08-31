import { createFileRoute } from "@tanstack/solid-router";
import { SecretVoicerSyncLogsPage } from "#admin/features/secret-voicer/voice";

export const Route = createFileRoute("/secret-voicer/sync-logs")({
  component: SecretVoicerSyncLogsPage,
});
