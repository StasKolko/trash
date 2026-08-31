import type { Cache, Config, EntryInfo } from "../_types";

export function cleanupConfigAndCache({
  dirs,
  files,
  config,
  cache,
}: {
  dirs: EntryInfo[];
  files: EntryInfo[];
  config: Config;
  cache: Cache;
}) {
  const allowedNames = new Set([
    ...dirs.map((d) => d.name),
    ...files.map((f) => f.name),
  ]);

  for (const key in config) {
    if (!allowedNames.has(key)) {
      delete config[key];
    }
  }

  for (const key in cache) {
    if (!allowedNames.has(key)) {
      delete cache[key];
    }
  }
}
