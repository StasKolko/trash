import { Typography } from "@packages/ui/typography";
import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/secret-voicer/settings")({
  component: () => (
    <div class="space-y-4">
      <Typography type="title" level={2}>
        Settings
      </Typography>
      <Typography color="muted">Настройки синтеза (в разработке)</Typography>
    </div>
  ),
});
