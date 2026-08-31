import { createFileRoute, Navigate } from "@tanstack/solid-router";

export const Route = createFileRoute("/secret-voicer/")({
  component: () => <Navigate to="/secret-voicer/credentials" />,
});
