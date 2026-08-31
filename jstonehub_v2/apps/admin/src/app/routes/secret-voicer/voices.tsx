import { createFileRoute } from "@tanstack/solid-router";
import { SecretVoicerVoicesPage } from "#admin/features/secret-voicer";

export const Route = createFileRoute("/secret-voicer/voices")({
  component: SecretVoicerVoicesPage,
});
