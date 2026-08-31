import type { CopyButtonProps, CopyButtonStatus } from "./copy-button.type";

import { cn } from "@packages/util/css";
import { is } from "@packages/util/guard";
import { createSignal, Match, onCleanup, Switch, splitProps } from "solid-js";

import { DEFAULT_COMPONENT_SIZE } from "../../_model/constant";
import { IconButton } from "../button/button";
import { icon } from "../icon/icon";
import { COPY_FEEDBACK_DURATION } from "./_copy-button.constant";
import { COPY_ERROR_COLOR, COPY_SUCCESS_COLOR } from "./_copy-button.style";
import { copyToClipboard } from "./_copy-button.util";

function CopyButton(props: CopyButtonProps) {
  const [local, rest] = splitProps(props, [
    "content",
    "class",
    "size",
    "onClick",
    "onCopied",
    "onError",
  ]);

  const [status, setStatus] = createSignal<CopyButtonStatus>("idle");

  let timerId: number | undefined;

  const size = () => local.size ?? DEFAULT_COMPONENT_SIZE;

  onCleanup(() => window.clearTimeout(timerId));

  const colorClass = () => {
    const s = status();
    if (s === "success") {
      return COPY_SUCCESS_COLOR;
    }
    if (s === "error") {
      return COPY_ERROR_COLOR;
    }
    return;
  };

  async function handleClick(e: MouseEvent) {
    local.onClick?.(e);

    const text = is.function(local.content) ? local.content() : local.content;

    const ok = await copyToClipboard(text);

    if (ok) {
      setStatus("success");
      local.onCopied?.();
    } else {
      setStatus("error");
      local.onError?.();
    }

    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => {
      setStatus("idle");
    }, COPY_FEEDBACK_DURATION);
  }

  return (
    <IconButton
      class={cn(colorClass(), local.class)}
      size={size()}
      onClick={handleClick}
      {...rest}
    >
      <Switch>
        <Match when={status() === "idle"}>
          {icon({ name: "copy", size: size() })}
        </Match>
        <Match when={status() === "success"}>
          {icon({ name: "check", size: size() })}
        </Match>
        <Match when={status() === "error"}>
          {icon({ name: "error", size: size() })}
        </Match>
      </Switch>
    </IconButton>
  );
}

export { CopyButton };
