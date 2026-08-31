import { Button } from "@packages/ui/button";
import { Download, Pause, Play } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import type { SynthesisTask } from "../model/types";

type TaskItemProps = {
  task: SynthesisTask;
  onRetry?: () => void;
};

export function TaskItem(props: TaskItemProps) {
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [audioRef, setAudioRef] = createSignal<HTMLAudioElement | null>(null);

  const audioUrl = () =>
    props.task.status === "COMPLETED"
      ? `/api/v1/admin/secret-voicer/synthesis/tasks/${props.task.id}/download`
      : null;

  const togglePlay = () => {
    const audio = audioRef();
    if (!audio) {
      return;
    }

    if (isPlaying()) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleEnded = () => setIsPlaying(false);

  return (
    <div class="p-3 rounded-lg border border-border bg-card">
      <Show when={props.task.status === "COMPLETED" && audioUrl()}>
        <div class="flex items-center gap-2 mt-2 pt-2 border-t border-border">
          {/* biome-ignore lint/a11y/useMediaCaption: синтезированное аудио не требует субтитров */}
          <audio
            ref={setAudioRef}
            src={audioUrl() ?? ""}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
          />

          <Button variant="ghost" size="icon-xs" onClick={togglePlay}>
            <Show when={isPlaying()} fallback={<Play class="w-3 h-3" />}>
              <Pause class="w-3 h-3" />
            </Show>
          </Button>

          <Button variant="ghost" size="icon-xs">
            {(classes) => (
              <a class={classes} href={audioUrl() ?? ""} download="true">
                <Download class="w-3 h-3" />
              </a>
            )}
          </Button>
        </div>
      </Show>
    </div>
  );
}
