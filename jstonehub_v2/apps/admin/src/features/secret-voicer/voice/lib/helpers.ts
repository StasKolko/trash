import type { SecretVoicerVoiceSyncEvent } from "../model/types";

export function formatSyncEventDate(date: Date | string | null): string {
  if (!date) {
    return "—";
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getSyncEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    VOICE_ADDED: "Добавлен голос",
    VOICE_REMOVED: "Удалён голос",
    VOICE_UPDATED: "Обновлён голос",
  };
  return labels[type] ?? type;
}

export function formatChangedFields(fields: string[] | null): string {
  if (!fields || fields.length === 0) {
    return "—";
  }
  return fields.join(", ");
}

export function groupSyncEventsByDate(
  events: SecretVoicerVoiceSyncEvent[],
): Map<string, SecretVoicerVoiceSyncEvent[]> {
  const grouped = new Map<string, SecretVoicerVoiceSyncEvent[]>();

  for (const event of events) {
    const dateKey = new Date(event.createdAt).toLocaleDateString("ru-RU");
    const existing = grouped.get(dateKey) ?? [];
    existing.push(event);
    grouped.set(dateKey, existing);
  }

  return grouped;
}
