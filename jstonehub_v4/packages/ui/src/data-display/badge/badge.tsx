import type { JSX } from "solid-js";

import type { ComponentSize, SemanticVariant } from "../../_model/type";

import { cn } from "@packages/util/css";

import {
  DEFAULT_COMPONENT_SIZE,
  DEFAULT_SEMANTIC_VARIANT,
} from "../../_model/constant";
import { BADGE_BASE, BADGE_SIZE, BADGE_VARIANT } from "./_badge.style";

function Badge(props: {
  "data-testid"?: string;
  "aria-label": string;
  class?: string;
  variant?: SemanticVariant;
  size?: ComponentSize;
  children: JSX.Element;
}) {
  const variant = () => props.variant ?? DEFAULT_SEMANTIC_VARIANT;
  const size = () => props.size ?? DEFAULT_COMPONENT_SIZE;

  return (
    <output
      data-testid={props["data-testid"]}
      aria-label={props["aria-label"]}
      class={cn(
        BADGE_BASE,
        BADGE_VARIANT[variant()],
        BADGE_SIZE[size()],
        props.class,
      )}
    >
      {props.children}
    </output>
  );
}

export { Badge };
