type Guard<T> = (value: unknown) => value is T;

type NotGuard<Excluded> = <Value>(
  value: Value,
) => value is Exclude<Value, Excluded>;

export type { Guard, NotGuard };