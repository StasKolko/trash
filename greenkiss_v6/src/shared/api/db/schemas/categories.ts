import type { InferSelectModel } from "drizzle-orm";
import type { AnyPgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";
import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@/shared/lib/id";

// biome-ignore lint/suspicious/noExplicitAny: any нужен
export const categories: PgTableWithColumns<any> = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    searchName: text("search_name").notNull(),
    isTest: boolean("is_test").notNull().default(false),
    parentId: text("parent_id").references(() => categories.id as AnyPgColumn, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("categories_search_name_idx").on(table.searchName),
    index("categories_parent_id_idx").on(table.parentId),
  ],
);

export type Category = InferSelectModel<typeof categories>;
