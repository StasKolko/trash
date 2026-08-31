import type { TypographyProps } from "../_model/typography.type";

import { cn } from "@packages/util/css";

import { DEFAULT_VARIANT } from "../_model/typography.constant";
import {
  HEADING_1,
  HEADING_2,
  HEADING_3,
  HEADING_4,
  HEADING_5,
  HEADING_6,
  HEADING_VARIANT,
} from "./_heading.style";

export function H1(props: TypographyProps) {
  const variant = () => props.variant ?? DEFAULT_VARIANT;
  const classes = () => cn(HEADING_1, HEADING_VARIANT[variant()], props.class);

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <h1 data-testid={props["data-testid"]} id={props.id} class={classes()}>
      {props.children}
    </h1>
  );
}

export function H2(props: TypographyProps) {
  const variant = () => props.variant ?? DEFAULT_VARIANT;
  const classes = () => cn(HEADING_2, HEADING_VARIANT[variant()], props.class);

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <h2 data-testid={props["data-testid"]} id={props.id} class={classes()}>
      {props.children}
    </h2>
  );
}

export function H3(props: TypographyProps) {
  const variant = () => props.variant ?? DEFAULT_VARIANT;
  const classes = () => cn(HEADING_3, HEADING_VARIANT[variant()], props.class);

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <h3 data-testid={props["data-testid"]} id={props.id} class={classes()}>
      {props.children}
    </h3>
  );
}

export function H4(props: TypographyProps) {
  const variant = () => props.variant ?? DEFAULT_VARIANT;
  const classes = () => cn(HEADING_4, HEADING_VARIANT[variant()], props.class);

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <h4 data-testid={props["data-testid"]} id={props.id} class={classes()}>
      {props.children}
    </h4>
  );
}

export function H5(props: TypographyProps) {
  const variant = () => props.variant ?? DEFAULT_VARIANT;
  const classes = () => cn(HEADING_5, HEADING_VARIANT[variant()], props.class);

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <h5 data-testid={props["data-testid"]} id={props.id} class={classes()}>
      {props.children}
    </h5>
  );
}

export function H6(props: TypographyProps) {
  const variant = () => props.variant ?? DEFAULT_VARIANT;
  const classes = () => cn(HEADING_6, HEADING_VARIANT[variant()], props.class);

  return (
    // biome-ignore lint/correctness/noRestrictedElements: UI primitive implementation
    <h6 data-testid={props["data-testid"]} id={props.id} class={classes()}>
      {props.children}
    </h6>
  );
}
