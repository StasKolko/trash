import type { ComponentSize, SemanticVariant } from "../../_model/type";

import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import {
  DEFAULT_COMPONENT_SIZE,
  DEFAULT_SEMANTIC_VARIANT,
} from "../../_model/constant";
import { BADGE_BASE, BADGE_SIZE, BADGE_VARIANT } from "./_badge.style";
import { Badge } from "./badge";

const TEST_ID = "Badge";

describe("[Badge]", () => {
  it("should render with defaults and react to variant/size/class/aria-label/children changes", () => {
    const [variant, setVariant] = createSignal<SemanticVariant | undefined>(
      undefined,
    );
    const [size, setSize] = createSignal<ComponentSize | undefined>(undefined);
    const [cls, setCls] = createSignal<string | undefined>(undefined);
    const [ariaLabel, setAriaLabel] = createSignal("initial label");
    const [children, setChildren] = createSignal("42");

    render(() => (
      <Badge
        data-testid={TEST_ID}
        aria-label={ariaLabel()}
        variant={variant()}
        size={size()}
        class={cls()}
      >
        {children()}
      </Badge>
    ));

    const el = screen.getByTestId(TEST_ID);

    expect(el.tagName.toLowerCase()).toBe("output");
    expect(el).toHaveAttribute("aria-label", "initial label");
    expect(el).toHaveTextContent("42");
    expect(el).toHaveClass(BADGE_BASE);
    expect(el).toHaveClass(BADGE_VARIANT[DEFAULT_SEMANTIC_VARIANT]);
    expect(el).toHaveClass(BADGE_SIZE[DEFAULT_COMPONENT_SIZE]);

    setVariant("error");
    setSize("lg");
    setCls("custom-badge");
    setAriaLabel("updated label");
    setChildren("99+");

    expect(el).toHaveAttribute("aria-label", "updated label");
    expect(el).toHaveTextContent("99+");
    expect(el).toHaveClass(BADGE_VARIANT.error);
    expect(el).toHaveClass(BADGE_SIZE.lg);
    expect(el).toHaveClass("custom-badge");

    expect(el).not.toHaveClass(BADGE_VARIANT[DEFAULT_SEMANTIC_VARIANT]);
    expect(el).not.toHaveClass(BADGE_SIZE[DEFAULT_COMPONENT_SIZE]);

    setVariant("success");
    setSize("sm");

    expect(el).toHaveClass(BADGE_VARIANT.success);
    expect(el).toHaveClass(BADGE_SIZE.sm);
    expect(el).not.toHaveClass(BADGE_VARIANT.error);
    expect(el).not.toHaveClass(BADGE_SIZE.lg);
  });
});
