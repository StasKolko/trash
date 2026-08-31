import { lazy } from "solid-js";

const RouterDevtool = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/solid-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null;

export { RouterDevtool };
