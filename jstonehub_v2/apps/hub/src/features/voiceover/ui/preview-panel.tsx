// apps/hub/src/features/voiceover/ui/preview-panel.tsx
import { Alert } from "@packages/ui/alert";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { CheckCircle, Play, XCircle } from "lucide-solid";
import { For, Show } from "solid-js";
import type { ProjectPreview } from "../model/types";
import { TaskPreviewCard } from "./task-preview-card";

type PreviewPanelProps = {
  preview: ProjectPreview;
  isCreating: boolean;
  onSubmit: () => void;
  onCancel: () => void;
};

export function PreviewPanel(props: PreviewPanelProps) {
  const validCount = () => props.preview.tasks.filter((t) => t.isValid).length;
  const invalidCount = () =>
    props.preview.tasks.filter((t) => !t.isValid).length;

  return (
    <Card
      title={props.preview.name || "Без названия"}
      description={`${props.preview.tasks.length} задач для озвучки`}
      content={
        <div class="space-y-4">
          {/* Summary */}
          <div class="flex items-center gap-3 flex-wrap">
            <Badge variant="success">
              <CheckCircle class="w-3 h-3" />
              {validCount()} валидных
            </Badge>
            <Show when={invalidCount() > 0}>
              <Badge variant="error">
                <XCircle class="w-3 h-3" />
                {invalidCount()} с ошибками
              </Badge>
            </Show>
          </div>

          {/* Errors */}
          <Show when={props.preview.errors.length > 0}>
            <Alert
              variant="error"
              title="Ошибки валидации"
              description={props.preview.errors.join("; ")}
            />
          </Show>

          {/* Tasks */}
          <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <For each={props.preview.tasks}>
              {(task) => <TaskPreviewCard task={task} />}
            </For>
          </div>
        </div>
      }
      footer={
        <div class="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={props.onCancel}
            disabled={props.isCreating}
          >
            Назад
          </Button>
          <Button
            onClick={props.onSubmit}
            disabled={!props.preview.isValid || props.isCreating}
          >
            <Play class="w-4 h-4" />
            {props.isCreating ? "Создание..." : "Создать и запустить"}
          </Button>
        </div>
      }
    />
  );
}
