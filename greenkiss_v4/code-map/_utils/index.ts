import type { Cache, CacheFile, Config } from "../_types";

export function isConfig(value: unknown): value is Config {
  return typeof value === "object" && value !== null;
}

export function isCache(value: unknown): value is Cache {
  return typeof value === "object" && value !== null && !("hash" in value);
}

export function isIgnoredEntry(value: unknown) {
  return value === "ignore";
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isCacheFile(
  value: Cache | CacheFile | undefined,
): value is CacheFile {
  return !!value && isString(value.status);
}
