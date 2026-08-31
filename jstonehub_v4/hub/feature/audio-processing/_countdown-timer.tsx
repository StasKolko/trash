import { createSignal, onCleanup, onMount } from "solid-js";

type CountdownTimerProps = {
  expiresAt: string;
};

const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;
const TICK_INTERVAL_MS = 1000;

function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) {
    return "Expired";
  }

  const days = Math.floor(remainingMs / MS_IN_DAY);
  const hours = Math.floor((remainingMs % MS_IN_DAY) / MS_IN_HOUR);
  const minutes = Math.floor((remainingMs % MS_IN_HOUR) / MS_IN_MINUTE);
  const seconds = Math.floor((remainingMs % MS_IN_MINUTE) / MS_IN_SECOND);

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

function CountdownTimer(props: CountdownTimerProps) {
  const [text, setText] = createSignal("");

  let timer: ReturnType<typeof setInterval> | null = null;

  function tick() {
    const remaining = new Date(props.expiresAt).getTime() - Date.now();
    setText(formatCountdown(remaining));

    if (remaining <= 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  onMount(() => {
    tick();
    timer = setInterval(tick, TICK_INTERVAL_MS);
  });

  onCleanup(() => {
    if (timer) {
      clearInterval(timer);
    }
  });

  return (
    <span class="text-xs text-subtle tabular-nums font-mono">{text()}</span>
  );
}

export { CountdownTimer };
