import { GLOBAL_ROLES } from "@packages/contract/role";
import { createId } from "@packages/util/id";
import { boolean, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

const globalRoleEnum = pgEnum("global_role", GLOBAL_ROLES);

const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  globalRole: globalRoleEnum("global_role").notNull().default("user"),
  isBanned: boolean("is_banned").notNull().default(false),
  bannedAt: timestamp("banned_at", { withTimezone: true }),
  bannedReason: text("banned_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

const oauthAccountsTable = pgTable(
  "oauth_accounts",
  {
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    userId: text("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    unique("unique_oauth_provider_account").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

const sessionsTable = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

const userAdminPermissionsTable = pgTable(
  "user_admin_permissions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    permission: text("permission").notNull(),
    grantedBy: text("granted_by").references(() => usersTable.id),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("unique_user_admin_permission").on(table.userId, table.permission),
  ],
);

export {
  globalRoleEnum,
  oauthAccountsTable,
  sessionsTable,
  userAdminPermissionsTable,
  usersTable,
}