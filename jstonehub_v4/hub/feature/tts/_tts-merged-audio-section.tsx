import type {
  JobFileEntry,
  JobListEntry,
} from "#hub/feature/audio-processing/audio-processing.api";

import { IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { toast } from "@packages/ui/overlay";
import { H3 } from "@packages/ui/typography";
import { Download, Loader2, Trash2 } from "lucide-solid";
import {
  createEffect,
  createSignal,
  For,
  Match,
  on,
  onCleanup,
  Switch,
} from "solid-js";

import { audioProcessingApi } from "#hub/feature/audio-processing/audio-processing.api";
import { AudioPlayer } from "#hub/shared/ui/audio-player";

import { ttsApi } from "./tts.api";

type MergedAudioSectionProps = {
  projectId: string;
  audioProcessingJobId: string | null;
  onDeleted: () => void;
};

type MergedState =
  | { phase: "idle" }
  | { phase: "polling"; jobId: string }
  | { phase: "completed"; jobId: string; files: JobFileEntry[] }
  | { phase: "failed"; jobId: string; error: string };

const POLL_INTERVAL_MS = 4000;
const ACTIVE_STATUSES = new Set(["active", "waiting", "delayed"]);

function MergedAudioSection(props: MergedAudioSectionProps) {
  const [state, setState] = createSignal<MergedState>({ phase: "idle" });
  const [deleting, setDeleting] = createSignal(false);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  onCleanup(() => stopPolling());

  createEffect(
    on(
      () => props.audioProcessingJobId,
      (jobId) => {
        stopPolling();

        if (!jobId) {
          setState({ phase: "idle" });
          return;
        }

        setState({ phase: "polling", jobId });
        loadJobStatus(jobId);
        pollTimer = setInterval(() => loadJobStatus(jobId), POLL_INTERVAL_MS);
      },
    ),
  );

  async function loadJobStatus(jobId: string) {
    try {
      const job = await audioProcessingApi.getJobStatus(jobId);
      applyJobState(jobId, job);
    } catch {
      // Job not found (404) or other error — stop polling, go idle
      stopPolling();
      setState({ phase: "idle" });
    }
  }

  function applyJobState(jobId: string, job: JobListEntry) {
    if (job.status === "completed" && job.files && job.files.length > 0) {
      stopPolling();
      setState({ phase: "completed", jobId, files: job.files });
      return;
    }

    if (job.status === "failed") {
      stopPolling();
      setState({
        phase: "failed",
        jobId,
        error: job.error ?? "Merge failed",
      });
      return;
    }

    if (!ACTIVE_STATUSES.has(job.status)) {
      stopPolling();
      setState({ phase: "idle" });
    }
  }

  async function handleDelete() {
    const current = state();
    if (current.phase !== "completed" && current.phase !== "failed") {
      return;
    }

    setDeleting(true);
    try {
      // Delete merged files from storage via dedicated endpoint
      await ttsApi.deleteMergedAudio(props.projectId);

      // Also try to remove the audio-processing job entry
      try {
        await audioProcessingApi.deleteJob(current.jobId);
      } catch {
        // non-critical — job may already be gone
      }

      toast.success("Merged audio deleted");
      setState({ phase: "idle" });
      props.onDeleted();
    } catch {
      toast.error("Failed to delete merged audio");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Switch>
      <Match when={state().phase === "idle"}>{null}</Match>

      <Match when={state().phase === "polling"}>
        <PollingSection />
      </Match>

      <Match when={state().phase === "completed"}>
        <CompletedSection
          files={(state() as { files: JobFileEntry[] }).files}
          deleting={deleting()}
          onDelete={handleDelete}
        />
      </Match>

      <Match when={state().phase === "failed"}>
        <FailedSection
          error={(state() as { error: string }).error}
          deleting={deleting()}
          onDelete={handleDelete}
        />
      </Match>
    </Switch>
  );
}

function PollingSection() {
  return (
    <div class="rounded-lg border border-info-border bg-info/10 p-4 space-y-2">
      <div class="flex items-center gap-2">
        <Loader2 size={16} class="text-info-foreground animate-spin" />
        <H3>Merging segments…</H3>
      </div>
      <div class="text-xs text-subtle">
        This may take a moment. The result will appear here automatically.
      </div>
    </div>
  );
}

function CompletedSection(props: {
  files: JobFileEntry[];
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div class="rounded-lg border border-success-border bg-success/10 p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Badge variant="success" size="sm" aria-label="Merged">
            Merged
          </Badge>
          <H3>Full Audio</H3>
        </div>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Delete merged audio"
          disabled={props.deleting}
          onClick={props.onDelete}
        >
          <Trash2 size={14} />
        </IconButton>
      </div>

      <div class="space-y-2">
        <For each={props.files}>{(file) => <MergedFileRow file={file} />}</For>
      </div>
    </div>
  );
}

function MergedFileRow(props: { file: JobFileEntry }) {
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
    const response = await fetch(props.file.downloadUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setCachedBlobUrl(url);
    return url;
  }

  function handleDownload() {
    const blobUrl = cachedBlobUrl();
    if (blobUrl) {
      triggerDownload(blobUrl, props.file.fileName);
    } else {
      fetch(props.file.downloadUrl)
        .then((r) => r.blob())
        .then((b) => {
          const url = URL.createObjectURL(b);
          triggerDownload(url, props.file.fileName);
          URL.revokeObjectURL(url);
        });
    }
  }

  return (
    <AudioPlayer
      name={props.file.fileName}
      src={getOrFetchBlobUrl}
      size={props.file.sizeBytes}
      actions={(audioState) => (
        <IconButton
          variant="outline"
          size="sm"
          aria-label={`Download ${props.file.fileName}`}
          onClick={() => {
            if (audioState.blobUrl) {
              triggerDownload(audioState.blobUrl, props.file.fileName);
            } else {
              handleDownload();
            }
          }}
        >
          <Download size={14} />
        </IconButton>
      )}
    />
  );
}

function FailedSection(props: {
  error: string;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div class="rounded-lg border border-error-border bg-error/10 p-4 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Badge variant="error" size="sm" aria-label="Failed">
            Failed
          </Badge>
          <H3>Merge Failed</H3>
        </div>
        <LoadingButton
          variant="ghost"
          size="sm"
          loading={props.deleting}
          onClick={props.onDelete}
        >
          <Trash2 size={14} />
          Clear
        </LoadingButton>
      </div>
      <div class="text-xs text-error-foreground">{props.error}</div>
    </div>
  );
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

export { MergedAudioSection };
