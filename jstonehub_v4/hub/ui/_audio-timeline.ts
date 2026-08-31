import type { AudioEngine, Signals } from "./_audio-engine";

const ARROW_SEEK_SEC = 5;

function getProgress(
  clientX: number,
  trackRef: HTMLDivElement | undefined,
): number {
  if (!trackRef) {
    return 0;
  }
  const rect = trackRef.getBoundingClientRect();
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
}

function pointerDown(e: PointerEvent, engine: AudioEngine, sig: Signals) {
  e.preventDefault();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  engine.wasPlayingBeforeDrag = sig.playing();

  if (engine.wasPlayingBeforeDrag && engine.audio) {
    engine.audio.pause();
    cancelAnimationFrame(engine.animFrame);
  }

  sig.setDragging(true);
  sig.setCurrentTime(getProgress(e.clientX, engine.trackRef) * sig.duration());
}

function pointerMove(e: PointerEvent, engine: AudioEngine, sig: Signals) {
  if (!sig.dragging()) {
    return;
  }
  sig.setCurrentTime(getProgress(e.clientX, engine.trackRef) * sig.duration());
}

function pointerUp(e: PointerEvent, engine: AudioEngine, sig: Signals) {
  (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  sig.setDragging(false);

  if (engine.audio) {
    engine.audio.currentTime = sig.currentTime();
    if (engine.wasPlayingBeforeDrag) {
      engine.audio.play();
      sig.setPlaying(true);
      engine.startTimeTracking();
    }
  }
}

function keyDown(e: KeyboardEvent, engine: AudioEngine, sig: Signals) {
  if (!engine.audio) {
    return;
  }
  const d = sig.duration();
  if (d <= 0) {
    return;
  }

  if (e.key === "ArrowRight") {
    e.preventDefault();
    const next = Math.min(d, engine.audio.currentTime + ARROW_SEEK_SEC);
    engine.audio.currentTime = next;
    sig.setCurrentTime(next);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    const next = Math.max(0, engine.audio.currentTime - ARROW_SEEK_SEC);
    engine.audio.currentTime = next;
    sig.setCurrentTime(next);
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export { formatTime, keyDown, pointerDown, pointerMove, pointerUp };
