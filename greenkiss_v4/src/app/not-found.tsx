import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/kit/button";

export default function ShopNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-xl text-center space-y-6">
        <div className="inline-flex items-center justify-center rounded-full bg-amber-500/10 px-4 py-1 text-xs text-amber-500 font-bold ring-1 ring-amber-500/30">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Страница не найдена
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Упс! Такой страницы нет
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
          Похоже, вы перешли по несуществующему адресу. Возможно, ссылка
          устарела или страница была удалена. Но у нас есть много классной
          одежды, которая уже ждёт вас.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="gap-2" size="lg">
            <Link href="/">
              <Home className="h-4 w-4" />
              На главную магазина
            </Link>
          </Button>

          <Button
            asChild
            className="gap-2 text-muted-foreground"
            size="lg"
            variant="outline"
          >
            <Link href="/?sort=newest">
              <ArrowLeft className="h-4 w-4" />К новинкам
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
