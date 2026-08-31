import type { NotGuard } from "./_type";

import { isNotDigitString } from "./_digit";

const isNotNull: NotGuard<null> = (
  value,
): value is Exclude<typeof value, null> => value !== null;

const isNotUndefined: NotGuard<undefined> = (
  value,
): value is Exclude<typeof value, undefined> => value !== undefined;

const notPrimitiveGuards = {
  null: isNotNull,
  undefined: isNotUndefined,
  digit: isNotDigitString,
} as const;

export { notPrimitiveGuards };
