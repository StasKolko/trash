import { createFileRoute } from "@tanstack/solid-router";
import { createResource, createSignal, For, Show } from "solid-js";

import { client } from "#hub/shared/api/client";

const Route = createFileRoute("/_private/settings/sessions")({
  component: SessionsPage,
});

function SessionsPage() {
  const [sessions, { refetch }] = createResource(fetchSessions);
  const [revoking, setRevoking] = createSignal<string | null>(null);
  const [revokingAll, setRevokingAll] = createSignal(false);

  async function handleRevoke(sessionId: string) {
    setRevoking(sessionId);
    try {
      await client.v1.auth.sessions({ sessionId }).delete();
      refetch();
    } finally {
      setRevoking(null);
    }
  }

  async function handleRevokeAll() {
    setRevokingAll(true);
    try {
      await client.v1.auth.sessions.delete();
      window.location.href = "/login";
    } finally {
      setRevokingAll(false);
    }
  }

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Active Sessions</h2>
        <button
          type="button"
          onClick={handleRevokeAll}
          disabled={revokingAll()}
          class="rounded bg-red-900 px-3 py-1.5 text-xs text-red-200 transition hover:bg-red-800 disabled:opacity-50"
        >
          {revokingAll() ? "Revoking..." : "Revoke All"}
        </button>
      </div>

      <Show
        when={sessions()}
        fallback={<p class="text-gray-400">Loading...</p>}
      >
        {(list) => (
          <div class="space-y-3">
            <For each={list()}>
              {(session) => (
                <div class="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium">
                        {session.browser ?? "Unknown browser"}
                      </span>
                      <span class="text-xs text-gray-500">on</span>
                      <span class="text-sm text-gray-300">
                        {session.os ?? "Unknown OS"}
                      </span>
                      <Show when={session.isCurrent}>
                        <span class="rounded bg-green-900 px-1.5 py-0.5 text-xs text-green-300">
                          Current
                        </span>
                      </Show>
                    </div>
                    <div class="mt-1 flex gap-4 text-xs text-gray-500">
                      <span>{session.deviceType ?? "unknown"}</span>
                      <span>{session.ipAddress ?? "unknown IP"}</span>
                      <span>
                        Last active:{" "}
                        {new Date(session.lastActiveAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Show when={!session.isCurrent}>
                    <button
                      type="button"
                      onClick={() => handleRevoke(session.id)}
                      disabled={revoking() === session.id}
                      class="rounded bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-gray-700 disabled:opacity-50"
                    >
                      {revoking() === session.id ? "..." : "Revoke"}
                    </button>
                  </Show>
                </div>
              )}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
}

type SessionItem = {
  id: string;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  ipAddress: string | null;
  createdAt: Date | string;
  lastActiveAt: Date | string;
  isCurrent: boolean;
};

async function fetchSessions(): Promise<SessionItem[]> {
  const { data } = await client.v1.auth.sessions.get();

  if (!data || "error" in data) {
    return [];
  }

  return (data.sessions ?? []) as SessionItem[];
}

export { Route };
