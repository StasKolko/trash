import type { SidebarGroupItem } from "@packages/ui/layout";

import { Logo } from "@packages/ui/data-display";
import {
  AppLayout,
  ContentShell,
  Navigation,
  SidebarDesktopToggle,
  SidebarMobileTrigger,
} from "@packages/ui/layout";
import { ModeToggle } from "@packages/ui/theme";
import { Link, Outlet, useLocation } from "@tanstack/solid-router";
import { ArrowLeftRight } from "lucide-solid";

import { env } from "#hub/shared/config/env";

import { GROUP_CHILD_ROUTES, SIDEBAR_ITEMS } from "./_sidebar-item";

function AuthLayout() {
  const location = useLocation();

  const hasActiveChild = (group: SidebarGroupItem) => {
    const routes = GROUP_CHILD_ROUTES[group.label];
    if (!routes) {
      return false;
    }
    return routes.some((route) => location().pathname.startsWith(route));
  };

  return (
    <AppLayout>
      <Navigation desktop={<DesktopNav />} mobile={<MobileNav />} />
      <ContentShell
        logo={
          <Logo appName="hub">
            {(logoProps) => <Link to="/" {...logoProps} />}
          </Logo>
        }
        sidebarItems={SIDEBAR_ITEMS}
        main={<Outlet />}
        closeLabel="Close sidebar"
        hasActiveChild={hasActiveChild}
      />
    </AppLayout>
  );
}

function AppSwitchLink() {
  return (
    <a
      href={env.ADMIN_URL}
      class="flex items-center gap-[6px] text-[13px] text-subtle hover:text-foreground transition-colors duration-normal px-[8px] py-[4px] rounded-sm"
      title="Switch to Admin"
    >
      <ArrowLeftRight size={14} />
      <span>Admin</span>
    </a>
  );
}

function DesktopNav() {
  return (
    <>
      <div class="flex items-center gap-[12px]">
        <Logo appName="hub">
          {(logoProps) => <Link to="/" {...logoProps} />}
        </Logo>
        <SidebarDesktopToggle aria-label="Toggle sidebar" />
      </div>
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

function MobileNav() {
  return (
    <>
      <SidebarMobileTrigger aria-label="Open menu" />
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

export { AuthLayout };
