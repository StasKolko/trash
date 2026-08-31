import type { Guard } from "./_type";

const isEmptyString: Guard<""> = (value): value is "" =>
  typeof value === "string" && value.length === 0;

const emptyGuards = {
  empty: {
    string: isEmptyString,
  },
} as const;

export { emptyGuards };
