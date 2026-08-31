import type { Config, IgnoreConfig } from "../_types";

export function filterIgnoreOnly(config: Config) {
  const result: IgnoreConfig = {};

  for (const [key, value] of Object.entries(config)) {
    if (value === "ignore") {
      result[key] = "ignore";
    } else if (typeof value === "object") {
      const child = filterIgnoreOnly(value);
      if (Object.keys(child).length > 0) {
        result[key] = child;
      }
    }
  }

  return result;
}