"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
import { debounce } from "@/shared/lib/timing";
import { AdminCategoryCreateDialog } from "./category-create-dialog";
import { AdminCategoryEditDialog } from "./category-edit-dialog";
import { AdminCategoriesFilters } from "./filters";
import { AdminCategoriesTable } from "./table";

type AdminCategoriesManagerProps = {
  initialCategories: Category[];
};

export const AdminCategoriesManager = ({
  initialCategories,
}: AdminCategoriesManagerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";

  const [inputValue, setInputValue] = useState(urlSearch);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setInputValue(urlSearch);
  }, [urlSearch]);

  const debouncedUpdateUrl = useMemo(
    () =>
      debounce((value: string) => {
        const trimmed = value.trim();
        const params = new URLSearchParams(searchParams.toString());

        if (trimmed) {
          params.set("search", trimmed);
        } else {
          params.delete("search");
        }

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
        router.refresh();
      }, 600),
    // searchParams.toString() вычисляется внутри callback – ESLint ругается,
    // поэтому завязываемся только на pathname и router.
    [pathname, router],
  );

  useEffect(
    () => () => {
      debouncedUpdateUrl.cancel();
    },
    [debouncedUpdateUrl],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedUpdateUrl(value);
    },
    [debouncedUpdateUrl],
  );

  const handleRowClick = useCallback((category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <AdminCategoriesFilters
        search={inputValue}
        onSearchChange={handleSearchChange}
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />

      <AdminCategoriesTable
        categories={categories}
        onRowClick={handleRowClick}
      />

      <AdminCategoryCreateDialog
        categories={categories}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreated={() => {
          router.refresh();
        }}
      />

      <AdminCategoryEditDialog
        categories={categories}
        category={selectedCategory}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedCategory(null);
          }
        }}
        onUpdated={() => {
          router.refresh();
        }}
        onDeleted={() => {
          router.refresh();
        }}
      />
    </div>
  );
};
