import type { JobListEntry } from "./audio-processing.api";

import { IconButton } from "@packages/ui/action";
import { Download, Loader2, Trash2 } from "lucide-solid";
import { createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";

import { AudioPlayer } from "#hub/shared/ui/audio-player";

import { CountdownTimer } from "./_countdown-timer";

type JobCardProps = {
  job: JobListEntry;
  onDelete: (jobId: string) => void;
  deleting: boolean;
};

const PROCESSING_STATUSES = new Set(["active", "waiting", "delayed"]);

function JobCard(props: JobCardProps) {
  return (
    <Switch>
      <Match when={PROCESSING_STATUSES.has(props.job.status)}>
        <ProcessingCard job={props.job} />
      </Match>
      <Match when={props.job.status === "completed"}>
        <CompletedCard
          job={props.job}
          onDelete={props.onDelete}
          deleting={props.deleting}
        />
      </Match>
      <Match when={props.job.status === "failed"}>
        <FailedCard
          job={props.job}
          onDelete={props.onDelete}
          deleting={props.deleting}
        />
      </Match>
    </Switch>
  );
}

function ProcessingCard(props: { job: JobListEntry }) {
  const modeLabel = () =>
    props.job.isConcatenated ? "Concatenated" : "Individual";
  const fileLabel = () =>
    props.job.fileCount > 1 ? `${props.job.fileCount} files` : "1 file";

  return (
    <div class="rounded-lg border border-info-border bg-info/10 p-4 space-y-1 animate-pulse">
      <div class="flex items-center gap-2">
        <Loader2 size={16} class="text-info-foreground animate-spin" />
        <span class="text-sm font-medium text-foreground">
          {props.job.name}
        </span>
        <Show when={!props.job.isConcatenated}>
          <span class="text-xs text-subtle">({fileLabel()})</span>
        </Show>
      </div>
      <div class="text-xs text-subtle">{modeLabel()} • Processing...</div>
    </div>
  );
}

function CompletedCard(props: {
  job: JobListEntry;
  onDelete: (jobId: string) => void;
  deleting: boolean;
}) {
  const files = () => props.job.files ?? [];
  const hasMultipleFiles = () => files().length > 1;

  function handleDownloadAll() {
    for (const file of files()) {
      downloadFile(file.downloadUrl, file.fileName);
    }
  }

  return (
    <div class="rounded-lg border border-success-border bg-success/10 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-foreground">
            {props.job.name}
          </span>
          <Show when={hasMultipleFiles()}>
            <span class="text-xs text-subtle">({files().length} files)</span>
          </Show>
        </div>
        <div class="flex items-center gap-2">
          <CountdownTimer expiresAt={props.job.expiresAt} />
          <Show when={hasMultipleFiles()}>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Download all files"
              onClick={handleDownloadAll}
            >
              <Download size={14} />
            </IconButton>
          </Show>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label={`Delete ${props.job.name}`}
            disabled={props.deleting}
            onClick={() => props.onDelete(props.job.jobId)}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
      <div class="space-y-2">
        <For each={files()}>
          {(file) => (
            <CompletedFileRow
              fileName={file.fileName}
              sizeBytes={file.sizeBytes}
              downloadUrl={file.downloadUrl}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function CompletedFileRow(props: {
  fileName: string;
  sizeBytes: number;
  downloadUrl: string;
}) {
  const [cachedBlobUrl, setCachedBlobUrl] = createSignal<string | null>(null);

  onCleanup(() => {
    const url = cachedBlobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  async function getOrFetchBlobUrl(): Promise<string> {
    const existing = cachedBlobUrl();
    if (existing) {
      return existing;
    }
    const response = await fetch(props.downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setCachedBlobUrl(url);
    return url;
  }

  return (
    <AudioPlayer
      name={props.fileName}
      src={getOrFetchBlobUrl}
      size={props.sizeBytes}
      actions={(audioState) => (
        <IconButton
          variant="outline"
          size="sm"
          aria-label={`Download ${props.fileName}`}
          onClick={() =>
            handleFileDownload(
              audioState.blobUrl,
              props.downloadUrl,
              props.fileName,
            )
          }
        >
          <Download size={14} />
        </IconButton>
      )}
    />
  );
}

function FailedCard(props: {
  job: JobListEntry;
  onDelete: (jobId: string) => void;
  deleting: boolean;
}) {
  return (
    <div class="rounded-lg border border-error-border bg-error/10 p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-foreground">
          {props.job.name}
        </span>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label={`Delete ${props.job.name}`}
          disabled={props.deleting}
          onClick={() => props.onDelete(props.job.jobId)}
        >
          <Trash2 size={14} />
        </IconButton>
      </div>
      <div class="text-xs text-error-foreground mt-1">
        {props.job.error ?? "Processing failed"}
      </div>
    </div>
  );
}

function handleFileDownload(
  blobUrl: string | null,
  downloadUrl: string,
  fileName: string,
) {
  if (blobUrl) {
    triggerDownload(blobUrl, fileName);
  } else {
    fetch(downloadUrl)
      .then((r) => r.blob())
      .then((b) => {
        const url = URL.createObjectURL(b);
        triggerDownload(url, fileName);
        URL.revokeObjectURL(url);
      });
  }
}

function downloadFile(url: string, fileName: string) {
  fetch(url)
    .then((r) => r.blob())
    .then((b) => {
      const blobUrl = URL.createObjectURL(b);
      triggerDownload(blobUrl, fileName);
      URL.revokeObjectURL(blobUrl);
    });
}

function triggerDownload(blobUrl: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export { JobCard };
