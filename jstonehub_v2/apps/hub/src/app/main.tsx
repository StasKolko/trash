import { createRouter, RouterProvider } from "@tanstack/solid-router";
import { render } from "solid-js/web";

import { routeTree } from "#hub/routeTree.gen";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => <h1>404</h1>,
});

declare module "@tanstack/solid-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: @tanstack/solid-router
  interface Register {
    router: typeof router;
  }
}

const DOM_NODE_ID = "app";
const domNode = document.getElementById(DOM_NODE_ID);

if (!domNode) {
  throw new Error(`DOM Node element with id "${DOM_NODE_ID}" was not found`);
}

render(() => <RouterProvider router={router} />, domNode);
