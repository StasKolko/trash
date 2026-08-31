import type { StorageDirectory, StorageFile } from "./storage.api";

import { formatFileSize } from "@packages/contract/format";
import { Button, LoadingButton } from "@packages/ui/action";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { ArrowUp, Folder, Trash2 } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { formatDate } from "./_format";
import {
  createStorageDeleteKeysMutation,
  createStorageDeletePrefixMutation,
  createStorageObjectsQuery,
} from "./storage.query";

function StoragePage() {
  const [prefix, setPrefix] = createSignal("");
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    new Set<string>(),
  );
  const [selectedPrefixes, setSelectedPrefixes] = createSignal<Set<string>>(
    new Set<string>(),
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);

  const query = createStorageObjectsQuery(prefix);
  const deleteKeysMutation = createStorageDeleteKeysMutation();
  const deletePrefixMutation = createStorageDeletePrefixMutation();

  function navigateToPrefix(newPrefix: string) {
    setPrefix(newPrefix);
    setSelectedKeys(new Set<string>());
    setSelectedPrefixes(new Set<string>());
  }

  function navigateUp() {
    const current = prefix();
    if (!current) return;
    const withoutTrailing = current.replace(/\/$/, "");
    const lastSlash = withoutTrailing.lastIndexOf("/");
    navigateToPrefix(
      lastSlash === -1 ? "" : `${withoutTrailing.slice(0, lastSlash + 1)}`,
    );
  }

  function toggleFileKey(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set<string>(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleDirPrefix(dirPrefix: string) {
    setSelectedPrefixes((prev) => {
      const next = new Set<string>(prev);
      if (next.has(dirPrefix)) next.delete(dirPrefix);
      else next.add(dirPrefix);
      return next;
    });
  }

  const selectionCount = () => selectedKeys().size + selectedPrefixes().size;

  async function handleDelete() {
    try {
      const keyArr = [...selectedKeys()];
      const prefixArr = [...selectedPrefixes()];

      const promises: Promise<void>[] = [];
      if (keyArr.length > 0) {
        promises.push(
          new Promise((resolve, reject) =>
            deleteKeysMutation.mutate(keyArr, {
              onSuccess: () => resolve(),
              onError: reject,
            }),
          ),
        );
      }
      for (const p of prefixArr) {
        promises.push(
          new Promise((resolve, reject) =>
            deletePrefixMutation.mutate(p, {
              onSuccess: () => resolve(),
              onError: reject,
            }),
          ),
        );
      }

      await Promise.all(promises);
      toast.success("Deleted successfully");
      setSelectedKeys(new Set<string>());
      setSelectedPrefixes(new Set<string>());
      setDeleteDialogOpen(false);
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div class="p-6 space-y-6">
      <H1>Storage</H1>

      <PathBar
        prefix={prefix()}
        canGoUp={prefix() !== ""}
        onGoUp={navigateUp}
      />

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading…</div>
      </Show>

      <Show when={query.isError}>
        <div class="text-error-foreground text-sm">Failed to load objects</div>
      </Show>

      <Show when={query.data}>
        {(data) => (
          <ObjectTable
            directories={data().directories}
            files={data().files}
            selectedKeys={selectedKeys()}
            selectedPrefixes={selectedPrefixes()}
            onNavigate={navigateToPrefix}
            onToggleFile={toggleFileKey}
            onToggleDir={toggleDirPrefix}
          />
        )}
      </Show>

      <SelectionBar
        count={selectionCount()}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      <Dialog
        alert={true}
        open={deleteDialogOpen()}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm deletion"
        description={`Delete ${selectionCount()} selected item(s)? This cannot be undone.`}
        footer={(close) => (
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              size="sm"
              loading={
                deleteKeysMutation.isPending || deletePrefixMutation.isPending
              }
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </div>
        )}
      />
    </div>
  );
}

function PathBar(props: {
  prefix: string;
  canGoUp: boolean;
  onGoUp: () => void;
}) {
  const segments = () => {
    if (!props.prefix) return ["(root)"];
    return props.prefix.split("/").filter(Boolean);
  };

  return (
    <div class="flex items-center gap-2 text-sm">
      <span class="text-subtle">Path:</span>
      <For each={segments()}>
        {(seg, i) => (
          <>
            <Show when={i() > 0}>
              <span class="text-subtle">/</span>
            </Show>
            <span class="font-medium">{seg}</span>
          </>
        )}
      </For>
      <Show when={props.canGoUp}>
        <Button variant="ghost" size="sm" onClick={props.onGoUp}>
          <ArrowUp size={14} />
        </Button>
      </Show>
    </div>
  );
}

function ObjectTable(props: {
  directories: StorageDirectory[];
  files: StorageFile[];
  selectedKeys: Set<string>;
  selectedPrefixes: Set<string>;
  onNavigate: (prefix: string) => void;
  onToggleFile: (key: string) => void;
  onToggleDir: (prefix: string) => void;
}) {
  const isEmpty = () =>
    props.directories.length === 0 && props.files.length === 0;

  return (
    <div class="border border-border rounded-md overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-secondary/50">
            <th class="w-10 p-3" />
            <th class="text-left p-3 font-medium">Name</th>
            <th class="text-left p-3 font-medium">Size</th>
            <th class="text-left p-3 font-medium">Modified</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.directories}>
            {(dir) => (
              <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                <td class="p-3 text-center">
                  {/* biome-ignore lint/correctness/noRestrictedElements: native checkbox for table selection */}
                  <input
                    type="checkbox"
                    checked={props.selectedPrefixes.has(dir.prefix)}
                    onChange={() => props.onToggleDir(dir.prefix)}
                  />
                </td>
                <td class="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="p-0 h-auto gap-2 font-medium"
                    onClick={() => props.onNavigate(dir.prefix)}
                  >
                    <Folder size={14} />
                    {dir.name}
                  </Button>
                </td>
                <td class="p-3 text-subtle">—</td>
                <td class="p-3 text-subtle">—</td>
              </tr>
            )}
          </For>
          <For each={props.files}>
            {(file) => (
              <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                <td class="p-3 text-center">
                  {/* biome-ignore lint/correctness/noRestrictedElements: native checkbox for table selection */}
                  <input
                    type="checkbox"
                    checked={props.selectedKeys.has(file.key)}
                    onChange={() => props.onToggleFile(file.key)}
                  />
                </td>
                <td class="p-3 font-medium truncate max-w-xs">
                  {file.key.split("/").pop()}
                </td>
                <td class="p-3 text-subtle">{formatFileSize(file.size)}</td>
                <td class="p-3 text-subtle">
                  {formatDate(file.lastModified)}
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <Show when={isEmpty()}>
        <div class="p-8 text-center text-subtle text-sm">No objects found</div>
      </Show>
    </div>
  );
}

function SelectionBar(props: { count: number; onDelete: () => void }) {
  return (
    <Show when={props.count > 0}>
      <div class="flex items-center gap-4">
        <span class="text-sm text-subtle">Selected: {props.count}</span>
        <Button variant="destructive" size="sm" onClick={props.onDelete}>
          <Trash2 size={14} />
          Delete selected
        </Button>
      </div>
    </Show>
  );
}

export { StoragePage };