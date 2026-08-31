import type { Context } from "solid-js";

import { is } from "@packages/util/guard";
import { useContext } from "solid-js";

function getStrictContext<T>(context: Context<T | undefined>, hook: string): T {
  const value = useContext(context);

  if (is.undefined(value)) {
    throw new Error(`[${hook}] requires <UiProvider>.`);
  }

  return value;
}

export { getStrictContext };
