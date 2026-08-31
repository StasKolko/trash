type AudioEngine = {
  audio: HTMLAudioElement | null;
  animFrame: number;
  wasPlayingBeforeDrag: boolean;
  resolvedSrc: string | null;
  blobUrl: string | null;
  trackRef: HTMLDivElement | undefined;
  startTimeTracking: () => void;
};

type Signals = {
  playing: () => boolean;
  setPlaying: (v: boolean) => void;
  currentTime: () => number;
  setCurrentTime: (t: number) => void;
  duration: () => number;
  setDuration: (d: number) => void;
  dragging: () => boolean;
  setDragging: (v: boolean) => void;
  loading: () => boolean;
  setLoading: (v: boolean) => void;
  blobUrl: () => string | null;
  setBlobUrl: (s: string | null) => void;
};

type AudioPlayerProps = {
  name: string;
  src: string | (() => Promise<string>);
  size?: number;
  format?: string;
  actions?: (audioState: {
    blobUrl: string | null;
  }) => import("solid-js").JSX.Element;
};

function preloadMetadata(
  props: AudioPlayerProps,
  engine: AudioEngine,
  sig: Signals,
) {
  const src = props.src;
  if (typeof src !== "string") {
    return;
  }

  engine.resolvedSrc = src;
  if (src.startsWith("blob:")) {
    engine.blobUrl = src;
    sig.setBlobUrl(src);
  }

  const preloader = new Audio();
  preloader.preload = "metadata";
  preloader.src = src;
  preloader.addEventListener("loadedmetadata", () => {
    sig.setDuration(preloader.duration);
  });
}

async function togglePlay(
  props: AudioPlayerProps,
  engine: AudioEngine,
  sig: Signals,
) {
  if (sig.playing()) {
    engine.audio?.pause();
    sig.setPlaying(false);
    cancelAnimationFrame(engine.animFrame);
    return;
  }

  sig.setLoading(true);
  try {
    const el = await ensureAudio(props, engine, sig);
    el.play();
    sig.setPlaying(true);
    engine.startTimeTracking();
  } finally {
    sig.setLoading(false);
  }
}

async function ensureAudio(
  props: AudioPlayerProps,
  engine: AudioEngine,
  sig: Signals,
): Promise<HTMLAudioElement> {
  if (engine.audio && engine.resolvedSrc) {
    return engine.audio;
  }

  const src = props.src;
  const url = typeof src === "string" ? src : await src();

  engine.resolvedSrc = url;
  if (url.startsWith("blob:")) {
    engine.blobUrl = url;
    sig.setBlobUrl(url);
  }

  if (engine.audio) {
    engine.audio.src = url;
  } else {
    engine.audio = new Audio(url);
    engine.audio.addEventListener("loadedmetadata", () => {
      sig.setDuration(engine.audio?.duration ?? 0);
    });
    engine.audio.addEventListener("ended", () => {
      sig.setPlaying(false);
      cancelAnimationFrame(engine.animFrame);
    });
  }

  await waitForCanPlay(engine.audio, sig);
  return engine.audio;
}

function waitForCanPlay(audio: HTMLAudioElement, sig: Signals): Promise<void> {
  return new Promise((resolve, reject) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      sig.setDuration(audio.duration);
      resolve();
      return;
    }
    const onCanPlay = () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      sig.setDuration(audio.duration);
      resolve();
    };
    const onError = () => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      reject(new Error("Failed to load audio"));
    };
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);
  });
}

export type { AudioEngine, AudioPlayerProps, Signals };
export { preloadMetadata, togglePlay };
