import { requireAdminOrManager } from "@/shared/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminOrManager();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Настройки</h1>
      <p className="text-sm text-muted-foreground">
        Здесь позже появятся настройки сайта: медиа, SEO, роли и прочее.
      </p>
    </div>
  );
}
