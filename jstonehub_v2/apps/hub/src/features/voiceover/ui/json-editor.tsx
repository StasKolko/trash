// apps/hub/src/features/voiceover/ui/json-editor.tsx
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Textarea } from "@packages/ui/textarea";
import { Eye } from "lucide-solid";

type JsonEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onPreview: () => void;
  disabled?: boolean;
};

export function JsonEditor(props: JsonEditorProps) {
  const exampleJson = JSON.stringify(
    {
      name: "Мой проект озвучки",
      tasks: [
        { text: "Привет, мир!", voiceId: "voice-id-1", rate: 1.0 },
        { text: "Это тестовый текст.", voiceId: "voice-id-2", rate: 1.2 },
      ],
    },
    null,
    2,
  );

  const insertExample = () => {
    props.onChange(exampleJson);
  };

  return (
    <Card
      title="JSON ввод"
      description="Вставьте JSON с задачами для озвучки"
      content={
        <div class="space-y-4">
          <Textarea
            placeholder={exampleJson}
            value={props.value}
            onInput={(e) => props.onChange(e.currentTarget.value)}
            disabled={props.disabled}
            rows={12}
            class="font-mono text-sm"
          />
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="btn-sm"
              onClick={insertExample}
              disabled={props.disabled}
            >
              Вставить пример
            </Button>
            <Button
              onClick={props.onPreview}
              disabled={props.disabled || !props.value.trim()}
            >
              <Eye class="w-4 h-4" />
              Предпросмотр
            </Button>
          </div>
        </div>
      }
    />
  );
}
