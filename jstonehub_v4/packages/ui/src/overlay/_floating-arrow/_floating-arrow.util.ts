import type { JSX } from "solid-js";

import type { Align, Side } from "../_model/type";

import {
  ALIGN_STYLES,
  CLIP_PATHS,
  INNER_POSITIONS,
  INNER_SIZES,
  OUTER_SIZES,
  SIDE_OFFSETS,
} from "./_floating-arrow.constant";

function isVertical(side: Side): boolean {
  return side === "top" || side === "bottom";
}

function getWrapperStyle(side: Side, align: Align): JSX.CSSProperties {
  const alignGroup = isVertical(side) ? "vertical" : "horizontal";
  const outer = OUTER_SIZES[side];

  return {
    width: `${outer.width}px`,
    height: `${outer.height}px`,
    ...SIDE_OFFSETS[side],
    ...ALIGN_STYLES[alignGroup][align],
  };
}

function getOuterStyle(side: Side): JSX.CSSProperties {
  const sizes = OUTER_SIZES[side];

  return {
    width: `${sizes.width}px`,
    height: `${sizes.height}px`,
    "clip-path": CLIP_PATHS[side],
  };
}

function getInnerStyle(side: Side): JSX.CSSProperties {
  const sizes = INNER_SIZES[side];

  return {
    width: `${sizes.width}px`,
    height: `${sizes.height}px`,
    "clip-path": CLIP_PATHS[side],
    ...INNER_POSITIONS[side],
  };
}

export { getInnerStyle, getOuterStyle, getWrapperStyle };
