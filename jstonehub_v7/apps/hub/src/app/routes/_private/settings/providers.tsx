import { createFileRoute } from "@tanstack/solid-router";
import { createResource, createSignal, For, Show } from "solid-js";

import { client } from "#hub/shared/api/client";

const Route = createFileRoute("/_private/settings/providers")({
  component: ProvidersPage,
});

function ProvidersPage() {
  const [providers, { refetch }] = createResource(fetchProviders);
  const [unlinking, setUnlinking] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  async function handleUnlink(accountId: string) {
    setUnlinking(accountId);
    setError(null);

    try {
      const { data } = await client.v1.auth.providers({ accountId }).delete();

      if (data && "error" in data) {
        setError(String(data.error));
        return;
      }

      refetch();
    } finally {
      setUnlinking(null);
    }
  }

  return (
    <div class="space-y-6">
      <h2 class="text-lg font-semibold">OAuth Providers</h2>

      <Show when={error()}>
        {(msg) => (
          <div class="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
            {msg()}
          </div>
        )}
      </Show>

      <Show
        when={providers()}
        fallback={<p class="text-gray-400">Loading...</p>}
      >
        {(list) => (
          <div class="space-y-3">
            <For each={list()}>
              {(provider) => (
                <div class="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-4">
                  <div>
                    <p class="text-sm font-medium capitalize">
                      {provider.provider}
                    </p>
                    <p class="text-xs text-gray-500">
                      Connected{" "}
                      {new Date(provider.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Show when={list().length > 1}>
                    <button
                      type="button"
                      onClick={() => handleUnlink(provider.id)}
                      disabled={unlinking() === provider.id}
                      class="rounded bg-gray-800 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-gray-700 disabled:opacity-50"
                    >
                      {unlinking() === provider.id ? "..." : "Unlink"}
                    </button>
                  </Show>
                </div>
              )}
            </For>

            <Show when={list().length <= 1}>
              <p class="text-xs text-gray-500">
                You must have at least one linked provider.
              </p>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}

type ProviderItem = {
  id: string;
  provider: string;
  createdAt: Date | string;
};

async function fetchProviders(): Promise<ProviderItem[]> {
  const { data } = await client.v1.auth.providers.get();

  if (!data || "error" in data) {
    return [];
  }

  return (data.providers ?? []) as ProviderItem[];
}

export { Route };
