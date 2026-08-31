import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Tooltip } from "@packages/ui/tooltip";
import { Typography } from "@packages/ui/typography";
import { Edit, Eye, EyeOff, Mic, Star } from "lucide-solid";
import { For, Show } from "solid-js";
import type { SecretVoicerVoice } from "../model/types";

function getEmotionBadgeVariant(
  emotionSupport: string,
): "success" | "warning" | "muted" {
  if (emotionSupport === "advanced") {
    return "success";
  }
  if (emotionSupport === "basic") {
    return "warning";
  }
  return "muted";
}

export function SecretVoicerVoicesTable(props: {
  voices: SecretVoicerVoice[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  onView: (id: string) => void;
  onUpdate: (id: string) => void;
}) {
  return (
    <Card
      padding="none"
      content={
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-muted border-b border-border">
              <tr>
                <th class="h-10 px-4 font-medium text-muted-foreground">
                  Голос
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground">Пол</th>
                <th class="h-10 px-4 font-medium text-muted-foreground hidden md:table-cell">
                  Эмоции
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground hidden lg:table-cell">
                  Рейтинг
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground">
                  Статус
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground text-right">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <Show
                when={!(props.isLoading || props.error)}
                fallback={
                  <tr>
                    <td colSpan={6} class="p-8 text-center">
                      <Typography color="muted">
                        {props.isLoading
                          ? "Загрузка..."
                          : (props.error ?? "Ошибка")}
                      </Typography>
                    </td>
                  </tr>
                }
              >
                <Show
                  when={props.voices.length > 0}
                  fallback={
                    <tr>
                      <td colSpan={6} class="p-8 text-center">
                        <Typography color="muted">Голоса не найдены</Typography>
                      </td>
                    </tr>
                  }
                >
                  <For each={props.voices}>
                    {(voice) => (
                      <tr class="hover:bg-muted/50 transition-colors group">
                        <td class="p-4">
                          <div class="flex items-center gap-2">
                            <Mic class="w-4 h-4 text-muted-foreground" />
                            <div>
                              <Typography level={4} class="font-medium">
                                {voice.externalName}
                              </Typography>
                              <Typography level={6} color="muted">
                                {voice.externalVoiceId}
                              </Typography>
                            </div>
                          </div>
                        </td>

                        <td class="p-4">
                          <Badge
                            variant={
                              voice.externalGender === "MALE"
                                ? "info"
                                : "warning"
                            }
                            size="sm"
                          >
                            {voice.externalGender === "MALE" ? "М" : "Ж"}
                          </Badge>
                        </td>

                        <td class="p-4 hidden md:table-cell">
                          <Badge
                            variant={getEmotionBadgeVariant(
                              voice.emotionSupport,
                            )}
                            size="sm"
                          >
                            {voice.emotionSupport}
                          </Badge>
                        </td>

                        <td class="p-4 hidden lg:table-cell">
                          <div class="flex items-center gap-1">
                            <Star class="w-4 h-4 text-warning-foreground" />
                            <span>{voice.rating}/10</span>
                          </div>
                        </td>

                        <td class="p-4">
                          <Show
                            when={!voice.isHidden}
                            fallback={
                              <Badge variant="muted" size="sm">
                                <EyeOff class="w-3 h-3" />
                                Скрыт
                              </Badge>
                            }
                          >
                            <Badge variant="success" size="sm">
                              <Eye class="w-3 h-3" />
                              Видим
                            </Badge>
                          </Show>
                        </td>

                        <td class="p-4 text-right">
                          <div class="flex items-center justify-end gap-1">
                            <Tooltip label="Просмотр">
                              {(triggerProps) => (
                                <Button
                                  ref={triggerProps.ref}
                                  onMouseEnter={triggerProps.onMouseEnter}
                                  onMouseLeave={triggerProps.onMouseLeave}
                                  onFocus={triggerProps.onFocus}
                                  onBlur={triggerProps.onBlur}
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => props.onView(voice.id)}
                                >
                                  <Eye class="w-4 h-4" />
                                </Button>
                              )}
                            </Tooltip>
                            <Tooltip label="Редактировать">
                              {(triggerProps) => (
                                <Button
                                  ref={triggerProps.ref}
                                  onMouseEnter={triggerProps.onMouseEnter}
                                  onMouseLeave={triggerProps.onMouseLeave}
                                  onFocus={triggerProps.onFocus}
                                  onBlur={triggerProps.onBlur}
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => props.onUpdate(voice.id)}
                                >
                                  <Edit class="w-4 h-4" />
                                </Button>
                              )}
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </Show>
            </tbody>
          </table>
        </div>
      }
      footer={
        <div class="flex justify-between items-center w-full border-t border-border bg-muted px-4 py-3 -mx-6 -mb-6 mt-0 rounded-b-[12px]">
          <Typography level={5} color="muted">
            Показано {props.voices.length} из {props.totalCount} голосов
          </Typography>
        </div>
      }
    />
  );
}
