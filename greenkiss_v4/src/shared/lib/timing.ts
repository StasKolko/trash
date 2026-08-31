export type Procedure<Args extends unknown[], Return> = (
  ...args: Args
) => Return;

export type Cancelable = {
  cancel: () => void;
};

export type DebouncedFunction<Args extends unknown[]> = Procedure<Args, void> &
  Cancelable;

export type ThrottledFunction<Args extends unknown[]> = Procedure<Args, void> &
  Cancelable;

export function debounce<Args extends unknown[], Return>(
  fn: Procedure<Args, Return>,
  wait: number,
): DebouncedFunction<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Args) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

export function throttle<Args extends unknown[], Return>(
  fn: Procedure<Args, Return>,
  wait: number,
): ThrottledFunction<Args> {
  let lastCallTime: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;

  const invoke = (time: number, args: Args) => {
    lastCallTime = time;
    fn(...args);
  };

  const throttled = (...args: Args) => {
    const now = Date.now();

    if (lastCallTime === null) {
      // Первый вызов — сразу
      invoke(now, args);
      return;
    }

    const remaining = wait - (now - lastCallTime);

    // Можно вызывать сразу — прошёл интервал
    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      invoke(now, args);
      return;
    }

    // Иначе планируем trailing‑вызов с последними аргументами
    lastArgs = args;
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (lastArgs) {
          invoke(Date.now(), lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastCallTime = null;
  };

  return throttled;
}
