import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Typography } from "@packages/ui/typography";
import { Download, File, Trash2 } from "lucide-solid";
import { For, Show } from "solid-js";
import { audioProcessingApi } from "../model/api";
import type { CachedFile } from "../model/types";

type CacheListProps = {
  files: CachedFile[];
  isLoading?: boolean;
  onDelete: (id: string) => void;
  onClearAll: () => void;
};

const BYTES_PER_MB = 1_048_576;
const MS_PER_DAY = 86_400_000;
const MAX_PROJECT_ID_LENGTH = 8;

function formatSize(bytes: number | null): string {
  if (!bytes) {
    return "—";
  }
  const mb = bytes / BYTES_PER_MB;
  return `${mb.toFixed(2)} MB`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) {
    return "—";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("ru-RU");
}

function getExpiresIn(date: Date): string {
  const expires = new Date(date);
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (MS_PER_DAY));

  if (diffDays <= 0) { return "Истёк"; }
  if (diffDays === 1) { return "1 день"; }
  return `${diffDays} дней`;
}

export function CacheList(props: CacheListProps) {
  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <Typography level={4}>
          Кэшированные файлы ({props.files.length})
        </Typography>
        <Show when={props.files.length > 0}>
          <Button variant="outline" size="btn-xs" onClick={props.onClearAll}>
            <Trash2 class="w-3 h-3" />
            Очистить всё
          </Button>
        </Show>
      </div>

      {/* Loading */}
      <Show when={props.isLoading}>
        <div class="text-center py-8">
          <Typography color="muted">Загрузка...</Typography>
        </div>
      </Show>

      {/* Empty State */}
      <Show when={!props.isLoading && props.files.length === 0}>
        <Card
          padding="lg"
          content={
            <div class="text-center py-8">
              <File class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <Typography level={4} color="muted">
                Кэш пуст
              </Typography>
              <Typography level={6} color="muted" class="mt-1">
                Обработанные файлы будут храниться здесь 7 дней
              </Typography>
            </div>
          }
        />
      </Show>

      {/* Files List */}
      <Show when={!props.isLoading && props.files.length > 0}>
        <div class="space-y-3">
          <For each={props.files}>
            {(file) => (
              <Card
                padding="sm"
                content={
                  <div class="flex items-center gap-4">
                    <File class="w-8 h-8 text-muted-foreground shrink-0" />

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <Typography level={5} class="font-medium">
                          {file.sourceType === "synthesis"
                            ? `Проект: ${file.sourceProjectId?.slice(0, MAX_PROJECT_ID_LENGTH) ?? "—"}`
                            : "Загруженные файлы"}
                        </Typography>
                        <Badge
                          variant={
                            file.status === "COMPLETED" ? "success" : "muted"
                          }
                          size="sm"
                        >
                          {file.status}
                        </Badge>
                      </div>

                      <div class="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatSize(file.outputSize)}</span>
                        <span>{formatDuration(file.outputDuration)}</span>
                        <span>Истекает: {getExpiresIn(file.expiresAt)}</span>
                      </div>

                      <Typography level={6} color="muted" class="mt-1">
                        Создан: {formatDate(file.createdAt)}
                      </Typography>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <Show when={file.status === "COMPLETED"}>
                        <Button variant="outline" size="icon-sm">
                          {(classes) => (
                            <a
                              class={classes}
                              href={audioProcessingApi.downloadUrl(file.id)}
                              download=""
                            >
                              <Download class="w-4 h-4" />
                            </a>
                          )}
                        </Button>
                      </Show>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => props.onDelete(file.id)}
                        class="text-error-foreground hover:bg-error/10"
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                }
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
