import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { TextInputField } from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { Plus, Trash2 } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import {
  createTagCreateMutation,
  createTagDeleteMutation,
  createTagsQuery,
} from "./tag.query";

function TagPage() {
  const query = createTagsQuery();
  const createMut = createTagCreateMutation();
  const deleteMut = createTagDeleteMutation();

  const [createOpen, setCreateOpen] = createSignal(false);
  const [slug, setSlug] = createSignal("");
  const [name, setName] = createSignal("");
  const [deleteId, setDeleteId] = createSignal<string | null>(null);

  function handleCreate() {
    createMut.mutate(
      { slug: slug().trim(), name: name().trim() },
      {
        onSuccess: () => {
          toast.success("Tag created");
          setCreateOpen(false);
          setSlug("");
          setName("");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  function handleDelete() {
    const id = deleteId();
    if (!id) {
      return;
    }
    deleteMut.mutate(id, {
      onSuccess: () => {
        toast.success("Tag deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <H1>Tags</H1>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Add Tag
        </Button>
      </div>

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>

      <Show when={query.data}>
        {(tags) => (
          <div class="border border-border rounded-md overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-secondary/50">
                  <th class="text-left p-3 font-medium">Slug</th>
                  <th class="text-left p-3 font-medium">Name</th>
                  <th class="text-right p-3 font-medium w-[60px]" />
                </tr>
              </thead>
              <tbody>
                <For each={tags()}>
                  {(tag) => (
                    <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30">
                      <td class="p-3 font-mono">{tag.slug}</td>
                      <td class="p-3">{tag.name}</td>
                      <td class="p-3 text-right">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Delete"
                          onClick={() => setDeleteId(tag.id)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
            <Show when={tags().length === 0}>
              <div class="p-8 text-center text-subtle text-sm">No tags</div>
            </Show>
          </div>
        )}
      </Show>

      <Dialog
        alert={false}
        open={createOpen()}
        onClose={() => setCreateOpen(false)}
        title="Add Tag"
        description="Enter tag slug and display name."
        content={() => (
          <div class="space-y-4">
            <TextInputField
              type="text"
              label="Slug"
              value={slug()}
              onValueChange={setSlug}
              required={true}
              placeholder="e.g. dark-humor"
            />
            <TextInputField
              type="text"
              label="Name"
              value={name()}
              onValueChange={setName}
              required={true}
              placeholder="e.g. Dark Humor"
            />
          </div>
        )}
        footer={() => (
          <div class="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <LoadingButton
              variant="primary"
              size="sm"
              loading={createMut.isPending}
              disabled={!(slug().trim() && name().trim())}
              onClick={handleCreate}
            >
              Create
            </LoadingButton>
          </div>
        )}
      />

      <Dialog
        alert={true}
        open={deleteId() !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Tag"
        description="Are you sure? This will remove the tag from all jokes."
        footer={(close) => (
          <div class="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
            <LoadingButton
              variant="destructive"
              size="sm"
              loading={deleteMut.isPending}
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

export { TagPage };
