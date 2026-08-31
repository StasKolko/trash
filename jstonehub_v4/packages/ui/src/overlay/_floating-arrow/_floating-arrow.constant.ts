import type { JSX } from "solid-js";

import type { Align, Side } from "../_model/type";

const FLOATING_ARROW_TEST_ID = "FloatingArrow";
const FLOATING_ARROW_OUTER_TEST_ID = "FloatingArrowOuter";
const FLOATING_ARROW_INNER_TEST_ID = "FloatingArrowInner";

const ARROW_SIZE = 10;
const ARROW_HEIGHT = 6;
const ARROW_OFFSET = 8;
const BORDER_WIDTH = 1;

const CLIP_PATHS: Record<Side, string> = {
  top: "polygon(50% 100%, 0% 0%, 100% 0%)",
  bottom: "polygon(50% 0%, 0% 100%, 100% 100%)",
  left: "polygon(100% 50%, 0% 0%, 0% 100%)",
  right: "polygon(0% 50%, 100% 0%, 100% 100%)",
};

const SIDE_OFFSETS: Record<Side, JSX.CSSProperties> = {
  top: { bottom: `-${ARROW_HEIGHT}px` },
  bottom: { top: `-${ARROW_HEIGHT}px` },
  left: { right: `-${ARROW_HEIGHT}px` },
  right: { left: `-${ARROW_HEIGHT}px` },
};

type AlignGroup = "vertical" | "horizontal";

const ALIGN_STYLES: Record<AlignGroup, Record<Align, JSX.CSSProperties>> = {
  vertical: {
    start: { left: `${ARROW_OFFSET}px` },
    center: { left: "50%", transform: "translateX(-50%)" },
    end: { right: `${ARROW_OFFSET}px` },
  },
  horizontal: {
    start: { top: `${ARROW_OFFSET}px` },
    center: { top: "50%", transform: "translateY(-50%)" },
    end: { bottom: `${ARROW_OFFSET}px` },
  },
};

const OUTER_SIZES: Record<Side, { width: number; height: number }> = {
  top: { width: ARROW_SIZE, height: ARROW_HEIGHT },
  bottom: { width: ARROW_SIZE, height: ARROW_HEIGHT },
  left: { width: ARROW_HEIGHT, height: ARROW_SIZE },
  right: { width: ARROW_HEIGHT, height: ARROW_SIZE },
};

const INNER_SIZES: Record<Side, { width: number; height: number }> = {
  top: {
    width: ARROW_SIZE - BORDER_WIDTH * 2,
    height: ARROW_HEIGHT - BORDER_WIDTH,
  },
  bottom: {
    width: ARROW_SIZE - BORDER_WIDTH * 2,
    height: ARROW_HEIGHT - BORDER_WIDTH,
  },
  left: {
    width: ARROW_HEIGHT - BORDER_WIDTH,
    height: ARROW_SIZE - BORDER_WIDTH * 2,
  },
  right: {
    width: ARROW_HEIGHT - BORDER_WIDTH,
    height: ARROW_SIZE - BORDER_WIDTH * 2,
  },
};

const INNER_POSITIONS: Record<Side, JSX.CSSProperties> = {
  top: {
    top: "0px",
    left: `${BORDER_WIDTH}px`,
  },
  bottom: {
    bottom: "0px",
    left: `${BORDER_WIDTH}px`,
  },
  left: {
    left: "0px",
    top: `${BORDER_WIDTH}px`,
  },
  right: {
    right: "0px",
    top: `${BORDER_WIDTH}px`,
  },
};

export {
  ALIGN_STYLES,
  CLIP_PATHS,
  FLOATING_ARROW_INNER_TEST_ID,
  FLOATING_ARROW_OUTER_TEST_ID,
  FLOATING_ARROW_TEST_ID,
  INNER_POSITIONS,
  INNER_SIZES,
  OUTER_SIZES,
  SIDE_OFFSETS,
};
