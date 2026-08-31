import type { JSX } from "solid-js";

import { cn } from "@packages/util/css";
import { Show } from "solid-js";

import { H3 } from "../../typography/heading/heading";
import { P } from "../../typography/text/text";
import {
  EMPTY_STATE_BODY,
  EMPTY_STATE_FOOTER,
  EMPTY_STATE_ICON,
  EMPTY_STATE_ROOT,
} from "./_empty-state.style";

function EmptyState(props: {
  "data-testid"?: string;
  "data-icon-testid"?: string;
  "data-body-testid"?: string;
  "data-title-testid"?: string;
  "data-text-testid"?: string;
  "data-footer-testid"?: string;
  icon: JSX.Element;
  title: JSX.Element;
  text: JSX.Element;
  action?: JSX.Element;
  class?: string;
}) {
  return (
    <div
      data-testid={props["data-testid"]}
      class={cn(EMPTY_STATE_ROOT, props.class)}
    >
      <div data-testid={props["data-icon-testid"]} class={EMPTY_STATE_ICON}>
        {props.icon}
      </div>

      <div data-testid={props["data-body-testid"]} class={EMPTY_STATE_BODY}>
        <H3 data-testid={props["data-title-testid"]}>{props.title}</H3>
        <P data-testid={props["data-text-testid"]} level={3}>
          {props.text}
        </P>
      </div>

      <Show when={props.action}>
        <div
          data-testid={props["data-footer-testid"]}
          class={EMPTY_STATE_FOOTER}
        >
          {props.action}
        </div>
      </Show>
    </div>
  );
}

export { EmptyState };
