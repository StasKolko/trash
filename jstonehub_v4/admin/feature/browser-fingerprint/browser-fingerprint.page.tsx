import type { BrowserFingerprintResponse } from "./browser-fingerprint.api";

import { DEBOUNCE_SEARCH_DEFAULT } from "@packages/contract/timing";
import { Button } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SearchInput } from "@packages/ui/form";
import { toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { debounce } from "@packages/util/timing";
import { useNavigate, useSearch } from "@tanstack/solid-router";
import { Plus } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import {
  createBrowserFingerprintDeleteMutation,
  createBrowserFingerprintsQuery,
  createBrowserFingerprintUpdateMutation,
} from "./browser-fingerprint.query";
import { BrowserFingerprintCreateDialog } from "./browser-fingerprint-create.dialog";
import { BrowserFingerprintDetailDialog } from "./browser-fingerprint-detail.dialog";

type BrowserFingerprintSearch = {
  query: string;
  sort: string;
  order: "asc" | "desc";
  status: "all" | ("active" | "inactive")[];
};

function BrowserFingerprintPage() {
  const search = useSearch({
    from: "/_auth/infrastructure/browser-fingerprint",
  }) as () => BrowserFingerprintSearch;
  const navigate = useNavigate({
    from: "/infrastructure/browser-fingerprint",
  });

  const [searchValue, setSearchValue] = createSignal(search().query);
  const [selectedFingerprint, setSelectedFingerprint] =
    createSignal<BrowserFingerprintResponse | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = createSignal(false);

  const query = createBrowserFingerprintsQuery(() => ({
    query: search().query,
    sort: search().sort,
    order: search().order,
    status: search().status,
  }));

  const updateMutation = createBrowserFingerprintUpdateMutation();
  const deleteMutation = createBrowserFingerprintDeleteMutation();

  const debouncedNavigate = debounce((value: string) => {
    navigate({
      search: (prev: BrowserFingerprintSearch) => ({ ...prev, query: value }),
    });
  }, DEBOUNCE_SEARCH_DEFAULT);

  function handleSearchChange(value: string) {
    setSearchValue(value);
    debouncedNavigate(value);
  }

  function handleUpdate(id: string, data: Record<string, unknown>) {
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success("Fingerprint updated");
          setSelectedFingerprint(null);
        },
        onError: () => toast.error("Failed to update fingerprint"),
      },
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Fingerprint deleted");
        setSelectedFingerprint(null);
      },
      onError: () => toast.error("Failed to delete fingerprint"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <PageHeader onCreateClick={() => setCreateDialogOpen(true)} />
      <SearchBar value={searchValue()} onValueChange={handleSearchChange} />
      <QueryStatus loading={query.isLoading} error={query.isError} />
      <Show when={query.data}>
        {(fingerprints) => (
          <FingerprintTable
            fingerprints={fingerprints()}
            onSelect={setSelectedFingerprint}
          />
        )}
      </Show>
      <BrowserFingerprintCreateDialog
        open={createDialogOpen()}
        onClose={() => setCreateDialogOpen(false)}
      />
      <BrowserFingerprintDetailDialog
        fingerprint={selectedFingerprint()}
        onClose={() => setSelectedFingerprint(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        updating={updateMutation.isPending}
        deleting={deleteMutation.isPending}
      />
    </div>
  );
}

function PageHeader(props: { onCreateClick: () => void }) {
  return (
    <div class="flex items-center justify-between">
      <H1>Browser Fingerprints</H1>
      <Button variant="primary" size="sm" onClick={props.onCreateClick}>
        <Plus size={16} />
        Create
      </Button>
    </div>
  );
}

function SearchBar(props: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  return (
    <div class="flex items-center gap-4">
      <SearchInput
        value={props.value}
        onValueChange={props.onValueChange}
        clearLabel="Clear search"
        placeholder="Search by label..."
      />
    </div>
  );
}

function QueryStatus(props: { loading: boolean; error: boolean }) {
  return (
    <>
      <Show when={props.loading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>
      <Show when={props.error}>
        <div class="text-error-foreground text-sm">
          Failed to load fingerprints
        </div>
      </Show>
    </>
  );
}

function FingerprintTable(props: {
  fingerprints: BrowserFingerprintResponse[];
  onSelect: (fp: BrowserFingerprintResponse) => void;
}) {
  return (
    <div class="border border-border rounded-md overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-secondary/50">
            <th class="text-left p-3 font-medium">Label</th>
            <th class="text-left p-3 font-medium">Platform</th>
            <th class="text-left p-3 font-medium">Screen</th>
            <th class="text-left p-3 font-medium">Timezone</th>
            <th class="text-left p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.fingerprints}>
            {(fp) => (
              <FingerprintRow fingerprint={fp} onSelect={props.onSelect} />
            )}
          </For>
        </tbody>
      </table>
      <Show when={props.fingerprints.length === 0}>
        <div class="p-8 text-center text-subtle text-sm">
          No fingerprints found
        </div>
      </Show>
    </div>
  );
}

function FingerprintRow(props: {
  fingerprint: BrowserFingerprintResponse;
  onSelect: (fp: BrowserFingerprintResponse) => void;
}) {
  const fp = props.fingerprint;

  return (
    <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
      <td class="p-3">
        <Button
          variant="ghost"
          size="sm"
          class="text-left text-primary hover:underline font-medium p-0 h-auto"
          onClick={() => props.onSelect(fp)}
        >
          {fp.label}
        </Button>
      </td>
      <td class="p-3 text-subtle">{fp.platform}</td>
      <td class="p-3 text-subtle">
        {fp.screenWidth}×{fp.screenHeight}
      </td>
      <td class="p-3 text-subtle">{fp.timezone}</td>
      <td class="p-3">
        <Badge
          variant={fp.isActive ? "success" : "warning"}
          size="sm"
          aria-label={fp.isActive ? "Active status" : "Inactive status"}
        >
          {fp.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
    </tr>
  );
}

export { BrowserFingerprintPage };
