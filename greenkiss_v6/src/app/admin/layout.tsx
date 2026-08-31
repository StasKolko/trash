import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { UserProfileButton } from "@/services/user-profile";
import { requireAdminOrManager } from "@/shared/lib/auth/server";
import { Button } from "@/shared/ui/kit/button";
import { Header } from "@/shared/ui/kit/header";
import { Logo } from "@/shared/ui/kit/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/kit/sheet";
import { ModeToggle } from "@/shared/ui/theme";
import { AdminSidebar } from "./_ui/admin-sidebar";
import { Breadcrumbs } from "./_ui/breadcrumbs";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminOrManager();

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,rgba(120,120,120,0.06),transparent_50%)]">
      {/* Глобальный header – на десктопах сверху, на мобилках снизу (поведение внутри компонента Header) */}
      <Header>
        <Logo className="hidden md:inline-block" />
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <UserProfileButton />
        </div>
      </Header>

      <div className="mx-auto grid w-full max-w-screen-2xl gap-0 md:grid-cols-[240px_1fr]">
        {/* Боковая панель (desktop) */}
        <aside className="hidden md:block sticky top-0 h-dvh border-r bg-card/40">
          <AdminSidebar className="h-full" />
        </aside>

        {/* Контентная область */}
        <main className="min-h-dvh">
          {/* Верхняя полоса с крошками и кнопкой меню (mobile) */}
          <div className="sticky top-0 z-10 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:border-none md:bg-transparent">
            <div className="flex items-center gap-3 px-4 py-3 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button aria-label="Открыть меню" size="icon" variant="ghost">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="p-0" side="left">
                  <SheetHeader className="p-4">
                    <SheetTitle>Навигация</SheetTitle>
                  </SheetHeader>
                  <AdminSidebar />
                </SheetContent>
              </Sheet>
              <div className="flex-1">
                <Breadcrumbs />
              </div>
            </div>
            <div className="hidden md:block px-6 pt-6">
              <Breadcrumbs />
            </div>
          </div>

          <div className="px-4 py-6 md:px-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
