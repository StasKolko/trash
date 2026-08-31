import { Config } from "../_types";

export function splitConfig(config: Config) {
  const ok: Config = {};
  const ignore: Config = {};

  for (const [key, value] of Object.entries(config)) {
    if (value === "ok") {
      ok[key] = "ok";
    } else if (value === "ignore") {
      ignore[key] = "ignore";
    } else {
      const { ok: childOk, ignore: childIgnore } = splitConfig(value);

      if (Object.keys(childOk).length > 0) {
        ok[key] = childOk;
      }
      if (Object.keys(childIgnore).length > 0) {
        ignore[key] = childIgnore;
      }
    }
  }

  return { ok, ignore };
}
