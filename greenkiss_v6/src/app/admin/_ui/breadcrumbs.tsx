"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  // Строим прогрессивные ссылки
  let acc = "";
  const items = parts.map((p, i) => {
    acc += `/${p}`;
    const label =
      p === "admin" ? "Админка" : decodeURIComponent(p).replaceAll("-", " ");
    const href = acc;
    const isLast = i === parts.length - 1;
    return { label, href, isLast };
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
      {items.map((it, idx) => (
        <span className="flex items-center gap-2" key={it.href}>
          {it.isLast ? (
            <span className="text-foreground">{it.label}</span>
          ) : (
            <Link className="hover:text-foreground" href={it.href}>
              {it.label}
            </Link>
          )}
          {idx < items.length - 1 && (
            <span className="text-muted-foreground/60">/</span>
          )}
        </span>
      ))}
    </nav>
  );
}
