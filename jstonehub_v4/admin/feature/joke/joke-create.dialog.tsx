import { Button, LoadingButton } from "@packages/ui/action";
import {
  NumberInputField,
  SelectField,
  SwitchField,
  TextareaField,
} from "@packages/ui/form";
import { Dialog, toast } from "@packages/ui/overlay";
import { H3 } from "@packages/ui/typography";
import { createSignal, For, Show } from "solid-js";

import { createLanguagesQuery } from "#admin/feature/language/language.query";
import { createTagsQuery } from "#admin/feature/tag/tag.query";

import { createJokeCreateMutation } from "./joke.query";

type JokeCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

function useJokeCreateForm(onClose: () => void) {
  const [languageCode, setLanguageCode] = createSignal("");
  const [segmentsJson, setSegmentsJson] = createSignal("");
  const [hasExplicit, setHasExplicit] = createSignal(false);
  const [humorRating, setHumorRating] = createSignal<number | undefined>(
    undefined,
  );
  const [selectedTagIds, setSelectedTagIds] = createSignal<string[]>([]);
  const [parseError, setParseError] = createSignal("");

  const createMut = createJokeCreateMutation();

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }

  function parseSegments(): { role: string; text: string }[] | null {
    try {
      const parsed = JSON.parse(segmentsJson().trim());
      if (!Array.isArray(parsed)) {
        setParseError("Must be a JSON array");
        return null;
      }
      for (const item of parsed) {
        if (!(item.name || item.role)) {
          setParseError("Each item must have 'name' or 'role'");
          return null;
        }
        if (!item.text) {
          setParseError("Each item must have 'text'");
          return null;
        }
      }
      setParseError("");
      return parsed.map((item: Record<string, string>) => ({
        role: (item.name ?? item.role).trim(),
        text: item.text.trim(),
      }));
    } catch {
      setParseError("Invalid JSON");
      return null;
    }
  }

  function handleSubmit() {
    const segments = parseSegments();
    if (!segments) {
      return;
    }
    if (!languageCode()) {
      return;
    }

    createMut.mutate(
      {
        originalLanguageCode: languageCode(),
        segments,
        hasExplicitContent: hasExplicit(),
        humorRating: humorRating(),
        tagIds: selectedTagIds().length > 0 ? selectedTagIds() : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Joke created");
          handleClose();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
      },
    );
  }

  function handleClose() {
    setLanguageCode("");
    setSegmentsJson("");
    setHasExplicit(false);
    setHumorRating(undefined);
    setSelectedTagIds([]);
    setParseError("");
    onClose();
  }

  const canSubmit = () =>
    languageCode().length > 0 && segmentsJson().trim().length > 0;

  return {
    languageCode,
    setLanguageCode,
    segmentsJson,
    setSegmentsJson,
    hasExplicit,
    setHasExplicit,
    humorRating,
    setHumorRating,
    selectedTagIds,
    toggleTag,
    parseError,
    createMut,
    handleSubmit,
    handleClose,
    canSubmit,
  };
}

function JokeCreateDialog(props: JokeCreateDialogProps) {
  const form = useJokeCreateForm(props.onClose);
  const languagesQuery = createLanguagesQuery();
  const tagsQuery = createTagsQuery();

  const languageOptions = () =>
    (languagesQuery.data ?? []).map((l) => ({
      value: l.code,
      label: `${l.code} — ${l.name}`,
    }));

  const tags = () => tagsQuery.data ?? [];

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={form.handleClose}
      title="Add Joke"
      description="Paste joke segments in JSON format."
      content={() => (
        <JokeCreateFormContent
          form={form}
          languageOptions={languageOptions()}
          tags={tags()}
        />
      )}
      footer={() => (
        <div class="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={form.handleClose}>
            Cancel
          </Button>
          <LoadingButton
            variant="primary"
            size="sm"
            loading={form.createMut.isPending}
            disabled={!form.canSubmit()}
            onClick={form.handleSubmit}
          >
            Create
          </LoadingButton>
        </div>
      )}
    />
  );
}

function JokeCreateFormContent(props: {
  form: ReturnType<typeof useJokeCreateForm>;
  languageOptions: { value: string; label: string }[];
  tags: { id: string; name: string }[];
}) {
  const { form } = props;

  return (
    <div class="space-y-4">
      <SelectField
        label="Language"
        value={form.languageCode()}
        onValueChange={(v) => form.setLanguageCode(v ?? "")}
        options={props.languageOptions}
        required={true}
        placeholder="Select language..."
      />

      <TextareaField
        label="Segments (JSON)"
        value={form.segmentsJson()}
        onValueChange={form.setSegmentsJson}
        required={false}
        disabled={false}
        readonly={false}
        name="joke-segments-json"
        maxLength={50_000}
        minLength={0}
        placeholder='[{"name": "narrator", "text": "A man walks into a bar..."}, {"name": "man", "text": "Ouch!"}]'
        counterLabel={(c, m) => `${c}/${m}`}
      />

      <Show when={form.parseError()}>
        <div class="text-xs text-error-foreground">{form.parseError()}</div>
      </Show>

      <NumberInputField
        label="Humor Rating (0-10)"
        value={form.humorRating() ?? 0}
        onValueChange={(v) =>
          form.setHumorRating(
            v === undefined || v === null ? undefined : Number(v),
          )
        }
      />

      <SwitchField
        label="Has explicit content"
        checked={form.hasExplicit()}
        onCheckedChange={(v) => form.setHasExplicit(v as boolean)}
      />

      <Show when={props.tags.length > 0}>
        <div class="space-y-2">
          <H3>Tags</H3>
          <div class="flex flex-wrap gap-2">
            <For each={props.tags}>
              {(tag) => {
                const isSelected = () => form.selectedTagIds().includes(tag.id);
                return (
                  <Button
                    variant={isSelected() ? "primary" : "outline"}
                    size="sm"
                    onClick={() => form.toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Button>
                );
              }}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

export { JokeCreateDialog };
