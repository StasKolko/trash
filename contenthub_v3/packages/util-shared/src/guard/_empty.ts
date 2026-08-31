import type { Guard } from "./_type";

const isEmptyString: Guard<string> = (value): value is string =>
  typeof value === "string" && value.length === 0;

const isEmptyArray: Guard<readonly []> = (value): value is readonly [] =>
  Array.isArray(value) && value.length === 0;

const emptyGuards = {
  string: isEmptyString,
  array: isEmptyArray,
} as const;

export { emptyGuards };