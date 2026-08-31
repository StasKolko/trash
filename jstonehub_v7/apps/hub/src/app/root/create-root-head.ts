import type { createRootRouteWithContext } from "@tanstack/solid-router";

import type { RouterContext } from "./root.type";

import style from "./_style.css?url";

type RootRouteOptions = NonNullable<
  Parameters<ReturnType<typeof createRootRouteWithContext<RouterContext>>>[0]
>;

type RootHead = ReturnType<NonNullable<RootRouteOptions["head"]>>;

function createRootHead(): RootHead {
  return {
    links: [{ rel: "stylesheet", href: style }],
  };
}

export { createRootHead };
