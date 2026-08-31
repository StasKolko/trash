"use client";

import { ImageIcon, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/css";

const items = [
  { href: "/admin", title: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/settings", title: "Настройки", icon: Settings },
  { href: "/admin/settings/favicon", title: "Фавиконка", icon: ImageIcon },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex h-full w-full flex-col gap-1 p-3 md:p-4", className)}
    >
      <div className="px-3 py-3 text-lg font-semibold tracking-tight">
        Admin
      </div>
      <div className="space-y-1">
        {items.map((it) => {
          const active =
            pathname === it.href || pathname.startsWith(`${it.href}/`);
          const Icon = it.icon;
          return (
            <Link
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
              href={it.href}
              key={it.href}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span>{it.title}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto px-3 py-2 text-xs text-muted-foreground/80">
        v1.0 • Minimal UI
      </div>
    </nav>
  );
}
