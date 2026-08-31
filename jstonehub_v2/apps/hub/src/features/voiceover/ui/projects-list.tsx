// apps/hub/src/features/voiceover/ui/projects-list.tsx
import { Alert } from "@packages/ui/alert";
import { Button } from "@packages/ui/button";
import { Typography } from "@packages/ui/typography";
import { RefreshCw } from "lucide-solid";
import { For, Show } from "solid-js";
import type { SynthesisProject } from "../model/types";
import { ProjectCard } from "./project-card";

type ProjectsListProps = {
  projects: SynthesisProject[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
};

export function ProjectsList(props: ProjectsListProps) {
  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <Typography type="title" level={4}>
          Мои проекты ({props.projects.length})
        </Typography>
        <Button
          variant="outline"
          size="btn-sm"
          onClick={props.onRefresh}
          disabled={props.isLoading}
        >
          <RefreshCw
            class="w-4 h-4"
            classList={{ "animate-spin": props.isLoading }}
          />
          Обновить
        </Button>
      </div>

      {/* Error */}
      <Show when={props.error}>
        {(err) => <Alert variant="error" title="Ошибка" description={err()} />}
      </Show>

      {/* Projects */}
      <Show
        when={!props.isLoading || props.projects.length > 0}
        fallback={
          <div class="text-center py-8">
            <Typography color="muted">Загрузка...</Typography>
          </div>
        }
      >
        <Show
          when={props.projects.length > 0}
          fallback={
            <div class="text-center py-8 border border-dashed border-border rounded-lg">
              <Typography color="muted">
                Нет проектов. Создайте первый!
              </Typography>
            </div>
          }
        >
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <For each={props.projects}>
              {(project) => (
                <ProjectCard
                  project={project}
                  onView={() => props.onView(project.id)}
                  onDelete={() => props.onDelete(project.id)}
                  onRetry={() => props.onRetry(project.id)}
                />
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
}
