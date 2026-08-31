// apps/hub/src/features/voiceover/ui/task-preview-card.tsx
import { Badge } from "@packages/ui/badge";
import { Typography } from "@packages/ui/typography";
import { AlertCircle, CheckCircle, Mic } from "lucide-solid";
import { Show } from "solid-js";
import type { TaskPreview } from "../model/types";

type TaskPreviewCardProps = {
  task: TaskPreview;
};

export function TaskPreviewCard(props: TaskPreviewCardProps) {
  return (
    <div
      class="p-4 rounded-lg border transition-colors"
      classList={{
        "border-border bg-card": props.task.isValid,
        "border-error bg-error/5": !props.task.isValid,
      }}
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0 space-y-2">
          {/* Index & Status */}
          <div class="flex items-center gap-2">
            <Badge variant={props.task.isValid ? "secondary" : "error"}>
              #{props.task.index}
            </Badge>
            <Show
              when={props.task.isValid}
              fallback={<AlertCircle class="w-4 h-4 text-error-foreground" />}
            >
              <CheckCircle class="w-4 h-4 text-success-foreground" />
            </Show>
          </div>

          {/* Text preview */}
          <Typography level={4} class="line-clamp-2">
            {props.task.text || (
              <span class="text-muted-foreground italic">Пустой текст</span>
            )}
          </Typography>

          {/* Voice info */}
          <div class="flex items-center gap-2 text-sm">
            <Mic class="w-3 h-3 text-muted-foreground" />
            <Show
              when={props.task.voiceName}
              fallback={
                <span class="text-error-foreground">
                  {props.task.voiceId || "Не указан"}
                </span>
              }
            >
              <span class="text-foreground">{props.task.voiceName}</span>
              <span class="text-muted-foreground">({props.task.voiceId})</span>
            </Show>
          </div>

          {/* Rate */}
          <Typography level={6} color="muted">
            Скорость: {props.task.rate}x
          </Typography>

          {/* Error */}
          <Show when={props.task.error}>
            <Typography level={6} class="text-error-foreground">
              {props.task.error}
            </Typography>
          </Show>
        </div>
      </div>
    </div>
  );
}
