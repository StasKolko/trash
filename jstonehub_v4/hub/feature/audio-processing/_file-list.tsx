import { IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { Progress } from "@packages/ui/feedback";
import { X } from "lucide-solid";
import { createSignal, For, onCleanup, Show } from "solid-js";

import { AudioPlayer } from "#hub/shared/ui/audio-player";

type FileEntry = {
  file: File;
  uploadProgress: number;
  status: "pending" | "uploading" | "uploaded" | "error";
  errorMessage?: string;
};

type FileListProps = {
  files: FileEntry[];
  onRemove: (index: number) => void;
  removable: boolean;
};

function FileList(props: FileListProps) {
  return (
    <div class="space-y-2">
      <For each={props.files}>
        {(entry, index) => (
          <FileRow
            entry={entry}
            onRemove={() => props.onRemove(index())}
            removable={props.removable}
          />
        )}
      </For>
    </div>
  );
}

function FileRow(props: {
  entry: FileEntry;
  onRemove: () => void;
  removable: boolean;
}) {
  const { entry } = props;
  const [objectUrl, setObjectUrl] = createSignal<string | null>(null);

  onCleanup(() => {
    const url = objectUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  function getSrc(): string {
    let url = objectUrl();
    if (!url) {
      url = URL.createObjectURL(entry.file);
      setObjectUrl(url);
    }
    return url;
  }

  return (
    <div class="space-y-1">
      <AudioPlayer
        name={entry.file.name}
        src={getSrc()}
        size={entry.file.size}
        actions={() => (
          <div class="flex items-center gap-1">
            <Show when={entry.status === "uploaded"}>
              <Badge variant="success" size="sm" aria-label="Uploaded">
                ✓
              </Badge>
            </Show>
            <Show when={entry.status === "error"}>
              <Badge variant="error" size="sm" aria-label="Upload error">
                ✗
              </Badge>
            </Show>
            <Show
              when={
                props.removable
                || entry.status === "uploaded"
                || entry.status === "error"
              }
            >
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Remove ${entry.file.name}`}
                onClick={props.onRemove}
              >
                <X size={14} />
              </IconButton>
            </Show>
          </div>
        )}
      />
      <Show when={entry.status === "uploading"}>
        <div class="px-3">
          <Progress
            max={100}
            success={entry.uploadProgress}
            formatLabel={(done) => `${done}%`}
          />
        </div>
      </Show>
      <Show when={entry.errorMessage}>
        <div class="text-xs text-error-foreground px-3">
          {entry.errorMessage}
        </div>
      </Show>
    </div>
  );
}

export type { FileEntry };
export { FileList };
