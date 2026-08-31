import type { ReactNode } from "react";

import { UserProfileButton } from "@/services/user-profile";
import { AdminNav } from "@/shared/ui/admin-kit";
import { Header } from "@/shared/ui/kit/header";
import { Logo } from "@/shared/ui/kit/logo";
import { Menu } from "@/shared/ui/menu";
import { ModeToggle } from "@/shared/ui/theme";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto relative">
      <Header>
        <Logo href="/admin" className="hidden md:inline-block" />
        <Menu
          triggerClassName="lg:hidden"
          title="Админ навигация"
          triggerName="Навигация"
        >
          <AdminNav />
        </Menu>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserProfileButton />
        </div>
      </Header>

      <main className="h-[calc(100vh-3rem-1px)] md:h-[calc(100vh-3.5rem-1px)] grid lg:grid-cols-[auto_1fr]">
        <aside className="hidden w-50 xl:w-60 lg:block border-r">
          <AdminNav />
        </aside>
        {children}
      </main>
    </div>
  );
}
