import { AdminContainer } from "@/shared/ui/admin-kit";
import { OnlyDevCard } from "@/shared/ui/only-dev-card";
import { getAdminCategories } from "../_actions/read";
import { AdminCategoriesManager } from "./manager";
import { AdminTestCategories } from "./test-categories";

export const AdminCategoriesPage = async ({ search }: { search?: string }) => {
  const trimmed = search?.trim() ?? "";
  console.log("AdminCategoriesPage search:", trimmed); // временно, для проверки
  const res = await getAdminCategories(
    trimmed ? { search: trimmed } : undefined,
  );
  const initialCategories = res.status === "success" ? res.data : [];

  return (
    <AdminContainer title="Категории">
      <OnlyDevCard title="Управление тестовыми категориями">
        <AdminTestCategories />
      </OnlyDevCard>

      {/* временно, чтобы видно было */}
      <div className="text-xs text-muted-foreground">
        current search: "{trimmed}"
      </div>

      <AdminCategoriesManager initialCategories={initialCategories} />
    </AdminContainer>
  );
};
