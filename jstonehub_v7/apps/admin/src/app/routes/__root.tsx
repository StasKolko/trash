import type { RouterContext } from "../root/root.type";

import { createRootRouteWithContext } from "@tanstack/solid-router";

import { authContextQueryOptions } from "#admin/shared/auth/auth-context.query";
import { exchangeAuthCode } from "#admin/shared/auth/exchange-auth-code";

import { createRootHead } from "../root/create-root-head";
import { RootLayout } from "../root/root.layout";

const Route = createRootRouteWithContext<RouterContext>()({
  head: createRootHead,
  component: RootLayout,
  beforeLoad: async ({ context }) => {
    await exchangeAuthCode();
    await context.queryClient.ensureQueryData(authContextQueryOptions);
  },
});

export { Route };
