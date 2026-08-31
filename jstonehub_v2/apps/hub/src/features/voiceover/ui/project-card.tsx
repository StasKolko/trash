// apps/hub/src/features/voiceover/ui/project-card.tsx
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Progress } from "@packages/ui/progress";
import { Typography } from "@packages/ui/typography";
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  Pause,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-solid";
import { createMemo, Show } from "solid-js";
import { synthesisApi } from "../model/api";
import type { ProjectStatus, SynthesisProject } from "../model/types";

const PERCENT_MULTIPLIER = 100;

type ProjectCardProps = {
  project: SynthesisProject;
  onView: () => void;
  onDelete: () => void;
  onRetry: () => void;
};

type StatusConfig = {
  label: string;
  variant: "success" | "error" | "warning" | "info" | "muted";
  icon: typeof Clock;
};

const STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  PENDING: { label: "Ожидает", variant: "muted", icon: Clock },
  PROCESSING: { label: "Обработка", variant: "info", icon: Loader2 },
  COMPLETED: { label: "Завершён", variant: "success", icon: CheckCircle },
  PARTIAL: { label: "Частично", variant: "warning", icon: XCircle },
  FAILED: { label: "Ошибка", variant: "error", icon: XCircle },
  PAUSED: { label: "Пауза", variant: "muted", icon: Pause },
  CANCELLED: { label: "Отменён", variant: "muted", icon: XCircle },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: "Неизвестно",
  variant: "muted",
  icon: Clock,
};

export function ProjectCard(props: ProjectCardProps) {
  const config = createMemo(
    () => STATUS_CONFIG[props.project.status] ?? DEFAULT_CONFIG,
  );

  const progress = createMemo(() => {
    const total = props.project.totalTasks;
    if (total === 0) {
      return 0;
    }
    return Math.round(
      (props.project.completedTasks / total) * PERCENT_MULTIPLIER,
    );
  });

  const isProcessing = () => props.project.status === "PROCESSING";
  const isPending = () => props.project.status === "PENDING";
  const isActive = () => isProcessing() || isPending();

  const canDownload = () =>
    props.project.status === "COMPLETED" || props.project.status === "PARTIAL";

  const canRetry = () => props.project.failedTasks > 0 && !isProcessing();

  const StatusIcon = config().icon;

  return (
    <Card
      padding="sm"
      content={
        <div class="space-y-3">
          {/* Header */}
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <Typography level={4} class="font-medium truncate">
                {props.project.name}
              </Typography>
              <Typography level={6} color="muted">
                {new Date(props.project.createdAt).toLocaleString("ru-RU")}
              </Typography>
            </div>
            <Badge variant={config().variant}>
              <StatusIcon
                class="w-3 h-3"
                classList={{ "animate-spin": isProcessing() }}
              />
              {config().label}
            </Badge>
          </div>

          {/* Processing Indicator - НОВОЕ */}
          <Show when={isActive()}>
            <div class="flex items-center gap-2 p-2 rounded-md bg-info/10 border border-info/20">
              <Loader2 class="w-4 h-4 text-info-foreground animate-spin" />
              <Typography level={5} class="text-info-foreground">
                {isProcessing()
                  ? "Идёт обработка..."
                  : "Ожидает начала обработки..."}
              </Typography>
            </div>
          </Show>

          {/* Progress */}
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Прогресс</span>
              <span>
                {props.project.completedTasks} / {props.project.totalTasks}
              </span>
            </div>
            <Progress value={progress()} />
          </div>

          {/* Failed tasks warning */}
          <Show when={props.project.failedTasks > 0}>
            <Typography level={6} class="text-error-foreground">
              {props.project.failedTasks} задач с ошибками
            </Typography>
          </Show>

          {/* Actions */}
          <div class="flex items-center gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="btn-xs" onClick={props.onView}>
              <Eye class="w-3 h-3" />
              Детали
            </Button>

            <Show when={canDownload()}>
              <Button variant="outline" size="btn-xs">
                {(buttonClass) => (
                  <a
                    class={buttonClass}
                    href={synthesisApi.downloadZipUrl(props.project.id)}
                    download=""
                  >
                    <Download class="w-3 h-3" />
                    ZIP
                  </a>
                )}
              </Button>
            </Show>

            <Show when={canRetry()}>
              <Button variant="outline" size="btn-xs" onClick={props.onRetry}>
                <RotateCcw class="w-3 h-3" />
                Повторить
              </Button>
            </Show>

            <div class="flex-1" />

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={props.onDelete}
              disabled={isProcessing()}
              class="text-error-foreground hover:bg-error/10"
            >
              <Trash2 class="w-3 h-3" />
            </Button>
          </div>
        </div>
      }
    />
  );
}
