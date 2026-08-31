import { createFileRoute } from "@tanstack/solid-router";
import { SecretVoicerLayout } from "#admin/features/secret-voicer";

export const Route = createFileRoute("/secret-voicer")({
  component: SecretVoicerLayout,
});
