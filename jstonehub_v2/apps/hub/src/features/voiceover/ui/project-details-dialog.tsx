import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Dialog } from "@packages/ui/dialog";
import { Progress } from "@packages/ui/progress";
import { Typography } from "@packages/ui/typography";
import {
  CheckCircle,
  Clock,
  Download,
  Loader2,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-solid";
import { createMemo, For, Show } from "solid-js";
import { synthesisApi } from "../model/api";
import type { ProjectWithTasks, TaskStatus } from "../model/types";

const PERCENT_MULTIPLIER = 100;

type ProjectDetailsDialogProps = {
  open: boolean;
  project: ProjectWithTasks;
  onClose: () => void;
  onRetryFailed: () => void;
  onRestart: () => void;
  onDelete: () => void;
};

type TaskStatusConfig = {
  label: string;
  variant: "success" | "error" | "warning" | "info" | "muted";
};

const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusConfig> = {
  PENDING: { label: "Ожидает", variant: "muted" },
  PROCESSING: { label: "Обработка", variant: "info" },
  COMPLETED: { label: "Готово", variant: "success" },
  FAILED: { label: "Ошибка", variant: "error" },
  CANCELLED: { label: "Отменено", variant: "muted" },
};

const DEFAULT_TASK_CONFIG: TaskStatusConfig = {
  label: "Неизвестно",
  variant: "muted",
};

export function ProjectDetailsDialog(props: ProjectDetailsDialogProps) {
  const progress = createMemo(() => {
    const total = props.project.totalTasks;
    if (total === 0) {
      return 0;
    }
    return Math.round(
      (props.project.completedTasks / total) * PERCENT_MULTIPLIER,
    );
  });

  const canDownload = () =>
    props.project.status === "COMPLETED" || props.project.status === "PARTIAL";

  const hasFailedTasks = () => props.project.failedTasks > 0;

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => !open && props.onClose()}
      title={props.project.name}
      description={`Создан: ${new Date(props.project.createdAt).toLocaleString("ru-RU")}`}
      class="max-w-2xl"
      footer={
        <div class="flex items-center gap-2 flex-wrap">
          <Show when={hasFailedTasks()}>
            <Button variant="outline" onClick={props.onRetryFailed}>
              <RotateCcw class="w-4 h-4" />
              Повторить ошибки
            </Button>
          </Show>
          <Button variant="outline" onClick={props.onRestart}>
            <RotateCcw class="w-4 h-4" />
            Перезапустить всё
          </Button>
          <Show when={canDownload()}>
            <Button variant="outline">
              {(buttonClass) => (
                <a
                  class={buttonClass}
                  href={synthesisApi.downloadZipUrl(props.project.id)}
                  download=""
                >
                  <Download class="w-4 h-4" />
                  Скачать ZIP
                </a>
              )}
            </Button>
          </Show>
          <div class="flex-1" />
          <Button
            variant="ghost"
            onClick={props.onDelete}
            class="text-error-foreground"
          >
            <Trash2 class="w-4 h-4" />
            Удалить
          </Button>
        </div>
      }
    >
      <div class="space-y-6">
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Общий прогресс</span>
            <span>
              {props.project.completedTasks} / {props.project.totalTasks} задач
            </span>
          </div>
          <Progress value={progress()} />
          <Show when={props.project.failedTasks > 0}>
            <Typography level={6} class="text-error-foreground">
              {props.project.failedTasks} задач с ошибками
            </Typography>
          </Show>
        </div>

        <div class="space-y-2">
          <Typography level={5} color="muted">
            Задачи
          </Typography>
          <div class="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            <For each={props.project.tasks}>
              {(task) => {
                const config =
                  TASK_STATUS_CONFIG[task.status] ?? DEFAULT_TASK_CONFIG;
                return (
                  <div class="p-3 rounded-lg border border-border bg-card">
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" size="sm">
                            #{task.orderIndex}
                          </Badge>
                          <Badge variant={config.variant} size="sm">
                            {task.status === "PROCESSING" && (
                              <Loader2 class="w-3 h-3 animate-spin" />
                            )}
                            {task.status === "COMPLETED" && (
                              <CheckCircle class="w-3 h-3" />
                            )}
                            {task.status === "FAILED" && (
                              <XCircle class="w-3 h-3" />
                            )}
                            {task.status === "PENDING" && (
                              <Clock class="w-3 h-3" />
                            )}
                            {config.label}
                          </Badge>
                        </div>
                        <Typography level={5} class="line-clamp-2">
                          {task.text}
                        </Typography>
                        <Typography level={6} color="muted">
                          {task.voiceId} • {task.rate}x
                        </Typography>
                        <Show when={task.error}>
                          <Typography
                            level={6}
                            class="text-error-foreground mt-1"
                          >
                            {task.error}
                          </Typography>
                        </Show>
                      </div>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
