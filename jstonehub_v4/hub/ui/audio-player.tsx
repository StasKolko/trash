import type { AudioEngine, AudioPlayerProps, Signals } from "./_audio-engine";

import { formatFileSize } from "@packages/contract/format";
import { IconButton } from "@packages/ui/action";
import { Pause, Play } from "lucide-solid";
import { createSignal, onCleanup, Show } from "solid-js";

import { preloadMetadata, togglePlay } from "./_audio-engine";
import {
  formatTime,
  keyDown,
  pointerDown,
  pointerMove,
  pointerUp,
} from "./_audio-timeline";

const PERCENT = 100;
const THUMB_SIZE = 12;
const HALF_THUMB = THUMB_SIZE / 2;

function AudioPlayer(props: AudioPlayerProps) {
  const [playing, setPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [dragging, setDragging] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [blobUrl, setBlobUrl] = createSignal<string | null>(null);

  const sig: Signals = {
    playing,
    setPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    dragging,
    setDragging,
    loading,
    setLoading,
    blobUrl,
    setBlobUrl,
  };

  const engine: AudioEngine = {
    audio: null,
    animFrame: 0,
    wasPlayingBeforeDrag: false,
    resolvedSrc: null,
    blobUrl: null,
    trackRef: undefined,
    startTimeTracking() {
      const tick = () => {
        if (engine.audio && playing() && !dragging()) {
          setCurrentTime(engine.audio.currentTime);
        }
        if (playing()) {
          engine.animFrame = requestAnimationFrame(tick);
        }
      };
      engine.animFrame = requestAnimationFrame(tick);
    },
  };

  onCleanup(() => {
    cancelAnimationFrame(engine.animFrame);
    engine.audio?.pause();
    const url = blobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  });

  preloadMetadata(props, engine, sig);

  const progress = () => {
    const d = duration();
    return d > 0 ? (currentTime() / d) * PERCENT : 0;
  };

  const fileExt = () => {
    if (props.format) {
      return props.format;
    }
    const dot = props.name.lastIndexOf(".");
    return dot >= 0 ? props.name.slice(dot + 1).toUpperCase() : "";
  };

  return (
    <div class="flex items-center gap-3 p-3 rounded-md bg-secondary/30">
      <PlayButton
        playing={playing()}
        loading={loading()}
        name={props.name}
        onClick={() => togglePlay(props, engine, sig)}
      />

      <div class="flex-1 min-w-0 space-y-1">
        <FileInfo name={props.name} ext={fileExt()} size={props.size} />
        <Timeline
          currentTime={currentTime()}
          duration={duration()}
          progress={progress()}
          trackRef={(el) => {
            engine.trackRef = el;
          }}
          onPointerDown={(e) => pointerDown(e, engine, sig)}
          onPointerMove={(e) => pointerMove(e, engine, sig)}
          onPointerUp={(e) => pointerUp(e, engine, sig)}
          onKeyDown={(e) => keyDown(e, engine, sig)}
        />
      </div>

      <Show when={props.actions}>
        {(actionsFn) => actionsFn()({ blobUrl: blobUrl() })}
      </Show>
    </div>
  );
}

function PlayButton(props: {
  playing: boolean;
  loading: boolean;
  name: string;
  onClick: () => void;
}) {
  return (
    <IconButton
      variant="ghost"
      size="sm"
      aria-label={props.playing ? `Pause ${props.name}` : `Play ${props.name}`}
      disabled={props.loading}
      onClick={props.onClick}
    >
      <Show when={props.playing} fallback={<Play size={14} />}>
        <Pause size={14} />
      </Show>
    </IconButton>
  );
}

function FileInfo(props: {
  name: string;
  ext: string;
  size: number | undefined;
}) {
  return (
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-sm font-medium truncate min-w-0">{props.name}</span>
      <Show when={props.ext}>
        <span class="text-[11px] text-subtle uppercase shrink-0">
          {props.ext}
        </span>
      </Show>
      <Show when={props.size !== undefined && props.size > 0}>
        <span class="text-[11px] text-subtle shrink-0">
          {formatFileSize(props.size ?? 0)}
        </span>
      </Show>
    </div>
  );
}

function Timeline(props: {
  currentTime: number;
  duration: number;
  progress: number;
  trackRef: (el: HTMLDivElement) => void;
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
}) {
  return (
    <div class="flex items-center gap-2">
      <span class="text-[11px] text-subtle tabular-nums w-[72px] shrink-0">
        {formatTime(props.currentTime)} / {formatTime(props.duration)}
      </span>
      <div
        ref={props.trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Audio timeline"
        aria-valuemin={0}
        aria-valuemax={Math.round(props.duration)}
        aria-valuenow={Math.round(props.currentTime)}
        class="relative flex-1 h-[20px] flex items-center cursor-pointer select-none touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        onPointerDown={props.onPointerDown}
        onPointerMove={props.onPointerMove}
        onPointerUp={props.onPointerUp}
        onKeyDown={props.onKeyDown}
      >
        <div class="absolute left-0 right-0 h-[4px] rounded-full bg-border" />
        <div
          class="absolute left-0 h-[4px] rounded-full bg-primary"
          style={{ width: `${props.progress}%` }}
        />
        <div
          class="absolute rounded-full bg-primary shadow-sm"
          style={{
            width: `${THUMB_SIZE}px`,
            height: `${THUMB_SIZE}px`,
            left: `calc(${props.progress}% - ${HALF_THUMB}px)`,
          }}
        />
      </div>
    </div>
  );
}

export type { AudioPlayerProps } from "./_audio-engine";

export { AudioPlayer };
