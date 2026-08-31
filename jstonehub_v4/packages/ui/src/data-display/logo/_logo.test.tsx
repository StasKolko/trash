import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import { LOGO_ICON_CONTAINER, LOGO_ROOT } from "./_logo.style";
import { LOGO_BRAND_TEXT, LOGO_LETTER_TEXT, Logo } from "./logo";

const TEST_ID = "Logo";

describe("[Logo]", () => {
  it("should render with admin appName, correct structure, classes and text, then react to appName change", () => {
    const [appName, setAppName] = createSignal<"admin" | "hub">("admin");

    render(() => (
      <Logo data-testid={TEST_ID} appName={appName()}>
        {(renderProps) => (
          <a data-testid={renderProps["data-testid"]} class={renderProps.class}>
            {renderProps.children}
          </a>
        )}
      </Logo>
    ));

    const root = screen.getByTestId(TEST_ID);

    expect(root.tagName.toLowerCase()).toBe("a");
    expect(root).toHaveClass(LOGO_ROOT);

    expect(root).toHaveTextContent(LOGO_LETTER_TEXT);
    expect(root).toHaveTextContent(LOGO_BRAND_TEXT);
    expect(root).toHaveTextContent("admin");

    const html = root.innerHTML;
    for (const token of LOGO_ICON_CONTAINER.split(" ").slice(0, 3)) {
      expect(html).toContain(token);
    }

    setAppName("hub");

    expect(root).toHaveTextContent("hub");
    expect(root).toHaveTextContent(LOGO_BRAND_TEXT);
    expect(root).toHaveTextContent(LOGO_LETTER_TEXT);
    expect(root).not.toHaveTextContent("admin");
  });

  it("should pass data-testid and class to children render prop", () => {
    render(() => (
      <Logo data-testid={TEST_ID} appName="hub">
        {(renderProps) => (
          <div
            data-testid={renderProps["data-testid"]}
            class={renderProps.class}
          >
            {renderProps.children}
          </div>
        )}
      </Logo>
    ));

    const el = screen.getByTestId(TEST_ID);
    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el).toHaveClass(LOGO_ROOT);
    expect(el).toHaveTextContent(LOGO_BRAND_TEXT);
    expect(el).toHaveTextContent("hub");
  });
});
