import type { Cache, Config, EntryInfo } from "../_types";

export function applyIgnoreFromConfig({
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
  const ignoredNames = new Set<string>();

  for (const key in config) {
    if (config.key === "ignore") {
      ignoredNames.add(key);
    }
  }

  let kept = dirs.filter((entry) => !ignoredNames.has(entry.name));
  dirs.length = 0;
  dirs.push(...kept);

  kept = files.filter((entry) => !ignoredNames.has(entry.name));
  files.length = 0;
  files.push(...kept);

  for (const key in cache) {
    if (ignoredNames.has(key)) {
      delete cache[key];
    }
  }
}
