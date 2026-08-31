export const formatKB = (bytes: number): string => {
  return Math.ceil(bytes / 1024).toString();
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
