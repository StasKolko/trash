type Guard<T> = (value: unknown) => value is T;
type NegatedGuard<T> = <U>(value: U) => value is Exclude<U, T>;

const isNumber: Guard<number> = (value): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isBoolean: Guard<boolean> = (value): value is boolean =>
  typeof value === "boolean";

const isFunction: Guard<(...args: unknown[]) => unknown> = (
  value,
): value is (...args: unknown[]) => unknown => typeof value === "function";


const isNull: Guard<null> = (value): value is null => value === null;

const isUndefined: Guard<undefined> = (value): value is undefined =>
  value === undefined;

const isNullish: Guard<null | undefined> = (value): value is null | undefined =>
  value === null || value === undefined;

const isDefined = <T>(value: T): value is Exclude<T, null | undefined> =>
  value !== null && value !== undefined;

const isNanValue: Guard<number> = (value): value is number =>
  typeof value === "number" && Number.isNaN(value);

const isEmptyArray: Guard<readonly []> = (value): value is readonly [] =>
  Array.isArray(value) && value.length === 0;

const isEmptyString: Guard<""> = (value): value is "" => value === "";

const notString: NegatedGuard<string> = <U>(
  value: U,
): value is Exclude<U, string> => !isString(value);

const notNumber: NegatedGuard<number> = <U>(
  value: U,
): value is Exclude<U, number> => !isNumber(value);

const notBoolean: NegatedGuard<boolean> = <U>(
  value: U,
): value is Exclude<U, boolean> => !isBoolean(value);

const notFunction: NegatedGuard<(...args: unknown[]) => unknown> = <U>(
  value: U,
): value is Exclude<U, (...args: unknown[]) => unknown> => !isFunction(value);

const notArray: NegatedGuard<readonly unknown[]> = <U>(
  value: U,
): value is Exclude<U, readonly unknown[]> => !isArray(value);

const notObject: NegatedGuard<Record<PropertyKey, unknown>> = <U>(
  value: U,
): value is Exclude<U, Record<PropertyKey, unknown>> => !isObject(value);

const notNull: NegatedGuard<null> = <U>(value: U): value is Exclude<U, null> =>
  !isNull(value);

const notUndefined: NegatedGuard<undefined> = <U>(
  value: U,
): value is Exclude<U, undefined> => !isUndefined(value);

const notNullish: NegatedGuard<null | undefined> = <U>(
  value: U,
): value is Exclude<U, null | undefined> => !isNullish(value);

const notDefined = <T>(value: T): value is Extract<T, null | undefined> =>
  !isDefined(value);

const notNaN: NegatedGuard<number> = <U>(
  value: U,
): value is Exclude<U, number> => !isNanValue(value);

const notEmptyArray = <T>(value: readonly T[]): value is readonly [T, ...T[]] =>
  value.length > 0;

const notEmptyString = <T extends string>(value: T): value is Exclude<T, ""> =>
  value !== "";

const not = {
  string: notString,
  number: notNumber,
  boolean: notBoolean,
  function: notFunction,
  array: notArray,
  object: notObject,
  null: notNull,
  undefined: notUndefined,
  nullish: notNullish,
  defined: notDefined,
  nan: notNaN,
  emptyArray: notEmptyArray,
  emptyString: notEmptyString,
} as const;

const is = {
  string: isString,
  number: isNumber,
  boolean: isBoolean,
  function: isFunction,
  array: isArray,
  object: isObject,
  null: isNull,
  undefined: isUndefined,
  nullish: isNullish,
  defined: isDefined,
  nan: isNanValue,
  emptyArray: isEmptyArray,
  emptyString: isEmptyString,
  not,
} as const;

export type { Guard };
export { is };
