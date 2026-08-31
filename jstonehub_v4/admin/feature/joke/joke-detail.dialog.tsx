import type { JokeResponse, JokeTranslationResponse } from "./joke.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import {
  NumberInputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H3, P } from "@packages/ui/typography";
import { Pencil, Plus, Save } from "lucide-solid";
import { createEffect, createSignal, For, Show } from "solid-js";

import { createLanguagesQuery } from "#admin/feature/language/language.query";
import { createTagsQuery } from "#admin/feature/tag/tag.query";

import {
  createAddTranslationMutation,
  createJokeUpdateMutation,
} from "./joke.query";

type JokeDetailDialogProps = {
  joke: JokeResponse | null;
  onClose: () => void;
  onDeleted: () => void;
};

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Approved" },
];

const STATUS_VARIANT_MAP: Record<string, "info" | "warning" | "success"> = {
  draft: "info",
  review: "warning",
  approved: "success",
};

function useJokeDetailForm(joke: () => JokeResponse | null) {
  const [editing, setEditing] = createSignal(false);
  const [status, setStatus] = createSignal("");
  const [hasExplicit, setHasExplicit] = createSignal(false);
  const [humorRating, setHumorRating] = createSignal<number | undefined>(
    undefined,
  );
  const [selectedTagIds, setSelectedTagIds] = createSignal<string[]>([]);
  const [addTranslationOpen, setAddTranslationOpen] = createSignal(false);

  const updateMut = createJokeUpdateMutation();

  createEffect(() => {
    const j = joke();
    if (j) {
      setStatus(j.status);
      setHasExplicit(j.hasExplicitContent);
      setHumorRating(j.humorRating === null ? undefined : j.humorRating);
      setSelectedTagIds([...j.tagIds]);
      setEditing(false);
      setAddTranslationOpen(false);
    }
  });

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }

  function handleSave() {
    const j = joke();
    if (!j) {
      return;
    }

    updateMut.mutate(
      {
        id: j.id,
        data: {
          status: status(),
          hasExplicitContent: hasExplicit(),
          humorRating: humorRating(),
          tagIds: selectedTagIds(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Joke updated");
          setEditing(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  return {
    editing,
    setEditing,
    status,
    setStatus,
    hasExplicit,
    setHasExplicit,
    humorRating,
    setHumorRating,
    selectedTagIds,
    toggleTag,
    addTranslationOpen,
    setAddTranslationOpen,
    updateMut,
    handleSave,
  };
}

function JokeDetailDialog(props: JokeDetailDialogProps) {
  const tagsQuery = createTagsQuery();
  const tags = () => tagsQuery.data ?? [];
  const form = useJokeDetailForm(() => props.joke);

  function handleClose() {
    form.setEditing(false);
    form.setAddTranslationOpen(false);
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.joke !== null}
      onClose={handleClose}
      title={<JokeDetailTitle joke={props.joke} />}
      description={`ID: ${props.joke?.id ?? ""}`}
      content={() => (
        <JokeDetailContent joke={props.joke} form={form} tags={tags()} />
      )}
      footer={(close) => (
        <div class="flex justify-end">
          <Button variant="ghost" size="sm" onClick={close}>
            Close
          </Button>
        </div>
      )}
    />
  );
}

function JokeDetailTitle(props: { joke: JokeResponse | null }) {
  return (
    <div class="flex items-center gap-3">
      <span>Joke Details</span>
      <Show when={props.joke}>
        {(joke) => (
          <Badge
            variant={STATUS_VARIANT_MAP[joke().status] ?? "info"}
            size="sm"
            aria-label={joke().status}
          >
            {joke().status}
          </Badge>
        )}
      </Show>
    </div>
  );
}

function JokeDetailContent(props: {
  joke: JokeResponse | null;
  form: ReturnType<typeof useJokeDetailForm>;
  tags: { id: string; name: string }[];
}) {
  const { form } = props;

  return (
    <div class="space-y-6">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <H3>Properties</H3>
          <Show when={!form.editing()}>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Edit"
              onClick={() => form.setEditing(true)}
            >
              <Pencil size={14} />
            </IconButton>
          </Show>
        </div>

        <Show
          when={form.editing()}
          fallback={<ReadOnlyMeta joke={props.joke} tags={props.tags} />}
        >
          <EditMeta
            status={form.status()}
            onStatusChange={form.setStatus}
            humorRating={form.humorRating()}
            onHumorRatingChange={form.setHumorRating}
            hasExplicit={form.hasExplicit()}
            onHasExplicitChange={form.setHasExplicit}
            tags={props.tags}
            selectedTagIds={form.selectedTagIds()}
            onToggleTag={form.toggleTag}
            saving={form.updateMut.isPending}
            onSave={form.handleSave}
            onCancel={() => form.setEditing(false)}
          />
        </Show>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <H3>Translations ({props.joke?.translations.length ?? 0})</H3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => form.setAddTranslationOpen(true)}
          >
            <Plus size={14} />
            Add
          </Button>
        </div>

        <Show when={props.joke}>
          {(joke) => (
            <div class="space-y-3">
              <For each={joke().translations}>
                {(translation) => <TranslationCard translation={translation} />}
              </For>
            </div>
          )}
        </Show>
      </div>

      <Show when={form.addTranslationOpen() && props.joke}>
        <AddTranslationSection
          jokeId={props.joke?.id ?? ""}
          existingLanguages={
            props.joke?.translations.map((t) => t.languageCode) ?? []
          }
          onDone={() => form.setAddTranslationOpen(false)}
        />
      </Show>
    </div>
  );
}

function ReadOnlyMeta(props: {
  joke: JokeResponse | null;
  tags: { id: string; name: string }[];
}) {
  const joke = () => props.joke;
  if (!joke()) {
    return null;
  }

  const tagNames = () => {
    const ids = new Set(joke()?.tagIds);
    return props.tags.filter((t) => ids.has(t.id)).map((t) => t.name);
  };

  return (
    <div class="space-y-2 text-sm">
      <div class="flex gap-8">
        <div>
          <span class="text-subtle">Language:</span>{" "}
          <span class="font-mono">{joke()?.originalLanguageCode}</span>
        </div>
        <div>
          <span class="text-subtle">Rating:</span>{" "}
          <span>
            {joke()?.humorRating === null ? "—" : `${joke()?.humorRating}/10`}
          </span>
        </div>
        <div>
          <span class="text-subtle">Explicit:</span>{" "}
          <span>{joke()?.hasExplicitContent ? "Yes" : "No"}</span>
        </div>
      </div>
      <Show when={tagNames().length > 0}>
        <div class="flex items-center gap-2">
          <span class="text-subtle">Tags:</span>
          <div class="flex gap-1 flex-wrap">
            <For each={tagNames()}>
              {(name) => (
                <Badge variant="info" size="sm" aria-label={name}>
                  {name}
                </Badge>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

function EditMeta(props: {
  status: string;
  onStatusChange: (v: string) => void;
  humorRating: number | undefined;
  onHumorRatingChange: (v: number | undefined) => void;
  hasExplicit: boolean;
  onHasExplicitChange: (v: boolean) => void;
  tags: { id: string; name: string }[];
  selectedTagIds: string[];
  onToggleTag: (id: string) => void;
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div class="space-y-3">
      <SelectField
        label="Status"
        value={props.status}
        onValueChange={(v) => props.onStatusChange(v ?? "")}
        options={STATUS_OPTIONS}
      />
      <NumberInputField
        label="Humor Rating (0-10)"
        value={props.humorRating ?? 0}
        onValueChange={(v) =>
          props.onHumorRatingChange(
            v === undefined || v === null ? undefined : Number(v),
          )
        }
      />
      <SwitchField
        label="Has explicit content"
        checked={props.hasExplicit}
        onCheckedChange={(v) => props.onHasExplicitChange(v as boolean)}
      />
      <Show when={props.tags.length > 0}>
        <div class="space-y-2">
          <P level={2} class="font-medium">
            Tags
          </P>
          <div class="flex flex-wrap gap-2">
            <For each={props.tags}>
              {(tag) => (
                <Button
                  variant={
                    props.selectedTagIds.includes(tag.id)
                      ? "primary"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => props.onToggleTag(tag.id)}
                >
                  {tag.name}
                </Button>
              )}
            </For>
          </div>
        </div>
      </Show>
      <div class="flex gap-2 pt-2">
        <LoadingButton
          variant="primary"
          size="sm"
          loading={props.saving}
          onClick={props.onSave}
        >
          <Save size={14} />
          Save
        </LoadingButton>
        <Button variant="ghost" size="sm" onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function TranslationCard(props: { translation: JokeTranslationResponse }) {
  const t = props.translation;
  const [expanded, setExpanded] = createSignal(false);

  return (
    <div class="rounded-lg border border-border p-3 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Badge variant="info" size="sm" aria-label={t.languageCode}>
            {t.languageCode}
          </Badge>
          <Badge
            variant={t.status === "approved" ? "success" : "warning"}
            size="sm"
            aria-label={t.status}
          >
            {t.status}
          </Badge>
          <span class="text-xs text-subtle">
            {t.segments.length} segment(s)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded() ? "Collapse" : "Expand"}
        </Button>
      </div>

      <Show when={!expanded()}>
        <P level={3} class="text-subtle line-clamp-2">
          {t.plainText}
        </P>
      </Show>

      <Show when={expanded()}>
        <div class="space-y-1 pl-2 border-l-2 border-border">
          <For each={t.segments}>
            {(seg) => (
              <div class="text-sm">
                <span class="font-medium text-primary">{seg.role}:</span>{" "}
                <span class="text-foreground">{seg.text}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

function AddTranslationSection(props: {
  jokeId: string;
  existingLanguages: string[];
  onDone: () => void;
}) {
  const [languageCode, setLanguageCode] = createSignal("");
  const [segmentsJson, setSegmentsJson] = createSignal("");
  const [parseError, setParseError] = createSignal("");

  const languagesQuery = createLanguagesQuery();
  const addMut = createAddTranslationMutation();

  const availableLanguages = () =>
    (languagesQuery.data ?? [])
      .filter((l) => !props.existingLanguages.includes(l.code))
      .map((l) => ({ value: l.code, label: `${l.code} — ${l.name}` }));

  function handleAdd() {
    setParseError("");

    let segments: { role: string; text: string }[];
    try {
      const parsed = JSON.parse(segmentsJson().trim());
      if (!Array.isArray(parsed)) {
        setParseError("Must be a JSON array");
        return;
      }
      segments = parsed.map((item: Record<string, string>) => ({
        role: (item.name ?? item.role ?? "").trim(),
        text: (item.text ?? "").trim(),
      }));
      if (segments.some((s) => !(s.role && s.text))) {
        setParseError("Each segment must have role/name and text");
        return;
      }
    } catch {
      setParseError("Invalid JSON");
      return;
    }

    if (!languageCode()) {
      return;
    }

    addMut.mutate(
      {
        jokeId: props.jokeId,
        data: { languageCode: languageCode(), segments },
      },
      {
        onSuccess: () => {
          toast.success("Translation added");
          props.onDone();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  return (
    <div class="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
      <H3>Add Translation</H3>

      <Show
        when={availableLanguages().length > 0}
        fallback={
          <P level={2} class="text-subtle">
            All available languages already have translations.
          </P>
        }
      >
        <SelectField
          label="Language"
          value={languageCode()}
          onValueChange={(v) => setLanguageCode(v ?? "")}
          options={availableLanguages()}
          required={true}
          placeholder="Select language..."
        />

        <TextareaField
          label="Segments (JSON)"
          value={segmentsJson()}
          onValueChange={setSegmentsJson}
          required={false}
          disabled={false}
          readonly={false}
          name="translation-segments-json"
          maxLength={50_000}
          minLength={0}
          placeholder='[{"name": "narrator", "text": "..."}, {"name": "man", "text": "..."}]'
          counterLabel={(c, m) => `${c}/${m}`}
        />

        <Show when={parseError()}>
          <div class="text-xs text-error-foreground">{parseError()}</div>
        </Show>

        <div class="flex gap-2">
          <LoadingButton
            variant="primary"
            size="sm"
            loading={addMut.isPending}
            disabled={!(languageCode() && segmentsJson().trim())}
            onClick={handleAdd}
          >
            Add Translation
          </LoadingButton>
          <Button variant="ghost" size="sm" onClick={props.onDone}>
            Cancel
          </Button>
        </div>
      </Show>
    </div>
  );
}

export { JokeDetailDialog };
