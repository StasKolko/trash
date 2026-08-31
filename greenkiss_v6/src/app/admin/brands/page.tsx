import { requireAdminOrManager } from "@/shared/lib/auth/server";
import { BrandAdminPage } from "./_ui/brand-admin-page";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  await requireAdminOrManager();

  return <BrandAdminPage />;
}
