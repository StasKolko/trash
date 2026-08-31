import { Main } from "@packages/ui/main";
import { TooltipProvider } from "@packages/ui/tooltip";
import { HeadContent, Outlet, Scripts } from "@tanstack/solid-router";
import { Devtools } from "./devtools";
import { RootResponsiveNavigation } from "./root-responsive-navigation";

export function RootLayout() {
  return (
    <TooltipProvider>
      <HeadContent />

      <RootResponsiveNavigation />
      <Main>
        <Outlet />
      </Main>

      <Devtools />
      <Scripts />
    </TooltipProvider>
  );
}
