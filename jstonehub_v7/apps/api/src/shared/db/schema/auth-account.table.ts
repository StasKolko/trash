import { createId } from "@packages/util/id";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { userTable } from "./user.table";

const authAccountTable = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_account_provider_account_idx").on(
      table.provider,
      table.providerAccountId,
    ),

    uniqueIndex("auth_account_provider_user_idx").on(
      table.provider,
      table.userId,
    ),

    index("auth_account_user_id_idx").on(table.userId),
  ],
);

export { authAccountTable };
