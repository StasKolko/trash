import type { ButtonType } from "./button.type";

import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import { BUTTON_ROUNDED, ICON_BUTTON_SIZE } from "./_button.style";
import { Button, DEFAULT_TYPE, IconButton, LoadingButton } from "./button";
import { resolveButtonClasses } from "./button.util";

describe("[Button]", () => {
  it("should render with defaults and react to type/disabled/class changes", () => {
    const [type, setType] = createSignal<ButtonType | undefined>(undefined);
    const [disabled, setDisabled] = createSignal<boolean | undefined>(
      undefined,
    );
    const [cls, setCls] = createSignal<string | undefined>(undefined);

    render(() => (
      <Button
        data-testid="btn"
        type={type()}
        disabled={disabled()}
        class={cls()}
      >
        text
      </Button>
    ));

    const el = screen.getByTestId("btn");

    expect(el.tagName.toLowerCase()).toBe("button");
    expect(el).toHaveAttribute("type", DEFAULT_TYPE);
    expect(el).not.toBeDisabled();
    expect(el).toHaveTextContent("text");

    const defaultClasses = resolveButtonClasses();
    for (const token of defaultClasses.split(" ").filter(Boolean)) {
      expect(el.className).toContain(token);
    }
    expect(el).toHaveClass(BUTTON_ROUNDED);

    setType("reset");
    expect(el).toHaveAttribute("type", "reset");

    setDisabled(true);
    expect(el).toBeDisabled();
    expect(el).toHaveClass("pointer-events-none");
    expect(el).toHaveClass("opacity-50");

    setDisabled(false);
    expect(el).not.toBeDisabled();

    setCls("my-custom");
    expect(el).toHaveClass("my-custom");
  });
});

describe("[IconButton]", () => {
  it("should render with icon classes and react to type/disabled/class changes", () => {
    const [type, setType] = createSignal<ButtonType | undefined>(undefined);
    const [disabled, setDisabled] = createSignal<boolean | undefined>(
      undefined,
    );
    const [cls, setCls] = createSignal<string | undefined>(undefined);

    render(() => (
      <IconButton
        data-testid="icon-btn"
        type={type()}
        disabled={disabled()}
        class={cls()}
        aria-label="test"
      >
        X
      </IconButton>
    ));

    const el = screen.getByTestId("icon-btn");

    expect(el.tagName.toLowerCase()).toBe("button");
    expect(el).toHaveAttribute("type", DEFAULT_TYPE);
    expect(el).not.toBeDisabled();
    expect(el).toHaveClass(ICON_BUTTON_SIZE);
    expect(el.className).not.toContain(BUTTON_ROUNDED);

    setType("submit");
    expect(el).toHaveAttribute("type", "submit");

    setDisabled(true);
    expect(el).toBeDisabled();
    expect(el).toHaveClass("pointer-events-none");

    setDisabled(false);
    expect(el).not.toBeDisabled();

    setCls("icon-custom");
    expect(el).toHaveClass("icon-custom");
  });
});

describe("[LoadingButton]", () => {
  it("should render with defaults, handle loading/disabled states, and show Loader", () => {
    const [type, setType] = createSignal<ButtonType | undefined>(undefined);
    const [disabled, setDisabled] = createSignal<boolean | undefined>(
      undefined,
    );
    const [loading, setLoading] = createSignal<boolean | undefined>(undefined);
    const [cls, setCls] = createSignal<string | undefined>(undefined);

    render(() => (
      <LoadingButton
        data-testid="load-btn"
        data-loader-testid="loader"
        type={type()}
        disabled={disabled()}
        loading={loading()}
        class={cls()}
      >
        save
      </LoadingButton>
    ));

    const el = screen.getByTestId("load-btn");

    expect(el.tagName.toLowerCase()).toBe("button");
    expect(el).toHaveAttribute("type", DEFAULT_TYPE);
    expect(el).not.toBeDisabled();
    expect(el).toHaveTextContent("save");
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();

    setLoading(true);
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(el).toHaveClass("pointer-events-none");
    const loader = screen.getByTestId("loader");
    expect(loader).toBeInTheDocument();

    setLoading(false);
    expect(el).not.toBeDisabled();
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();

    setDisabled(true);
    expect(el).toBeDisabled();
    expect(el).toHaveClass("pointer-events-none");

    setDisabled(false);
    setLoading(true);
    expect(el).toBeDisabled();

    setLoading(false);
    setDisabled(false);

    setType("submit");
    expect(el).toHaveAttribute("type", "submit");

    setCls("load-custom");
    expect(el).toHaveClass("load-custom");
  });
});
