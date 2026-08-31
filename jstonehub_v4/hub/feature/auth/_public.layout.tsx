import { Logo } from "@packages/ui/data-display";
import { AppLayout, Navigation } from "@packages/ui/layout";
import { ModeToggle } from "@packages/ui/theme";
import { Link, Outlet } from "@tanstack/solid-router";
import { ArrowLeftRight } from "lucide-solid";

import { env } from "#hub/shared/config/env";

function PublicLayout() {
  return (
    <AppLayout>
      <Navigation desktop={<DesktopNav />} mobile={<MobileNav />} />
      <Outlet />
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
      <Logo appName="hub">{(logoProps) => <Link to="/" {...logoProps} />}</Logo>
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
      <Logo appName="hub">{(logoProps) => <Link to="/" {...logoProps} />}</Logo>
      <div class="flex items-center gap-[8px]">
        <AppSwitchLink />
        <ModeToggle aria-label="Toggle theme" />
      </div>
    </>
  );
}

export { PublicLayout };
