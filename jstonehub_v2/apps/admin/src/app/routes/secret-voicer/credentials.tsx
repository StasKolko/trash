import { createFileRoute } from "@tanstack/solid-router";
import { SecretVoicerCredentialsPage } from "#admin/features/secret-voicer";

export const Route = createFileRoute("/secret-voicer/credentials")({
  component: SecretVoicerCredentialsPage,
});
