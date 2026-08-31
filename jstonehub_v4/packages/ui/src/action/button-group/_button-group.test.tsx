import type { Orientation } from "../../_model/type";

import { render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

import { Button } from "../button/button";
import {
  BUTTON_GROUP_BASE,
  BUTTON_GROUP_HORIZONTAL_CHILDREN,
  BUTTON_GROUP_VERTICAL_CHILDREN,
} from "./_button-group.style";
import { ButtonGroup } from "./button-group";

const TEST_ID = "BtnGroup";

describe("[ButtonGroup]", () => {
  it("should render div[role=group] with defaults and react to orientation/class/children changes", () => {
    const [orientation, setOrientation] = createSignal<Orientation | undefined>(
      undefined,
    );
    const [cls, setCls] = createSignal<string | undefined>(undefined);
    const [children, setChildren] = createSignal("initial");

    render(() => (
      <ButtonGroup
        data-testid={TEST_ID}
        orientation={orientation()}
        class={cls()}
      >
        {children()}
      </ButtonGroup>
    ));

    const el = screen.getByTestId(TEST_ID);

    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el).toHaveAttribute("role", "group");
    expect(el).toHaveClass(BUTTON_GROUP_BASE);
    expect(el).toHaveClass(BUTTON_GROUP_HORIZONTAL_CHILDREN);
    expect(el.className).not.toContain("flex-col");
    expect(el).toHaveTextContent("initial");

    setOrientation("vertical");
    expect(el).toHaveClass(BUTTON_GROUP_VERTICAL_CHILDREN);
    expect(el).toHaveClass("flex-col");

    setOrientation("horizontal");
    expect(el).toHaveClass(BUTTON_GROUP_HORIZONTAL_CHILDREN);
    expect(el.className).not.toContain("flex-col");

    setCls("group-custom");
    expect(el).toHaveClass("group-custom");

    setChildren("updated");
    expect(el).toHaveTextContent("updated");
  });

  it("should apply correct child styles for horizontal orientation", () => {
    render(() => (
      <ButtonGroup data-testid={TEST_ID}>
        <Button data-testid="b1">A</Button>
        <Button data-testid="b2">B</Button>
        <Button data-testid="b3">C</Button>
      </ButtonGroup>
    ));

    const group = screen.getByTestId(TEST_ID);

    expect(group).toHaveClass(BUTTON_GROUP_HORIZONTAL_CHILDREN);

    expect(group).toHaveClass("[&>*:focus-visible]:z-1");
    expect(group).toHaveClass(
      "[&>*:not(:first-child):not(:last-child)]:rounded-none",
    );
    expect(group).toHaveClass("[&>*:first-child]:rounded-r-none");
    expect(group).toHaveClass("[&>*:last-child]:rounded-l-none");
    expect(group).toHaveClass("[&>*:not(:first-child)]:-ml-px");
  });

  it("should apply correct child styles for vertical orientation", () => {
    render(() => (
      <ButtonGroup data-testid={TEST_ID} orientation="vertical">
        <Button data-testid="b1">A</Button>
        <Button data-testid="b2">B</Button>
        <Button data-testid="b3">C</Button>
      </ButtonGroup>
    ));

    const group = screen.getByTestId(TEST_ID);

    expect(group).toHaveClass(BUTTON_GROUP_VERTICAL_CHILDREN);

    expect(group).toHaveClass("[&>*:focus-visible]:z-1");
    expect(group).toHaveClass(
      "[&>*:not(:first-child):not(:last-child)]:rounded-none",
    );
    expect(group).toHaveClass("[&>*:first-child]:rounded-b-none");
    expect(group).toHaveClass("[&>*:last-child]:rounded-t-none");
    expect(group).toHaveClass("[&>*:not(:first-child)]:-mt-px");
  });
});
