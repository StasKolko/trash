import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Input } from "@packages/ui/input";
import { Popover } from "@packages/ui/popover";
import { Typography } from "@packages/ui/typography";
import { cn } from "@packages/utils/css";
import { ArrowRight, ChevronDown, RefreshCw, Search } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import type { ProjectPreview, PublicVoice } from "../model/types";

type GenderFilter = "all" | "MALE" | "FEMALE";

type VoiceReplacerProps = {
  preview: ProjectPreview;
  voices: PublicVoice[];
  onReplace: (oldId: string, newId: string) => void;
};

function GenderBadge(props: { gender: string }) {
  return (
    <Badge variant={props.gender === "MALE" ? "info" : "warning"} size="sm">
      {props.gender === "MALE" ? "М" : "Ж"}
    </Badge>
  );
}

function VoiceListItem(props: {
  voice: PublicVoice;
  showCount?: boolean;
  count?: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      class={cn(
        "w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors",
        "hover:bg-muted",
        props.selected && "bg-accent/10 text-accent",
      )}
      onClick={props.onSelect}
    >
      <GenderBadge gender={props.voice.gender} />
      <div class="flex-1 min-w-0">
        <div class="font-medium truncate">{props.voice.name}</div>
        <div class="text-xs text-muted-foreground truncate">
          {props.voice.externalVoiceId}
        </div>
      </div>
      <Show when={props.showCount && props.count}>
        <Badge variant="secondary" size="sm">
          {props.count}
        </Badge>
      </Show>
    </button>
  );
}

