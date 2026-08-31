import type { SecretVoicerVoice } from "@packages/contract/secret-voicer";

import type { TtsJobEntry } from "./_tts-jobs-types";
import type { MergeConfig } from "./_tts-merge-dialog";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { Link } from "@tanstack/solid-router";
import { Plus, RefreshCw } from "lucide-solid";
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";

import { PROCESSING_STATUSES } from "./_tts-jobs-types";
import { TtsMergeDialog } from "./_tts-merge-dialog";
import { ProjectEditCard } from "./_tts-project-edit-card";
import { ProjectViewCard } from "./_tts-project-view-card";
import { ttsApi } from "./tts.api";
import {
  createDeleteProjectMutation,
  createMergeSegmentsMutation,
  createTtsProjectsQuery,
  createVoicesQuery,
} from "./tts.query";

const POLL_INTERVAL_MS = 4000;

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: REFACTOR
function TtsJobsPage() {
  const projectsQuery = createTtsProjectsQuery();
  const voicesQuery = createVoicesQuery();
  const deleteMutation = createDeleteProjectMutation();
  const mergeMutation = createMergeSegmentsMutation();

  const [deleteDialogId, setDeleteDialogId] = createSignal<string | null>(null);
  const [mergeDialogProjectId, setMergeDialogProjectId] = createSignal<
    string | null
  >(null);
  const [forcePolling, setForcePolling] = createSignal(false);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function hasActiveProjects(): boolean {
    return (projectsQuery.data ?? []).some(
      (p) =>
        PROCESSING_STATUSES.has(p.status)
        || (p.segments ?? []).some((s) => PROCESSING_STATUSES.has(s.status)),
    );
  }

  function shouldPoll(): boolean {
    return hasActiveProjects() || forcePolling();
  }

  function startPolling() {
    if (pollTimer) {
      return;
    }
    pollTimer = setInterval(() => {
      if (shouldPoll()) {
        projectsQuery.refetch();
      } else {
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    setForcePolling(false);
  }

  function ensurePolling() {
    setForcePolling(true);
    startPolling();
    // biome-ignore lint/style/noMagicNumbers: REFACTOR
    setTimeout(() => setForcePolling(false), POLL_INTERVAL_MS * 5);
  }

  createEffect(() => {
    if (hasActiveProjects()) {
      startPolling();
    }
  });

  onCleanup(() => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  });

  function handleDelete(projectId: string) {
    deleteMutation.mutate(projectId, {
      onSuccess: () => {
        toast.success("Project deleted");
        setDeleteDialogId(null);
      },
      onError: () => toast.error("Failed to delete project"),
    });
  }

  function handleRefresh() {
    projectsQuery.refetch();
    ensurePolling();
  }

  function handleMergeConfirm(config: MergeConfig) {
    const projectId = mergeDialogProjectId();
    if (!projectId) {
      return;
    }

    mergeMutation.mutate(
      { projectId, params: config },
      {
        onSuccess: () => {
          toast.success("Merge started");
          setMergeDialogProjectId(null);
          handleRefresh();
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to start merge",
          );
        },
      },
    );
  }

  const mergeProject = () => {
    const id = mergeDialogProjectId();
    if (!id) {
      return null;
    }
    return (projectsQuery.data ?? []).find((p) => p.jobId === id) ?? null;
  };

  const mergeSegmentCount = () => {
    const project = mergeProject();
    if (!project) {
      return 0;
    }
    return (project.segments ?? []).filter((s) => s.status === "completed")
      .length;
  };

  const previewApi = {
    getPreviewUrl: async (voiceId: string, url: string): Promise<string> => {
      const result = await ttsApi.getPreviewUrl(voiceId, url);
      return result.downloadUrl;
    },
  };

  return (
    <div class="p-6 space-y-6 max-w-3xl">
      <div class="flex items-center justify-between">
        <H1>TTS Projects</H1>
        <div class="flex items-center gap-2">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Refresh"
            onClick={() => projectsQuery.refetch()}
          >
            <RefreshCw size={16} />
          </IconButton>
          <Link to="/tool/tts/create">
            <Button variant="primary" size="sm">
              <Plus size={16} />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      <Show when={projectsQuery.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>

      <Show
        when={
          !projectsQuery.isLoading && (projectsQuery.data ?? []).length === 0
        }
      >
        <div class="text-subtle text-sm text-center py-8">
          No TTS projects yet.
        </div>
      </Show>

      <div class="space-y-4">
        <For each={projectsQuery.data ?? []}>
          {(project) => (
            <ProjectCard
              project={project}
              voices={voicesQuery.data ?? []}
              voicesLoading={voicesQuery.isLoading}
              previewApi={previewApi}
              onDelete={() => setDeleteDialogId(project.jobId)}
              onRefresh={handleRefresh}
              onOpenMerge={() => setMergeDialogProjectId(project.jobId)}
            />
          )}
        </For>
      </div>

      <Dialog
        alert={true}
        open={deleteDialogId() !== null}
        onClose={() => setDeleteDialogId(null)}
        title="Delete Project"
        description="This will delete all audio files and cannot be undone."
        footer={(close) => (
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              size="sm"
              loading={deleteMutation.isPending}
              onClick={() => {
                const id = deleteDialogId();
                if (id) {
                  handleDelete(id);
                }
              }}
            >
              Delete
            </LoadingButton>
          </div>
        )}
      />

      <TtsMergeDialog
        open={mergeDialogProjectId() !== null}
        onClose={() => setMergeDialogProjectId(null)}
        onConfirm={handleMergeConfirm}
        loading={mergeMutation.isPending}
        segmentCount={mergeSegmentCount()}
      />
    </div>
  );
}

type ProjectCardProps = {
  project: TtsJobEntry;
  voices: SecretVoicerVoice[];
  voicesLoading: boolean;
  previewApi: {
    getPreviewUrl: (voiceId: string, url: string) => Promise<string>;
  };
  onDelete: () => void;
  onRefresh: () => void;
  onOpenMerge: () => void;
};

function ProjectCard(props: ProjectCardProps) {
  const [editing, setEditing] = createSignal(false);

  return (
    <Show
      when={editing()}
      fallback={
        <ProjectViewCard
          project={props.project}
          onEdit={() => setEditing(true)}
          onDelete={props.onDelete}
          onRefresh={props.onRefresh}
          onOpenMerge={props.onOpenMerge}
        />
      }
    >
      <ProjectEditCard
        project={props.project}
        voices={props.voices}
        voicesLoading={props.voicesLoading}
        previewApi={props.previewApi}
        onClose={() => setEditing(false)}
        onRefresh={props.onRefresh}
      />
    </Show>
  );
}

export { TtsJobsPage };
