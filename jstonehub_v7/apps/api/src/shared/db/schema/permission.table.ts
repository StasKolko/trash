import { createId } from "@packages/util/id";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { userTable } from "#api/shared/db/schema/user.table";

const permissionTable = pgTable(
  "permission",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(),
    grantedBy: text("granted_by").references(() => userTable.id, {
      onDelete: "set null",
    }),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("permission_user_id_permission_idx").on(
      table.userId,
      table.permission,
    ),

    index("permission_user_id_idx").on(table.userId),

    index("permission_permission_idx").on(table.permission),
  ],
);

export { permissionTable };
