import { createRootRouteWithContext } from "@tanstack/solid-router";
import { RootLayout } from "#admin/features/root-layout";
import styleCss from "../styles/globals.css?url";

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: "stylesheet", href: styleCss }],
  }),
  shellComponent: RootLayout,
});
