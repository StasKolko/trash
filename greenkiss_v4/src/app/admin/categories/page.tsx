import { AdminCategoriesPage as AdminCategories } from "@/features/categories/server";

type SearchParams = {
  search?: string;
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  // ВАЖНО: searchParams теперь Promise — его надо await'ить
  const sp = await searchParams;
  const search =
    typeof sp.search === "string" && sp.search.length > 0 ? sp.search : "";

  return <AdminCategories search={search} />;
}
