import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { TextInputField } from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { Plus, Trash2 } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import {
  createLanguageCreateMutation,
  createLanguageDeleteMutation,
  createLanguagesQuery,
} from "./language.query";

function LanguagePage() {
  const query = createLanguagesQuery();
  const createMut = createLanguageCreateMutation();
  const deleteMut = createLanguageDeleteMutation();

  const [createOpen, setCreateOpen] = createSignal(false);
  const [code, setCode] = createSignal("");
  const [name, setName] = createSignal("");
  const [deleteId, setDeleteId] = createSignal<string | null>(null);

  function handleCreate() {
    createMut.mutate(
      { code: code().trim(), name: name().trim() },
      {
        onSuccess: () => {
          toast.success("Language created");
          setCreateOpen(false);
          setCode("");
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
        toast.success("Language deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <H1>Languages</H1>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Add Language
        </Button>
      </div>

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>

      <Show when={query.data}>
        {(languages) => (
          <div class="border border-border rounded-md overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border bg-secondary/50">
                  <th class="text-left p-3 font-medium">Code</th>
                  <th class="text-left p-3 font-medium">Name</th>
                  <th class="text-right p-3 font-medium w-[60px]" />
                </tr>
              </thead>
              <tbody>
                <For each={languages()}>
                  {(lang) => (
                    <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30">
                      <td class="p-3 font-mono">{lang.code}</td>
                      <td class="p-3">{lang.name}</td>
                      <td class="p-3 text-right">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          aria-label="Delete"
                          onClick={() => setDeleteId(lang.id)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
            <Show when={languages().length === 0}>
              <div class="p-8 text-center text-subtle text-sm">
                No languages
              </div>
            </Show>
          </div>
        )}
      </Show>

      <Dialog
        alert={false}
        open={createOpen()}
        onClose={() => setCreateOpen(false)}
        title="Add Language"
        description="Enter language code and display name."
        content={() => (
          <div class="space-y-4">
            <TextInputField
              type="text"
              label="Code"
              value={code()}
              onValueChange={setCode}
              required={true}
              placeholder="e.g. ru"
            />
            <TextInputField
              type="text"
              label="Name"
              value={name()}
              onValueChange={setName}
              required={true}
              placeholder="e.g. Русский"
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
              disabled={!(code().trim() && name().trim())}
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
        title="Delete Language"
        description="Are you sure? This may affect existing translations."
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

export { LanguagePage };
