import { createId } from "@packages/util/id";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { userTable } from "./user.table";

const authLinkRequestTable = pgTable(
  "auth_link_request",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("auth_link_request_provider_account_idx").on(
      table.provider,
      table.providerAccountId,
    ),

    index("auth_link_request_target_user_id_idx").on(table.targetUserId),

    index("auth_link_request_expires_at_idx").on(table.expiresAt),
  ],
);

export { authLinkRequestTable };
