import type { Guard } from "./_type";

const isString: Guard<string> = (value): value is string =>
  typeof value === "string";

const primitiveGuards = {
  string: isString,
} as const;

export { primitiveGuards };
