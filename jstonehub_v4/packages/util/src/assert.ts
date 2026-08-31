import { is } from "./guard";

export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${value}`);
}

export function devFrontendAssert(
  condition: boolean,
  component: string,
  message: string,
): void {
  if (is.truthy(import.meta.env.DEV) && is.truthy(condition)) {
    throw new Error(`[${component}] ${message}`);
  }
}