export function VoiceReplacer(props: VoiceReplacerProps) {
  const [fromVoice, setFromVoice] = createSignal("");
  const [toVoice, setToVoice] = createSignal("");
  const [fromOpen, setFromOpen] = createSignal(false);
  const [toOpen, setToOpen] = createSignal(false);
  const [fromSearch, setFromSearch] = createSignal("");
  const [toSearch, setToSearch] = createSignal("");
  const [toGenderFilter, setToGenderFilter] = createSignal<GenderFilter>("all");

  // biome-ignore lint/suspicious/noUnassignedVariables: FALSE_POSITIVE <SOLIDJS_REACTIVITY>
  let fromAnchorRef: HTMLButtonElement | undefined;
  // biome-ignore lint/suspicious/noUnassignedVariables: FALSE_POSITIVE <SOLIDJS_REACTIVITY>
  let toAnchorRef: HTMLButtonElement | undefined;

  const usedVoiceIds = createMemo(() => {
    const ids = new Set<string>();
    for (const task of props.preview.tasks) {
      if (task.voiceId) {
        ids.add(task.voiceId);
      }
    }
    return [...ids];
  });

  const usedVoices = createMemo(() => {
    return props.voices.filter((v) =>
      usedVoiceIds().includes(v.externalVoiceId),
    );
  });

  const isVoiceValid = (voiceId: string) =>
    props.voices.some((v) => v.externalVoiceId === voiceId);

  const filteredFromVoices = createMemo(() => {
    const query = fromSearch().toLowerCase();
    return usedVoices().filter(
      (v) =>
        v.name.toLowerCase().includes(query)
        || v.externalVoiceId.toLowerCase().includes(query),
    );
  });

  const filteredToVoices = createMemo(() => {
    const query = toSearch().toLowerCase();
    const gender = toGenderFilter();
    return props.voices.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(query)
        || v.externalVoiceId.toLowerCase().includes(query);
      const matchesGender = gender === "all" || v.gender === gender;
      return matchesSearch && matchesGender;
    });
  });

  const getVoiceById = (id: string) =>
    props.voices.find((v) => v.externalVoiceId === id);

  const getTaskCount = (voiceId: string) =>
    props.preview.tasks.filter((t) => t.voiceId === voiceId).length;

  const handleReplace = () => {
    const from = fromVoice();
    const to = toVoice();
    if (from && to && from !== to) {
      props.onReplace(from, to);
      setFromVoice("");
      setToVoice("");
    }
  };

  const selectedFromVoice = createMemo(() => {
    const id = fromVoice();
    return id ? getVoiceById(id) : undefined;
  });

  const selectedToVoice = createMemo(() => {
    const id = toVoice();
    return id ? getVoiceById(id) : undefined;
  });

  return (
    <Show when={usedVoiceIds().length > 0}>
      <Card
        title="Замена голосов"
        description="Массовая замена голоса во всех задачах"
        content={
          <div class="space-y-4">
            <div>
              <Typography level={5} color="muted" class="mb-2">
                Используемые голоса:
              </Typography>
              <div class="flex flex-wrap gap-2">
                <For each={usedVoiceIds()}>
                  {(voiceId) => {
                    const voice = props.voices.find(
                      (v) => v.externalVoiceId === voiceId,
                    );
                    const valid = isVoiceValid(voiceId);
                    const count = getTaskCount(voiceId);

                    return (
                      <div
                        class={cn(
                          "flex items-center gap-1 px-2 py-1 rounded text-sm",
                          valid
                            ? "bg-muted"
                            : "bg-error/10 border border-error text-error-foreground",
                        )}
                      >
                        <Show when={voice}>
                          <GenderBadge gender={voice?.gender ?? "neutral"} />
                        </Show>
                        <span>{voice?.name ?? voiceId}</span>
                        <Show when={!valid}>
                          <Badge variant="error" size="sm">
                            Не найден!
                          </Badge>
                        </Show>
                        <Badge
                          variant={valid ? "secondary" : "error"}
                          size="sm"
                        >
                          {count}
                        </Badge>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>

            <div class="flex items-end gap-2 flex-wrap">
              <div class="flex-1 min-w-[200px]">
                <Typography level={6} color="muted" class="mb-1">
                  Заменить
                </Typography>
                <Button
                  ref={fromAnchorRef}
                  variant="outline"
                  class="w-full justify-between"
                  onClick={() => setFromOpen(!fromOpen())}
                >
                  <Show
                    when={selectedFromVoice()}
                    fallback={
                      <span class="text-muted-foreground">
                        Выберите голос...
                      </span>
                    }
                  >
                    {(voice) => (
                      <div class="flex items-center gap-2">
                        <GenderBadge gender={voice().gender} />
                        <span class="truncate">{voice().name}</span>
                      </div>
                    )}
                  </Show>
                  <ChevronDown class="w-4 h-4 opacity-50" />
                </Button>
                <Popover
                  open={fromOpen()}
                  onOpenChange={setFromOpen}
                  anchor={fromAnchorRef}
                  content={
                    <div class="w-[280px] p-2 space-y-2">
                      <Input
                        placeholder="Поиск..."
                        prefix={<Search class="w-4 h-4" />}
                        value={fromSearch()}
                        onInput={(e) => setFromSearch(e.currentTarget.value)}
                        autofocus={true}
                      />
                      <div class="max-h-[200px] overflow-y-auto space-y-1">
                        <Show
                          when={filteredFromVoices().length > 0}
                          fallback={
                            <Typography
                              level={5}
                              color="muted"
                              class="p-2 text-center"
                            >
                              Голоса не найдены
                            </Typography>
                          }
                        >
                          <For each={filteredFromVoices()}>
                            {(voice) => (
                              <VoiceListItem
                                voice={voice}
                                showCount={true}
                                count={getTaskCount(voice.externalVoiceId)}
                                selected={fromVoice() === voice.externalVoiceId}
                                onSelect={() => {
                                  setFromVoice(voice.externalVoiceId);
                                  setFromOpen(false);
                                  setFromSearch("");
                                }}
                              />
                            )}
                          </For>
                        </Show>
                      </div>
                    </div>
                  }
                />
              </div>

              <ArrowRight class="w-5 h-5 text-muted-foreground mb-2" />

              <div class="flex-1 min-w-[200px]">
                <Typography level={6} color="muted" class="mb-1">
                  На
                </Typography>
                <Button
                  ref={toAnchorRef}
                  variant="outline"
                  class="w-full justify-between"
                  onClick={() => setToOpen(!toOpen())}
                >
                  <Show
                    when={selectedToVoice()}
                    fallback={
                      <span class="text-muted-foreground">
                        Выберите голос...
                      </span>
                    }
                  >
                    {(voice) => (
                      <div class="flex items-center gap-2">
                        <GenderBadge gender={voice().gender} />
                        <span class="truncate">{voice().name}</span>
                      </div>
                    )}
                  </Show>
                  <ChevronDown class="w-4 h-4 opacity-50" />
                </Button>
                <Popover
                  open={toOpen()}
                  onOpenChange={setToOpen}
                  anchor={toAnchorRef}
                  content={
                    <div class="w-[320px] p-2 space-y-2">
                      <Input
                        placeholder="Поиск..."
                        prefix={<Search class="w-4 h-4" />}
                        value={toSearch()}
                        onInput={(e) => setToSearch(e.currentTarget.value)}
                        autofocus={true}
                      />

                      <div class="flex gap-1">
                        <For
                          each={
                            [
                              { value: "all", label: "Все" },
                              { value: "MALE", label: "Мужские" },
                              { value: "FEMALE", label: "Женские" },
                            ] as const
                          }
                        >
                          {(opt) => (
                            <Button
                              variant="ghost"
                              size="btn-xs"
                              class={cn(
                                toGenderFilter() === opt.value
                                  && "bg-accent/15 text-accent",
                              )}
                              onClick={() => setToGenderFilter(opt.value)}
                            >
                              {opt.label}
                            </Button>
                          )}
                        </For>
                      </div>

                      <div class="max-h-[250px] overflow-y-auto space-y-1">
                        <Show
                          when={filteredToVoices().length > 0}
                          fallback={
                            <Typography
                              level={5}
                              color="muted"
                              class="p-2 text-center"
                            >
                              Голоса не найдены
                            </Typography>
                          }
                        >
                          <For each={filteredToVoices()}>
                            {(voice) => (
                              <VoiceListItem
                                voice={voice}
                                selected={toVoice() === voice.externalVoiceId}
                                onSelect={() => {
                                  setToVoice(voice.externalVoiceId);
                                  setToOpen(false);
                                  setToSearch("");
                                }}
                              />
                            )}
                          </For>
                        </Show>
                      </div>
                    </div>
                  }
                />
              </div>

              <Button
                onClick={handleReplace}
                disabled={
                  !(fromVoice() && toVoice()) || fromVoice() === toVoice()
                }
              >
                <RefreshCw class="w-4 h-4" />
                Заменить
              </Button>
            </div>
          </div>
        }
      />
    </Show>
  );
}
