import { createFileRoute } from "@tanstack/solid-router";
import { JokesPage } from "#hub/features/jokes";

export const Route = createFileRoute("/jokes")({
  component: JokesPage,
});
