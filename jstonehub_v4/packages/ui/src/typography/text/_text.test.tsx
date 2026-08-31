import type {
  TypographyLevel,
  TypographyVariant,
} from "../_model/typography.type";

import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import {
  assertClassReactivity,
  assertIdReactivity,
  assertVariantReactivity,
} from "../_model/typography.test-util";
import { TEXT_LEVEL, TEXT_VARIANT } from "./_text.style";
import { P } from "./text";

const TEST_ID = "Text";

describe("[P]", () => {
  it("should render <p> with defaults and react to level/variant/id/class/children changes", () => {
    const [level, setLevel] = createSignal<TypographyLevel>(3);
    const [variant, setVariant] = createSignal<TypographyVariant | undefined>(
      undefined,
    );
    const [id, setId] = createSignal<string | undefined>(undefined);
    const [cls, setCls] = createSignal<string | undefined>(undefined);
    const [children, setChildren] = createSignal("initial");

    render(() => (
      <P
        data-testid={TEST_ID}
        level={level()}
        variant={variant()}
        id={id()}
        class={cls()}
      >
        {children()}
      </P>
    ));

    const el = screen.getByTestId(TEST_ID);

    expect(el.tagName.toLowerCase()).toBe("p");
    expect(el).toHaveClass(TEXT_LEVEL[3]);
    expect(el).toHaveTextContent("initial");

    for (let l = 1; l <= 6; l++) {
      setLevel(l as TypographyLevel);
      expect(el).toHaveClass(TEXT_LEVEL[l as TypographyLevel]);
    }

    setChildren("updated");
    expect(el).toHaveTextContent("updated");

    assertVariantReactivity(el, setVariant, TEXT_VARIANT);
    assertIdReactivity(el, setId);
    assertClassReactivity(el, setCls);
  });
});
