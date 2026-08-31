type Guard<T> = (value: unknown) => value is T;

type NonNullish = NonNullable<unknown>;

const string: Guard<string> = (value): value is string =>
  typeof value === "string";

const number: Guard<number> = (value): value is number =>
  typeof value === "number" && !Number.isNaN(value);

const boolean: Guard<boolean> = (value): value is boolean =>
  typeof value === "boolean";

const truthy = (value: unknown): value is NonNullish => Boolean(value);

const falsy = (value: unknown): boolean => !value;

const undefined_: Guard<undefined> = (value): value is undefined =>
  value === undefined;

const null_: Guard<null> = (value): value is null => value === null;

const nullish: Guard<null | undefined> = (value): value is null | undefined =>
  value === null || value === undefined;

const object: Guard<Record<string, unknown>> = (
  value,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const array: Guard<unknown[]> = (value): value is unknown[] =>
  Array.isArray(value);

const function_: Guard<(...args: unknown[]) => unknown> = (
  value,
): value is (...args: unknown[]) => unknown => typeof value === "function";

const error: Guard<Error> = (value): value is Error => value instanceof Error;

const not = {
  string: <T>(value: T): value is Exclude<T, string> => !string(value),
  number: <T>(value: T): value is Exclude<T, number> => !number(value),
  boolean: <T>(value: T): value is Exclude<T, boolean> => !boolean(value),
  undefined: <T>(value: T): value is Exclude<T, undefined> =>
    !undefined_(value),
  null: <T>(value: T): value is Exclude<T, null> => !null_(value),
  nullish: <T>(value: T): value is NonNullable<T> => !nullish(value),
  object: <T>(value: T): value is Exclude<T, Record<string, unknown>> =>
    !object(value),
  array: <T>(value: T): value is Exclude<T, unknown[]> => !array(value),
  function: <T>(
    value: T,
  ): value is Exclude<T, (...args: unknown[]) => unknown> => !function_(value),
  error: <T>(value: T): value is Exclude<T, Error> => !error(value),
} as const;

export const is = {
  string,
  number,
  boolean,
  undefined: undefined_,
  null: null_,
  nullish,
  object,
  array,
  function: function_,
  error,
  truthy,
  falsy,
  not,
} as const;
