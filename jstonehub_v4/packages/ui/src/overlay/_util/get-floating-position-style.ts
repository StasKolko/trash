import type { FloatingPosition } from "../_model/type";

import { OFFSCREEN_PX } from "../_model/constant";

export function getFloatingPositionStyle(
  pos: FloatingPosition | null,
  visible: boolean,
): Record<string, string> {
  if (!pos) {
    return {
      left: `${OFFSCREEN_PX}px`,
      top: `${OFFSCREEN_PX}px`,
      visibility: "hidden",
      opacity: "0",
    };
  }

  const base: Record<string, string> = {
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    "max-width": `${pos.maxWidth}px`,
    "max-height": `${pos.maxHeight}px`,
  };

  if (!visible) {
    return { ...base, visibility: "hidden", opacity: "0" };
  }

  return { ...base, visibility: "visible" };
}
