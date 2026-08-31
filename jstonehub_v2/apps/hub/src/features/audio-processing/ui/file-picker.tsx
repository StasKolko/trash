import { Alert } from "@packages/ui/alert";
import { Badge } from "@packages/ui/badge";
import { Button } from "@packages/ui/button";
import { Card } from "@packages/ui/card";
import { Typography } from "@packages/ui/typography";
import { cn } from "@packages/utils/css";
import { File, Trash2, Upload, X } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

const MAX_FILE_SIZE_MB = 500;
const MAX_TOTAL_SIZE_MB = 2000;
const BYTES_PER_MB = 1_048_576;
const MAX_FILES = 1024;

type FilePickerProps = {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  disabled?: boolean;
  accept?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < BYTES_PER_MB) {
    return `${(bytes / MAX_FILES).toFixed(1)} KB`;
  }
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
}

export function FilePicker(props: FilePickerProps) {
  const [error, setError] = createSignal<string | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);

  // biome-ignore lint/suspicious/noUnassignedVariables: FALSE_POSITIVE <SOLIDJS_REACTIVITY>
  let inputRef: HTMLInputElement | undefined;

  const totalSize = () => props.files.reduce((sum, f) => sum + f.size, 0);

  const validateAndAddFiles = (newFiles: File[]) => {
    setError(null);
    const errors: string[] = [];

    // Проверка размера каждого файла
    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_MB * BYTES_PER_MB) {
        errors.push(`${file.name}: превышает ${MAX_FILE_SIZE_MB}MB`);
      }
    }

    // Проверка общего размера
    const newTotalSize =
      totalSize() + newFiles.reduce((sum, f) => sum + f.size, 0);
    if (newTotalSize > MAX_TOTAL_SIZE_MB * BYTES_PER_MB) {
      errors.push(`Общий размер превышает ${MAX_TOTAL_SIZE_MB}MB`);
    }

    // Проверка формата
    const validExtensions = [".mp3", ".wav"];
    for (const file of newFiles) {
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!validExtensions.includes(ext)) {
        errors.push(`${file.name}: неподдерживаемый формат (только MP3, WAV)`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join("; "));
      return;
    }

    props.onAdd(newFiles);
  };

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      validateAndAddFiles(Array.from(target.files));
      target.value = ""; // Reset input
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (props.disabled) {
      return;
    }

    const files = e.dataTransfer?.files;
    if (files) {
      validateAndAddFiles(Array.from(files));
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!props.disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div class="space-y-4">
      {/* Error Alert */}
      <Show when={error()}>
        {(err) => (
          <Alert
            variant="error"
            title="Ошибка загрузки"
            description={err()}
            onClose={() => setError(null)}
          />
        )}
      </Show>

      {/* \
        biome-ignore lint/a11y/noStaticElementInteractions: FALSE_POSITIVE
        biome-ignore lint/a11y/noNoninteractiveElementInteractions: FALSE_POSITIVE
      */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        class={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-colors",
          "flex flex-col items-center justify-center gap-4",
          isDragging()
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50",
          props.disabled && "opacity-50 pointer-events-none",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={true}
          accept={props.accept ?? ".mp3,.wav"}
          onChangeValue={handleInputChange}
          disabled={props.disabled}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <Upload class="w-10 h-10 text-muted-foreground" />

        <div class="text-center">
          <Typography level={4}>
            Перетащите файлы сюда или{" "}
            <span class="text-primary underline">выберите</span>
          </Typography>
          <Typography level={6} color="muted" class="mt-1">
            MP3, WAV • до {MAX_FILE_SIZE_MB}MB на файл • до {MAX_TOTAL_SIZE_MB}
            MB всего
          </Typography>
        </div>
      </div>

      {/* Files List */}
      <Show when={props.files.length > 0}>
        <Card
          padding="sm"
          content={
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <Typography level={5}>Файлы ({props.files.length})</Typography>
                <div class="flex items-center gap-2">
                  <Badge variant="secondary">
                    {formatFileSize(totalSize())}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="btn-xs"
                    onClick={props.onClear}
                    disabled={props.disabled}
                  >
                    <Trash2 class="w-3 h-3" />
                    Очистить
                  </Button>
                </div>
              </div>

              <div class="space-y-2 max-h-[300px] overflow-y-auto">
                <For each={props.files}>
                  {(file, index) => (
                    <div class="flex items-center gap-3 p-2 rounded-md bg-muted/50 group">
                      <File class="w-4 h-4 text-muted-foreground shrink-0" />
                      <div class="flex-1 min-w-0">
                        <Typography level={5} class="truncate">
                          {file.name}
                        </Typography>
                        <Typography level={6} color="muted">
                          {formatFileSize(file.size)}
                        </Typography>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => props.onRemove(index())}
                        disabled={props.disabled}
                        class="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X class="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </For>
              </div>
            </div>
          }
        />
      </Show>
    </div>
  );
}
