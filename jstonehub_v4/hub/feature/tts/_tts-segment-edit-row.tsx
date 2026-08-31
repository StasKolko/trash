import type { TtsJobFileEntry, TtsJobSegmentEntry } from "./_tts-jobs-types";

import { IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { TextareaField } from "@packages/ui/form";
import { Copy, Download, Loader2, RefreshCw, Trash2 } from "lucide-solid";
import {
  createMemo,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";

import { AudioPlayer } from "#hub/shared/ui/audio-player";
import { RoleSelector } from "#hub/shared/ui/segment-editor/segment-editor-role-selector";

import { handleFileDownload } from "./_tts-jobs-helpers";
import {
  DONE_STATUSES,
  FAILED_STATUSES,
  PROCESSING_STATUSES,
  SEGMENT_INDEX_PAD_LENGTH,
} from "./_tts-jobs-types";

type EditSegmentRowProps = {
  seg: TtsJobSegmentEntry;
  index: number;
  allRoles: string[];
  outputFiles: TtsJobFileEntry[];
  onRoleChange: (role: string) => void;
  onTextChange: (text: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRetry: () => void;
  retrying: boolean;
  canDelete: boolean;
};

function EditSegmentRow(props: EditSegmentRowProps) {
  const seg = () => props.seg;
  const isSegDone = () => DONE_STATUSES.has(seg().status);
  const isSegFailed = () => FAILED_STATUSES.has(seg().status);
  const isSegProcessing = () => PROCESSING_STATUSES.has(seg().status);
  const isSegPending = () => seg().status === "pending";

  const [cachedBlobUrl, setCachedBlobUrl] = createSignal<string | null>(null);

  onCleanup(() => {
    const url = cachedBlobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  const segmentFile = createMemo(() => {
    if (!isSegDone()) {
      return null;
    }
    const padded = String(seg().index).padStart(SEGMENT_INDEX_PAD_LENGTH, "0");
    return (
      props.outputFiles.find(
        (f) =>
          f.fileName.includes(`seg_${padded}`)
          || f.fileName.includes(`seg_${seg().index}`),
      ) ?? null
    );
  });

  async function getOrFetchBlobUrl(downloadUrl: string): Promise<string> {
    const existing = cachedBlobUrl();
    if (existing) {
      return existing;
    }
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setCachedBlobUrl(url);
    return url;
  }

  const borderClass = () => {
    if (isSegDone()) {
      return "border-success-border/50";
    }
    if (isSegFailed()) {
      return "border-error-border/50";
    }
    if (isSegPending()) {
      return "border-warning-border/50";
    }
    if (isSegProcessing()) {
      return "border-info-border/50";
    }
    return "border-border/50";
  };

  return (
    <div class={`rounded-md border p-3 space-y-2 ${borderClass()}`}>
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-subtle w-[24px] shrink-0">
          #{props.index + 1}
        </span>

        <RoleSelector
          value={seg().role}
          existingRoles={props.allRoles.filter(
            (r) => r.toLowerCase() !== seg().role.toLowerCase(),
          )}
          onChange={props.onRoleChange}
          disabled={false}
        />

        <div class="flex-1" />

        <Switch>
          <Match when={isSegProcessing()}>
            <Loader2 size={14} class="text-info-foreground animate-spin" />
          </Match>
          <Match when={isSegDone()}>
            <Badge variant="success" size="sm" aria-label="Done">
              ✓
            </Badge>
          </Match>
          <Match when={isSegFailed()}>
            <Badge variant="error" size="sm" aria-label="Failed">
              ✗
            </Badge>
          </Match>
          <Match when={isSegPending()}>
            <Badge variant="warning" size="sm" aria-label="Pending">
              pending
            </Badge>
          </Match>
        </Switch>

        <div class="flex items-center gap-1">
          <Show when={isSegFailed()}>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Retry"
              disabled={props.retrying}
              onClick={props.onRetry}
            >
              <RefreshCw size={12} />
            </IconButton>
          </Show>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Duplicate segment"
            onClick={props.onDuplicate}
          >
            <Copy size={14} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Delete segment"
            disabled={!props.canDelete}
            onClick={props.onDelete}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>

      <TextareaField
        label=""
        value={seg().text}
        onValueChange={props.onTextChange}
        disabled={false}
        readonly={false}
        required={false}
        name={`edit-seg-${seg().index}`}
        maxLength={5000}
        minLength={0}
        placeholder="Segment text..."
        counterLabel={(c, m) => `${c}/${m}`}
      />

      <Show when={isSegDone() && segmentFile()}>
        {(file) => (
          <AudioPlayer
            name={file().fileName}
            src={() => getOrFetchBlobUrl(file().downloadUrl)}
            size={file().sizeBytes}
            actions={(audioState) => (
              <IconButton
                variant="outline"
                size="sm"
                aria-label={`Download ${file().fileName}`}
                onClick={() =>
                  handleFileDownload(
                    audioState.blobUrl,
                    file().downloadUrl,
                    file().fileName,
                  )
                }
              >
                <Download size={14} />
              </IconButton>
            )}
          />
        )}
      </Show>

      <Show when={isSegFailed() && seg().error}>
        <div class="text-xs text-error-foreground">{seg().error}</div>
      </Show>
    </div>
  );
}

export { EditSegmentRow };
