import { Alert } from "@packages/ui/alert";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Progress } from "@packages/ui/progress";
import { Typography } from "@packages/ui/typography";
import { CheckCircle, Download, Loader2, Play } from "lucide-solid";
import { Show } from "solid-js";
import { audioProcessingApi } from "../model/api";
import type { ProcessingJob } from "../model/types";

type ProcessingStatusProps = {
  job: ProcessingJob | null;
  isProcessing: boolean;
  error: string | null;
  filesCount: number;
  onStart: () => void;
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const BYTES_PER_MB = 1_048_576;

function formatSize(bytes: number): string {
  const mb = bytes / BYTES_PER_MB;
  return `${mb.toFixed(2)} MB`;
}

export function ProcessingStatus(props: ProcessingStatusProps) {
  const isCompleted = () => props.job?.status === "COMPLETED";
  const isFailed = () => props.job?.status === "FAILED";
  const isRunning = () =>
    props.job?.status === "PROCESSING" || props.job?.status === "PENDING";

  const downloadUrl = () =>
    props.job ? audioProcessingApi.downloadUrl(props.job.id) : null;

  return (
    <Card
      content={
        <div class="space-y-4">
          {/* Error */}
          <Show when={props.error}>
            {(err) => (
              <Alert variant="error" title="Ошибка" description={err()} />
            )}
          </Show>

          {/* Job Failed */}
          <Show when={isFailed() && props.job?.error}>
            <Alert
              variant="error"
              title="Обработка не удалась"
              description={props.job?.error ?? 0}
            />
          </Show>

          {/* Processing */}
          <Show when={isRunning() && props.job}>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <Loader2 class="w-5 h-5 text-primary animate-spin" />
                <Typography level={4}>Обработка...</Typography>
              </div>
              <Progress value={props.job?.progress ?? 0} />
              <Typography level={6} color="muted">
                {props.job?.progress}% завершено
              </Typography>
            </div>
          </Show>

          {/* Completed */}
          <Show when={isCompleted() && props.job}>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <CheckCircle class="w-5 h-5 text-success-foreground" />
                <Typography level={4}>Обработка завершена!</Typography>
              </div>

              <div class="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/50">
                <div>
                  <Typography level={6} color="muted">
                    Размер
                  </Typography>
                  <Typography level={4}>
                    {props.job?.outputSize
                      ? formatSize(props.job?.outputSize)
                      : "—"}
                  </Typography>
                </div>
                <div>
                  <Typography level={6} color="muted">
                    Длительность
                  </Typography>
                  <Typography level={4}>
                    {props.job?.outputDuration
                      ? formatDuration(props.job?.outputDuration)
                      : "—"}
                  </Typography>
                </div>
              </div>

              <Button class="w-full">
                {(classes) => (
                  <a class={classes} href={downloadUrl() ?? ""} download="">
                    <Download class="w-4 h-4" />
                    Скачать результат
                  </a>
                )}
              </Button>
            </div>
          </Show>

          {/* Start Button */}
          <Show when={!(isRunning() || isCompleted())}>
            <Button
              class="w-full"
              onClick={props.onStart}
              disabled={props.filesCount === 0 || props.isProcessing}
            >
              <Play class="w-4 h-4" />
              Начать обработку ({props.filesCount} файлов)
            </Button>
          </Show>

          {/* Process Again */}
          <Show when={isCompleted() || isFailed()}>
            <Button variant="outline" class="w-full" onClick={props.onStart}>
              <Play class="w-4 h-4" />
              Обработать заново
            </Button>
          </Show>
        </div>
      }
    />
  );
}
