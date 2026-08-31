import { requireAdminOrManager } from "@/shared/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminOrManager();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Товары</h1>
      <p className="text-sm text-muted-foreground">
        Здесь позже появится управление товарами, вариантами, ценами и
        остатками.
      </p>
    </div>
  );
}
