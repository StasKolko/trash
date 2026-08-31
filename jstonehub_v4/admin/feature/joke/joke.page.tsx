import type { GetJokesFilters, JokeResponse } from "./joke.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SearchInput, SelectField } from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H1 } from "@packages/ui/typography";
import { Eye, Plus, Trash2 } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";

import { createJokeDeleteMutation, createJokesQuery } from "./joke.query";
import { JokeCreateDialog } from "./joke-create.dialog";
import { JokeDetailDialog } from "./joke-detail.dialog";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Approved" },
];

const STATUS_VARIANT_MAP: Record<string, "info" | "warning" | "success"> = {
  draft: "info",
  review: "warning",
  approved: "success",
};

const PREVIEW_MAX_LENGTH = 80;

function JokePage() {
  const [search, setSearch] = createSignal("");
  const [statusFilter, setStatusFilter] = createSignal("");
  const [createOpen, setCreateOpen] = createSignal(false);
  const [selectedJoke, setSelectedJoke] = createSignal<JokeResponse | null>(
    null,
  );
  const [deleteId, setDeleteId] = createSignal<string | null>(null);

  const deleteMut = createJokeDeleteMutation();

  const filters = (): GetJokesFilters => ({
    query: search() || undefined,
    status: statusFilter() || undefined,
  });

  const query = createJokesQuery(filters);
  const jokes = () => query.data ?? [];

  function handleDelete() {
    const id = deleteId();
    if (!id) {
      return;
    }
    deleteMut.mutate(id, {
      onSuccess: () => {
        toast.success("Joke deleted");
        setDeleteId(null);
        setSelectedJoke(null);
      },
      onError: () => toast.error("Failed to delete"),
    });
  }

  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <H1>Jokes</H1>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Add Joke
        </Button>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex-1">
          <SearchInput
            value={search()}
            onValueChange={setSearch}
            clearLabel="Clear"
            placeholder="Search jokes..."
          />
        </div>
        <div class="w-[160px]">
          <SelectField
            label=""
            value={statusFilter()}
            onValueChange={(v) => setStatusFilter(v ?? "")}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
          />
        </div>
      </div>

      <Show when={query.isLoading}>
        <div class="text-subtle text-sm">Loading...</div>
      </Show>

      <Show when={query.data}>
        <div class="border border-border rounded-md overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border bg-secondary/50">
                <th class="text-left p-3 font-medium">Preview</th>
                <th class="text-left p-3 font-medium">Language</th>
                <th class="text-left p-3 font-medium">Status</th>
                <th class="text-left p-3 font-medium">Rating</th>
                <th class="text-left p-3 font-medium">Translations</th>
                <th class="text-right p-3 font-medium w-[80px]" />
              </tr>
            </thead>
            <tbody>
              <For each={jokes()}>
                {(joke) => (
                  <JokeRow
                    joke={joke}
                    onView={() => setSelectedJoke(joke)}
                    onDelete={() => setDeleteId(joke.id)}
                  />
                )}
              </For>
            </tbody>
          </table>
          <Show when={jokes().length === 0}>
            <div class="p-8 text-center text-subtle text-sm">
              No jokes found
            </div>
          </Show>
        </div>
      </Show>

      <JokeCreateDialog
        open={createOpen()}
        onClose={() => setCreateOpen(false)}
      />
      <JokeDetailDialog
        joke={selectedJoke()}
        onClose={() => setSelectedJoke(null)}
        onDeleted={() => {
          setSelectedJoke(null);
        }}
      />

      <Dialog
        alert={true}
        open={deleteId() !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Joke"
        description="This will delete the joke, all translations, and audio. Cannot be undone."
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

function JokeRow(props: {
  joke: JokeResponse;
  onView: () => void;
  onDelete: () => void;
}) {
  const j = props.joke;
  const primaryTranslation = () =>
    j.translations.find((t) => t.languageCode === j.originalLanguageCode)
    ?? j.translations[0];

  const previewText = () => {
    const t = primaryTranslation();
    if (!t) {
      return "—";
    }
    const text = t.plainText;
    return text.length > PREVIEW_MAX_LENGTH
      ? `${text.slice(0, PREVIEW_MAX_LENGTH)}...`
      : text;
  };

  return (
    <tr class="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
      <td class="p-3 max-w-[300px]">
        <Button
          variant="ghost"
          size="sm"
          class="text-left text-sm text-foreground hover:text-primary cursor-pointer truncate block w-full p-0 h-auto justify-start"
          onClick={props.onView}
        >
          {previewText()}
        </Button>
      </td>
      <td class="p-3 font-mono text-xs">{j.originalLanguageCode}</td>
      <td class="p-3">
        <Badge
          variant={STATUS_VARIANT_MAP[j.status] ?? "info"}
          size="sm"
          aria-label={j.status}
        >
          {j.status}
        </Badge>
      </td>
      <td class="p-3">
        <Show when={j.humorRating !== null} fallback="—">
          <span class="font-mono">{j.humorRating}/10</span>
        </Show>
      </td>
      <td class="p-3">{j.translations.length}</td>
      <td class="p-3 text-right">
        <div class="flex items-center justify-end gap-1">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="View joke"
            onClick={props.onView}
          >
            <Eye size={14} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Delete joke"
            onClick={props.onDelete}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </td>
    </tr>
  );
}

export { JokePage };
