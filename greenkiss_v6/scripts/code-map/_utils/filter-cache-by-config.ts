import { Cache, Config } from "../_types";

export const filterCacheByConfig = (config: Config, cache: Cache): Cache => {
  const result: Cache = {};

  for (const key in cache) {
    const configValue = config[key];
    const cacheValue = cache[key];

    if (configValue === "ignore") continue;
    else if (typeof configValue === "object") {
      if (!("status" in cacheValue)) {
        const filteredChild = filterCacheByConfig(configValue, cacheValue);

        if (Object.keys(filteredChild).length > 0) {
          result[key] = filteredChild;
        }
      } else {
        result[key] = cacheValue;
      }
      continue;
    }

    result[key] = cacheValue;
  }

  return result;
};
