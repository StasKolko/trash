import { createFileRoute } from "@tanstack/solid-router";
import { AudioProcessingPage } from "#hub/features/audio-processing";

export const Route = createFileRoute("/audio-processing")({
  component: AudioProcessingPage,
});
