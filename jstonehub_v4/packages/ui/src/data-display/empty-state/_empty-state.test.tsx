import type { JSX } from "solid-js";

import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import {
  EMPTY_STATE_BODY,
  EMPTY_STATE_FOOTER,
  EMPTY_STATE_ICON,
  EMPTY_STATE_ROOT,
} from "./_empty-state.style";
import { EmptyState } from "./empty-state";

const TEST_ID = "EmptyState";
const ICON_TEST_ID = "EmptyStateIcon";
const BODY_TEST_ID = "EmptyStateBody";
const TITLE_TEST_ID = "EmptyStateTitle";
const TEXT_TEST_ID = "EmptyStateText";
const FOOTER_TEST_ID = "EmptyStateFooter";

describe("[EmptyState]", () => {
  it("should render with required props, correct structure and classes", () => {
    render(() => (
      <EmptyState
        data-testid={TEST_ID}
        data-icon-testid={ICON_TEST_ID}
        data-body-testid={BODY_TEST_ID}
        data-title-testid={TITLE_TEST_ID}
        data-text-testid={TEXT_TEST_ID}
        icon={<svg data-testid="icon-svg" />}
        title="No items"
        text="Create your first item to get started"
      />
    ));

    const root = screen.getByTestId(TEST_ID);
    expect(root.tagName.toLowerCase()).toBe("div");
    expect(root).toHaveClass(EMPTY_STATE_ROOT);

    const iconZone = screen.getByTestId(ICON_TEST_ID);
    expect(iconZone).toHaveClass(EMPTY_STATE_ICON);
    expect(screen.getByTestId("icon-svg")).toBeInTheDocument();

    const body = screen.getByTestId(BODY_TEST_ID);
    expect(body).toHaveClass(EMPTY_STATE_BODY);

    const title = screen.getByTestId(TITLE_TEST_ID);
    expect(title.tagName.toLowerCase()).toBe("h3");
    expect(title).toHaveTextContent("No items");

    const text = screen.getByTestId(TEXT_TEST_ID);
    expect(text.tagName.toLowerCase()).toBe("p");
    expect(text).toHaveTextContent("Create your first item to get started");

    expect(screen.queryByTestId(FOOTER_TEST_ID)).not.toBeInTheDocument();
  });

  it("should show footer when action is provided and hide when removed", () => {
    const [action, setAction] = createSignal<JSX.Element | undefined>(
      <button data-testid="action-btn">Click</button>,
    );

    render(() => (
      <EmptyState
        data-testid={TEST_ID}
        data-footer-testid={FOOTER_TEST_ID}
        icon={<svg />}
        title="Title"
        text="Text"
        action={action()}
      />
    ));

    const footer = screen.getByTestId(FOOTER_TEST_ID);
    expect(footer).toHaveClass(EMPTY_STATE_FOOTER);
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();

    setAction(undefined);
    expect(screen.queryByTestId(FOOTER_TEST_ID)).not.toBeInTheDocument();
  });

  it("should react to icon/title/text/class changes", () => {
    const [iconContent, setIconContent] = createSignal("icon-a");
    const [title, setTitle] = createSignal("Title A");
    const [text, setText] = createSignal("Text A");
    const [cls, setCls] = createSignal<string | undefined>(undefined);

    render(() => (
      <EmptyState
        data-testid={TEST_ID}
        data-icon-testid={ICON_TEST_ID}
        data-title-testid={TITLE_TEST_ID}
        data-text-testid={TEXT_TEST_ID}
        icon={<span>{iconContent()}</span>}
        title={title()}
        text={text()}
        class={cls()}
      />
    ));

    const root = screen.getByTestId(TEST_ID);
    const iconZone = screen.getByTestId(ICON_TEST_ID);
    const titleEl = screen.getByTestId(TITLE_TEST_ID);
    const textEl = screen.getByTestId(TEXT_TEST_ID);

    expect(iconZone).toHaveTextContent("icon-a");
    expect(titleEl).toHaveTextContent("Title A");
    expect(textEl).toHaveTextContent("Text A");

    setIconContent("icon-b");
    setTitle("Title B");
    setText("Text B");
    setCls("custom-empty");

    expect(iconZone).toHaveTextContent("icon-b");
    expect(titleEl).toHaveTextContent("Title B");
    expect(textEl).toHaveTextContent("Text B");
    expect(root).toHaveClass("custom-empty");
  });

  it("should react to action content changes", () => {
    const [label, setLabel] = createSignal("Save");

    render(() => (
      <EmptyState
        data-testid={TEST_ID}
        data-footer-testid={FOOTER_TEST_ID}
        icon={<svg />}
        title="Title"
        text="Text"
        action={<button>{label()}</button>}
      />
    ));

    const footer = screen.getByTestId(FOOTER_TEST_ID);
    expect(footer).toHaveTextContent("Save");

    setLabel("Submit");
    expect(footer).toHaveTextContent("Submit");
  });
});
