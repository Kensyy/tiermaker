export function throttle<Args extends unknown[]>(fn: (...args: Args) => void, waitMs: number) {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let pendingArgs: Args | undefined;

  return (...args: Args) => {
    const now = Date.now();
    const remaining = waitMs - (now - lastCall);

    if (remaining <= 0) {
      lastCall = now;
      fn(...args);
      return;
    }

    pendingArgs = args;
    if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = undefined;
        if (pendingArgs) fn(...pendingArgs);
      }, remaining);
    }
  };
}
