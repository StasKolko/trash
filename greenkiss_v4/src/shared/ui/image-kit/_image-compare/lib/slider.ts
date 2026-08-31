export function clampSliderPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function getSliderPercentFromClientX(
  clientX: number,
  rect: DOMRect,
): number {
  const x = clientX - rect.left;
  const rawPercent = (x / rect.width) * 100;
  return clampSliderPercent(rawPercent);
}
