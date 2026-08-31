import type { TtsJobFileEntry, TtsJobSegmentEntry } from "./_tts-jobs-types";

import { IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { Download, Loader2, RefreshCw } from "lucide-solid";
import {
  createMemo,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";

import { AudioPlayer } from "#hub/shared/ui/audio-player";

import { handleFileDownload } from "./_tts-jobs-helpers";
import {
  DONE_STATUSES,
  FAILED_STATUSES,
  PROCESSING_STATUSES,
  SEGMENT_INDEX_PAD_LENGTH,
} from "./_tts-jobs-types";

type SegmentViewRowProps = {
  segment: TtsJobSegmentEntry;
  outputFiles: TtsJobFileEntry[];
  onRetry: () => void;
  retrying: boolean;
};

function SegmentViewRow(props: SegmentViewRowProps) {
  const seg = () => props.segment;
  const isSegDone = () => DONE_STATUSES.has(seg().status);
  const isSegFailed = () => FAILED_STATUSES.has(seg().status);
  const isSegProcessing = () => PROCESSING_STATUSES.has(seg().status);

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

  return (
    <div class="rounded-md border border-border/50 p-3 space-y-2">
      <div class="flex items-center gap-3 text-sm">
        <span class="text-xs font-mono text-subtle w-[24px] shrink-0">
          #{seg().index + 1}
        </span>
        <Badge variant="info" size="sm" aria-label={seg().role}>
          {seg().role}
        </Badge>
        <span class="flex-1 truncate text-subtle">{seg().text}</span>
        <Switch>
          <Match when={isSegProcessing()}>
            <Loader2
              size={14}
              class="text-info-foreground animate-spin shrink-0"
            />
          </Match>
          <Match when={isSegDone()}>
            <Badge variant="success" size="sm" aria-label="Completed">
              ✓
            </Badge>
          </Match>
          <Match when={isSegFailed()}>
            <div class="flex items-center gap-1 shrink-0">
              <Badge variant="error" size="sm" aria-label="Failed">
                ✗
              </Badge>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="Retry segment"
                disabled={props.retrying}
                onClick={props.onRetry}
              >
                <RefreshCw size={12} />
              </IconButton>
            </div>
          </Match>
          <Match when={seg().status === "pending"}>
            <Badge variant="warning" size="sm" aria-label="Pending">
              pending
            </Badge>
          </Match>
        </Switch>
      </div>

      <Show when={isSegDone() && segmentFile()}>
        {(file) => (
          <div class="pl-[36px]">
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
          </div>
        )}
      </Show>

      <Show when={isSegFailed() && seg().error}>
        <div class="text-xs text-error-foreground pl-[36px]">{seg().error}</div>
      </Show>
    </div>
  );
}

export { SegmentViewRow };
