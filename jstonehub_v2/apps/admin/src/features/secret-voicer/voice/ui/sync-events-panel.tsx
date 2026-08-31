import { Accordion, type AccordionItem } from "@packages/ui/accordion";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Typography } from "@packages/ui/typography";
import { AlertTriangle, Clock, Trash2 } from "lucide-solid";
import { For, Show } from "solid-js";
import {
  formatChangedFields,
  formatSyncEventDate,
  getSyncEventTypeLabel,
} from "../lib/helpers";
import type { SecretVoicerVoiceSyncEvent } from "../model/types";

function SyncEventItem(props: {
  event: SecretVoicerVoiceSyncEvent;
  onDelete: (id: string) => void;
}) {
  return (
    <div class="flex items-start justify-between p-3 rounded-lg bg-muted/50 border border-border">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <Badge variant={props.event.isCritical ? "error" : "info"} size="sm">
            {getSyncEventTypeLabel(props.event.eventType)}
          </Badge>
          <Typography level={6} color="muted">
            {formatSyncEventDate(props.event.createdAt)}
          </Typography>
        </div>
        <Typography level={4} class="font-medium">
          {props.event.voiceName ?? props.event.externalVoiceId ?? "Unknown"}
        </Typography>
        <Show
          when={
            props.event.changedFields && props.event.changedFields.length > 0
          }
        >
          <Typography level={5} color="muted">
            Изменены: {formatChangedFields(props.event.changedFields)}
          </Typography>
        </Show>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => props.onDelete(props.event.id)}
      >
        <Trash2 class="w-3 h-3" />
      </Button>
    </div>
  );
}

export function SyncEventsPanel(props: {
  criticalEvents: SecretVoicerVoiceSyncEvent[];
  nonCriticalEvents: SecretVoicerVoiceSyncEvent[];
  onDeleteEvent: (id: string) => void;
  onDeleteAll: () => void;
}) {
  const hasEvents = () =>
    props.criticalEvents.length > 0 || props.nonCriticalEvents.length > 0;

  const accordionItems = (): AccordionItem[] => {
    const items: AccordionItem[] = [];

    if (props.criticalEvents.length > 0) {
      items.push({
        value: "critical",
        title: (
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-error-foreground" />
            <span>Критические изменения</span>
            <Badge variant="error" size="sm">
              {props.criticalEvents.length}
            </Badge>
          </div>
        ),
        content: (
          <div class="space-y-2">
            <For each={props.criticalEvents}>
              {(event) => (
                <SyncEventItem event={event} onDelete={props.onDeleteEvent} />
              )}
            </For>
          </div>
        ),
      });
    }

    if (props.nonCriticalEvents.length > 0) {
      items.push({
        value: "changelog",
        title: (
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-muted-foreground" />
            <span>Журнал изменений</span>
            <Badge variant="muted" size="sm">
              {props.nonCriticalEvents.length}
            </Badge>
          </div>
        ),
        content: (
          <div class="space-y-2">
            <For each={props.nonCriticalEvents}>
              {(event) => (
                <SyncEventItem event={event} onDelete={props.onDeleteEvent} />
              )}
            </For>
          </div>
        ),
      });
    }

    return items;
  };

  return (
    <Show when={hasEvents()}>
      <Card
        padding="none"
        content={
          <div>
            <div class="flex items-center justify-between px-4 py-3 border-b border-border">
              <Typography type="title" level={5}>
                События синхронизации
              </Typography>
              <Button variant="ghost" size="btn-xs" onClick={props.onDeleteAll}>
                <Trash2 class="w-3 h-3" />
                Очистить всё
              </Button>
            </div>
            <Accordion
              items={accordionItems()}
              type="multiple"
              defaultValue={props.criticalEvents.length > 0 ? ["critical"] : []}
            />
          </div>
        }
      />
    </Show>
  );
}
