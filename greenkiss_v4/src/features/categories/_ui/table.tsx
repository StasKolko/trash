"use client";

import { memo, useMemo } from "react";
import type { Category } from "@/shared/api/db/schemas/categories";
import { cn } from "@/shared/lib/css";
import { useRenderLogger } from "@/shared/lib/react";
import { Badge } from "@/shared/ui/kit/badge";
import { ScrollArea } from "@/shared/ui/kit/scroll-area";
import {
  buildCategoryTree,
  type CategoryTreeNode,
} from "../_lib/build-category-tree";

type AdminCategoriesTableProps = {
  categories: Category[];
  className?: string;
  onRowClick?: (category: Category) => void;
};

type FlatRow = {
  category: Category;
  depth: number;
  hasChildren: boolean;
};

const AdminCategoriesTableInner = ({
  categories,
  className,
  onRowClick,
}: AdminCategoriesTableProps) => {
  useRenderLogger("AdminCategoriesTable");

  const flatRows: FlatRow[] = useMemo(() => {
    if (!categories.length) {
      return [];
    }

    const roots = buildCategoryTree(categories);
    const result: FlatRow[] = [];

    const stack: CategoryTreeNode[] = [...roots].reverse();
    while (stack.length > 0) {
      const node = stack.pop() as CategoryTreeNode;
      result.push({
        category: node.category,
        depth: node.depth,
        hasChildren: node.children.length > 0,
      });
      for (let i = node.children.length - 1; i >= 0; i -= 1) {
        stack.push(node.children[i]);
      }
    }

    return result;
  }, [categories]);

  if (!flatRows.length) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        Категории не найдены.
      </div>
    );
  }

  return (
    <ScrollArea className={cn("w-full", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="px-3 py-2 font-medium">ID</th>
            <th className="px-3 py-2 font-medium">Название</th>
            <th className="px-3 py-2 font-medium">Тестовая</th>
          </tr>
        </thead>
        <tbody>
          {flatRows.map(({ category, depth, hasChildren }) => (
            <tr
              key={category.id}
              className={cn(
                "border-b last:border-0 hover:bg-muted/50",
                onRowClick && "cursor-pointer",
              )}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(category);
                }
              }}
            >
              <td className="px-3 py-2 align-top font-mono text-xs text-muted-foreground">
                {category.id}
              </td>
              <td className="px-3 py-2 align-top">
                <div className="flex items-center">
                  <div
                    className="inline-flex items-center"
                    style={{ marginLeft: depth * 16 }}
                  >
                    <span
                      className={cn(
                        "mr-2 inline-block h-2 w-2 rounded-full",
                        hasChildren ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                  </div>
                  <span>{category.name}</span>
                </div>
              </td>
              <td className="px-3 py-2 align-top">
                {category.isTest ? (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    test
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
};

export const AdminCategoriesTable = memo(
  AdminCategoriesTableInner,
  (prev, next) => {
    if (prev.categories.length !== next.categories.length) return false;
    if (prev.onRowClick !== next.onRowClick) return false;
    return prev.categories === next.categories;
  },
);
