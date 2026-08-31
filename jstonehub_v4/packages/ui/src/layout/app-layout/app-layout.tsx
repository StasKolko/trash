import type { JSX } from "solid-js";

import { APP_LAYOUT_BASE } from "./_app-layout.style";

function AppLayout(props: { "data-testid"?: string; children: JSX.Element }) {
  return (
    <div data-testid={props["data-testid"]} class={APP_LAYOUT_BASE}>
      {props.children}
    </div>
  );
}

export { AppLayout };
