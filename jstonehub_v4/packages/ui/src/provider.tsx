import type { JSX } from "solid-js";

import { BreakpointProvider } from "./layout/breakpoint/breakpoint.provider";
import { SidebarProvider } from "./layout/content-shell/sidebar.provider";
import { Toaster } from "./overlay/toaster/toaster";
import { ThemeProvider } from "./theme/theme.provider";

export function UiProvider(props: { children: JSX.Element }) {
  return (
    <ThemeProvider>
      <BreakpointProvider>
        <SidebarProvider>
          {props.children}
          <Toaster />
        </SidebarProvider>
      </BreakpointProvider>
    </ThemeProvider>
  );
}
