import { createFileRoute } from "@tanstack/solid-router";
import { HomePage } from "#hub/features/home-page";

export const Route = createFileRoute("/")({
  component: HomePage,
});
