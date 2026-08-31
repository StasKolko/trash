import type { JokeResponse, JokeTranslationResponse } from "./joke.api";

import { Button, IconButton, LoadingButton } from "@packages/ui/action";
import { Badge } from "@packages/ui/data-display";
import { SelectField } from "@packages/ui/form";
import { toast } from "@packages/ui/overlay";
import { H3, P } from "@packages/ui/typography";
import { Download, Loader2, Mic, Play, RefreshCw, Square } from "lucide-solid";
import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { jokeTtsApi } from "./joke-tts.api";

type JokeTtsPanelProps = {
  joke: JokeResponse;
  translation: JokeTranslationResponse;
  voices: { voiceId: string; name: string; gender?: string }[];
};

type PipelineEntry = {
  id: string;
  status: string;
  voiceConfig: Record<string, string>;
  ttsProjectId: string | null;
  jokeAudioId: string | null;
  audioDownloadUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
};

type StartPipelineContext = {
  translationId: string;
  voiceConfig: Record<string, string>;
  engine: PanelEngine;
  sig: PanelSignals;
};

type PlayAudioContext = {
  pipelineId: string;
  url: string;
  engine: PanelEngine;
  sig: PanelSignals;
};

const PIPELINE_POLL_INTERVAL = 5000;
const VOICE_ID_PREVIEW_LENGTH = 8;

const ACTIVE_STATUSES = new Set([
  "pending",
  "creating_tasks",
  "synthesizing",
  "processing_audio",
  "saving",
]);

const STATUS_VARIANT_MAP: Record<
  string,
  "info" | "warning" | "success" | "error"
> = {
  pending: "info",
  creating_tasks: "info",
  synthesizing: "warning",
  processing_audio: "warning",
  saving: "warning",
  completed: "success",
  failed: "error",
};

type PanelSignals = {
  pipelines: () => PipelineEntry[];
  setPipelines: (
    v: PipelineEntry[] | ((prev: PipelineEntry[]) => PipelineEntry[]),
  ) => void;
  loading: () => boolean;
  setLoading: (v: boolean) => void;
  starting: () => boolean;
  setStarting: (v: boolean) => void;
  showConfig: () => boolean;
  setShowConfig: (v: boolean | ((prev: boolean) => boolean)) => void;
  voiceConfig: () => Record<string, string>;
  setVoiceConfig: (
    v:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  playingPipelineId: () => string | null;
  setPlayingPipelineId: (v: string | null) => void;
};

type PanelEngine = {
  pollTimer: ReturnType<typeof setInterval> | null;
  audioElement: HTMLAudioElement | null;
};

function createPanelSignals(): PanelSignals {
  const [pipelines, setPipelines] = createSignal<PipelineEntry[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [starting, setStarting] = createSignal(false);
  const [showConfig, setShowConfig] = createSignal(false);
  const [voiceConfig, setVoiceConfig] = createSignal<Record<string, string>>(
    {},
  );
  const [playingPipelineId, setPlayingPipelineId] = createSignal<string | null>(
    null,
  );
  return {
    pipelines,
    setPipelines,
    loading,
    setLoading,
    starting,
    setStarting,
    showConfig,
    setShowConfig,
    voiceConfig,
    setVoiceConfig,
    playingPipelineId,
    setPlayingPipelineId,
  };
}

function startPolling(engine: PanelEngine, loadFn: () => void) {
  if (engine.pollTimer) {
    return;
  }
  engine.pollTimer = setInterval(loadFn, PIPELINE_POLL_INTERVAL);
}

function stopPolling(engine: PanelEngine) {
  if (engine.pollTimer) {
    clearInterval(engine.pollTimer);
    engine.pollTimer = null;
  }
}

function stopAudio(engine: PanelEngine, sig: PanelSignals) {
  if (engine.audioElement) {
    engine.audioElement.pause();
    engine.audioElement.src = "";
    engine.audioElement = null;
  }
  sig.setPlayingPipelineId(null);
}

async function loadPipelines(
  translationId: string,
  engine: PanelEngine,
  sig: PanelSignals,
) {
  try {
    sig.setLoading(true);
    const result = await jokeTtsApi.getByTranslation(translationId);
    sig.setPipelines(result);
    if (result.some((p) => ACTIVE_STATUSES.has(p.status))) {
      startPolling(engine, () => loadPipelines(translationId, engine, sig));
    } else {
      stopPolling(engine);
    }
  } catch {
    // silently fail on poll
  } finally {
    sig.setLoading(false);
  }
}

async function handleStartPipeline(ctx: StartPipelineContext) {
  const { translationId, voiceConfig, engine, sig } = ctx;
  sig.setStarting(true);
  try {
    await jokeTtsApi.start({
      jokeTranslationId: translationId,
      voiceConfig,
      isPlatformDefault: false,
    });
    toast.success("TTS pipeline started");
    sig.setShowConfig(false);
    await loadPipelines(translationId, engine, sig);
    startPolling(engine, () => loadPipelines(translationId, engine, sig));
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to start pipeline",
    );
  } finally {
    sig.setStarting(false);
  }
}

function playAudioUrl(ctx: PlayAudioContext) {
  const { pipelineId, url, engine, sig } = ctx;
  engine.audioElement = new Audio(url);
  sig.setPlayingPipelineId(pipelineId);
  engine.audioElement.addEventListener("ended", () => {
    sig.setPlayingPipelineId(null);
  });
  engine.audioElement.addEventListener("error", () => {
    sig.setPlayingPipelineId(null);
    toast.error("Audio playback error");
  });
  engine.audioElement.play().catch(() => {
    sig.setPlayingPipelineId(null);
  });
}

async function handlePlayAudio(
  pipeline: PipelineEntry,
  engine: PanelEngine,
  sig: PanelSignals,
) {
  if (sig.playingPipelineId() === pipeline.id) {
    stopAudio(engine, sig);
    return;
  }
  stopAudio(engine, sig);
  if (!pipeline.audioDownloadUrl) {
    try {
      const details = await jokeTtsApi.getById(pipeline.id);
      if (!details.audioDownloadUrl) {
        toast.error("Audio not available");
        return;
      }
      playAudioUrl({
        pipelineId: pipeline.id,
        url: details.audioDownloadUrl,
        engine,
        sig,
      });
    } catch {
      toast.error("Failed to load audio");
    }
    return;
  }
  playAudioUrl({
    pipelineId: pipeline.id,
    url: pipeline.audioDownloadUrl,
    engine,
    sig,
  });
}

function handleDownload(pipeline: PipelineEntry) {
  if (!pipeline.audioDownloadUrl) {
    jokeTtsApi
      .getById(pipeline.id)
      .then((details) => {
        if (details.audioDownloadUrl) {
          triggerDownload(details.audioDownloadUrl, pipeline.id);
        }
      })
      .catch(() => toast.error("Failed to get download URL"));
    return;
  }
  triggerDownload(pipeline.audioDownloadUrl, pipeline.id);
}

function triggerDownload(url: string, pipelineId: string) {
  fetch(url)
    .then((r) => r.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `joke-tts-${pipelineId.slice(0, VOICE_ID_PREVIEW_LENGTH)}.mp3`;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    });
}

