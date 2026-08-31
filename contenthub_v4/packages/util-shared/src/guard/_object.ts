import type { Guard } from "./_type";

const isArray: Guard<readonly unknown[]> = (
  value,
): value is readonly unknown[] => Array.isArray(value);

const isObject: Guard<Record<PropertyKey, unknown>> = (
  value,
): value is Record<PropertyKey, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const objectGuards = {
  array: isArray,
  object: isObject,
} as const;

export { objectGuards };
