import type { Guard } from "./_type";

import { isDigitString } from "./_digit";

const isNull: Guard<null> = (value): value is null => value === null;

const isUndefined: Guard<undefined> = (value): value is undefined =>
  value === undefined;

const isString: Guard<string> = (value): value is string =>
  typeof value === "string";

const primitiveGuards = {
  null: isNull,
  undefined: isUndefined,
  string: isString,
  digit: isDigitString,
} as const;

export { primitiveGuards };
