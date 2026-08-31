import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminOrManager } from "@/shared/lib/auth/server";
import { Button } from "@/shared/ui/kit/button";
import { Separator } from "@/shared/ui/kit/separator";

export const dynamic = "force-dynamic";

export default async function AdminNotFoundPage() {
  // Защита: только ADMIN / MANAGER видят этот 404
  try {
    await requireAdminOrManager();
  } catch {
    redirect("/login?error=AccessDenied");
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 rounded-xl border border-border/60 bg-card/40 p-8 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Admin / Ошибка 404
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Такой административной страницы не существует
            </h1>
          </div>
        </div>

        <p className="text-sm text-muted-foreground max-w-xl">
          Запрошенный вами адрес в панели управления не найден. Проверьте ссылку
          или воспользуйтесь навигацией админки. Если вы ожидали другую
          страницу, возможно, она ещё не реализована или была перемещена.
        </p>

        <Separator />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="w-full sm:w-auto gap-2">
            <Link href="/admin">
              <Home className="h-4 w-4" />В панель управления
            </Link>
          </Button>

          <Button
            asChild
            className="w-full sm:w-auto gap-2 text-muted-foreground"
            variant="outline"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              На главный сайт
            </Link>
          </Button>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground pt-2">
          <span>Green Kiss · Admin</span>
          <span>Код ошибки: 404</span>
        </div>
      </div>
    </div>
  );
}