function JokeTtsPanel(props: JokeTtsPanelProps) {
  const sig = createPanelSignals();
  const engine: PanelEngine = { pollTimer: null, audioElement: null };

  const uniqueRoles = createMemo(() => {
    const roles = new Set<string>();
    for (const seg of props.translation.segments) {
      if (seg.role.trim()) {
        roles.add(seg.role.trim());
      }
    }
    return [...roles];
  });

  const voiceOptions = createMemo(() =>
    props.voices.map((v) => ({
      value: v.voiceId,
      label: v.gender ? `${v.name} (${v.gender})` : v.name,
    })),
  );

  const allRolesMapped = createMemo(() => {
    const config = sig.voiceConfig();
    return uniqueRoles().every((role) => {
      const vid = config[role];
      return vid && vid.length > 0;
    });
  });

  const doLoad = () => loadPipelines(props.translation.id, engine, sig);

  onMount(() => {
    doLoad();
  });
  onCleanup(() => {
    stopPolling(engine);
    stopAudio(engine, sig);
  });

  return (
    <div class="space-y-3">
      <PanelHeader
        showConfig={sig.showConfig()}
        onToggleConfig={() => sig.setShowConfig((p) => !p)}
        onRefresh={doLoad}
      />

      <Show when={sig.showConfig()}>
        <VoiceConfigPanel
          roles={uniqueRoles()}
          voiceConfig={sig.voiceConfig()}
          voiceOptions={voiceOptions()}
          onSetVoice={(role, voiceId) =>
            sig.setVoiceConfig((prev) => ({ ...prev, [role]: voiceId }))
          }
          allMapped={allRolesMapped()}
          starting={sig.starting()}
          onStart={() => {
            if (!allRolesMapped()) {
              toast.error("All roles must have a voice assigned");
              return;
            }
            handleStartPipeline({
              translationId: props.translation.id,
              voiceConfig: sig.voiceConfig(),
              engine,
              sig,
            });
          }}
          onCancel={() => sig.setShowConfig(false)}
        />
      </Show>

      <Show when={sig.loading() && sig.pipelines().length === 0}>
        <div class="text-subtle text-sm text-center py-4">Loading...</div>
      </Show>

      <Show when={sig.pipelines().length === 0 && !sig.loading()}>
        <P level={3} class="text-subtle text-center py-4">
          No TTS audio generated yet.
        </P>
      </Show>

      <div class="space-y-2">
        <For each={sig.pipelines()}>
          {(pipeline) => (
            <PipelineCard
              pipeline={pipeline}
              voices={props.voices}
              playing={sig.playingPipelineId() === pipeline.id}
              onPlay={() => handlePlayAudio(pipeline, engine, sig)}
              onDownload={() => handleDownload(pipeline)}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function PanelHeader(props: {
  showConfig: boolean;
  onToggleConfig: () => void;
  onRefresh: () => void;
}) {
  return (
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Mic size={16} />
        <H3>TTS Audio</H3>
      </div>
      <div class="flex items-center gap-2">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Refresh"
          onClick={props.onRefresh}
        >
          <RefreshCw size={14} />
        </IconButton>
        <Button variant="outline" size="sm" onClick={props.onToggleConfig}>
          <Mic size={14} />
          {props.showConfig ? "Cancel" : "New TTS"}
        </Button>
      </div>
    </div>
  );
}

function VoiceConfigPanel(props: {
  roles: string[];
  voiceConfig: Record<string, string>;
  voiceOptions: { value: string; label: string }[];
  onSetVoice: (role: string, voiceId: string) => void;
  allMapped: boolean;
  starting: boolean;
  onStart: () => void;
  onCancel: () => void;
}) {
  return (
    <div class="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
      <P level={2} class="font-medium">
        Assign voices to roles
      </P>
      <div class="space-y-2">
        <For each={props.roles}>
          {(role) => (
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium min-w-[100px] truncate">
                {role}
              </span>
              <div class="flex-1">
                <SelectField
                  label=""
                  value={props.voiceConfig[role] ?? ""}
                  onValueChange={(v) => props.onSetVoice(role, v ?? "")}
                  options={props.voiceOptions}
                  placeholder="Select voice..."
                />
              </div>
            </div>
          )}
        </For>
      </div>
      <div class="flex gap-2 pt-2">
        <LoadingButton
          variant="primary"
          size="sm"
          loading={props.starting}
          disabled={!props.allMapped}
          onClick={props.onStart}
        >
          Start TTS Pipeline
        </LoadingButton>
        <Button variant="ghost" size="sm" onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function PipelineCard(props: {
  pipeline: PipelineEntry;
  voices: { voiceId: string; name: string }[];
  playing: boolean;
  onPlay: () => void;
  onDownload: () => void;
}) {
  const p = props.pipeline;
  const isActive = () => ACTIVE_STATUSES.has(p.status);
  const isCompleted = () => p.status === "completed";
  const isFailed = () => p.status === "failed";

  const voiceMap = createMemo(() => {
    const map = new Map<string, string>();
    for (const v of props.voices) {
      map.set(v.voiceId, v.name);
    }
    return map;
  });

  const voiceDisplay = createMemo(() =>
    Object.entries(p.voiceConfig)
      .map(([role, voiceId]) => {
        const name =
          voiceMap().get(voiceId) ?? voiceId.slice(0, VOICE_ID_PREVIEW_LENGTH);
        return `${role}: ${name}`;
      })
      .join(", "),
  );

  const createdDate = () => {
    try {
      return new Date(p.createdAt).toLocaleString();
    } catch {
      return p.createdAt;
    }
  };

  return (
    <div class="rounded-lg border border-border p-3 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Show when={isActive()}>
            <Loader2 size={14} class="animate-spin text-info-foreground" />
          </Show>
          <Badge
            variant={STATUS_VARIANT_MAP[p.status] ?? "info"}
            size="sm"
            aria-label={p.status}
          >
            {p.status}
          </Badge>
          <span class="text-xs text-subtle">{createdDate()}</span>
        </div>
        <div class="flex items-center gap-1">
          <Show when={isCompleted()}>
            <IconButton
              variant="outline"
              size="sm"
              aria-label={props.playing ? "Stop" : "Play"}
              onClick={props.onPlay}
            >
              <Show when={props.playing} fallback={<Play size={14} />}>
                <Square size={14} />
              </Show>
            </IconButton>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Download"
              onClick={props.onDownload}
            >
              <Download size={14} />
            </IconButton>
          </Show>
        </div>
      </div>
      <P level={3} class="text-subtle text-xs">
        {voiceDisplay()}
      </P>
      <Show when={isFailed() && p.errorMessage}>
        <div class="text-xs text-error-foreground mt-1">{p.errorMessage}</div>
      </Show>
    </div>
  );
}

export type { JokeTtsPanelProps };
export { JokeTtsPanel };
