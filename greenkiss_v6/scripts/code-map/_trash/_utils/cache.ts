import type { CacheFile, Cache } from "../_types";

export function isCacheFile(value: Cache | CacheFile | undefined): value is CacheFile {
  return !!value && (value as CacheFile).status !== undefined;
}
