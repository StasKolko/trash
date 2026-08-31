export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";

export type FloatingPosition = {
  x: number;
  y: number;
  maxWidth: number;
  maxHeight: number;
  side: Side;
  align: Align;
};
