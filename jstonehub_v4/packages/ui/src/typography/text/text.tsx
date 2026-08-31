import type { TextProps } from "../_model/typography.type";

import { cn } from "@packages/util/css";

import { DEFAULT_VARIANT } from "../_model/typography.constant";
import { TEXT_LEVEL, TEXT_VARIANT } from "./_text.style";

export function P(props: TextProps) {
  const variant = () => props.variant ?? DEFAULT_VARIANT;
  const classes = () =>
    cn(TEXT_LEVEL[props.level], TEXT_VARIANT[variant()], props.class);

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <p data-testid={props["data-testid"]} id={props.id} class={classes()}>
      {props.children}
    </p>
  );
}
