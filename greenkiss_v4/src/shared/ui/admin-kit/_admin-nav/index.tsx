"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/ui/kit/button";
import { Logo } from "@/shared/ui/kit/logo";

const adminLinks = [
  {
    name: "Категории",
    href: "/admin/categories",
  },
  {
    name: "Бренды",
    href: "/admin/brands",
  },
];

export const AdminNav = () => {
  const pathname = usePathname();

  return (
    <nav className="h-[calc(100vh-1.75rem-1px)] lg:h-full overflow-x-auto">
      <div className="h-14 flex items-center justify-center border-b lg:hidden">
        <Logo href="/admin" />
      </div>

      {adminLinks.map(({ name, href }) => (
        <Button
          asChild
          key={href}
          className="w-full rounded-none border-b"
          variant={pathname.startsWith(href) ? "default" : "ghost"}
        >
          <Link href={href}>{name}</Link>
        </Button>
      ))}
    </nav>
  );
};
