import type { Orientation } from "../../_model/type";

const SEPARATOR_BASE = "bg-border shrink-0";

const SEPARATOR_ORIENTATION: Record<Orientation, string> = {
  horizontal: "w-full h-px",
  vertical: "w-px h-full",
};

export { SEPARATOR_BASE, SEPARATOR_ORIENTATION };
