import { lazy } from "solid-js";

const QueryDevtool = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/solid-query-devtools").then((m) => ({
        default: m.SolidQueryDevtools,
      })),
    )
  : () => null;

export { QueryDevtool };
