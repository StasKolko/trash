import { Typography } from "@packages/ui/typography";
import { cn } from "@packages/utils/css";
import { type ParentProps, Show } from "solid-js";

export function PageHeader(
  props: ParentProps<{
    title: string;
    description?: string;
    class?: string;
  }>,
) {
  return (
    <div
      class={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border",
        props.class,
      )}
    >
      <div class="space-y-1">
        <Typography type="title" level={2}>
          {props.title}
        </Typography>
        <Show when={props.description}>
          <Typography level={2} color="muted" class="mt-1">
            {props.description}
          </Typography>
        </Show>
      </div>
      <div class="flex items-center gap-2">{props.children}</div>
    </div>
  );
}
