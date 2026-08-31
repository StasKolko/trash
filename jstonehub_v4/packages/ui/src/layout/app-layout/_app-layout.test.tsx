import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import { APP_LAYOUT_BASE } from "./_app-layout.style";
import { AppLayout } from "./app-layout";

const TEST_ID = "AppLayout";

describe("[AppLayout]", () => {
  it("should render div with classes and reactive children", () => {
    const [children, setChildren] = createSignal("initial");

    render(() => <AppLayout data-testid={TEST_ID}>{children()}</AppLayout>);

    const el = screen.getByTestId(TEST_ID);

    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el).toHaveClass(APP_LAYOUT_BASE);
    expect(el).toHaveTextContent("initial");

    setChildren("updated");
    expect(el).toHaveTextContent("updated");
  });
});
