import type { JSX } from "solid-js";

import { SELECT_EMPTY_STYLE } from "./_select.style";

export function SelectEmpty(props: { children: JSX.Element }) {
  return <div class={SELECT_EMPTY_STYLE}>{props.children}</div>;
}
