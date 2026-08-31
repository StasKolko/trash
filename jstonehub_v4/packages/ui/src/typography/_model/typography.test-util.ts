import type { Setter } from "solid-js";

import type { TypographyVariant } from "./typography.type";

import { DEFAULT_VARIANT } from "./typography.constant";

const ALL_VARIANTS: TypographyVariant[] = [
  "foreground",
  "success",
  "error",
  "warning",
  "info",
];

const NON_DEFAULT_VARIANTS = ALL_VARIANTS.filter((v) => v !== DEFAULT_VARIANT);

// biome-ignore-start lint/suspicious/noMisplacedAssertion: FALSE_POSITIVE
function assertVariantReactivity(
  el: HTMLElement,
  setVariant: Setter<TypographyVariant | undefined>,
  variantMap: Record<TypographyVariant, string>,
) {
  expect(el).toHaveClass(variantMap[DEFAULT_VARIANT]);

  for (const v of NON_DEFAULT_VARIANTS) {
    setVariant(v);
    expect(el).toHaveClass(variantMap[v]);
    expect(el).not.toHaveClass(variantMap[DEFAULT_VARIANT]);
  }

  setVariant(undefined);
  expect(el).toHaveClass(variantMap[DEFAULT_VARIANT]);
}

function assertIdReactivity(
  el: HTMLElement,
  setId: Setter<string | undefined>,
) {
  expect(el).not.toHaveAttribute("id");

  setId("test-id");
  expect(el).toHaveAttribute("id", "test-id");
}

function assertClassReactivity(
  el: HTMLElement,
  setCls: Setter<string | undefined>,
) {
  setCls("custom-class");
  expect(el).toHaveClass("custom-class");
}

// biome-ignore-end lint/suspicious/noMisplacedAssertion: FALSE_POSITIVE

export { assertClassReactivity, assertIdReactivity, assertVariantReactivity };
