import type { JSX } from "solid-js";

import { Show } from "solid-js";

import { useBreakpoint } from "../breakpoint/breakpoint.provider";
import {
  NAVIGATION_DESKTOP_ROOT_STYLE,
  NAVIGATION_MOBILE_ROOT_STYLE,
} from "./_navigation.style";

export function Navigation(props: {
  "data-desktop-testid"?: string;
  "data-mobile-testid"?: string;
  desktop: JSX.Element;
  mobile: JSX.Element;
}) {
  const bp = useBreakpoint();

  return (
    <Show
      when={bp.isMobile()}
      fallback={
        <header
          data-testid={props["data-desktop-testid"]}
          class={NAVIGATION_DESKTOP_ROOT_STYLE}
        >
          {props.desktop}
        </header>
      }
    >
      <nav
        data-testid={props["data-mobile-testid"]}
        class={NAVIGATION_MOBILE_ROOT_STYLE}
      >
        {props.mobile}
      </nav>
    </Show>
  );
}
