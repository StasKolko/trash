import { Devtools } from "@packages/devtool";
import { HeadContent, Outlet, Scripts } from "@tanstack/solid-router";

function RootLayout() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <Scripts />
      <Devtools />
    </>
  );
}

export { RootLayout };
