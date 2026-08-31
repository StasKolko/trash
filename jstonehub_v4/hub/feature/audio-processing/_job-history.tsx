import type { JobListEntry } from "./audio-processing.api";

import { H3 } from "@packages/ui/typography";
import {
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { JobCard } from "./_job-card";
import { audioProcessingApi } from "./audio-processing.api";

type JobHistoryProps = {
  refreshTrigger: number;
};

const POLL_INTERVAL_MS = 5000;
const PROCESSING_STATUSES = new Set(["active", "waiting", "delayed"]);

function JobHistory(props: JobHistoryProps) {
  const [jobs, setJobs] = createSignal<JobListEntry[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  async function loadJobs() {
    try {
      const result = await audioProcessingApi.getJobs();
      setJobs(result);
    } catch {
      // biome-ignore lint/suspicious/noConsole: non-critical polling error
      console.warn("Failed to load job history");
    } finally {
      setLoading(false);
    }
  }

  function hasActiveJobs(): boolean {
    return jobs().some((j) => PROCESSING_STATUSES.has(j.status));
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => {
      if (hasActiveJobs()) {
        loadJobs();
      }
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  async function handleDelete(jobId: string) {
    setDeletingId(jobId);
    try {
      await audioProcessingApi.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
    } catch {
      // biome-ignore lint/suspicious/noConsole: non-critical delete error
      console.warn("Failed to delete job");
    } finally {
      setDeletingId(null);
    }
  }

  onMount(() => {
    loadJobs();
    startPolling();
  });

  onCleanup(() => {
    stopPolling();
  });

  createEffect(
    on(
      () => props.refreshTrigger,
      () => {
        loadJobs();
      },
      { defer: true },
    ),
  );

  return (
    <div class="space-y-4">
      <H3>Recent Jobs</H3>
      <Show when={loading()}>
        <div class="text-sm text-subtle">Loading...</div>
      </Show>
      <Show when={!loading() && jobs().length === 0}>
        <div class="text-sm text-subtle">No jobs yet</div>
      </Show>
      <For each={jobs()}>
        {(job) => (
          <JobCard
            job={job}
            onDelete={handleDelete}
            deleting={deletingId() === job.jobId}
          />
        )}
      </For>
    </div>
  );
}

export { JobHistory };
