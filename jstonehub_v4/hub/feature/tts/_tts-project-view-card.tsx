import type { TtsJobEntry } from "./_tts-jobs-types";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { Progress } from "@packages/ui/feedback";
import { toast } from "@packages/ui/overlay";
import {
  Download,
  Loader2,
  Merge,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { downloadAllFiles } from "./_tts-jobs-helpers";
import {
  DONE_STATUSES,
  FAILED_STATUSES,
  PROCESSING_STATUSES,
} from "./_tts-jobs-types";
import { MergedAudioSection } from "./_tts-merged-audio-section";
import { SegmentViewRow } from "./_tts-segment-view-row";
import {
  createRetryAllFailedMutation,
  createRetrySegmentMutation,
  createSynthesizeAllPendingMutation,
} from "./tts.query";

const RETRY_REFRESH_DELAY_MS = 1500;
const RETRY_REFRESH_SECOND_DELAY_MS = 4000;

function useProjectStats(project: () => TtsJobEntry) {
  const segments = () => project().segments ?? [];

  const completedCount = () =>
    segments().filter((s) => DONE_STATUSES.has(s.status)).length;
  const failedCount = () =>
    segments().filter((s) => FAILED_STATUSES.has(s.status)).length;
  const pendingCount = () =>
    segments().filter((s) => s.status === "pending").length;
  const totalCount = () => segments().length;

  const isProcessing = () =>
    PROCESSING_STATUSES.has(project().status)
    || segments().some((s) => PROCESSING_STATUSES.has(s.status));

  const allCompleted = () =>
    completedCount() === totalCount()
    && totalCount() > 0
    && failedCount() === 0;

  const statusVariant = (): "success" | "error" | "warning" | "info" => {
    if (failedCount() > 0 && completedCount() > 0) {
      return "warning";
    }
    if (FAILED_STATUSES.has(project().status)) {
      return "error";
    }
    if (allCompleted()) {
      return "success";
    }
    return "info";
  };

  const statusLabel = () => {
    if (allCompleted()) {
      return "Completed";
    }
    if (isProcessing()) {
      return "Processing";
    }
    if (FAILED_STATUSES.has(project().status)) {
      return "Failed";
    }
    if (failedCount() > 0) {
      return "Partial";
    }
    return project().status;
  };

  return {
    segments,
    completedCount,
    failedCount,
    pendingCount,
    totalCount,
    isProcessing,
    allCompleted,
    statusVariant,
    statusLabel,
  };
}

function ViewCardHeader(props: {
  project: TtsJobEntry;
  stats: ReturnType<typeof useProjectStats>;
  hasMergedAudio: boolean;
  retryAllPending: boolean;
  synthPending: boolean;
  onRetryAll: () => void;
  onSynthPending: () => void;
  onDownloadSegments: () => void;
  onOpenMerge: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { stats } = props;
  const showMergeButton = () =>
    stats.allCompleted() && stats.totalCount() > 1 && !props.hasMergedAudio;

  return (
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Show when={stats.isProcessing()}>
          <Loader2 size={16} class="text-info-foreground animate-spin" />
        </Show>
        <span class="text-sm font-medium">{props.project.name}</span>
        <Badge
          variant={stats.statusVariant()}
          size="sm"
          aria-label={stats.statusLabel()}
        >
          {stats.statusLabel()}
        </Badge>
      </div>

      <div class="flex items-center gap-1">
        <Show when={stats.allCompleted() && stats.totalCount() > 1}>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onDownloadSegments}
          >
            <Download size={14} />
            Segments
          </Button>
        </Show>
        <Show when={stats.allCompleted() && stats.totalCount() === 1}>
          <Button
            variant="outline"
            size="sm"
            onClick={props.onDownloadSegments}
          >
            <Download size={14} />
            Download
          </Button>
        </Show>
        <Show when={showMergeButton()}>
          <Button variant="primary" size="sm" onClick={props.onOpenMerge}>
            <Merge size={14} />
            Merge
          </Button>
        </Show>
        <Show when={stats.failedCount() > 0}>
          <LoadingButton
            variant="outline"
            size="sm"
            loading={props.retryAllPending}
            onClick={props.onRetryAll}
          >
            <RefreshCw size={14} />
            Retry failed ({stats.failedCount()})
          </LoadingButton>
        </Show>
        <Show when={stats.pendingCount() > 0 && !stats.isProcessing()}>
          <LoadingButton
            variant="outline"
            size="sm"
            loading={props.synthPending}
            onClick={props.onSynthPending}
          >
            <RefreshCw size={14} />
            Synth pending ({stats.pendingCount()})
          </LoadingButton>
        </Show>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Edit project"
          onClick={props.onEdit}
        >
          <Pencil size={14} />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Delete project"
          onClick={props.onDelete}
        >
          <Trash2 size={14} />
        </IconButton>
      </div>
    </div>
  );
}

function delayedRefresh(onRefresh: () => void) {
  setTimeout(() => onRefresh(), RETRY_REFRESH_DELAY_MS);
  setTimeout(() => onRefresh(), RETRY_REFRESH_SECOND_DELAY_MS);
}

function ProjectViewCard(props: {
  project: TtsJobEntry;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onOpenMerge: () => void;
}) {
  const project = () => props.project;
  const stats = useProjectStats(project);

  const retryAllMutation = createRetryAllFailedMutation();
  const synthPendingMutation = createSynthesizeAllPendingMutation();
  const retrySegMutation = createRetrySegmentMutation();

  const [mergedDeleted, setMergedDeleted] = createSignal(false);

  const activeAudioJobId = () => {
    if (mergedDeleted()) {
      return null;
    }
    return project().audioProcessingJobId;
  };

  const hasMergedAudio = () => activeAudioJobId() !== null;

  function handleRetryAll() {
    retryAllMutation.mutate(project().jobId, {
      onSuccess: () => {
        toast.success("Retrying all failed");
        props.onRefresh();
        delayedRefresh(props.onRefresh);
      },
      onError: () => toast.error("Failed to retry"),
    });
  }

  function handleSynthPending() {
    synthPendingMutation.mutate(project().jobId, {
      onSuccess: () => {
        toast.success("Synthesizing pending segments");
        props.onRefresh();
        delayedRefresh(props.onRefresh);
      },
      onError: () => toast.error("Failed to synthesize"),
    });
  }

  function handleRetrySegment(index: number) {
    retrySegMutation.mutate(
      { projectId: project().jobId, segmentIndex: index },
      {
        onSuccess: () => {
          toast.success("Retry started");
          props.onRefresh();
          delayedRefresh(props.onRefresh);
        },
        onError: () => toast.error("Failed to retry segment"),
      },
    );
  }

  function handleDownloadSegments() {
    const files = project().outputFiles.map((f) => ({
      downloadUrl: f.downloadUrl,
      fileName: f.fileName,
    }));
    downloadAllFiles(files).catch(() => {
      toast.error("Failed to download files");
    });
  }

  function handleMergedDeleted() {
    setMergedDeleted(true);
    props.onRefresh();
  }

  return (
    <div class="rounded-lg border border-border p-4 space-y-4 bg-card">
      <ViewCardHeader
        project={project()}
        stats={stats}
        hasMergedAudio={hasMergedAudio()}
        retryAllPending={retryAllMutation.isPending}
        synthPending={synthPendingMutation.isPending}
        onRetryAll={handleRetryAll}
        onSynthPending={handleSynthPending}
        onDownloadSegments={handleDownloadSegments}
        onOpenMerge={props.onOpenMerge}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
      />

      <MergedAudioSection
        projectId={project().jobId}
        audioProcessingJobId={activeAudioJobId()}
        onDeleted={handleMergedDeleted}
      />

      <Show when={stats.totalCount() > 0}>
        <Progress
          max={stats.totalCount()}
          success={stats.completedCount()}
          error={stats.failedCount()}
          formatLabel={(processed, max) => `${processed} / ${max} segments`}
        />
      </Show>

      <div class="space-y-2">
        <For each={stats.segments()}>
          {(segment) => (
            <SegmentViewRow
              segment={segment}
              outputFiles={project().outputFiles}
              onRetry={() => handleRetrySegment(segment.index)}
              retrying={retrySegMutation.isPending}
            />
          )}
        </For>
      </div>
    </div>
  );
}

export { ProjectViewCard };
