import { Config } from "../_types";

export const createIgnoreMap = (config: Config): Config => {
  const result: Config = {};

  Object.entries(config).forEach(([key, value]) => {
    if (value === "ignore") {
      result[key] = "ignore";
    } else if (value === "ok") {
      // пропускаем
    } else {
      // value — это вложенный Config
      const nested = createIgnoreMap(value as Config);

      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    }
  });

  return result;
};
