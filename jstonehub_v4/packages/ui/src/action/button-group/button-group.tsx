import type { JSX } from "solid-js";

import type { Orientation } from "../../_model/type";

import { cn } from "@packages/util/css";

import {
  BUTTON_GROUP_BASE,
  BUTTON_GROUP_HORIZONTAL_CHILDREN,
  BUTTON_GROUP_VERTICAL_CHILDREN,
} from "./_button-group.style";

const DEFAULT_ORIENTATION: Orientation = "horizontal";

function ButtonGroup(props: {
  "data-testid"?: string;
  orientation?: Orientation;
  class?: string;
  children: JSX.Element;
}) {
  const orientation = () => props.orientation ?? DEFAULT_ORIENTATION;

  return (
    // biome-ignore lint/a11y/useSemanticElements: fieldset has unwanted default styles (border, padding, legend); div[role=group] is semantically correct for toolbar-like button grouping
    <div
      data-testid={props["data-testid"]}
      role="group"
      class={cn(
        BUTTON_GROUP_BASE,
        props.orientation === "vertical" && "flex-col",
        orientation() === "horizontal"
          ? BUTTON_GROUP_HORIZONTAL_CHILDREN
          : BUTTON_GROUP_VERTICAL_CHILDREN,
        props.class,
      )}
    >
      {props.children}
    </div>
  );
}

export { ButtonGroup, DEFAULT_ORIENTATION };
