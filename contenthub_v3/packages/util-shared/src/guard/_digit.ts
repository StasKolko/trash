import type { Guard, NotGuard } from "./_type";

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

const isDigitString: Guard<Digit> = (value): value is Digit =>
  typeof value === "string" &&
  value.length === 1 &&
  value >= "0" &&
  value <= "9";

const isNotDigitString: NotGuard<Digit> = <Value>(
  value: Value,
): value is Exclude<Value, Digit> => !isDigitString(value);

export type { Digit };
export { isDigitString, isNotDigitString };