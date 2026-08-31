import {
  FaviconPreview,
  FaviconSettings,
  FaviconUploader,
} from "@/features/favicon";
import { listFavicons } from "@/features/favicon/server";
import type { FaviconSizeJson } from "@/shared/api/db/schemas/favicon";
import { requireAdminOrManager } from "@/shared/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/kit/card";

export default async function AdminFaviconPage() {
  await requireAdminOrManager();
  const items = await listFavicons();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Favicon</h1>
        <p className="text-muted-foreground">
          Загрузка PNG, обрезка до квадрата, генерация всех размеров и manifest,
          хранение в S3.
        </p>
      </div>

      <Card className="bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base">Загрузка</CardTitle>
        </CardHeader>
        <CardContent>
          <FaviconUploader />
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base">Настройки</CardTitle>
        </CardHeader>
        <CardContent>
          <FaviconSettings />
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base">Имеющиеся варианты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((it) => {
              const sizes = it.sizes as unknown as Record<
                string,
                Pick<FaviconSizeJson, "url" | "width" | "height" | "bytes">
              >;
              return (
                <div className="rounded-md border p-4" key={it.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.isActive ? "Активный" : "Не активный"}
                    </div>
                  </div>
                  <FaviconPreview sizes={sizes} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
