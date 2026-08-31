import type { Side } from "../_model/type";
import type { TooltipPosition } from "./_tooltip.type";

import { getFloatingCoords } from "../_util/get-floating-coords";
import { getFloatingPositionStyle } from "../_util/get-floating-position-style";
import { resolveFloatingLayout } from "../_util/resolve-floating-layout";
import { TOOLTIP_CONFIG } from "./_tooltip.constant";

function createTooltipTimers() {
  let showId: number | undefined;
  let hideId: number | undefined;
  let unmountId: number | undefined;
  let autoHideId: number | undefined;

  function clearAll() {
    window.clearTimeout(showId);
    window.clearTimeout(hideId);
    window.clearTimeout(unmountId);
    window.clearTimeout(autoHideId);
    showId = undefined;
    hideId = undefined;
    unmountId = undefined;
    autoHideId = undefined;
  }

  function scheduleShow(callback: () => void, delay: number) {
    clearAll();
    showId = window.setTimeout(() => {
      showId = undefined;
      callback();
    }, delay);
  }

  function scheduleHide(callback: () => void, delay: number) {
    clearAll();
    hideId = window.setTimeout(() => {
      hideId = undefined;
      callback();
    }, delay);
  }

  function scheduleUnmount(callback: () => void, delay: number) {
    window.clearTimeout(unmountId);
    unmountId = window.setTimeout(() => {
      unmountId = undefined;
      callback();
    }, delay);
  }

  function scheduleAutoHide(callback: () => void, delay: number) {
    window.clearTimeout(autoHideId);
    autoHideId = window.setTimeout(() => {
      autoHideId = undefined;
      callback();
    }, delay);
  }

  return {
    scheduleShow,
    scheduleHide,
    scheduleUnmount,
    scheduleAutoHide,
    clearAll,
  };
}

function calculateTooltipPosition(options: {
  triggerRef: HTMLElement | null;
  tooltipRef: HTMLElement | null;
  side: Side;
}): TooltipPosition | null {
  const { triggerRef, tooltipRef, side } = options;

  if (!(triggerRef && tooltipRef)) {
    return null;
  }

  const triggerRect = triggerRef.getBoundingClientRect();
  const naturalRect = measureNaturalSize(tooltipRef);

  const layout = resolveFloatingLayout({
    trigger: triggerRect,
    side,
    offset: TOOLTIP_CONFIG.offset,
    minWidth: Math.max(TOOLTIP_CONFIG.widthMin, naturalRect.width),
    minHeight: Math.max(TOOLTIP_CONFIG.heightMin, naturalRect.height),
  });

  const maxAllowedWidth = Math.min(
    naturalRect.width,
    TOOLTIP_CONFIG.widthMax,
    layout.maxWidth,
  );

  const wrappedHeight = measureWrappedHeight(tooltipRef, maxAllowedWidth);
  const optimalWidth = findOptimalWidth(
    tooltipRef,
    maxAllowedWidth,
    wrappedHeight,
  );

  const finalHeight = measureFinalHeight(
    tooltipRef,
    optimalWidth,
    layout.maxHeight,
  );

  const coords = getFloatingCoords({
    trigger: triggerRect,
    side: layout.side,
    align: layout.align,
    width: optimalWidth,
    height: finalHeight,
    offset: TOOLTIP_CONFIG.offset,
  });

  return {
    ...coords,
    width: optimalWidth,
    height: finalHeight,
    maxWidth: layout.maxWidth,
    maxHeight: layout.maxHeight,
    side: layout.side,
    align: layout.align,
  };
}

function getTooltipPositionStyle(
  pos: TooltipPosition | null,
  visible: boolean,
): Record<string, string> {
  return getFloatingPositionStyle(pos, visible);
}

function measureNaturalSize(element: HTMLElement) {
  element.style.width = "max-content";
  element.style.height = "auto";
  element.style.maxWidth = "none";
  element.style.maxHeight = "none";
  return element.getBoundingClientRect();
}

function measureWrappedHeight(element: HTMLElement, width: number): number {
  element.style.width = `${width}px`;
  element.style.maxWidth = `${width}px`;
  element.style.height = "auto";
  element.style.maxHeight = "none";
  return element.getBoundingClientRect().height;
}

function measureFinalHeight(
  element: HTMLElement,
  width: number,
  maxHeight: number,
): number {
  element.style.width = `${width}px`;
  element.style.maxWidth = `${width}px`;
  element.style.height = "auto";
  element.style.maxHeight = "none";
  const measured = element.getBoundingClientRect().height;
  return Math.min(measured, TOOLTIP_CONFIG.heightMax, maxHeight);
}

function findOptimalWidth(
  element: HTMLElement,
  maxWidth: number,
  targetHeight: number,
): number {
  let low = TOOLTIP_CONFIG.widthMin;
  let high = maxWidth;
  let optimal = maxWidth;

  while (high - low > TOOLTIP_CONFIG.binarySearchThreshold) {
    const mid = Math.floor((low + high) / 2);

    element.style.width = `${mid}px`;
    element.style.maxWidth = `${mid}px`;

    const rect = element.getBoundingClientRect();

    if (rect.height <= targetHeight + TOOLTIP_CONFIG.heightTolerance) {
      optimal = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return optimal;
}

export {
  calculateTooltipPosition,
  createTooltipTimers,
  findOptimalWidth,
  getTooltipPositionStyle,
};
