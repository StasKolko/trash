import type { ReactNode } from "react";
import { CartButton } from "@/services/cart";
import { FavoritesButton } from "@/services/favorites";
import { SearchBar } from "@/services/search";
import { UserProfileButton } from "@/services/user-profile";
import { Header } from "@/shared/ui/kit/header";
import { Logo } from "@/shared/ui/kit/logo";
import { Menu } from "@/shared/ui/menu";
import { ModeToggle } from "@/shared/ui/theme";

export default function ShopLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto relative">
      <Header>
        <Logo href="/" className="hidden md:inline-block" />
        <Menu triggerName="Каталог" title="Каталог товаров">
          Бытовая техника
        </Menu>
        <SearchBar />
        <FavoritesButton />
        <CartButton />
        <ModeToggle />
        <UserProfileButton />
      </Header>
      {children}
    </div>
  );
}
