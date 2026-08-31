import type { Orientation } from "../../_model/type";

import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import { SEPARATOR_BASE, SEPARATOR_ORIENTATION } from "./_separator.style";
import { DEFAULT_ORIENTATION, Separator } from "./separator";

const TEST_ID = "Separator";

describe("[Separator]", () => {
  it("should render with defaults and update props reactively", () => {
    const [orientation, setOrientation] = createSignal<Orientation | undefined>(
      undefined,
    );
    const [cls, setCls] = createSignal<string | undefined>(undefined);

    render(() => (
      <Separator
        data-testid={TEST_ID}
        orientation={orientation()}
        class={cls()}
      />
    ));

    const el = screen.getByTestId(TEST_ID);

    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass(SEPARATOR_BASE);
    expect(el).toHaveClass(SEPARATOR_ORIENTATION[DEFAULT_ORIENTATION]);

    setOrientation("vertical");
    expect(el).toHaveClass(SEPARATOR_ORIENTATION.vertical);

    setCls("my-[8px]");
    expect(el).toHaveClass("my-[8px]");
  });
});
