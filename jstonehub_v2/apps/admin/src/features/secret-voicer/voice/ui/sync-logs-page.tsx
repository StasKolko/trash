import { Alert } from "@packages/ui/alert";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Typography } from "@packages/ui/typography";
import { RefreshCw, Trash2 } from "lucide-solid";
import { createSignal, For, onMount, Show } from "solid-js";
import { PageHeader } from "#admin/shared/ui/page-header";
import {
  formatChangedFields,
  formatSyncEventDate,
  getSyncEventTypeLabel,
} from "../lib/helpers";
import { secretVoicerVoiceApi } from "../model/api";
import type {
  SecretVoicerVoiceSyncEvent,
  SecretVoicerVoiceSyncState,
} from "../model/types";

export function SecretVoicerSyncLogsPage() {
  const [events, setEvents] = createSignal<SecretVoicerVoiceSyncEvent[]>([]);
  const [syncState, setSyncState] =
    createSignal<SecretVoicerVoiceSyncState | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eventsData, stateData] = await Promise.all([
        secretVoicerVoiceApi.getSyncEvents(),
        secretVoicerVoiceApi.getSyncState(),
      ]);
      setEvents(eventsData);
      setSyncState(stateData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    await secretVoicerVoiceApi.deleteSyncEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteAllEvents = async () => {
    await secretVoicerVoiceApi.deleteAllSyncEvents();
    setEvents([]);
  };

  onMount(fetchData);

  return (
    <div class="space-y-6">
      <PageHeader title="Sync Logs" description="История синхронизации голосов">
        <Button variant="outline" onClick={fetchData} disabled={isLoading()}>
          <RefreshCw class="w-4 h-4" />
          Обновить
        </Button>
        <Show when={events().length > 0}>
          <Button variant="outline" onClick={deleteAllEvents}>
            <Trash2 class="w-4 h-4" />
            Очистить всё
          </Button>
        </Show>
      </PageHeader>

      <Show when={error()}>
        {(err) => <Alert variant="error" title="Ошибка" description={err()} />}
      </Show>

      {/* Sync State Card */}
      <Card
        title="Состояние синхронизации"
        content={
          <Show
            when={syncState()}
            fallback={<Typography color="muted">Загрузка...</Typography>}
          >
            {(state) => (
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Typography level={5} color="muted">
                    Последняя синхронизация
                  </Typography>
                  <Typography level={4}>
                    {state().lastSyncAt
                      ? formatSyncEventDate(state().lastSyncAt)
                      : "Никогда"}
                  </Typography>
                </div>
                <div>
                  <Typography level={5} color="muted">
                    Статус
                  </Typography>
                  <Badge
                    variant={state().lastSyncSuccess ? "success" : "error"}
                  >
                    {state().lastSyncSuccess ? "Успешно" : "Ошибка"}
                  </Badge>
                </div>
                <div>
                  <Typography level={5} color="muted">
                    Блокировка
                  </Typography>
                  <Badge variant={state().isBlocked ? "error" : "muted"}>
                    {state().isBlocked ? "Заблокирован" : "Нет"}
                  </Badge>
                </div>
                <Show when={state().lastSyncStats}>
                  {(stats) => (
                    <div>
                      <Typography level={5} color="muted">
                        Статистика
                      </Typography>
                      <Typography level={4}>
                        +{stats().added} / ~{stats().updated} / -
                        {stats().removed}
                      </Typography>
                    </div>
                  )}
                </Show>
              </div>
            )}
          </Show>
        }
      />

      {/* Events List */}
      <Card
        title={`События (${events().length})`}
        padding="none"
        content={
          <Show
            when={!isLoading()}
            fallback={
              <div class="p-8 text-center">
                <Typography color="muted">Загрузка...</Typography>
              </div>
            }
          >
            <Show
              when={events().length > 0}
              fallback={
                <div class="p-8 text-center">
                  <Typography color="muted">Нет событий</Typography>
                </div>
              }
            >
              <div class="divide-y divide-border">
                <For each={events()}>
                  {(event) => (
                    <div class="flex items-start justify-between p-4 hover:bg-muted/50">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <Badge
                            variant={event.isCritical ? "error" : "info"}
                            size="sm"
                          >
                            {getSyncEventTypeLabel(event.eventType)}
                          </Badge>
                          <Typography level={6} color="muted">
                            {formatSyncEventDate(event.createdAt)}
                          </Typography>
                        </div>
                        <Typography level={4} class="font-medium">
                          {event.voiceName
                            ?? event.externalVoiceId
                            ?? "Unknown"}
                        </Typography>
                        <Show
                          when={
                            event.changedFields
                            && event.changedFields.length > 0
                          }
                        >
                          <Typography level={5} color="muted">
                            Изменены: {formatChangedFields(event.changedFields)}
                          </Typography>
                        </Show>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        }
      />
    </div>
  );
}
