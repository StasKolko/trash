import { requireAdminOrManager } from "@/shared/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdminOrManager();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Заказы</h1>
      <p className="text-sm text-muted-foreground">
        Здесь позже появится список заказов, статусы и детали доставок.
      </p>
    </div>
  );
}
