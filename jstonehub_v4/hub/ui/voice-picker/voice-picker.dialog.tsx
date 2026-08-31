import type {
  SecretVoicerVoice,
  VoiceGender,
} from "@packages/contract/secret-voicer";

import { VOICE_GENDERS } from "@packages/contract/secret-voicer";
import { Button, IconButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SearchInput } from "@packages/ui/form";
import { Dialog } from "@packages/ui/overlay";
import { Check, Play, Square, User } from "lucide-solid";
import { createMemo, createSignal, For, Show } from "solid-js";

type VoicePickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (voiceId: string) => void;
  voices: SecretVoicerVoice[];
  loading: boolean;
  selectedVoiceId: string | null;
  disabledVoiceIds?: string[];
  onPreviewPlay?: (voice: SecretVoicerVoice) => void;
  playingVoiceId?: string | null;
};

type SortMode = "popularity" | "name";

const PAGE_SIZE = 20;
const VOICE_AVATAR_SIZE = 40;
const THOUSAND = 1000;
const MILLION = 1_000_000;

function VoicePickerDialog(props: VoicePickerDialogProps) {
  const [search, setSearch] = createSignal("");
  const [genderFilter, setGenderFilter] = createSignal<VoiceGender | null>(
    null,
  );
  const [sortMode, setSortMode] = createSignal<SortMode>("popularity");
  const [displayCount, setDisplayCount] = createSignal(PAGE_SIZE);

  const disabledSet = createMemo(() => new Set(props.disabledVoiceIds ?? []));

  const filteredVoices = createMemo(() => {
    let voices = [...props.voices];

    const query = search().toLowerCase().trim();
    if (query) {
      voices = voices.filter(
        (v) =>
          v.name.toLowerCase().includes(query)
          || (v.description?.toLowerCase().includes(query) ?? false)
          || (v.accent?.toLowerCase().includes(query) ?? false),
      );
    }

    const gender = genderFilter();
    if (gender) {
      voices = voices.filter((v) => v.gender === gender);
    }

    if (sortMode() === "popularity") {
      voices.sort((a, b) => b.usageCount - a.usageCount);
    } else {
      voices.sort((a, b) => a.name.localeCompare(b.name));
    }

    return voices;
  });

  const visibleVoices = createMemo(() =>
    filteredVoices().slice(0, displayCount()),
  );

  const hasMore = createMemo(() => displayCount() < filteredVoices().length);

  function handleLoadMore() {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  }

  function handleSelect(voiceId: string) {
    if (disabledSet().has(voiceId)) {
      return;
    }
    props.onSelect(voiceId);
  }

  function handleClose() {
    setSearch("");
    setGenderFilter(null);
    setDisplayCount(PAGE_SIZE);
    props.onClose();
  }

  return (
    <Dialog
      alert={false}
      open={props.open}
      onClose={handleClose}
      title="Select Voice"
      description={`${filteredVoices().length} voice(s) available`}
      content={() => (
        <div class="space-y-4">
          <FilterBar
            search={search()}
            onSearchChange={setSearch}
            genderFilter={genderFilter()}
            onGenderFilterChange={setGenderFilter}
            sortMode={sortMode()}
            onSortModeChange={setSortMode}
          />

          <Show when={props.loading}>
            <div class="text-subtle text-sm text-center py-8">
              Loading voices...
            </div>
          </Show>

          <Show when={!props.loading && filteredVoices().length === 0}>
            <div class="text-subtle text-sm text-center py-8">
              No voices match your filters
            </div>
          </Show>

          <Show when={!props.loading && filteredVoices().length > 0}>
            {/* Увеличить высоту списка */}
            <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              <For each={visibleVoices()}>
                {(voice) => (
                  <VoiceCard
                    voice={voice}
                    selected={voice.voiceId === props.selectedVoiceId}
                    disabled={disabledSet().has(voice.voiceId)}
                    playing={voice.voiceId === props.playingVoiceId}
                    onSelect={() => handleSelect(voice.voiceId)}
                    onPreviewPlay={() => props.onPreviewPlay?.(voice)}
                  />
                )}
              </For>
              <Show when={hasMore()}>
                <div class="text-center pt-2">
                  <Button variant="ghost" size="sm" onClick={handleLoadMore}>
                    Load more ({filteredVoices().length - displayCount()}{" "}
                    remaining)
                  </Button>
                </div>
              </Show>
            </div>
          </Show>
        </div>
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

function FilterBar(props: {
  search: string;
  onSearchChange: (value: string) => void;
  genderFilter: VoiceGender | null;
  onGenderFilterChange: (gender: VoiceGender | null) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
}) {
  return (
    <div class="space-y-3">
      <SearchInput
        value={props.search}
        onValueChange={props.onSearchChange}
        clearLabel="Clear search"
        placeholder="Search by name, accent..."
      />

      <div class="flex items-center gap-2 flex-wrap">
        <GenderFilterButtons
          value={props.genderFilter}
          onChange={props.onGenderFilterChange}
        />
        <div class="ml-auto flex items-center gap-1">
          <SortButton
            label="Popular"
            active={props.sortMode === "popularity"}
            onClick={() => props.onSortModeChange("popularity")}
          />
          <SortButton
            label="A-Z"
            active={props.sortMode === "name"}
            onClick={() => props.onSortModeChange("name")}
          />
        </div>
      </div>
    </div>
  );
}

function GenderFilterButtons(props: {
  value: VoiceGender | null;
  onChange: (gender: VoiceGender | null) => void;
}) {
  return (
    <div class="flex items-center gap-1">
      <Button
        variant={props.value === null ? "primary" : "ghost"}
        size="sm"
        onClick={() => props.onChange(null)}
      >
        All
      </Button>
      <For each={[...VOICE_GENDERS]}>
        {(gender) => (
          <Button
            variant={props.value === gender ? "primary" : "ghost"}
            size="sm"
            onClick={() =>
              props.onChange(props.value === gender ? null : gender)
            }
          >
            {gender === "MALE" ? "Male" : "Female"}
          </Button>
        )}
      </For>
    </div>
  );
}

function SortButton(props: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={props.active ? "secondary" : "ghost"}
      size="sm"
      onClick={props.onClick}
    >
      {props.label}
    </Button>
  );
}

function VoiceCard(props: {
  voice: SecretVoicerVoice;
  selected: boolean;
  disabled: boolean;
  playing: boolean;
  onSelect: () => void;
  onPreviewPlay: () => void;
}) {
  const v = props.voice;

  const cardClass = () => {
    const base =
      "w-full text-left rounded-lg border p-3 transition-colors cursor-pointer";
    if (props.selected) {
      return `${base} border-primary bg-primary/10`;
    }
    if (props.disabled) {
      return `${base} border-border opacity-50 cursor-not-allowed`;
    }
    return `${base} border-border hover:border-primary/50 hover:bg-secondary/30`;
  };

  return (
    // biome-ignore lint/correctness/noRestrictedElements: FALSE_POSITIVE
    <button
      type="button"
      class={cardClass()}
      disabled={props.disabled}
      onClick={props.onSelect}
    >
      <div class="flex items-start gap-3 w-full">
        <VoiceAvatar avatarUrl={v.avatarUrl} name={v.name} />

        <div class="flex-1 min-w-0 text-left space-y-1">
          {/* Первая строка: имя + гендер + галка */}
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-semibold leading-tight">{v.name}</span>
            <Badge
              variant={v.gender === "MALE" ? "info" : "warning"}
              size="sm"
              aria-label={v.gender}
            >
              {v.gender === "MALE" ? "M" : "F"}
            </Badge>
            <Show when={props.selected}>
              <Check size={14} class="text-primary shrink-0" />
            </Show>
          </div>

          {/* Вторая строка: locale + accent + usage */}
          <div class="flex items-center gap-2 text-xs text-subtle flex-wrap">
            <Show when={v.locale}>
              <span class="font-mono">{v.locale}</span>
            </Show>
            <Show when={v.accent}>
              <span>• {v.accent}</span>
            </Show>
            <span>• {formatUsageCount(v.usageCount)} uses</span>
          </div>

          {/* Описание */}
          <Show when={v.description}>
            {/* biome-ignore lint/correctness/noRestrictedElements: FALSE_POSITIVE */}
            <p class="text-xs text-subtle line-clamp-2 leading-relaxed">
              {v.description}
            </p>
          </Show>

          {/* Теги */}
          <Show when={v.voiceStyleTags.length > 0}>
            <div class="flex gap-1 flex-wrap mt-1">
              {/* biome-ignore lint/style/noMagicNumbers: FALSE_POSITIVE */}
              <For each={v.voiceStyleTags.slice(0, 3)}>
                {(tag) => (
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-subtle">
                    {tag}
                  </span>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Preview button */}
        <Show when={v.previewUrl}>
          <IconButton
            variant="outline"
            size="sm"
            aria-label={
              props.playing
                ? `Stop ${v.name} preview`
                : `Play ${v.name} preview`
            }
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              props.onPreviewPlay();
            }}
          >
            <Show when={props.playing} fallback={<Play size={14} />}>
              <Square size={14} />
            </Show>
          </IconButton>
        </Show>
      </div>
    </button>
  );
}

function VoiceAvatar(props: { avatarUrl: string | null; name: string }) {
  return (
    <Show
      when={props.avatarUrl}
      fallback={
        <div class="w-[40px] h-[40px] rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User size={18} class="text-subtle" />
        </div>
      }
    >
      {(url) => (
        <img
          src={url()}
          alt={props.name}
          width={VOICE_AVATAR_SIZE}
          height={VOICE_AVATAR_SIZE}
          class="w-[40px] h-[40px] rounded-full object-cover shrink-0"
        />
      )}
    </Show>
  );
}

function formatUsageCount(count: number): string {
  if (count >= MILLION) {
    return `${(count / MILLION).toFixed(1)}M`;
  }
  if (count >= THOUSAND) {
    return `${(count / THOUSAND).toFixed(1)}K`;
  }
  return String(count);
}

export type { VoicePickerDialogProps };
export { VoicePickerDialog };
