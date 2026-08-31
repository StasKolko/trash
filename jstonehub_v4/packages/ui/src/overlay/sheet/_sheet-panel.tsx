import type { JSX } from "solid-js";

import {
  SHEET_PANEL_ROOT_STYLE,
  SHEET_PANEL_TRANSFORM_HIDDEN,
  SHEET_PANEL_TRANSFORM_VISIBLE,
} from "./_sheet.style";

export function SheetPanel(props: {
  "data-testid"?: string;
  ref: HTMLElement;
  visible: boolean;
  children: JSX.Element;
}) {
  return (
    <aside
      // v8 ignore start
      ref={props.ref}
      // v8 ignore end
      data-testid={props["data-testid"]}
      class={SHEET_PANEL_ROOT_STYLE}
      style={{
        transform: props.visible
          ? SHEET_PANEL_TRANSFORM_VISIBLE
          : SHEET_PANEL_TRANSFORM_HIDDEN,
      }}
    >
      {props.children}
    </aside>
  );
}
