"use client";

import {
  CreditCard,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";
import { UserAvatar } from "./user-avatar";

type Role = "ADMIN" | "MANAGER" | "USER";

export const UserProfilePopoverAuthenticated = ({
  user,
  onSignOut,
}: {
  user:
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: Role | null;
      }
    | null
    | undefined;
  onSignOut: () => void | Promise<void>;
}) => {
  return (
    <div className="space-y-4">
      {/* Информация о пользователе */}
      <div className="flex items-center gap-3">
        <UserAvatar className="h-12 w-12" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">
            {user?.name || "Пользователь"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
          {user?.role && user.role !== "USER" && (
            <div className="flex items-center gap-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {user.role === "ADMIN" ? "Администратор" : "Менеджер"}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Навигационные ссылки */}
      <div className="space-y-1">
        <Link href="/profile" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <Settings className="mr-2 h-4 w-4" />
            Личный кабинет
          </Button>
        </Link>
        <Link href="/orders" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <Package className="mr-2 h-4 w-4" />
            Мои заказы
          </Button>
        </Link>
        <Link href="/favorites" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <Heart className="mr-2 h-4 w-4" />
            Избранное
          </Button>
        </Link>
        <Link href="/addresses" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <MapPin className="mr-2 h-4 w-4" />
            Адреса доставки
          </Button>
        </Link>
        <Link href="/payment-methods" passHref>
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <CreditCard className="mr-2 h-4 w-4" />
            Способы оплаты
          </Button>
        </Link>

        {/* Ссылки для админов/менеджеров */}
        {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
          <>
            <Separator className="my-2" />
            <Link href="/admin" passHref>
              <Button
                className="w-full justify-start"
                size="sm"
                variant="ghost"
              >
                <Settings className="mr-2 h-4 w-4" />
                Панель управления
              </Button>
            </Link>
          </>
        )}
      </div>

      <Separator />

      {/* Дополнительные действия */}
      <div className="flex flex-col gap-3">
        <Link href="#">
          <Button className="w-full justify-start" size="sm" variant="ghost">
            <HelpCircle className="mr-2 h-4 w-4" />
            Помощь и поддержка
          </Button>
        </Link>

        <Separator />

        <Button
          className="w-full"
          onClick={onSignOut}
          size="sm"
          variant="destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );
};
