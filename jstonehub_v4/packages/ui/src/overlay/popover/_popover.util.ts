import type { Align, Side } from "../_model/type";
import type { PopoverPosition } from "./_popover.type";

import { getFloatingCoords } from "../_util/get-floating-coords";
import { resolveFloatingLayout } from "../_util/resolve-floating-layout";
import { POPOVER_CONFIG } from "./_popover.constant";

type MeasureOptions = {
  anchor: HTMLElement;
  panel: HTMLElement;
  side: Side;
  matchTriggerWidth: boolean;
};

type MeasuredLayout = {
  triggerRect: DOMRect;
  side: Side;
  align: Align;
  width: number;
  maxWidth: number;
  maxHeight: number;
};

function measureLayout(options: MeasureOptions): MeasuredLayout {
  const { anchor, panel, side, matchTriggerWidth } = options;
  const triggerRect = anchor.getBoundingClientRect();

  const layout = resolveFloatingLayout({
    trigger: triggerRect,
    side,
    offset: POPOVER_CONFIG.offset,
    minWidth: matchTriggerWidth ? triggerRect.width : POPOVER_CONFIG.widthMin,
    minHeight: POPOVER_CONFIG.heightMin,
  });

  const width = matchTriggerWidth
    ? triggerRect.width
    : Math.min(POPOVER_CONFIG.widthMax, layout.maxWidth);

  const maxHeight = Math.min(POPOVER_CONFIG.heightMax, layout.maxHeight);

  panel.style.width = `${width}px`;
  panel.style.maxHeight = `${maxHeight}px`;
  panel.style.visibility = "hidden";
  panel.style.left = "0px";
  panel.style.top = "0px";

  return {
    triggerRect,
    side: layout.side,
    align: layout.align,
    width,
    maxWidth: layout.maxWidth,
    maxHeight,
  };
}

function computePosition(
  panel: HTMLElement,
  layout: MeasuredLayout,
): PopoverPosition {
  const panelRect = panel.getBoundingClientRect();
  const actualHeight = Math.min(panelRect.height, layout.maxHeight);

  const coords = getFloatingCoords({
    trigger: layout.triggerRect,
    side: layout.side,
    align: layout.align,
    width: layout.width,
    height: actualHeight,
    offset: POPOVER_CONFIG.offset,
  });

  return {
    ...coords,
    width: layout.width,
    height: actualHeight,
    maxWidth: layout.maxWidth,
    maxHeight: layout.maxHeight,
    side: layout.side,
    align: layout.align,
  };
}

function getPopoverStyle(
  pos: PopoverPosition | null,
  visible: boolean,
): Record<string, string> {
  if (!pos) {
    return {
      left: "-9999px",
      top: "-9999px",
      visibility: "hidden",
      opacity: "0",
    };
  }

  const base: Record<string, string> = {
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: `${pos.width}px`,
    "max-height": `${pos.maxHeight}px`,
  };

  if (!visible) {
    return { ...base, visibility: "hidden", opacity: "0" };
  }

  return { ...base, visibility: "visible", opacity: "1" };
}

export { computePosition, getPopoverStyle, measureLayout };
