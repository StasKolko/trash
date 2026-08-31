function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${value}`);
}

function devFrontendAssert(condition: boolean, message: string) {
  if (import.meta.env.DEV && condition) {
    throw new Error(message);
  }
}

export { assertNever, devFrontendAssert };
