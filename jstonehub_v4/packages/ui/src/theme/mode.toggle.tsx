import type { ModeToggleProps } from "./_theme.type";

import { MoonIcon, SunIcon } from "lucide-solid";
import { Show, splitProps } from "solid-js";

import { DEFAULT_COMPONENT_SIZE } from "../_model/constant";
import { IconButton } from "../action/button/button";
import { ICON_SIZE } from "../action/icon/icon.constant";
import { useTheme } from "./theme.provider";

export function ModeToggle(props: ModeToggleProps) {
  const [local, rest] = splitProps(props, [
    "data-dark-testid",
    "data-light-testid",
    "onClick",
  ]);

  const { toggle, theme } = useTheme();

  const size = () => props.size ?? DEFAULT_COMPONENT_SIZE;
  const iconPx = () => ICON_SIZE[size()];
  const dark = () => theme() === "dark";

  function handleClick(e: MouseEvent) {
    local.onClick?.(e);
    toggle();
  }

  return (
    <IconButton onClick={handleClick} {...rest}>
      <Show
        when={dark()}
        fallback={
          <SunIcon data-testid={local["data-light-testid"]} size={iconPx()} />
        }
      >
        <MoonIcon data-testid={local["data-dark-testid"]} size={iconPx()} />
      </Show>
    </IconButton>
  );
}
