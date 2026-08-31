import { sql } from "drizzle-orm";
import Link from "next/link";
import { getActiveFavicon } from "@/features/favicon/server";
import { db } from "@/shared/api/db";
import type { FaviconSizeJson } from "@/shared/api/db/schemas/favicon";
import { favicon } from "@/shared/api/db/schemas/favicon";
import { users } from "@/shared/api/db/schemas/users";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";

export default async function AdminPage() {
  const [{ count: usersCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const [{ count: favCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(favicon);

  const activeFavicon = await getActiveFavicon();

  const [health, dbHealth] = await Promise.all([
    fetch(`${process.env.NEXTAUTH_URL || ""}/api/health`, { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => ({ status: "unknown" })),
    fetch(`${process.env.NEXTAUTH_URL || ""}/api/health/db`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .catch(() => ({ status: "unknown" })),
  ]);

  const sizesMap =
    (activeFavicon?.sizes as
      | Record<
          string,
          Pick<FaviconSizeJson, "url" | "width" | "height" | "bytes">
        >
      | undefined) || {};

  const previewUrl =
    sizesMap["favicon-96"]?.url ||
    sizesMap["favicon-32"]?.url ||
    activeFavicon?.originalUrl ||
    "";

  const previewBytes = sizesMap["favicon-96"]?.bytes ?? "—";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Панель администратора
        </h1>
        <p className="text-muted-foreground">
          Ключевые метрики и быстрые действия.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Пользователи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{usersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Всего зарегистрировано
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Фавиконки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{favCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Всего вариантов
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Активная фавиконка
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            {activeFavicon ? (
              <>
                <div className="size-10 rounded bg-secondary overflow-hidden">
                  {/* biome-ignore lint/performance/noImgElement: preview */}
                  <img
                    alt="favicon"
                    className="h-full w-full object-cover"
                    src={previewUrl}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  PNG: {previewBytes} байт • {activeFavicon.originalWidth}×
                  {activeFavicon.originalHeight}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Не выбрана</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Медиа и брендирование</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/admin/settings/favicon">
              <Button variant="outline">Управление фавиконкой</Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline">Общие настройки</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Состояние сервиса</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Web</div>
              <div className="font-medium">
                {health.status === "healthy"
                  ? "OK"
                  : (health.status ?? "unknown")}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Database</div>
              <div className="font-medium">
                {dbHealth.db === "reachable"
                  ? "OK"
                  : (dbHealth.db ?? "unknown")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
