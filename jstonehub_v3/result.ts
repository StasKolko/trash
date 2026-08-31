type Result<T> = Ok<T> | Fail;
type Ok<T> = { ok: true; data: T };
type Fail = { ok: false; error: ResultError };

type ResultError = {
  code: string;
  message: string;
  cause?: unknown;
};

type SyncPipe<T> = {
  map: <U>(fn: (data: T) => U) => SyncPipe<U>;
  flatMap: <U>(fn: (data: T) => Result<U>) => SyncPipe<U>;
  mapError: (fn: (error: ResultError) => ResultError) => SyncPipe<T>;
  recover: (fn: (error: ResultError) => T) => SyncPipe<T>;
  mapAsync: <U>(fn: (data: T) => Promise<U>) => AsyncPipe<U>;
  flatMapAsync: <U>(fn: (data: T) => Promise<Result<U>>) => AsyncPipe<U>;
  recoverAsync: (fn: (error: ResultError) => Promise<T>) => AsyncPipe<T>;
  unwrapOr: (fallback: T) => T;
  unwrapOrThrow: () => T;
  result: () => Result<T>;
};

type AsyncPipe<T> = {
  map: <U>(fn: (data: T) => U) => AsyncPipe<U>;
  mapAsync: <U>(fn: (data: T) => Promise<U>) => AsyncPipe<U>;
  flatMap: <U>(fn: (data: T) => Result<U>) => AsyncPipe<U>;
  flatMapAsync: <U>(fn: (data: T) => Promise<Result<U>>) => AsyncPipe<U>;
  mapError: (fn: (error: ResultError) => ResultError) => AsyncPipe<T>;
  recover: (fn: (error: ResultError) => T) => AsyncPipe<T>;
  recoverAsync: (fn: (error: ResultError) => Promise<T>) => AsyncPipe<T>;
  unwrapOr: (fallback: T) => Promise<T>;
  unwrapOrThrow: () => Promise<T>;
  result: () => Promise<Result<T>>;
};

const isOk = <T>(result: Result<T>): result is Ok<T> => result.ok;

const isFail = <T>(result: Result<T>): result is Fail => !result.ok;

const ok = <T>(data: T): Result<T> => ({
  ok: true,
  data,
});

const fail = <T = never>(
  code: string,
  message: string,
  cause?: unknown,
): Result<T> => ({
  ok: false,
  error: { code, message, cause },
});

const fromCatch = (e: unknown, code: string): Result<never> => {
  if (e instanceof Error) {
    return fail(code, e.message, e);
  }
  return fail(code, String(e), e);
};

const tryCatch = <T>(fn: () => T, code: string): Result<T> => {
  try {
    return ok(fn());
  } catch (e) {
    return fromCatch(e, code);
  }
};

const tryCatchAsync = async <T>(
  fn: () => Promise<T>,
  code: string,
): Promise<Result<T>> => {
  try {
    return ok(await fn());
  } catch (e) {
    return fromCatch(e, code);
  }
};

const unwrapOr = <T>(result: Result<T>, fallback: T): T => {
  if (isOk(result)) {
    return result.data;
  }
  return fallback;
};

const unwrapOrThrow = <T>(result: Result<T>): T => {
  if (isOk(result)) {
    return result.data;
  }
  throw new Error(result.error.message, { cause: result.error });
};

const map = <T, U>(result: Result<T>, fn: (data: T) => U): Result<U> =>
  isOk(result) ? ok(fn(result.data)) : result;

const flatMap = <T, U>(
  result: Result<T>,
  fn: (data: T) => Result<U>,
): Result<U> => (isOk(result) ? fn(result.data) : result);

const mapError = <T>(
  result: Result<T>,
  fn: (error: ResultError) => ResultError,
): Result<T> => {
  if (isOk(result)) {
    return result;
  }
  const newError = fn(result.error);
  return fail(newError.code, newError.message, newError.cause);
};

