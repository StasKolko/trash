import type { Align, Side } from "../_model/type";

function getFloatingCoords(options: {
  trigger: DOMRect;
  side: Side;
  align: Align;
  width: number;
  height: number;
  offset: number;
}) {
  const { trigger, side, align, width, height, offset } = options;

  let x = 0;
  let y = 0;

  if (side === "top") {
    y = trigger.top - height - offset;
    x = getAlignedX(trigger, align, width);
  } else if (side === "bottom") {
    y = trigger.bottom + offset;
    x = getAlignedX(trigger, align, width);
  } else if (side === "left") {
    x = trigger.left - width - offset;
    y = getAlignedY(trigger, align, height);
  } else {
    x = trigger.right + offset;
    y = getAlignedY(trigger, align, height);
  }

  return { x, y };
}

function getAlignedX(trigger: DOMRect, align: Align, width: number) {
  if (align === "start") {
    return trigger.left;
  }
  if (align === "end") {
    return trigger.right - width;
  }
  return trigger.left + trigger.width / 2 - width / 2;
}

function getAlignedY(trigger: DOMRect, align: Align, height: number) {
  if (align === "start") {
    return trigger.top;
  }
  if (align === "end") {
    return trigger.bottom - height;
  }
  return trigger.top + trigger.height / 2 - height / 2;
}

export { getFloatingCoords };
