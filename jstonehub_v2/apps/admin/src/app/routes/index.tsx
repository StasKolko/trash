import { createFileRoute } from "@tanstack/solid-router";
import { HomePage } from "#admin/features/home-page";

export const Route = createFileRoute("/")({
  component: HomePage,
});
