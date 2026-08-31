import { Card } from "@packages/ui/card";
import { Typography } from "@packages/ui/typography";
import { For, Show } from "solid-js";
import type { SecretVoicerCredential } from "../model/types";
import { SecretVoicerCredentialRow } from "./row";

export function SecretVoicerCredentialsTable(props: {
  credentials: SecretVoicerCredential[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  getFingerprintName: (id: string) => string;
  onView: (id: string) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
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
                  Название
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground">
                  Fingerprint
                </th>
                <th class="h-10 px-4 font-medium text-muted-foreground hidden md:table-cell">
                  Session ID
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
                    <td colSpan={5} class="p-8 text-center">
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
                  when={props.credentials.length > 0}
                  fallback={
                    <tr>
                      <td colSpan={5} class="p-8 text-center">
                        <Typography color="muted">Список пуст</Typography>
                      </td>
                    </tr>
                  }
                >
                  <For each={props.credentials}>
                    {(credential) => (
                      <SecretVoicerCredentialRow
                        credential={credential}
                        fingerprintName={props.getFingerprintName(
                          credential.fingerprintId,
                        )}
                        onView={() => props.onView(credential.id)}
                        onUpdate={() => props.onUpdate(credential.id)}
                        onDelete={() => props.onDelete(credential.id)}
                        onToggleStatus={() =>
                          props.onToggleStatus(credential.id)
                        }
                      />
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
            Показано {props.credentials.length} из {props.totalCount} записей
          </Typography>
        </div>
      }
    />
  );
}
