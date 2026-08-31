import type { TypographyVariant } from "../_model/typography.type";

import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import {
  assertClassReactivity,
  assertIdReactivity,
  assertVariantReactivity,
} from "../_model/typography.test-util";
import {
  HEADING_1,
  HEADING_2,
  HEADING_3,
  HEADING_4,
  HEADING_5,
  HEADING_6,
  HEADING_VARIANT,
} from "./_heading.style";
import { H1, H2, H3, H4, H5, H6 } from "./heading";

const TEST_ID = "Heading";

const HEADINGS = [
  { Component: H1, tag: "h1", style: HEADING_1 },
  { Component: H2, tag: "h2", style: HEADING_2 },
  { Component: H3, tag: "h3", style: HEADING_3 },
  { Component: H4, tag: "h4", style: HEADING_4 },
  { Component: H5, tag: "h5", style: HEADING_5 },
  { Component: H6, tag: "h6", style: HEADING_6 },
] as const;

describe("[Heading]", () => {
  for (const { Component, tag, style } of HEADINGS) {
    it(`<${tag}> should render with defaults and react to variant/id/class/children changes`, () => {
      testHeading(Component, tag, style);
    });
  }
});

// biome-ignore-start lint/suspicious/noMisplacedAssertion: FALSE_POSITIVE
function testHeading(
  Component: (typeof HEADINGS)[number]["Component"],
  tag: string,
  headingStyle: string,
) {
  const [variant, setVariant] = createSignal<TypographyVariant | undefined>(
    undefined,
  );
  const [id, setId] = createSignal<string | undefined>(undefined);
  const [cls, setCls] = createSignal<string | undefined>(undefined);
  const [children, setChildren] = createSignal("initial");

  render(() => (
    <Component
      data-testid={TEST_ID}
      variant={variant()}
      id={id()}
      class={cls()}
    >
      {children()}
    </Component>
  ));

  const el = screen.getByTestId(TEST_ID);

  expect(el.tagName.toLowerCase()).toBe(tag);
  expect(el).toHaveClass(headingStyle);
  expect(el).toHaveTextContent("initial");

  setChildren("updated");
  expect(el).toHaveTextContent("updated");

  assertVariantReactivity(el, setVariant, HEADING_VARIANT);
  assertIdReactivity(el, setId);
  assertClassReactivity(el, setCls);
}
// biome-ignore-end lint/suspicious/noMisplacedAssertion: FALSE_POSITIVE
