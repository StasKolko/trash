import { getElementByIdOrThrow } from "@packages/util/dom";
import { QueryClientProvider } from "@tanstack/solid-query";
import { createRouter, RouterProvider } from "@tanstack/solid-router";
import { render } from "solid-js/web";

import { routeTree } from "#hub/routeTree.gen";
import { queryClient } from "#hub/shared/api/query-client";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
});

declare module "@tanstack/solid-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: @tanstack/solid-router
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

render(App, getElementByIdOrThrow("app"));