const recover = <T>(
  result: Result<T>,
  fn: (error: ResultError) => T,
): Result<T> => (isOk(result) ? result : ok(fn(result.error)));

const mapAsync = async <T, U>(
  result: Result<T>,
  fn: (data: T) => Promise<U>,
): Promise<Result<U>> => {
  if (isFail(result)) {
    return result;
  }
  try {
    return ok(await fn(result.data));
  } catch (e) {
    return fromCatch(e, "MAP_ASYNC_ERROR");
  }
};

const flatMapAsync = async <T, U>(
  result: Result<T>,
  fn: (data: T) => Promise<Result<U>>,
): Promise<Result<U>> => {
  if (isFail(result)) {
    return result;
  }
  try {
    return await fn(result.data);
  } catch (e) {
    return fromCatch(e, "FLAT_MAP_ASYNC_ERROR");
  }
};

const recoverAsync = async <T>(
  result: Result<T>,
  fn: (error: ResultError) => Promise<T>,
): Promise<Result<T>> => {
  if (isOk(result)) {
    return result;
  }
  try {
    return ok(await fn(result.error));
  } catch (e) {
    return fromCatch(e, "RECOVER_ASYNC_ERROR");
  }
};

const pipeAsync = <T>(resultPromise: Promise<Result<T>>) => ({
  map: <U>(fn: (data: T) => U) =>
    pipeAsync(resultPromise.then((r) => map(r, fn))),

  mapAsync: <U>(fn: (data: T) => Promise<U>) =>
    pipeAsync(resultPromise.then((r) => mapAsync(r, fn))),

  flatMap: <U>(fn: (data: T) => Result<U>) =>
    pipeAsync(resultPromise.then((r) => flatMap(r, fn))),

  flatMapAsync: <U>(fn: (data: T) => Promise<Result<U>>) =>
    pipeAsync(resultPromise.then((r) => flatMapAsync(r, fn))),

  mapError: (fn: (error: ResultError) => ResultError) =>
    pipeAsync(resultPromise.then((r) => mapError(r, fn))),

  recover: (fn: (error: ResultError) => T) =>
    pipeAsync(resultPromise.then((r) => recover(r, fn))),

  recoverAsync: (fn: (error: ResultError) => Promise<T>) =>
    pipeAsync(resultPromise.then((r) => recoverAsync(r, fn))),

  unwrapOr: async (fallback: T): Promise<T> =>
    unwrapOr(await resultPromise, fallback),

  unwrapOrThrow: async (): Promise<T> => unwrapOrThrow(await resultPromise),

  result: (): Promise<Result<T>> => resultPromise,
});

function pipe<T>(result: Result<T>): SyncPipe<T>;
function pipe<T>(result: Promise<Result<T>>): AsyncPipe<T>;
function pipe<T>(result: Result<T> | Promise<Result<T>>) {
  if (result instanceof Promise) {
    return pipeAsync(result);
  }
  return {
    map: <U>(fn: (data: T) => U) => pipe(map(result, fn)),
    flatMap: <U>(fn: (data: T) => Result<U>) => pipe(flatMap(result, fn)),
    mapError: (fn: (error: ResultError) => ResultError) =>
      pipe(mapError(result, fn)),
    recover: (fn: (error: ResultError) => T) => pipe(recover(result, fn)),

    mapAsync: <U>(fn: (data: T) => Promise<U>) =>
      pipeAsync(mapAsync(result, fn)),
    flatMapAsync: <U>(fn: (data: T) => Promise<Result<U>>) =>
      pipeAsync(flatMapAsync(result, fn)),
    recoverAsync: (fn: (error: ResultError) => Promise<T>) =>
      pipeAsync(recoverAsync(result, fn)),

    unwrapOr: (fallback: T): T => unwrapOr(result, fallback),
    unwrapOrThrow: (): T => unwrapOrThrow(result),
    result: (): Result<T> => result,
  };
}

export { ok, fail, tryCatch, tryCatchAsync, isOk, isFail, pipe };
export type { Result, ResultError, Ok, Fail };
