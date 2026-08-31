import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Input } from "@packages/ui/input";
import { cn } from "@packages/utils/css";
import { Plus, Search } from "lucide-solid";
import { For } from "solid-js";
import type { SecretVoicerCredentialStatusFilter } from "../model/types";

const tabs: { value: SecretVoicerCredentialStatusFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "inactive", label: "Неактивные" },
];

export function SecretVoicerCredentialsToolbar(props: {
  searchQuery: string;
  statusFilter: SecretVoicerCredentialStatusFilter;
  onSearchChange: (query: string) => void;
  onStatusChange: (filter: SecretVoicerCredentialStatusFilter) => void;
  onCreateClick: () => void;
}) {
  return (
    <Card
      padding="sm"
      content={
        <div class="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Input
              placeholder="Поиск по названию..."
              prefix={<Search class="w-4 h-4" />}
              wrapperClass="w-full sm:w-64"
              value={props.searchQuery}
              onInput={(e) => props.onSearchChange(e.currentTarget.value)}
            />

            <div class="inline-flex rounded-lg border border-border p-1 bg-muted/50">
              <For each={tabs}>
                {(tab) => (
                  <Button
                    variant="ghost"
                    size="btn-xs"
                    class={cn(
                      props.statusFilter === tab.value
                        && "bg-card shadow-sm border border-border",
                    )}
                    onClick={() => props.onStatusChange(tab.value)}
                  >
                    {tab.label}
                  </Button>
                )}
              </For>
            </div>
          </div>

          <Button onClick={props.onCreateClick}>
            <Plus class="w-4 h-4" />
            Добавить
          </Button>
        </div>
      }
    />
  );
}
