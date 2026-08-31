import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Checkbox } from "@packages/ui/checkbox";
import { Input } from "@packages/ui/input";
import { Label } from "@packages/ui/label";
import { cn } from "@packages/utils/css";
import { Search } from "lucide-solid";
import { For } from "solid-js";
import type { VoiceGenderFilter } from "../model/hooks";

const genderTabs: { value: VoiceGenderFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "MALE", label: "Мужские" },
  { value: "FEMALE", label: "Женские" },
];

export function SecretVoicerVoicesToolbar(props: {
  searchQuery: string;
  showHidden: boolean;
  genderFilter: VoiceGenderFilter;
  onSearchChange: (query: string) => void;
  onShowHiddenChange: (show: boolean) => void;
  onGenderFilterChange: (filter: VoiceGenderFilter) => void;
}) {
  return (
    <Card
      padding="sm"
      content={
        <div class="flex flex-col gap-4">
          {/* Top row: Search + Gender Filter */}
          <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Input
              placeholder="Поиск по имени или ID..."
              prefix={<Search class="w-4 h-4" />}
              wrapperClass="w-full sm:w-64"
              value={props.searchQuery}
              onInput={(e) => props.onSearchChange(e.currentTarget.value)}
            />

            <div class="inline-flex rounded-lg border border-border p-1 bg-muted/50">
              <For each={genderTabs}>
                {(tab) => (
                  <Button
                    variant="ghost"
                    size="btn-xs"
                    class={cn(
                      props.genderFilter === tab.value
                        && "bg-card shadow-sm border border-border",
                    )}
                    onClick={() => props.onGenderFilterChange(tab.value)}
                  >
                    {tab.label}
                  </Button>
                )}
              </For>
            </div>
          </div>

          {/* Bottom row: Checkbox */}
          <div class="flex items-center gap-2">
            <Checkbox
              id="show-hidden"
              checked={props.showHidden}
              onChangeValue={props.onShowHiddenChange}
            />
            <Label for="show-hidden">Показать скрытые</Label>
          </div>
        </div>
      }
    />
  );
}
