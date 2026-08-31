import { lazy } from "solid-js";

export const Devtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/solid-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    )
  : () => null;
