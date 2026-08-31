import { createFileRoute } from "@tanstack/solid-router";
import { VoiceoverPage } from "#hub/features/voiceover";

export const Route = createFileRoute("/voiceover")({
  component: VoiceoverPage,
});
