import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import { DEFAULT_STROKE_WIDTH, Loader } from "../loader/loader";

const TEST_ID = "Loader";

describe("[Loader]", () => {
  it("should render svg with circle and update props reactively", () => {
    const [size, setSize] = createSignal(24);
    const [strokeWidth, setStrokeWidth] = createSignal<number | undefined>(
      undefined,
    );
    const [style, setStyle] = createSignal<string | undefined>(undefined);

    render(() => (
      <Loader
        data-testid={TEST_ID}
        size={size()}
        strokeWidth={strokeWidth()}
        class={style()}
      />
    ));

    const svg = screen.getByTestId(TEST_ID);

    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");

    const circle = svg.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute(
      "stroke-width",
      String(DEFAULT_STROKE_WIDTH),
    );

    setStrokeWidth(4);
    expect(circle).toHaveAttribute("stroke-width", "4");

    setSize(32);
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");

    setStyle("custom-class");
    expect(svg).toHaveClass("custom-class");
  });
});
