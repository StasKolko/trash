import type { Align, Side } from "../_model/type";

import { OPPOSITE_SIDE, VIEWPORT_PADDING } from "../_model/constant";

function resolveFloatingLayout(options: {
  trigger: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
  };
  side: Side;
  offset: number;
  minWidth: number;
  minHeight: number;
}) {
  const { trigger, side: preferredSide, offset, minWidth, minHeight } = options;
  const gap = VIEWPORT_PADDING + offset;

  if (preferredSide === "top" || preferredSide === "bottom") {
    const topSpace = trigger.top - gap;
    const bottomSpace = window.innerHeight - trigger.bottom - gap;

    const { side, maxSize } = resolveSide({
      preferred: preferredSide,
      startSpace: topSpace,
      endSpace: bottomSpace,
      minSize: minHeight,
    });

    const { align, maxSize: maxWidth } = resolveAlign({
      triggerStart: trigger.left,
      triggerEnd: trigger.right,
      triggerSize: trigger.width,
      viewportSize: window.innerWidth,
      minSize: minWidth,
    });

    return { side, align, maxWidth, maxHeight: maxSize };
  }

  const leftSpace = trigger.left - gap;
  const rightSpace = window.innerWidth - trigger.right - gap;

  const { side, maxSize } = resolveSide({
    preferred: preferredSide,
    startSpace: leftSpace,
    endSpace: rightSpace,
    minSize: minWidth,
  });

  const { align, maxSize: maxHeight } = resolveAlign({
    triggerStart: trigger.top,
    triggerEnd: trigger.bottom,
    triggerSize: trigger.height,
    viewportSize: window.innerHeight,
    minSize: minHeight,
  });

  return { side, align, maxWidth: maxSize, maxHeight };
}

function resolveSide(options: {
  preferred: Side;
  startSpace: number;
  endSpace: number;
  minSize: number;
}): { side: Side; maxSize: number } {
  const { preferred, startSpace, endSpace, minSize } = options;
  const opposite = OPPOSITE_SIDE[preferred];
  const preferStart = preferred === "top" || preferred === "left";

  const startFits = startSpace >= minSize;
  const endFits = endSpace >= minSize;

  if (preferStart && startFits) {
    return { side: preferred, maxSize: startSpace };
  }
  if (preferStart && endFits) {
    return { side: opposite, maxSize: endSpace };
  }

  if (!preferStart && endFits) {
    return { side: preferred, maxSize: endSpace };
  }
  if (!preferStart && startFits) {
    return { side: opposite, maxSize: startSpace };
  }

  if (startSpace >= endSpace) {
    return { side: preferStart ? preferred : opposite, maxSize: startSpace };
  }
  return { side: preferStart ? opposite : preferred, maxSize: endSpace };
}

function resolveAlign(options: {
  triggerStart: number;
  triggerEnd: number;
  triggerSize: number;
  viewportSize: number;
  minSize: number;
}): { align: Align; maxSize: number } {
  const { triggerStart, triggerEnd, triggerSize, viewportSize, minSize } =
    options;
  const triggerCenter = triggerStart + triggerSize / 2;
  const startFromCenter = triggerCenter - VIEWPORT_PADDING;
  const endFromCenter = viewportSize - triggerCenter - VIEWPORT_PADDING;
  const centerSize = Math.min(startFromCenter, endFromCenter) * 2;

  if (centerSize >= minSize) {
    return { align: "center", maxSize: centerSize };
  }

  const startSize = viewportSize - triggerStart - VIEWPORT_PADDING;
  const endSize = triggerEnd - VIEWPORT_PADDING;

  if (startSize >= minSize) {
    return { align: "start", maxSize: startSize };
  }
  if (endSize >= minSize) {
    return { align: "end", maxSize: endSize };
  }

  const max = Math.max(centerSize, startSize, endSize);
  if (max === centerSize) {
    return { align: "center", maxSize: centerSize };
  }
  if (max === startSize) {
    return { align: "start", maxSize: startSize };
  }
  return { align: "end", maxSize: endSize };
}

export { resolveFloatingLayout };
